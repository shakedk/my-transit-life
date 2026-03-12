import axios from "axios";
import db from "../db";

type ShippingDetails = {
  name: string | null;
  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
  } | null;
} | null;

interface FulfillmentParams {
  orderId: string;
  stripeSessionId: string;
  routeID: string;
  posterType: string;
  size: string;
  shippingDetails: ShippingDetails;
  provider: "manual" | "printful" | "gelato";
}

/**
 * Triggers a print-on-demand fulfillment order.
 *
 * This is intentionally implementation-agnostic: it can be wired to Printful,
 * Gelato, or any other provider by configuring environment variables.
 *
 * Required env per provider:
 * - Printful: PRINTFUL_API_URL, PRINTFUL_API_KEY
 * - Gelato: GELATO_API_URL, GELATO_API_KEY
 */
export async function triggerPrintFulfillment(params: FulfillmentParams) {
  const orderRef = db.collection("orders").doc(params.orderId);

  const recipientName = params.shippingDetails?.name || undefined;
  const address = params.shippingDetails?.address;

  // Helper: mark order as pending manual handling
  async function markPendingManual(note: string) {
    await orderRef.set(
      {
        fulfillmentStatus: "pending_manual",
        fulfillmentNote: note,
      },
      { merge: true }
    );
  }

  if (params.provider === "printful") {
    const apiUrl = process.env.PRINTFUL_API_URL || "https://api.printful.com/orders";
    const apiKey = process.env.PRINTFUL_API_KEY;

    if (!apiKey) {
      await markPendingManual(
        "PRINTFUL_API_KEY is not configured. Configure Printful API credentials or handle this order manually."
      );
      return;
    }

    try {
      const payload = {
        external_id: params.orderId,
        shipping: "STANDARD",
        recipient: {
          name: recipientName,
          address1: address?.line1 || "",
          address2: address?.line2 || "",
          city: address?.city || "",
          state_code: address?.state || "",
          country_code: address?.country || "",
          zip: address?.postal_code || "",
        },
        items: [
          {
            // You will typically map this to a concrete Printful variant_id
            external_id: `${params.routeID}-${params.posterType}-${params.size}`,
            quantity: 1,
            files: [
              {
                url: `poster:${params.routeID}:${params.posterType}:${params.size}`,
              },
            ],
          },
        ],
        metadata: {
          stripe_session_id: params.stripeSessionId,
          route_id: params.routeID,
          poster_type: params.posterType,
          size: params.size,
        },
      };

      const response = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      await orderRef.set(
        {
          fulfillmentStatus: "submitted",
          fulfillmentResponse: response.data,
        },
        { merge: true }
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Printful API error", e);
      await orderRef.set(
        {
          fulfillmentStatus: "failed",
          fulfillmentError:
            e instanceof Error ? e.message : "Printful fulfillment error",
        },
        { merge: true }
      );
    }
    return;
  }

  if (params.provider === "gelato") {
    const apiUrl =
      process.env.GELATO_API_URL || "https://order.gelatoapis.com/v4/orders";
    const apiKey = process.env.GELATO_API_KEY;

    if (!apiKey) {
      await markPendingManual(
        "GELATO_API_KEY is not configured. Configure Gelato API credentials or handle this order manually."
      );
      return;
    }

    try {
      const payload = {
        orderType: "order",
        orderReferenceId: params.orderId,
        currency: "USD",
        items: [
          {
            itemReferenceId: `${params.routeID}-${params.posterType}-${params.size}`,
            productUid: "poster-generic", // replace with a real Gelato product UID
            quantity: 1,
            files: [
              {
                type: "front",
                url: `poster:${params.routeID}:${params.posterType}:${params.size}`,
              },
            ],
          },
        ],
        shipmentMethodUid: "express",
        shippingAddress: {
          firstName: recipientName || "Customer",
          lastName: "",
          addressLine1: address?.line1 || "",
          addressLine2: address?.line2 || "",
          city: address?.city || "",
          state: address?.state || "",
          postCode: address?.postal_code || "",
          country: address?.country || "",
        },
        metadata: [
          { key: "stripe_session_id", value: params.stripeSessionId },
          { key: "route_id", value: params.routeID },
          { key: "poster_type", value: params.posterType },
          { key: "size", value: params.size },
        ],
      };

      const response = await axios.post(apiUrl, payload, {
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
      });

      await orderRef.set(
        {
          fulfillmentStatus: "submitted",
          fulfillmentResponse: response.data,
        },
        { merge: true }
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Gelato API error", e);
      await orderRef.set(
        {
          fulfillmentStatus: "failed",
          fulfillmentError:
            e instanceof Error ? e.message : "Gelato fulfillment error",
        },
        { merge: true }
      );
    }
    return;
  }

  // Manual / unsupported provider -> leave as manual fulfillment
  await markPendingManual(
    "Provider set to manual or unsupported. Handle this order manually."
  );
}

