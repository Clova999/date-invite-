import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * State that survives a refresh. Reads once on mount, writes on every change.
 */
export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) return initialValue
      return { ...initialValue, ...JSON.parse(raw) }
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Private mode or a full quota. Not worth breaking the app over.
    }
  }, [key, value])

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Ignore, see above.
    }
    setValue(initialValue)
  }, [key, initialValue])

  return [value, setValue, reset]
}

/** Live result of a CSS media query. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (!window.matchMedia) return
    const list = window.matchMedia(query)
    const onChange = (event) => setMatches(event.matches)
    setMatches(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/**
 * True when the person has asked their device to keep motion to a minimum.
 */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * True for a mouse or trackpad. False for touch, where hover does not exist
 * and a dodge on hover would fire on the tap itself.
 */
export function useFinePointer() {
  return useMediaQuery('(pointer: fine)')
}

/**
 * Live viewport size. Recomputed on resize and on orientation change, which
 * is what keeps the growing Yes button inside the screen when the phone turns.
 */
export function useViewportSize() {
  const [size, setSize] = useState(() => readViewport())

  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setSize(readViewport()))
    }

    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    // Mobile browsers resize the visual viewport when the URL bar slides away.
    window.visualViewport?.addEventListener('resize', update)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [])

  return size
}

function readViewport() {
  if (typeof window === 'undefined') return { width: 390, height: 780 }
  return {
    width: window.visualViewport?.width ?? window.innerWidth,
    height: window.visualViewport?.height ?? window.innerHeight,
  }
}

/**
 * Position and size of an element in viewport coordinates, remeasured
 * whenever it resizes or the window changes. Viewport space is what the
 * ask screen needs, because the dodging button is positioned against the
 * whole screen rather than against any one container.
 */
export function useMeasuredRect() {
  const [rect, setRect] = useState(null)
  const nodeRef = useRef(null)
  const observerRef = useRef(null)

  const measure = useCallback(() => {
    const node = nodeRef.current
    if (!node) return
    // Sub pixel accurate, which keeps the two ask screen buttons on exactly
    // the same centre line before the first press.
    const box = node.getBoundingClientRect()
    setRect((prev) =>
      prev &&
      prev.x === box.x &&
      prev.y === box.y &&
      prev.width === box.width &&
      prev.height === box.height
        ? prev
        : { x: box.x, y: box.y, width: box.width, height: box.height },
    )
  }, [])

  const ref = useCallback(
    (node) => {
      observerRef.current?.disconnect()
      nodeRef.current = node
      if (!node) return
      measure()
      if (typeof ResizeObserver !== 'undefined') {
        observerRef.current = new ResizeObserver(measure)
        observerRef.current.observe(node)
      }
    },
    [measure],
  )

  useEffect(() => {
    // A resize can move an element without changing its own size.
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)
    return () => {
      observerRef.current?.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
    }
  }, [measure])

  return [ref, rect]
}
