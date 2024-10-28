import { Inter, Open_Sans, DM_Sans } from "next/font/google";
import "./globals.css";

// Primary font - clean, modern, highly legible
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Secondary font - excellent readability for chat messages
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

// Alternative option - friendly and modern
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata = {
  title: "ChatRaum",
  description: "Connect and chat in real-time with a modern, secure messaging experience.",
  icons: {
    icon: "/favicon.ico",
  },
  manifest: '/manifest.json'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} ${openSans.variable} ${dmSans.variable} font-sans min-h-full bg-background antialiased`}
      >
        {children}
      </body>
    </html>
  );
}