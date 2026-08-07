import { ArrowLeft } from 'lucide-react'
import ChoiceCard from './ChoiceCard.jsx'
import Shell, { PrimaryButton, QuietButton } from './Shell.jsx'

/**
 * One screen of selectable, rankable cards. Used for both the vibe step and
 * the restaurant step, and it renders whatever the config array holds.
 */
export default function PickStep({
  steps,
  currentIndex,
  title,
  intro,
  items,
  order,
  onToggle,
  onMove,
  onBack,
  onContinue,
  continueLabel = 'Continue',
}) {
  const chosen = order.length

  return (
    <Shell
      steps={steps}
      currentIndex={currentIndex}
      footer={
        <div className="flex items-center gap-3">
          <QuietButton onClick={onBack} aria-label="Go back">
            <ArrowLeft size={18} strokeWidth={2.5} aria-hidden />
            Back
          </QuietButton>
          <PrimaryButton onClick={onContinue} disabled={chosen === 0}>
            {chosen === 0 ? 'Pick at least one' : continueLabel}
          </PrimaryButton>
        </div>
      }
    >
      <h2 className="text-2xl leading-tight font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{intro}</p>
      <p className="mt-1 text-sm font-medium text-accent">
        {chosen === 0
          ? 'Tap the ones you like'
          : `${chosen} chosen, tap order sets the ranking`}
      </p>

      <ul className="mt-5 flex flex-col gap-4">
        {items.map((item) => {
          const rank = order.indexOf(item.name)
          const selected = rank !== -1
          return (
            <ChoiceCard
              key={item.name}
              item={item}
              selected={selected}
              rank={selected ? rank + 1 : null}
              onToggle={() => onToggle(item.name)}
              onMoveUp={() => onMove(item.name, -1)}
              onMoveDown={() => onMove(item.name, 1)}
              canMoveUp={selected && rank > 0}
              canMoveDown={selected && rank < order.length - 1}
            />
          )
        })}
      </ul>
    </Shell>
  )
}
