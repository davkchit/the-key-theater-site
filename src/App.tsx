import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { PageTransition } from './components/layout/PageTransition'
import bgPattern from '../assets/bg-pattern.png'

function App() {
  return (
    <div
      className="min-h-screen font-body text-ink"
      style={{
        backgroundImage: `url(${bgPattern})`,
        backgroundRepeat: 'repeat',
        backgroundSize: '1100px',
        backgroundColor: 'var(--color-paper)',
      }}
    >
      <Header />
      <PageTransition />
      <Footer />
    </div>
  )
}

export default App
