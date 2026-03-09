import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../src/context/AuthContext";
import { Box, Button, Text } from "theme-ui";

export default function SignInPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const router = useRouter();
  const { redirect = "/" } = router.query;

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push(typeof redirect === "string" ? redirect : "/");
    } catch (err) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 5,
        p: 4,
        border: "1px solid",
        borderColor: "muted",
        borderRadius: 2,
      }}
    >
      <Text as="h1" sx={{ fontSize: 3, mb: 3 }}>
        Sign in
      </Text>
      <Text as="p" sx={{ color: "text", mb: 3 }}>
        Sign in with Google to create and edit transit posters.
      </Text>
      {error && (
        <Text as="p" sx={{ color: "error", mb: 2 }}>
          {error}
        </Text>
      )}
      <Button onClick={handleGoogleSignIn} disabled={loading} sx={{ width: "100%" }}>
        {loading ? "Signing in…" : "Sign in with Google"}
      </Button>
      <Text as="p" sx={{ mt: 3, fontSize: 1, color: "muted" }}>
        <Link href="/">← Back to home</Link>
      </Text>
    </Box>
  );
}
