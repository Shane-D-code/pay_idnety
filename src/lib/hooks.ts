import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Tweens a number toward a target with an ease-out curve — used by every
 * metric readout in the console so numbers "count up" on arrival.
 */
export function useCountUp(target: number, duration = 1400, delay = 0) {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const raf = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return
    let start = 0
    let cancelled = false

    const tick = (t: number) => {
      if (cancelled) return
      if (!start) start = t
      const elapsed = t - start - delay
      if (elapsed < 0) {
        raf.current = requestAnimationFrame(tick)
        return
      }
      const p = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(from + (target - from) * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
      else fromRef.current = target
    }

    raf.current = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf.current)
      fromRef.current = target
    }
  }, [target, duration, delay])

  return value
}

/** Terminal-style typewriter reveal. */
export function useTypewriter(text: string, speed = 14, enabled = true) {
  const [out, setOut] = useState(enabled ? '' : text)
  const [done, setDone] = useState(!enabled)

  useEffect(() => {
    if (!enabled) {
      setOut(text)
      setDone(true)
      return
    }
    setOut('')
    setDone(false)
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setOut(text.slice(0, i))
      if (i >= text.length) {
        window.clearInterval(id)
        setDone(true)
      }
    }, speed)
    return () => window.clearInterval(id)
  }, [text, speed, enabled])

  return { text: out, done }
}

export function useKey(key: string, handler: () => void, enabled = true) {
  const cb = useCallback(handler, [handler])
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === key) cb()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [key, cb, enabled])
}