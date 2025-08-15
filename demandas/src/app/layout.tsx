import "./globals.css";
import QueryProvider from "../lib/queryClient";

export const metadata = { title: "Demandas" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
