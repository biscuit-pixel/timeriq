import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'

export function TopNav() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const isDebate = pathname.startsWith('/debate')

  return (
    <nav className="top-nav" aria-label={t('nav.presentation')}>
      <Link to="/" className={`top-nav-tab ${!isDebate ? 'top-nav-tab--active' : ''}`}>
        {t('nav.presentation')}
      </Link>
      <Link to="/debate" className={`top-nav-tab ${isDebate ? 'top-nav-tab--active' : ''}`}>
        {t('nav.debate')}
      </Link>
    </nav>
  )
}
