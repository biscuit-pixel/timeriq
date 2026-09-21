import { useTranslation } from '../i18n/useTranslation'
import { useTimerStore } from '../store/timerStore'

export function ModeToggle() {
  const { t } = useTranslation()
  const enabled = useTimerStore((s) => s.settings.playlistEnabled)
  const setPlaylistEnabled = useTimerStore((s) => s.setPlaylistEnabled)

  return (
    <div className="segmented" role="group" aria-label={t('playlist.mode')}>
      <button
        className={`segmented-opt ${enabled ? 'segmented-opt--active' : ''}`}
        onClick={() => !enabled && setPlaylistEnabled(true)}
      >
        {t('playlist.modePlaylist')}
      </button>
      <button
        className={`segmented-opt ${!enabled ? 'segmented-opt--active' : ''}`}
        onClick={() => enabled && setPlaylistEnabled(false)}
      >
        {t('playlist.modeSingle')}
      </button>
    </div>
  )
}
