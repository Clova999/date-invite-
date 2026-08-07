import { useState } from 'react'

const VIDEO_TYPES = ['.mp4', '.webm', '.mov']

/** Filenames in config.js resolve against /public/media. */
export function mediaUrl(file) {
  if (!file) return null
  if (/^(https?:)?\/\//.test(file) || file.startsWith('/')) return file
  return `${import.meta.env.BASE_URL}media/${file}`
}

export function hasMedia(file) {
  return Boolean(file && file.trim())
}

/**
 * A rounded banner with a fixed aspect ratio, so a tall GIF and a wide photo
 * still line up in the same list. If the file is missing or fails to load the
 * banner removes itself and the card falls back to its text only layout.
 */
export default function MediaBanner({
  file,
  alt,
  aspect = '16 / 10',
  // fill makes the banner take the height its parent gives it instead of
  // deriving height from the aspect ratio. object-fit cover keeps it tidy.
  fill = false,
  onUnavailable,
}) {
  const [state, setState] = useState('loading')
  const url = mediaUrl(file)

  const fail = () => {
    setState('error')
    onUnavailable?.()
  }

  if (!url || state === 'error') return null

  const isVideo = VIDEO_TYPES.some((ext) => url.toLowerCase().endsWith(ext))

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-cream-deep ${fill ? 'h-full' : ''}`}
      style={fill ? undefined : { aspectRatio: aspect }}
    >
      {state === 'loading' && (
        <div className="placeholder-pulse absolute inset-0 bg-gradient-to-br from-cream-deep via-accent-tint to-cream-deep" />
      )}

      {isVideo ? (
        <video
          className="relative h-full w-full object-cover"
          src={url}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={alt}
          onLoadedData={() => setState('ready')}
          onError={fail}
        />
      ) : (
        <img
          className="relative h-full w-full object-cover"
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setState('ready')}
          onError={fail}
          style={{
            opacity: state === 'ready' ? 1 : 0,
            transition: 'opacity 320ms ease',
          }}
        />
      )}
    </div>
  )
}
