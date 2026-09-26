// createHashRouter, not createBrowserRouter -- GitHub Pages has no server-side
// rewrite, so a direct link / refresh on e.g. /afisha would 404. This is a
// deploy-target crutch, not a permanent choice: swap back to
// createBrowserRouter (one line) the day the site moves to a host that can
// rewrite unknown paths to index.html.
import { createHashRouter } from 'react-router-dom'
import App from './App'
import HomePage from './pages/HomePage'
import HomePageV2 from './pages/HomePageV2'
import RepertoirePageV2 from './pages/RepertoirePageV2'
import ShowPageV2 from './pages/ShowPageV2'
import CoursesPageV2 from './pages/CoursesPageV2'
import NotFoundPageV2 from './pages/NotFoundPageV2'
import FestivalPageV2 from './pages/FestivalPageV2'
import AboutPageV2 from './pages/AboutPageV2'
import TeamPageV2 from './pages/TeamPageV2'
import AfishaPageV2 from './pages/AfishaPageV2'
import GalleryPageV2 from './pages/GalleryPageV2'
import ContactsPageV2 from './pages/ContactsPageV2'
import PrivacyPageV2 from './pages/PrivacyPageV2'
import AfishaPage from './pages/AfishaPage'
import RepertoirePage from './pages/RepertoirePage'
import AboutPage from './pages/AboutPage'
import TeamPage from './pages/TeamPage'
import GalleryPage from './pages/GalleryPage'
import CoursesPage from './pages/CoursesPage'
import CourseGroupPage from './pages/CourseGroupPage'
import ContactsPage from './pages/ContactsPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import NotFoundPage from './pages/NotFoundPage'

export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'novaya', element: <HomePageV2 /> },
      { path: 'novaya/repertuar', element: <RepertoirePageV2 /> },
      { path: 'novaya/spektakl/:slug', element: <ShowPageV2 /> },
      { path: 'novaya/kursy', element: <CoursesPageV2 /> },
      { path: 'novaya/festival', element: <FestivalPageV2 /> },
      { path: 'novaya/o-teatre', element: <AboutPageV2 /> },
      { path: 'novaya/komanda', element: <TeamPageV2 /> },
      { path: 'novaya/afisha', element: <AfishaPageV2 /> },
      { path: 'novaya/galereya', element: <GalleryPageV2 /> },
      { path: 'novaya/kontakty', element: <ContactsPageV2 /> },
      { path: 'novaya/politika', element: <PrivacyPageV2 /> },
      { path: 'novaya/*', element: <NotFoundPageV2 /> },
      { path: 'afisha', element: <AfishaPage /> },
      { path: 'repertuar', element: <RepertoirePage /> },
      { path: 'o-teatre', element: <AboutPage /> },
      { path: 'komanda', element: <TeamPage /> },
      { path: 'galereya', element: <GalleryPage /> },
      { path: 'kursy', element: <CoursesPage /> },
      { path: 'kursy/:groupKey', element: <CourseGroupPage /> },
      { path: 'kontakty', element: <ContactsPage /> },
      { path: 'politika', element: <PrivacyPolicyPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
