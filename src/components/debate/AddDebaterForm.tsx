import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { useDebateStore } from '../../debate/store'
import { defaultQuestionDurationMs } from '../../debate/defaults'
import { DurationInput } from '../DurationInput'

export function AddDebaterForm() {
  const { t } = useTranslation()
  const addDebater = useDebateStore((s) => s.addDebater)
  const [name, setName] = useState('')
  const [allottedMs, setAllottedMs] = useState(5 * 60 * 1000)

  const submitSpeaker = (e: React.FormEvent) => {
    e.preventDefault()
    addDebater(name.trim() || t('debate.defaultName'), allottedMs, 'speaker')
    setName('')
  }

  const addQuestionTimer = () => {
    addDebater(name.trim() || t('debate.defaultQuestionName'), name.trim() ? allottedMs : defaultQuestionDurationMs, 'question')
    setName('')
  }

  return (
    <form className="add-item-form" onSubmit={submitSpeaker}>
      <input
        className="text-input"
        placeholder={t('debate.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <DurationInput valueMs={allottedMs} onChange={setAllottedMs} ariaLabel={t('debate.allotted')} />
      <button type="submit" className="ctrl-btn ctrl-btn--primary ctrl-btn--sm">
        + {t('debate.addDebater')}
      </button>
      <button type="button" className="ctrl-btn ctrl-btn--ghost ctrl-btn--sm" onClick={addQuestionTimer}>
        + {t('debate.addQuestionTimer')}
      </button>
    </form>
  )
}
