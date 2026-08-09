/*
  Where the "Absolutely not" button is allowed to land once the Yes button
  has stopped growing.

  The safe area is the viewport inset by EDGE on every side, minus the Yes
  button's bounds grown by CLEARANCE. That leaves up to four bands, above,
  below, left and right of the Yes button. A band only counts if the whole
  button fits inside it, so the result is never clipped by a screen edge and
  never sits under the Yes button.
*/

export const EDGE = 16 // keep at least this far inside every viewport edge
export const CLEARANCE = 16 // and this far away from the Yes button
const MIN_TRAVEL = 90 // a new spot should feel like a move, not a twitch
const SAMPLES = 12

const clamp = (value, low, high) =>
  low > high ? (low + high) / 2 : Math.min(Math.max(value, low), high)

/**
 * Bands the button's centre may occupy. Coordinates are viewport pixels.
 */
export function safeBands({ viewport, yes, width, height, clearance = CLEARANCE }) {
  const halfW = width / 2
  const halfH = height / 2

  const inset = {
    left: EDGE,
    top: EDGE,
    right: viewport.width - EDGE,
    bottom: viewport.height - EDGE,
  }

  const blocked = {
    left: yes.left - clearance,
    top: yes.top - clearance,
    right: yes.right + clearance,
    bottom: yes.bottom + clearance,
  }

  const regions = [
    // Above the Yes button, full width.
    { ...inset, bottom: Math.min(inset.bottom, blocked.top) },
    // Below it, full width.
    { ...inset, top: Math.max(inset.top, blocked.bottom) },
    // Beside it, full height.
    { ...inset, right: Math.min(inset.right, blocked.left) },
    { ...inset, left: Math.max(inset.left, blocked.right) },
  ]

  return regions
    .map((region) => ({
      left: region.left + halfW,
      right: region.right - halfW,
      top: region.top + halfH,
      bottom: region.bottom - halfH,
    }))
    .filter((band) => band.right >= band.left && band.bottom >= band.top)
}

/** True when this centre point keeps the whole button inside a safe band. */
export function isSafe(point, options) {
  if (!point) return false
  return safeBands(options).some(
    (band) =>
      point.x >= band.left &&
      point.x <= band.right &&
      point.y >= band.top &&
      point.y <= band.bottom,
  )
}

function pickBand(bands, random) {
  const areas = bands.map((band) =>
    Math.max(1, (band.right - band.left) * (band.bottom - band.top)),
  )
  const total = areas.reduce((sum, area) => sum + area, 0)
  let roll = random() * total
  for (let i = 0; i < bands.length; i += 1) {
    roll -= areas[i]
    if (roll <= 0) return bands[i]
  }
  return bands[bands.length - 1]
}

/**
 * A new random centre for the button, biased away from where it already is
 * so each dodge reads as a move. Falls back through progressively looser
 * rules rather than ever returning something off screen, because the button
 * has to stay reachable.
 */
export function pickSpot(options, previous, random = Math.random) {
  const { viewport, yes, width, height } = options

  let bands = safeBands(options)
  // If the Yes button leaves no room at all, give up the clearance around it
  // before giving up on staying on screen.
  if (!bands.length) bands = safeBands({ ...options, clearance: 0 })

  if (!bands.length) {
    // Nothing fits beside the Yes button. Stay on screen, as far from its
    // centre as the viewport allows, and rely on the button's z-index to
    // keep it tappable.
    const halfW = width / 2
    const halfH = height / 2
    const yesCx = (yes.left + yes.right) / 2
    const yesCy = (yes.top + yes.bottom) / 2
    return {
      x: clamp(
        yesCx < viewport.width / 2 ? viewport.width : 0,
        EDGE + halfW,
        viewport.width - EDGE - halfW,
      ),
      y: clamp(
        yesCy < viewport.height / 2 ? viewport.height : 0,
        EDGE + halfH,
        viewport.height - EDGE - halfH,
      ),
    }
  }

  let furthest = null
  for (let i = 0; i < SAMPLES; i += 1) {
    const band = pickBand(bands, random)
    const spot = {
      x: band.left + random() * (band.right - band.left),
      y: band.top + random() * (band.bottom - band.top),
    }
    if (!previous) return spot
    const distance = Math.hypot(spot.x - previous.x, spot.y - previous.y)
    if (distance >= MIN_TRAVEL) return spot
    if (!furthest || distance > furthest.distance) {
      furthest = { ...spot, distance }
    }
  }
  return { x: furthest.x, y: furthest.y }
}
