import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { withAuth } from "../../../src/lib/auth/requireAuth";
import { sendError, withMethod } from "../../../src/lib/api/validation";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && process.env.NODE_ENV === "production") {
  // In production we require Stripe to be configured; in dev we allow missing key
  // so the route can still be type-checked without throwing at import time.
  // eslint-disable-next-line no-console
  console.error("STRIPE_SECRET_KEY is not configured");
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    })
  : null;

type SupportedCurrency = "usd" | "eur" | "gbp" | "ils";

type Provider = "manual" | "printful" | "gelato";

interface CreateCheckoutBody {
  posterId: string;
  routeID: string;
  posterType: string;
  fulfillmentType: "digital" | "print";
  size?: string;
  quantity?: number;
  currency?: SupportedCurrency;
  provider?: Provider;
}

const DEFAULT_PRICE_CENTS: Record<SupportedCurrency, number> = {
  usd: 4900,
  eur: 4500,
  gbp: 3900,
  ils: 18000,
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!stripe) {
    return sendError(
      res,
      500,
      "Payments are not configured. Please set STRIPE_SECRET_KEY."
    );
  }

  const body = req.body as Partial<CreateCheckoutBody> | undefined;
  if (!body || typeof body !== "object") {
    return sendError(res, 400, "Invalid request body");
  }

  const {
    posterId,
    routeID,
    posterType,
    fulfillmentType,
    size = "A2",
    quantity = 1,
    currency = "usd",
  } = body as CreateCheckoutBody;

  if (
    !posterId ||
    !routeID ||
    !posterType ||
    (fulfillmentType !== "digital" && fulfillmentType !== "print")
  ) {
    return sendError(
      res,
      400,
      "posterId, routeID, posterType and fulfillmentType are required"
    );
  }

  const lowerCurrency = currency.toLowerCase() as SupportedCurrency;
  const unitAmount =
    DEFAULT_PRICE_CENTS[lowerCurrency] ?? DEFAULT_PRICE_CENTS.usd;

  const origin =
    (req.headers.origin as string | undefined) ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3003";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity,
          price_data: {
            currency: lowerCurrency,
            unit_amount: unitAmount,
            product_data: {
              name:
                fulfillmentType === "print"
                  ? `Printed transit poster (${size})`
                  : "Digital transit poster download",
              description: `Route ${routeID} – ${posterType}`,
            },
          },
        },
      ],
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      metadata: {
        posterId,
        routeID,
        posterType,
        fulfillmentType,
        size,
        provider: body.provider || "manual",
      },
      shipping_address_collection:
        fulfillmentType === "print"
          ? {
              allowed_countries: ["US", "CA", "GB", "DE", "FR", "IL", "SE"],
            }
          : undefined,
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Error creating Stripe Checkout Session", e);
    return sendError(res, 500, "Failed to create checkout session");
  }
}

export default withMethod("POST", withAuth(["POST"], handler));

