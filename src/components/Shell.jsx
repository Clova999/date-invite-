import ProgressBar from './ProgressBar.jsx'

/**
 * Frame shared by every screen after the ask screen: progress rail on top,
 * scrolling body, and a footer that stays under the thumb.
 */
export default function Shell({ steps, currentIndex, children, footer }) {
  return (
    <div className="flex h-[100dvh] flex-col bg-cream">
      <ProgressBar steps={steps} currentIndex={currentIndex} />

      <main
        key={currentIndex}
        className="step-enter min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-8"
      >
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>

      {footer && (
        <footer className="safe-bottom shrink-0 border-t border-accent-tint bg-cream/95 px-5 pt-3 backdrop-blur">
          <div className="mx-auto w-full max-w-md">{footer}</div>
        </footer>
      )}
    </div>
  )
}

export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`h-14 w-full cursor-pointer rounded-full bg-accent text-lg font-bold text-white shadow-[0_10px_24px_-12px_rgba(224,97,74,0.9)] transition active:scale-[0.98] disabled:cursor-default disabled:bg-accent/35 disabled:shadow-none ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function QuietButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold text-ink-soft transition active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
