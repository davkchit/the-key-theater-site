import { AfishaPreview } from '../components/home/AfishaPreview'
import { ArtBand } from '../components/home/ArtBand'
import { CoursesPreview } from '../components/home/CoursesPreview'
import { FestivalBand } from '../components/home/FestivalBand'
import { GalleryStrip } from '../components/home/GalleryStrip'
import { Hero } from '../components/home/Hero'
import { LabBand } from '../components/home/LabBand'
import { ManifestoBands } from '../components/home/ManifestoBands'
import { NextShowBand } from '../components/home/NextShowBand'
import { RepertoirePreview } from '../components/home/RepertoirePreview'
import { nextShow } from '../data/afisha'

export default function HomePage() {
  return (
    <main>
      <Hero />
      {nextShow && <NextShowBand show={nextShow} />}
      <ManifestoBands />
      <AfishaPreview />
      <RepertoirePreview />
      <FestivalBand />
      <CoursesPreview />
      <LabBand />
      <GalleryStrip />
      <ArtBand />
    </main>
  )
}
