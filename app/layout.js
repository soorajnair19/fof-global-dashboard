import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"; // Enable in Vercel: Project → Speed Insights → Enable

export const metadata = {
  title: "Friends of Figma – Chapter Rankings",
  description: "Community chapter member counts and rankings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
