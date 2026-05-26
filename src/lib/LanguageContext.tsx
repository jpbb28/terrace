"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Lang, translations } from "./i18n";

type T = typeof translations.en;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: T;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
});

// Language follows the URL: English lives at the root, French under /fr. The
// root layout mounts this provider with the default ("en"); src/app/fr/layout
// mounts a nested one with initialLang="fr". Because each locale has its own
// crawlable URL, language is fixed per route (no localStorage auto-switch), and
// the language toggle navigates between the two URLs instead of flipping state.
export function LanguageProvider({
  children,
  initialLang = "en",
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const t = translations[lang] as T;
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
