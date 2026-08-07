import { useState } from 'react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import MediaBanner, { hasMedia } from './MediaBanner.jsx'

/**
 * One selectable, rankable card. Works the same for a vibe and a restaurant.
 * With media it shows a banner, without media it falls back to a clean text
 * layout with an accent stripe.
 */
export default function ChoiceCard({
  item,
  selected,
  rank,
  onToggle,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) {
  // A missing or broken file falls back to the text only layout rather than
  // leaving a hole in the card.
  const [mediaFailed, setMediaFailed] = useState(false)
  const withMedia = hasMedia(item.media) && !mediaFailed

  return (
    <li className="list-none">
      <div
        className={[
          'relative overflow-hidden rounded-3xl border-2 bg-white transition-all duration-300',
          selected
            ? 'border-accent shadow-[0_10px_30px_-12px_rgba(224,97,74,0.55)]'
            : 'border-black/5 shadow-[0_6px_18px_-14px_rgba(44,33,28,0.6)]',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={selected}
          className="block w-full cursor-pointer p-2 text-left"
        >
          {withMedia ? (
            <MediaBanner
              file={item.media}
              alt={item.name}
              onUnavailable={() => setMediaFailed(true)}
            />
          ) : (
            <div
              className="h-1.5 w-full rounded-full bg-gradient-to-r from-accent to-accent/15"
              aria-hidden
            />
          )}

          {/* Without media the badge sits over this row, so keep it clear. */}
          <div className={withMedia ? 'px-3 pt-3 pb-2' : 'px-3 pt-4 pr-16 pb-2'}>
            <div className="flex items-baseline gap-2">
              <h3 className="text-lg leading-tight font-semibold text-ink">
                {item.name}
              </h3>
              {item.area && (
                <span className="shrink-0 text-xs font-medium tracking-wide text-accent uppercase">
                  {item.area}
                </span>
              )}
            </div>
            {item.description && (
              <p className="mt-1 text-sm leading-snug text-ink-soft">
                {item.description}
              </p>
            )}
          </div>
        </button>

        {/* Rank badge and check, sitting over the top right of the media. */}
        <div
          className={[
            'pointer-events-none absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-all duration-300',
            selected
              ? 'scale-100 bg-accent text-white opacity-100 shadow-lg'
              : 'scale-75 bg-white/85 text-ink-soft opacity-0',
          ].join(' ')}
        >
          <Check size={16} strokeWidth={3} aria-hidden />
          {rank != null && (
            <span className="text-sm leading-none font-bold">{rank}</span>
          )}
        </div>

        {selected && (onMoveUp || onMoveDown) && (
          <div className="flex items-center justify-end gap-2 border-t border-accent-tint px-3 py-2">
            <span className="mr-auto text-xs font-medium text-ink-soft">
              {rank === 1 ? 'Top choice' : `Choice ${rank}`}
            </span>
            <RankButton
              label={`Move ${item.name} up`}
              disabled={!canMoveUp}
              onClick={onMoveUp}
            >
              <ChevronUp size={18} strokeWidth={2.5} aria-hidden />
            </RankButton>
            <RankButton
              label={`Move ${item.name} down`}
              disabled={!canMoveDown}
              onClick={onMoveDown}
            >
              <ChevronDown size={18} strokeWidth={2.5} aria-hidden />
            </RankButton>
          </div>
        )}
      </div>
    </li>
  )
}

function RankButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-accent-tint text-accent-dark transition active:scale-90 disabled:cursor-default disabled:opacity-30"
    >
      {children}
    </button>
  )
}
