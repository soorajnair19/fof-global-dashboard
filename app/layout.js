import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"; // Enable in Vercel: Project → Speed Insights → Enable
import ThemeProvider from "./components/ThemeProvider";

export const metadata = {
  title: "Friends of Figma – Chapter Rankings",
  description: "Community chapter member counts and rankings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
