import config from './config.js'

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
  const vibes = pickedItems(answers.vibeOrder, config.vibes)
  const restaurants = pickedItems(answers.restaurantOrder, config.restaurants)

  const lines = ['Thursday, sorted. Here is what she picked.', '']

  if (vibes.length) {
    lines.push('Vibe, in her order:')
    vibes.forEach((vibe, index) => lines.push(`${index + 1}. ${vibe.name}`))
    lines.push('')
  }

  if (restaurants.length) {
    lines.push('Restaurants, in her order:')
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

export function whatsAppLink(text) {
  const digits = (config.myWhatsAppNumber || '').replace(/\D/g, '')
  const message = encodeURIComponent(text)
  return digits
    ? `https://wa.me/${digits}?text=${message}`
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
