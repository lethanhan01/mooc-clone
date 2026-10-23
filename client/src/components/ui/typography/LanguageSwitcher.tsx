import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const toggle = () => {
    const next = isVi ? 'ja' : 'vi'
    i18n.changeLanguage(next)
    document.documentElement.lang = next
    localStorage.setItem('gym-locale', next)
  }

  return (
    <button
      data-no-sweep
      onClick={toggle}
      className="inline-flex items-center gap-1 px-2.5 py-1 border border-line-default rounded-full bg-surface-elevated font-body text-xs font-bold tracking-[0.04em] cursor-pointer transition-colors duration-200 hover:border-line-hover"
      aria-label={isVi ? 'Switch to Japanese' : 'Switch to Vietnamese'}
    >
      <span className={isVi ? 'text-action-primary' : 'text-fg-muted'}>
        VI
      </span>
      <span className="text-fg-subtle font-normal">/</span>
      <span className={!isVi ? 'text-action-primary' : 'text-fg-muted'}>
        JA
      </span>
    </button>
  )
}
