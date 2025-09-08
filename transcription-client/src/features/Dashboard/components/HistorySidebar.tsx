import { useEffect, useState } from 'react'

interface HistoryItem {
  id: string
  fileName: string
  createdAt: string
}

interface Props {
  onSelect: (id: string, fileName: string) => void
}

function HistorySidebar({ onSelect }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('transcripts-history')
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  return (
    <aside className="sidebar">
      <div className="card" style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>היסטוריית תמלולים</h3>
        <div className="grid gap-sm">
          {items.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted)' }}>אין פריטים להצגה</div>
          ) : (
            items.map((it) => (
              <div key={it.id} className="item" onClick={() => onSelect(it.id, it.fileName)}>
                <div style={{ fontWeight: 600 }}>{it.fileName}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{new Date(it.createdAt).toLocaleString('he-IL')}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  )
}

export default HistorySidebar


