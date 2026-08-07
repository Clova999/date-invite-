/**
 * Thin progress rail at the top of every screen except the ask screen.
 */
export default function ProgressBar({ steps, currentIndex }) {
  return (
    <div
      className="flex items-center gap-1.5 px-5 pt-4"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-valuenow={currentIndex + 1}
      aria-label={`Step ${currentIndex + 1} of ${steps.length}`}
    >
      {steps.map((step, index) => (
        <span
          key={step}
          className={[
            'h-1.5 flex-1 rounded-full transition-colors duration-400',
            index <= currentIndex ? 'bg-accent' : 'bg-accent-tint',
          ].join(' ')}
        />
      ))}
    </div>
  )
}
