import { useLocation } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { PageTransition } from './components/layout/PageTransition'
import { Mascot } from './components/mascot/Mascot'
import { HeaderV2 } from './components/home2/HeaderV2'
import { FooterV2 } from './components/home2/FooterV2'
import bgPattern from '../assets/bg-pattern.png'

function App() {
  // The new design is the site; the previous one is kept at /staryi with its
  // own menu, footer and patterned background.
  const redesign = !useLocation().pathname.startsWith('/staryi')

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
