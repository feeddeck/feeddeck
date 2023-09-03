import Footer from "@/components/footer";
import Header from "@/components/header";

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-onbackground">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
