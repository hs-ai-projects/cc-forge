import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "cc-forge",
  description: "Claude Code project template",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body data-gramm="false">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
