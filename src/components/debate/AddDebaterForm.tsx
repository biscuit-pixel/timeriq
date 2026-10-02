import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { useDebateStore } from '../../debate/store'
import { DurationInput } from '../DurationInput'

export function AddDebaterForm() {
  const { t } = useTranslation()
  const addDebater = useDebateStore((s) => s.addDebater)
  const [name, setName] = useState('')
  const [allottedMs, setAllottedMs] = useState(5 * 60 * 1000)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    addDebater(name.trim() || t('debate.defaultName'), allottedMs)
    setName('')
  }

  return (
    <form className="add-item-form" onSubmit={submit}>
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
    </form>
  )
}
