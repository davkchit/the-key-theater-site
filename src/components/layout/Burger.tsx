interface BurgerProps {
  open: boolean
  onClick: () => void
}

const LINE_PATH = 'M1,2.5 C4.5,0.5 8,4.5 12,2.5 C16,0.5 19.5,4.5 23,2.5'

/** Hamburger built from 3 wavy brand-style lines, morphing into an X via CSS transforms. */
export function Burger({ open, onClick }: BurgerProps) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
      aria-expanded={open}
      className="ml-auto flex h-[46px] w-[46px] flex-shrink-0 flex-col items-center justify-center gap-[3px] border-none bg-transparent p-0 transition-transform duration-150 active:scale-90 md:hidden"
    >
      {[0, 1, 2].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 5"
          width="24"
          height="5"
          className="origin-center overflow-visible transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            transform: open
              ? i === 0
                ? 'translateY(8px) rotate(45deg)'
                : i === 2
                  ? 'translateY(-8px) rotate(-45deg)'
                  : undefined
              : undefined,
            opacity: open && i === 1 ? 0 : 1,
            scale: open && i === 1 ? 0.6 : 1,
          }}
        >
          <path d={LINE_PATH} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      ))}
    </button>
  )
}
