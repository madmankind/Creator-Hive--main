'use client'
import clsx from 'clsx'

type Option = { label: string; value: 'hire' | 'getHired' }
export default function Segmented({
  value, onChange, options,
}: {
  value: 'hire' | 'getHired'
  onChange: (v: 'hire' | 'getHired') => void
  options: Option[]
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white/5 p-1 ring-1 ring-white/10">
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-[12px] font-medium transition',
              active
                ? 'bg-white/10 text-white ring-1 ring-white/15'
                : 'text-white/60 hover:text-white'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}







