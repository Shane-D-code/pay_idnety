import { HashRouter, useRouter } from '@/lib/router'
import { SimulationProvider } from '@/sim/SimulationProvider'
import { AppShell } from '@/components/layout/AppShell'
import { Landing } from '@/pages/Landing'
import { CommandCenter } from '@/pages/CommandCenter'
import { IdentityTwin } from '@/pages/IdentityTwin'
import { Sessions } from '@/pages/Sessions'
import { Simulation } from '@/pages/Simulation'
import { AttackTrace } from '@/pages/AttackTrace'
import { Deception } from '@/pages/Deception'
import { Incidents } from '@/pages/Incidents'
import { Vaccination } from '@/pages/Vaccination'
import { Conclusion } from '@/pages/Conclusion'

const PAGES: Record<string, () => React.JSX.Element> = {
  '/console': CommandCenter,
  '/identity': IdentityTwin,
  '/sessions': Sessions,
  '/simulation': Simulation,
  '/attacktrace': AttackTrace,
  '/deception': Deception,
  '/incidents': Incidents,
  '/vaccination': Vaccination,
}

function Router() {
  const { path } = useRouter()

  if (path === '/') return <Landing />
  if (path === '/conclusion') return <Conclusion />

  const Page = PAGES[path] ?? CommandCenter
  return (
    <AppShell>
      <Page />
    </AppShell>
  )
}

export default function App() {
  return (
    <SimulationProvider>
      <HashRouter>
        <Router />
      </HashRouter>
    </SimulationProvider>
  )
}