"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Card, Flex, Heading, Spinner, Text, Button } from "theme-ui";
import axios from "axios";
import { useAuth } from "../../src/context/AuthContext";

type Poster = {
  id: string;
  slug?: string;
  routeID?: string;
  posterType?: string;
  created?: string;
};

type Order = {
  id: string;
  createdAt?: string;
  status?: string;
  fulfillmentStatus?: string;
  amountTotal?: number;
  currency?: string;
  posterId?: string;
  provider?: string;
};

type PostersResponse = { posters: Poster[] };
type OrdersResponse = { orders: Order[] };

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [posters, setPosters] = useState<Poster[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || loading) return;

    async function load() {
      try {
        setIsLoadingData(true);
        setError(null);
        const [postersRes, ordersRes] = await Promise.all([
          axios.get<PostersResponse>("/api/commerce/myPosters"),
          axios.get<OrdersResponse>("/api/commerce/myOrders"),
        ]);
        setPosters(postersRes.data.posters || []);
        setOrders(ordersRes.data.orders || []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to load dashboard data", e);
        setError("Failed to load dashboard data.");
      } finally {
        setIsLoadingData(false);
      }
    }

    load();
  }, [user, loading]);

  if (loading || (!user && !loading)) {
    return (
      <Flex
        sx={{
          minHeight: "60vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex
        sx={{
          minHeight: "60vh",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Heading as="h1" sx={{ mb: 2 }}>
          Your dashboard
        </Heading>
        <Text sx={{ mb: 3, color: "muted" }}>
          Sign in to view your posters and orders.
        </Text>
        <Link href="/signin">
          <Button as="span">Sign in</Button>
        </Link>
      </Flex>
    );
  }

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", px: 3, py: 4 }}>
      <Heading as="h1" sx={{ mb: 3 }}>
        Your dashboard
      </Heading>
      <Text sx={{ mb: 4, color: "muted" }}>
        Manage your saved posters and track orders.
      </Text>

      {error && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 4,
            bg: "highlight",
            color: "text",
          }}
        >
          {error}
        </Box>
      )}

      {isLoadingData ? (
        <Flex
          sx={{
            minHeight: "40vh",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spinner />
        </Flex>
      ) : (
        <>
          <Heading as="h2" sx={{ fontSize: 3, mb: 2 }}>
            Posters
          </Heading>
          {posters.length === 0 ? (
            <Text sx={{ mb: 4, color: "muted" }}>
              No posters yet.{" "}
              <Link href="/routeSelector">Start by designing one.</Link>
            </Text>
          ) : (
            <Flex sx={{ flexDirection: "column", gap: 2, mb: 4 }}>
              {posters.map((p) => (
                <Card key={p.id} sx={{ p: 3, display: "flex", gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Text sx={{ fontWeight: "bold" }}>
                      {p.slug || p.routeID || p.id}
                    </Text>
                    <Text sx={{ fontSize: 1, color: "muted", mt: 1 }}>
                      Route: {p.routeID || "Unknown"} • Type:{" "}
                      {p.posterType || "Unknown"}
                    </Text>
                    {p.created && (
                      <Text sx={{ fontSize: 0, color: "muted", mt: 1 }}>
                        Created at: {new Date(p.created).toLocaleString()}
                      </Text>
                    )}
                  </Box>
                  <Flex
                    sx={{
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 2,
                    }}
                  >
                    {p.routeID && p.posterType && (
                      <Link
                        href={`/posters/poster?posterType=${encodeURIComponent(
                          p.posterType
                        )}&routeID=${encodeURIComponent(p.routeID)}`}
                      >
                        <Button as="span" variant="secondary">
                          Edit poster
                        </Button>
                      </Link>
                    )}
                  </Flex>
                </Card>
              ))}
            </Flex>
          )}

          <Heading as="h2" sx={{ fontSize: 3, mb: 2 }}>
            Orders
          </Heading>
          {orders.length === 0 ? (
            <Text sx={{ color: "muted" }}>
              No orders yet. Order a print from your poster editor.
            </Text>
          ) : (
            <Flex sx={{ flexDirection: "column", gap: 2 }}>
              {orders.map((o) => (
                <Card key={o.id} sx={{ p: 3 }}>
                  <Flex
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 3,
                    }}
                  >
                    <Box>
                      <Text sx={{ fontWeight: "bold" }}>Order {o.id}</Text>
                      <Text sx={{ fontSize: 1, color: "muted", mt: 1 }}>
                        Status: {o.status || "unknown"} • Fulfillment:{" "}
                        {o.fulfillmentStatus || "n/a"}{" "}
                        {o.provider ? `• Provider: ${o.provider}` : ""}
                      </Text>
                      {o.createdAt && (
                        <Text sx={{ fontSize: 0, color: "muted", mt: 1 }}>
                          Created at: {new Date(o.createdAt).toLocaleString()}
                        </Text>
                      )}
                      {o.amountTotal && (
                        <Text sx={{ fontSize: 0, color: "muted", mt: 1 }}>
                          Total:{" "}
                          {(o.amountTotal / 100).toFixed(2)}{" "}
                          {(o.currency || "usd").toUpperCase()}
                        </Text>
                      )}
                    </Box>
                    {o.posterId && (
                      <Link
                        href={`/posters/poster?posterID=${encodeURIComponent(
                          o.posterId
                        )}`}
                      >
                        <Button as="span" variant="secondary">
                          View poster
                        </Button>
                      </Link>
                    )}
                  </Flex>
                </Card>
              ))}
            </Flex>
          )}
        </>
      )}
    </Box>
  );
}

