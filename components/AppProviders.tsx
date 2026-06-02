"use client";

import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/components/CartProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2600,
          style: {
            background: "#E8F3EA",
            border: "1px solid rgba(132, 174, 144, 0.42)",
            borderRadius: "18px",
            boxShadow: "0 18px 42px rgba(44, 76, 59, 0.14)",
            color: "#2C4C3B",
            fontSize: "14px",
            fontWeight: 500,
            marginTop: "76px",
            padding: "10px 12px",
          },
        }}
      />
    </CartProvider>
  );
}
