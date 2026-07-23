import { AfishaPreview } from '../components/home/AfishaPreview'
import { ArtBand } from '../components/home/ArtBand'
import { FestivalBand } from '../components/home/FestivalBand'
import { GalleryStrip } from '../components/home/GalleryStrip'
import { Hero } from '../components/home/Hero'
import { ManifestoBands } from '../components/home/ManifestoBands'
import { ManifestoDirector } from '../components/home/ManifestoDirector'
import { RepertoirePreview } from '../components/home/RepertoirePreview'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ManifestoBands />
      <AfishaPreview />
      <RepertoirePreview />
      <ManifestoDirector />
      <FestivalBand />
      <ArtBand />
      <GalleryStrip />
    </main>
  )
}
