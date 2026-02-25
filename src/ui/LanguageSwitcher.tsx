import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SupportedLang } from '../i18n';

type LangOption = {
  lang: SupportedLang;
  label: string;
  flag: string;
};

export default function LanguageSwitcher({
  className = ''
}: {
  className?: string;
}) {
  const { i18n, t } = useTranslation();

  const options: LangOption[] = useMemo(
    () => [
      { lang: 'en', label: t('lang.en'), flag: '🇺🇸' },
      { lang: 'fr', label: t('lang.fr'), flag: '🇫🇷' },
      { lang: 'es', label: t('lang.es'), flag: '🇪🇸' }
    ],
    [t]
  );

  const current = (i18n.resolvedLanguage ?? i18n.language ?? 'en') as SupportedLang;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <span className="sr-only">{t('lang.label')}</span>
      {options.map((opt) => {
        const active = opt.lang === current;
        return (
          <button
            key={opt.lang}
            type="button"
            onClick={() => i18n.changeLanguage(opt.lang)}
            className={
              'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ' +
              (active
                ? 'border-blue-500 bg-blue-600/20 text-blue-200'
                : 'border-slate-700 bg-slate-800/70 text-slate-200 hover:bg-slate-700')
            }
            aria-pressed={active}
          >
            <span aria-hidden className="text-base leading-none">{opt.flag}</span>
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
