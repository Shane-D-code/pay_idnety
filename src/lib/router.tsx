import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export const ROUTES = [
  { path: '/console', label: 'COMMAND CENTER', short: 'CONSOLE', glyph: '▣' },
  { path: '/identity', label: 'IDENTITY TWINS', short: 'IDENTITY', glyph: '◈' },
  { path: '/sessions', label: 'LIVE SESSIONS', short: 'SESSIONS', glyph: '▤' },
  { path: '/simulation', label: 'ATTACK SIMULATION', short: 'SIMULATE', glyph: '▶' },
  { path: '/attacktrace', label: 'ATTACKTRACE', short: 'TRACE', glyph: '⋔' },
  { path: '/deception', label: 'DECEPTION', short: 'DECOY', glyph: '◉' },
  { path: '/incidents', label: 'INCIDENTS', short: 'INCIDENTS', glyph: '⚑' },
  { path: '/vaccination', label: 'SECURITY VACCINATION', short: 'VACCINE', glyph: '✚' },
] as const

export type RoutePath = (typeof ROUTES)[number]['path'] | '/'

interface RouterValue {
  path: string
  navigate: (to: string) => void
}

const RouterContext = createContext<RouterValue | null>(null)

const readPath = () => {
  const raw = window.location.hash.replace(/^#/, '')
  if (!raw || raw === '/') return '/'
  return raw.startsWith('/') ? raw : `/${raw}`
}

export function HashRouter({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(() => (typeof window === 'undefined' ? '/' : readPath()))

  useEffect(() => {
    const onChange = () => setPath(readPath())
    window.addEventListener('hashchange', onChange)
    if (!window.location.hash) window.location.hash = '#/'
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = useCallback((to: string) => {
    const next = to === '/' ? '#/' : `#${to}`
    if (window.location.hash === next) {
      setPath(to)
      return
    }
    window.location.hash = next
  }, [])

  const value = useMemo(() => ({ path, navigate }), [path, navigate])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used inside <HashRouter>')
  return ctx
}

export function useNavigate() {
  return useRouter().navigate
}