import { LanguageProvider } from "@/lib/LanguageContext";

// All /fr/* routes render in French. This nested provider overrides the
// root (English) provider for everything under /fr, so server-rendered HTML
// is French for crawlers. The <html lang> attribute stays "en" (single root
// layout); French pages scope language with a wrapper element where it matters.
export default function FrLayout({ children }: { children: React.ReactNode }) {
  return <LanguageProvider initialLang="fr">{children}</LanguageProvider>;
}
