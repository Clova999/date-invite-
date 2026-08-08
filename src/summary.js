import {
  activities as allActivities,
  restaurants as allRestaurants,
  whatsappNumber,
} from './config.js'

/** Items are matched by name, so reordering config.js does not lose picks. */
export function pickedItems(order, all) {
  return order
    .map((name) => all.find((item) => item.name === name))
    .filter(Boolean)
}

/**
 * The plain text version she copies or sends over WhatsApp.
 */
export function buildSummaryText(answers) {
  const activities = pickedItems(answers.activityOrder, allActivities)
  const restaurants = pickedItems(answers.restaurantOrder, allRestaurants)

  const lines = ['Thursday, sorted. Here is what she picked.', '']

  if (activities.length) {
    lines.push('Doing, in her order:')
    activities.forEach((item, index) => lines.push(`${index + 1}. ${item.name}`))
    lines.push('')
  }

  if (restaurants.length) {
    lines.push('Eating, in her order:')
    restaurants.forEach((place, index) =>
      lines.push(
        `${index + 1}. ${place.name}${place.area ? ` (${place.area})` : ''}`,
      ),
    )
    lines.push('')
  }

  const note = answers.note.trim()
  if (note) {
    lines.push('Her note:')
    lines.push(note)
    lines.push('')
  }

  lines.push(jokeLine(answers.noCount))

  return lines.join('\n')
}

export function jokeLine(noCount) {
  if (noCount === 0) return 'Bonus: she said yes on the very first tap.'
  if (noCount === 1) return 'Bonus: one press of "Absolutely not" before the yes.'
  return `Bonus: ${noCount} presses of "Absolutely not" before the yes. The button got quite big.`
}

/**
 * True only for a number that could actually receive a message. A left over
 * placeholder like "27XXXXXXXXX" would otherwise strip down to "27" and
 * produce a dead wa.me link, so it counts as not set.
 */
export function hasRealNumber() {
  const raw = whatsappNumber || ''
  if (/[a-z]/i.test(raw)) return false
  return raw.replace(/\D/g, '').length >= 8
}

export function whatsAppLink(text) {
  const message = encodeURIComponent(text)
  return hasRealNumber()
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`
    : `https://wa.me/?text=${message}`
}

/** Clipboard API with a fallback for browsers that block it. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const field = document.createElement('textarea')
      field.value = text
      field.setAttribute('readonly', '')
      field.style.position = 'fixed'
      field.style.opacity = '0'
      document.body.appendChild(field)
      field.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(field)
      return ok
    } catch {
      return false
    }
  }
}
