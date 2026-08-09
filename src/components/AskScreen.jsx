import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { askCaptions, askHeadline, askMedia } from '../config.js'
import { isSafe, pickSpot } from '../dodge.js'
import {
  useFinePointer,
  useMeasuredRect,
  useReducedMotion,
  useViewportSize,
} from '../hooks.js'
import MediaBanner, { hasMedia } from './MediaBanner.jsx'

// Natural, unscaled geometry of the two buttons, in CSS pixels.
const YES_BASE_W = 146
const YES_BASE_H = 60
const YES_BASE_FONT = 20
const YES_MAX_FONT = 40 // the label stops growing here and stays readable

const NO_BASE_W = 150
const NO_BASE_H = 48
const NO_BASE_FONT = 15
const NO_MIN_FONT = 11
const NO_FLOOR = 44 // never below a 44 by 44 tap target

const PAIR_GAP = 12
const GROWTH = 1.35 // Yes grows by 35 percent per press
const SHRINK = 0.85 // Absolutely not shrinks by 15 percent per press

// Fractions of the viewport the Yes button may never exceed.
const MAX_VIEWPORT_W = 0.85
const MAX_VIEWPORT_H = 0.55

// Room kept clear at the top of the dock for the teasing caption.
const CAPTION_ZONE = 48
const DOCK_MARGIN = 12

const lerp = (from, to, t) => from + (to - from) * t

