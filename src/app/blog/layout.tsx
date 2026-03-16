import { Lora } from "next/font/google";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <div className={lora.variable}>{children}</div>;
}
