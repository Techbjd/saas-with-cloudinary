// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import AppLayout from "@/app/components/ui/AppLayout" // adjust path if AppLayout is in a subfolder

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AppLayout>
              {children} {/* Now every page gets the sidebar & navbar */}
            </AppLayout>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
