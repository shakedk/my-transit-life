"use client";

import React, { type ReactNode } from "react";
import { ThemeProvider } from "theme-ui";
import theme from "../styles/theme";
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
        <ThemeProvider theme={theme}>
          <AuthHeader />
          {children}
        </ThemeProvider>
      </AppWrapper>
    </AuthProvider>
  );
}

