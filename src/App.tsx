import { useLocation } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { PageTransition } from './components/layout/PageTransition'
import { Mascot } from './components/mascot/Mascot'
import { HeaderV2 } from './components/home2/HeaderV2'
import { FooterV2 } from './components/home2/FooterV2'
import bgPattern from '../assets/bg-pattern.png'

function App() {
  // The new design lives under /novaya until the theatre approves it; there it
  // brings its own menu, footer and plain paper background.
  const redesign = useLocation().pathname.startsWith('/novaya')

  return (
    <div
      className="font-body text-ink min-h-screen"
      style={
        redesign
          ? { backgroundColor: 'var(--color-paper)' }
          : {
              backgroundImage: `url(${bgPattern})`,
              backgroundRepeat: 'repeat',
              backgroundSize: '1100px',
              backgroundColor: 'var(--color-paper)',
            }
      }
    >
      {redesign ? <HeaderV2 /> : <Header />}
      <PageTransition />
      {redesign ? <FooterV2 /> : <Footer />}
      <Mascot />
    </div>
  )
}

export default App
