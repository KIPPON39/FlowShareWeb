'use client';

import { useState, useEffect, useCallback } from 'react';
import { I18nContext, type Language, getTranslation } from '@/lib/i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('th');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Language | null;
    if (saved === 'en' || saved === 'th') {
      setLangState(saved);
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  }, []);

  const t = useCallback(
    (key: string) => getTranslation(lang)(key),
    [lang]
  );

  // Prevent hydration mismatch by rendering children only after mount
  // but always render the provider
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {mounted ? children : children}
    </I18nContext.Provider>
  );
}
