"use client";

import React, { type ReactNode } from "react";
import { AppWrapper } from "../src/context/state";
import { AuthProvider } from "../src/context/AuthContext";
import AuthHeader from "../components/AuthHeader";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <AppWrapper>
        <AuthHeader />
        {children}
      </AppWrapper>
    </AuthProvider>
  );
}

