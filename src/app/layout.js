import "./globals.css";
import SiteThemeProvider from "@/components/theme-provider";

export const metadata = {
  title: "Alpha Tips",
  description: "Painel completo para apostadores esportivos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <SiteThemeProvider>{children}</SiteThemeProvider>
      </body>
    </html>
  );
}
