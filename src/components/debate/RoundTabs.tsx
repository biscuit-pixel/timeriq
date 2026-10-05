import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { useDebateStore } from '../../debate/store'

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" /></svg>
)
const EditIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M4 20h4l11-11-4-4L4 16v4zm13.7-14.3 2.6 2.6" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
)
const DuplicateIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="8" y="8" width="12" height="12" rx="2" /><rect x="4" y="4" width="12" height="12" rx="2" /></svg>
)
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M6 7h12l-1 13H7L6 7zm3-3h6l1 2H8l1-2z" /></svg>
)

export function RoundTabs() {
  const { t } = useTranslation()
  const rounds = useDebateStore((s) => s.rounds)
  const activeRoundId = useDebateStore((s) => s.activeRoundId)
  const selectRound = useDebateStore((s) => s.selectRound)
  const addRound = useDebateStore((s) => s.addRound)
  const duplicateRound = useDebateStore((s) => s.duplicateRound)
  const renameRound = useDebateStore((s) => s.renameRound)
  const removeRound = useDebateStore((s) => s.removeRound)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const commitRename = (id: string) => {
    const name = draft.trim()
    if (name) renameRound(id, name)
    setEditingId(null)
  }

  return (
    <div className="round-tabs">
      {rounds.map((round, i) => {
        const isActive = round.id === activeRoundId
        return (
          <div key={round.id} className={`round-tab ${isActive ? 'round-tab--active' : ''}`}>
            {editingId === round.id ? (
              <input
                autoFocus
                className="round-tab-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => commitRename(round.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename(round.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
              />
            ) : (
              <button className="round-tab-label" onClick={() => selectRound(round.id)}>
                {round.name || `${t('debate.round')} ${i + 1}`}
              </button>
            )}

            {isActive && editingId !== round.id && (
              <span className="round-tab-actions">
                <button
                  className="round-tab-icon"
                  title={t('debate.renameRound')}
                  onClick={() => {
                    setDraft(round.name)
                    setEditingId(round.id)
                  }}
                >
                  <EditIcon />
                </button>
                <button className="round-tab-icon" title={t('debate.duplicateRound')} onClick={() => duplicateRound(round.id)}>
                  <DuplicateIcon />
                </button>
                {rounds.length > 1 && (
                  <button
                    className="round-tab-icon round-tab-icon--danger"
                    title={t('debate.removeRound')}
                    onClick={() => {
                      if (confirm(t('debate.removeRoundConfirm'))) removeRound(round.id)
                    }}
                  >
                    <TrashIcon />
                  </button>
                )}
              </span>
            )}
          </div>
        )
      })}

      <button
        className="round-tab round-tab--add"
        onClick={() => addRound(`${t('debate.round')} ${rounds.length + 1}`)}
        title={t('debate.addRound')}
      >
        <PlusIcon />
      </button>
    </div>
  )
}
