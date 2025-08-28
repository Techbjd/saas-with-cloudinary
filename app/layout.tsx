// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import AppLayout from "@/app/components/ui/AppLayout"; // adjust path if needed

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClerkProvider>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="light"
            themes={["light", "dark", "dracula", "ocean", "forest"]}
            enableSystem={false}
          >
            <AppLayout>
              {children} {/* Every page gets sidebar & navbar */}
            </AppLayout>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
