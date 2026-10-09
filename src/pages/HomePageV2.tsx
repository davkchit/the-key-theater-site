import { useEffect } from 'react'
import { Hero } from '../components/home2/Hero'
import { PrintFilters } from '../components/home2/parts'
import {
  CoursesBand,
  FestivalStrip,
  MoreThanShows,
  NumbersBand,
  PeopleSection,
  UpcomingShows,
} from '../components/home2/Sections'
import { FindUs, NewsletterBand } from '../components/home2/Contact'
import { GalleryCarousel } from '../components/home2/Gallery'

// The homepage from the approved mockup (September 2026).

export default function HomePageV2() {
  // Safari on iPhone shows :active (the press feedback of buttons) only when
  // some touchstart listener exists; an empty passive one is enough.
  useEffect(() => {
    const noop = () => {}
    document.addEventListener('touchstart', noop, { passive: true })
    return () => document.removeEventListener('touchstart', noop)
  }, [])

  return (
    <div className="bg-paper relative overflow-x-clip">
      <PrintFilters />
      <Hero />
      <FestivalStrip />
      <UpcomingShows />
      <CoursesBand />
      <NumbersBand />
      <PeopleSection />
      <MoreThanShows />
      <GalleryCarousel />
      <NewsletterBand />
      <FindUs />
    </div>
  )
}
