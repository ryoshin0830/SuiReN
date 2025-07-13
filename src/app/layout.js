import { BIZ_UDPGothic } from "next/font/google";
import "./globals.css";
import Layout from '../components/Layout';

const bizUDPGothic = BIZ_UDPGothic({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: "--font-biz-ud-gothic",
});

export const metadata = {
  title: "SuiReN - Japanese Speed Reading",
  description: "日本語学習者のための速読ウェブサイト",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className={`${bizUDPGothic.variable} font-sans antialiased`}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
