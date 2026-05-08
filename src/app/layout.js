import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import LegacyTranslator from "@/i18n/LegacyTranslator";

export const metadata = {
  title: "Filtto - Gestão profissional de apostas esportivas",
  description:
    "Painel SaaS para gestão de banca, registro de apostas, histórico, métricas e análise de desempenho.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <LegacyTranslator />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}