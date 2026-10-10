import { useLocation } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { PageTransition } from './components/layout/PageTransition'
import { Mascot } from './components/mascot/Mascot'
import { HeaderV2 } from './components/home2/HeaderV2'
import { FooterV2 } from './components/home2/FooterV2'
import { ReviewInvite } from './components/reviews/Review'
import { TicketOverlay } from './components/tickets/TicketOverlay'
import { RouteMeta } from './seo/RouteMeta'
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
      <RouteMeta />
      {redesign ? <HeaderV2 /> : <Header />}
      <PageTransition />
      {redesign ? <FooterV2 /> : <Footer />}
      <Mascot />
      {redesign && <ReviewInvite />}
      {redesign && <TicketOverlay />}
    </div>
  )
}

export default App
