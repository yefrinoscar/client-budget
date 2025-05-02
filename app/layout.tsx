import { BudgetProvider } from "@/lib/budget-context";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Budget App",
  description: "Create beautiful client budgets with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BudgetProvider>
      <html lang="en">
        <head>
          <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet" />
        </head>
        <body>
          {children}
        </body>
      </html>
    </BudgetProvider>
  );
}
