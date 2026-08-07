import { useState } from 'react'
import { ArrowLeft, Check, Copy, Pencil, Send } from 'lucide-react'
import config from '../config.js'
import { buildSummaryText, copyText, jokeLine, pickedItems, whatsAppLink } from '../summary.js'
import { hasMedia, mediaUrl } from './MediaBanner.jsx'
import Shell, { PrimaryButton, QuietButton } from './Shell.jsx'

export default function SummaryScreen({
  steps,
  currentIndex,
  answers,
  onNoteChange,
  onEdit,
  onBack,
  onReset,
}) {
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)

  const vibes = pickedItems(answers.vibeOrder, config.vibes)
  const restaurants = pickedItems(answers.restaurantOrder, config.restaurants)
  const text = buildSummaryText(answers)

  const handleCopy = async () => {
    const ok = await copyText(text)
    setCopied(ok)
    if (ok) setTimeout(() => setCopied(false), 2200)
  }

  return (
    <Shell
      steps={steps}
      currentIndex={currentIndex}
      footer={
        sent ? (
          <div className="flex items-center gap-3">
            <QuietButton onClick={() => setSent(false)}>
              <ArrowLeft size={18} strokeWidth={2.5} aria-hidden />
              Edit
            </QuietButton>
            <a
              href={whatsAppLink(text)}
              target="_blank"
              rel="noreferrer"
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-lg font-bold text-white shadow-[0_10px_24px_-12px_rgba(224,97,74,0.9)] transition active:scale-[0.98]"
            >
              <Send size={20} strokeWidth={2.4} aria-hidden />
              WhatsApp it
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <QuietButton onClick={onBack} aria-label="Go back">
              <ArrowLeft size={18} strokeWidth={2.5} aria-hidden />
              Back
            </QuietButton>
            <PrimaryButton onClick={() => setSent(true)}>
              Send it to me
            </PrimaryButton>
          </div>
        )
      }
    >
      <h2 className="text-2xl leading-tight font-semibold text-ink">
        {sent ? 'Ready to send' : 'Here is the plan'}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        {sent
          ? 'Copy it, or open WhatsApp with the message already written.'
          : 'Have a read. Change anything you like before it comes to me.'}
      </p>

      {sent ? (
        <div className="mt-5 flex flex-col gap-3">
          <pre className="rounded-3xl border-2 border-accent-tint bg-white p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-ink">
            {text}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-accent bg-white text-base font-semibold text-accent-dark transition active:scale-[0.98]"
          >
            {copied ? (
              <Check size={18} strokeWidth={2.6} aria-hidden />
            ) : (
              <Copy size={18} strokeWidth={2.4} aria-hidden />
            )}
            {copied ? 'Copied' : 'Copy to clipboard'}
          </button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          <RecapSection
            title="The vibe"
            items={vibes}
            onEdit={() => onEdit('vibes')}
          />
          <RecapSection
            title="Where we eat"
            items={restaurants}
            onEdit={() => onEdit('restaurants')}
          />

          <label className="rounded-3xl border-2 border-black/5 bg-white p-4">
            <span className="text-sm font-semibold text-ink">
              Anything to add
            </span>
            <textarea
              value={answers.note}
              onChange={(event) => onNoteChange(event.target.value)}
              rows={3}
              placeholder="A time, a craving, a warning about the parking"
              className="mt-2 w-full resize-none bg-transparent text-sm leading-relaxed text-ink outline-none placeholder:text-ink-soft/60"
            />
          </label>

          <p className="px-2 text-center text-sm text-ink-soft">
            {jokeLine(answers.noCount)}
          </p>

          <button
            type="button"
            onClick={onReset}
            className="mx-auto cursor-pointer text-xs font-semibold text-ink-soft/70 underline underline-offset-4"
          >
            Start over
          </button>
        </div>
      )}
    </Shell>
  )
}

function RecapSection({ title, items, onEdit }) {
  return (
    <section className="rounded-3xl border-2 border-black/5 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-wide text-ink-soft uppercase">
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-accent-tint px-3 text-xs font-bold text-accent-dark transition active:scale-95"
        >
          <Pencil size={13} strokeWidth={2.6} aria-hidden />
          Edit
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Nothing chosen yet.</p>
      ) : (
        <ol className="mt-3 flex flex-col gap-3">
          {items.map((item, index) => (
            <li key={item.name} className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                {index + 1}
              </span>

              {hasMedia(item.media) && (
                <img
                  src={mediaUrl(item.media)}
                  alt=""
                  loading="lazy"
                  className="h-10 w-10 shrink-0 rounded-xl bg-cream-deep object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
              )}

              <span className="min-w-0">
                <span className="block text-sm leading-tight font-semibold text-ink">
                  {item.name}
                </span>
                {item.area && (
                  <span className="block text-xs text-ink-soft">
                    {item.area}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
