import React from "react";
import Link from "next/link";
import { useAuth } from "../src/context/AuthContext";
import { Box, Button, Flex, Text } from "theme-ui";

export default function AuthHeader() {
  const { user, loading, signOut } = useAuth();

  if (loading) return null;

  return (
    <Box
      as="header"
      sx={{
        py: 2,
        px: 3,
        borderBottom: "1px solid",
        borderColor: "muted",
        mb: 3,
      }}
    >
      <Flex sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" passHref>
          <Text as="a" sx={{ fontWeight: "bold", textDecoration: "none", color: "text" }}>
            My Transit Life
          </Text>
        </Link>
        {user ? (
          <Flex sx={{ alignItems: "center", gap: 2 }}>
            <Text as="span" sx={{ fontSize: 1, color: "muted" }}>
              {user.email}
            </Text>
            <Button variant="secondary" onClick={signOut}>
              Sign out
            </Button>
          </Flex>
        ) : (
          <Link href="/signin" passHref>
            <Button as="a">Sign in</Button>
          </Link>
        )}
      </Flex>
    </Box>
  );
}
