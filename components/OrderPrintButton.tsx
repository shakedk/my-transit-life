import React, { useState } from "react";
import axios from "axios";
import { Button, Flex, Label, Select, Text } from "theme-ui";
import { useRouter } from "next/router";
import { useAuth } from "../src/context/AuthContext";

type FulfillmentType = "digital" | "print";
type Provider = "manual" | "printful" | "gelato";

interface OrderPrintButtonProps {
  fulfillmentType?: FulfillmentType;
}

export default function OrderPrintButton({
  fulfillmentType = "print",
}: OrderPrintButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
   const [provider, setProvider] = useState<Provider>("printful");

  const handleClick = async () => {
    if (!user) {
      const redirect = encodeURIComponent(
        router.asPath || "/posters/poster"
      );
      router.push(`/signin?redirect=${redirect}`);
      return;
    }

    const { routeID, posterType } = router.query;

    if (!routeID || !posterType || Array.isArray(routeID) || Array.isArray(posterType)) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/commerce/createCheckoutSession", {
        posterId: `${posterType}-${routeID}`,
        routeID,
        posterType,
        fulfillmentType,
        provider,
      });
      const { url } = response.data as { url?: string };
      if (url) {
        window.location.href = url;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to start checkout", e);
      // In a real app, surface a toast or inline error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex sx={{ alignItems: "center", gap: 2, flexWrap: "wrap" }}>
      <Label sx={{ fontSize: 0 }}>
        <Text as="span" sx={{ mr: 2 }}>
          Print provider
        </Text>
        <Select
          value={provider}
          onChange={(e) => setProvider(e.target.value as Provider)}
          sx={{ fontSize: 0, minWidth: 140, mt: 1 }}
        >
          <option value="printful">Printful</option>
          <option value="gelato">Gelato</option>
          <option value="manual">Other / manual</option>
        </Select>
      </Label>
      <Button onClick={handleClick} disabled={loading}>
        {loading
          ? "Redirecting..."
          : fulfillmentType === "print"
          ? "Order a print"
          : "Buy digital file"}
      </Button>
    </Flex>
  );
}

