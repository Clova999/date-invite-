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

/**
 * True when the person has asked their device to keep motion to a minimum.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (!window.matchMedia) return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event) => setReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
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
 * Measures an element once it exists and again whenever it resizes.
 * Used to learn the natural, unscaled size of the Yes button.
 */
export function useMeasuredSize() {
  const [size, setSize] = useState(null)
  const nodeRef = useRef(null)
  const observerRef = useRef(null)

  const ref = useCallback((node) => {
    observerRef.current?.disconnect()
    nodeRef.current = node
    if (!node) return

    const measure = () => {
      // Sub pixel accurate, which keeps the two ask screen buttons on exactly
      // the same centre line before the first press.
      const rect = node.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    }
    measure()

    if (typeof ResizeObserver !== 'undefined') {
      observerRef.current = new ResizeObserver(measure)
      observerRef.current.observe(node)
    }
  }, [])

  useEffect(() => () => observerRef.current?.disconnect(), [])

  return [ref, size]
}
