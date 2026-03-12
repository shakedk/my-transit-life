import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import db from "../../../src/lib/db";
import { sendError, withMethod } from "../../../src/lib/api/validation";
import { triggerPrintFulfillment } from "../../../src/lib/commerce/fulfillment";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey && process.env.NODE_ENV === "production") {
  // eslint-disable-next-line no-console
  console.error("STRIPE_SECRET_KEY is not configured");
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    })
  : null;

async function buffer(readable: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!stripe || !webhookSecret) {
    return sendError(
      res,
      500,
      "Stripe webhook not configured. Please set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET."
    );
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig as string, webhookSecret);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Stripe webhook signature verification failed:", err);
    return sendError(res, 400, "Webhook signature verification failed");
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const {
        posterId,
        routeID,
        posterType,
        fulfillmentType,
        size,
        provider,
      } = (session.metadata || {}) as Record<string, string>;

      const customerEmail =
        (session.customer_details && session.customer_details.email) || null;

      const orderRef = db.collection("orders").doc();
      const orderData: Record<string, unknown> = {
        id: orderRef.id,
        createdAt: new Date().toISOString(),
        stripeSessionId: session.id,
        amountTotal: session.amount_total,
        currency: session.currency,
        status: "paid",
        fulfillmentStatus:
          fulfillmentType === "print" ? "pending" : "not_required",
        posterId: posterId || null,
        routeID: routeID || null,
        posterType: posterType || null,
        fulfillmentType: fulfillmentType || "digital",
        size: size || "A2",
        provider: provider || "manual",
        customerEmail,
        shipping: session.shipping_details || null,
      };

      await orderRef.set(orderData);

      if (fulfillmentType === "print") {
        await triggerPrintFulfillment({
          orderId: orderRef.id,
          stripeSessionId: session.id,
          routeID: routeID || "",
          posterType: posterType || "",
          size: size || "A2",
          shippingDetails: session.shipping_details || null,
          provider: (provider as "manual" | "printful" | "gelato") || "manual",
        });
      }
    }

    res.json({ received: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Error handling Stripe webhook", e);
    return sendError(res, 500, "Failed to handle webhook");
  }
}

export default withMethod("POST", handler);