export default function AskScreen({ presses, onYes, onNo }) {
  const reducedMotion = useReducedMotion()
  const finePointer = useFinePointer()
  const viewport = useViewportSize()
  const [stageRef, stage] = useMeasuredRect()
  const [dockRef, dock] = useMeasuredRect()

  // The Yes button may never exceed 85 percent of viewport width or 55
  // percent of viewport height, whichever limit is reached first. It is also
  // held inside its stage so it can never be clipped or cover anything else.
  // Both parts recompute whenever the viewport or the layout changes, which
  // covers resize and orientation change.
  const maxScale = useMemo(() => {
    const limits = [
      (viewport.width * MAX_VIEWPORT_W) / YES_BASE_W,
      (viewport.height * MAX_VIEWPORT_H) / YES_BASE_H,
    ]
    if (stage) {
      limits.push((stage.width - 8) / YES_BASE_W)
      limits.push((stage.height - 8) / YES_BASE_H)
    }
    return Math.max(1, Math.min(...limits))
  }, [viewport, stage])

  const scale = Math.min(Math.pow(GROWTH, presses), maxScale)

  // The label rides along with the button but stops at a readable size. The
  // divide undoes the transform so the rendered size lands exactly on the cap.
  const yesFontSize = Math.min(YES_BASE_FONT * scale, YES_MAX_FONT) / scale

  // Press zero puts the two buttons side by side around the centre line.
  const paired = presses === 0
  const yesShiftX = paired ? -(NO_BASE_W + PAIR_GAP) / 2 : 0

  const noWidth = Math.max(NO_FLOOR, NO_BASE_W * Math.pow(SHRINK, presses))
  const noHeight = Math.max(NO_FLOOR, NO_BASE_H * Math.pow(SHRINK, presses))
  const noFontSize = Math.max(NO_MIN_FONT, NO_BASE_FONT * Math.pow(SHRINK, presses))

  // Once growth is capped the joke carries on by other means: the small
  // button starts dodging instead.
  const dodging = presses > 0 && Math.pow(GROWTH, presses) >= maxScale

  // Where the Yes button actually sits on screen, which is what the dodge
  // has to steer around.
  const yesBounds = useMemo(() => {
    const centreX = (stage ? stage.x + stage.width / 2 : viewport.width / 2) + yesShiftX
    const centreY = stage ? stage.y + stage.height / 2 : viewport.height / 2
    const halfW = (YES_BASE_W * scale) / 2
    const halfH = (YES_BASE_H * scale) / 2
    return {
      left: centreX - halfW,
      right: centreX + halfW,
      top: centreY - halfH,
      bottom: centreY + halfH,
    }
  }, [stage, viewport, yesShiftX, scale])

  const [dodgeSpot, setDodgeSpot] = useState(null)

  const spotOptions = useMemo(
    () => ({ viewport, yes: yesBounds, width: noWidth, height: noHeight }),
    [viewport, yesBounds, noWidth, noHeight],
  )

  // Held in a ref so the handlers below always see current geometry without
  // making every resize re-roll the position.
  const optionsRef = useRef(spotOptions)
  optionsRef.current = spotOptions

  const dodge = useCallback(() => {
    setDodgeSpot((previous) => pickSpot(optionsRef.current, previous))
  }, [])

  // A new spot on every press once dodging has begun.
  useEffect(() => {
    if (!dodging) {
      setDodgeSpot(null)
      return
    }
    dodge()
  }, [dodging, presses, dodge])

  // A resize or rotation can leave the button under the Yes button or half
  // off screen. Only re-roll when that has actually happened.
  useEffect(() => {
    if (!dodging) return
    setDodgeSpot((previous) =>
      isSafe(previous, spotOptions) ? previous : pickSpot(spotOptions, previous),
    )
  }, [dodging, spotOptions])

  // Drift: from press one onward the small button sits in the dock and edges
  // a little further towards the corner on every press. Reduced motion keeps
  // it parked where it lands.
  const driftT = reducedMotion ? 0 : 1 - Math.pow(0.7, Math.max(0, presses - 1))

  // Everything below is the centre of the small button, in viewport pixels.
  const noCentre = useMemo(() => {
    const stageCx = stage ? stage.x + stage.width / 2 : viewport.width / 2
    const stageCy = stage ? stage.y + stage.height / 2 : viewport.height / 2

    if (paired) {
      // Beside the Yes button, level with the middle of the stage.
      return { x: stageCx + (YES_BASE_W + PAIR_GAP) / 2, y: stageCy }
    }

    if (dodging && dodgeSpot) return dodgeSpot

    if (!dock) return { x: stageCx, y: stageCy }

    const zoneTop = dock.y + CAPTION_ZONE + noHeight / 2
    const zoneBottom = dock.y + dock.height - DOCK_MARGIN - noHeight / 2
    return {
      x: lerp(
        dock.x + dock.width / 2,
        dock.x + dock.width - DOCK_MARGIN - noWidth / 2,
        driftT,
      ),
      y: lerp(zoneTop, Math.max(zoneTop, zoneBottom), driftT),
    }
  }, [
    paired,
    dodging,
    dodgeSpot,
    stage,
    dock,
    viewport,
    driftT,
    noWidth,
    noHeight,
  ])

  const springy = reducedMotion
    ? 'none'
    : 'transform 560ms var(--ease-spring), width 400ms var(--ease-spring), height 400ms var(--ease-spring), font-size 400ms ease'

  const caption =
    presses > 0 && askCaptions.length > 0
      ? askCaptions[(presses - 1) % askCaptions.length]
      : null

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[radial-gradient(125%_65%_at_50%_0%,var(--color-cream-deep)_0%,var(--color-cream)_60%)]">
      {/* The header gives up room before anything else does, so the Yes
          button always has space to grow, even on a short landscape phone. */}
      <header className="flex min-h-0 shrink flex-col items-center gap-4 overflow-hidden px-6 pt-8">
        {hasMedia(askMedia) && (
          <div
            className="w-full max-w-[17rem] min-h-0 shrink [@media(max-height:520px)]:hidden"
            style={{ flexBasis: '24dvh' }}
          >
            <MediaBanner file={askMedia} alt="" fill />
          </div>
        )}
        <h1 className="max-w-md shrink-0 text-center text-[clamp(1.4rem,6vw,2rem)] leading-tight font-semibold text-balance text-ink">
          {askHeadline}
        </h1>
      </header>

      {/* The stage holds the Yes button and nothing else, so the button can
          grow without pushing, clipping or covering anything. */}
      <div ref={stageRef} className="relative min-h-[30dvh] flex-1">
        <button
          type="button"
          onClick={onYes}
          style={{
            width: YES_BASE_W,
            height: YES_BASE_H,
            fontSize: yesFontSize,
            transform: `translate(-50%, -50%) translateX(${yesShiftX}px) scale(${scale})`,
            transition: springy,
          }}
          className="absolute top-1/2 left-1/2 z-20 cursor-pointer rounded-full bg-accent font-bold text-white shadow-[0_12px_28px_-10px_rgba(224,97,74,0.9)] active:brightness-95"
        >
          Yes
        </button>
      </div>

      <div
        ref={dockRef}
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        className="relative h-[26dvh] max-h-[200px] min-h-[116px] shrink-0"
      >
        <p
          aria-live="polite"
          className="absolute inset-x-0 top-0 px-6 text-center text-sm text-ink-soft transition-opacity duration-300"
          style={{ opacity: caption ? 1 : 0 }}
        >
          {caption ?? ' '}
        </p>

      </div>

      {/* Positioned against the viewport rather than any container, so once
          it starts dodging it can use the whole screen. The z-index keeps it
          tappable wherever it lands. */}
      <button
        type="button"
        onClick={onNo}
        onMouseEnter={dodging && finePointer ? dodge : undefined}
        aria-label="Absolutely not"
        title="Absolutely not"
        style={{
          width: noWidth,
          height: noHeight,
          fontSize: noFontSize,
          transform: `translate(${noCentre.x - noWidth / 2}px, ${noCentre.y - noHeight / 2}px)`,
          transition: stage ? springy : 'none',
        }}
        className="fixed top-0 left-0 z-30 cursor-pointer overflow-hidden rounded-full border-2 border-accent/30 bg-white px-2 font-semibold text-ink-soft whitespace-nowrap active:brightness-95"
      >
        <span className="block overflow-hidden text-ellipsis">
          Absolutely not
        </span>
      </button>
    </div>
  )
}
