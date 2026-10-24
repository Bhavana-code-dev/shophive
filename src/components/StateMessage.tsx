interface Props {
  title: string
  message?: string
  tone?: 'error' | 'neutral'
  action?: { label: string; onClick: () => void }
}

export function StateMessage({ title, message, tone = 'neutral', action }: Props) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center"
    >
      <h2 className={`text-lg font-bold ${tone === 'error' ? 'text-red-700' : ''}`}>{title}</h2>
      {message && <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">{message}</p>}
      {action && (
        <button onClick={action.onClick} className="mt-5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          {action.label}
        </button>
      )}
    </div>
  )
}
