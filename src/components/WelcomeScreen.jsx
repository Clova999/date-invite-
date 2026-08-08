import { Heart } from 'lucide-react'
import { welcomeIntro } from '../config.js'
import Shell, { PrimaryButton } from './Shell.jsx'

export default function WelcomeScreen({ steps, currentIndex, onStart }) {
  return (
    <Shell
      steps={steps}
      currentIndex={currentIndex}
      footer={<PrimaryButton onClick={onStart}>Start</PrimaryButton>}
    >
      <div className="flex flex-col items-center pt-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-tint text-accent">
          <Heart size={30} strokeWidth={2.2} fill="currentColor" aria-hidden />
        </span>

        <h1 className="mt-6 text-3xl leading-tight font-semibold text-ink">
          You said yes.
        </h1>

        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          {welcomeIntro}
        </p>

        <p className="mt-8 rounded-2xl bg-white px-5 py-4 text-sm leading-relaxed text-ink-soft shadow-[0_6px_18px_-14px_rgba(44,33,28,0.6)]">
          Two quick steps. Pick what we do, pick what we eat, then send it
          straight back to me.
        </p>
      </div>
    </Shell>
  )
}
