// createHashRouter, not createBrowserRouter -- GitHub Pages has no server-side
// rewrite, so a direct link / refresh on e.g. /afisha would 404. This is a
// deploy-target crutch, not a permanent choice: swap back to
// createBrowserRouter (one line) the day the site moves to a host that can
// rewrite unknown paths to index.html.
import { Navigate, createHashRouter } from 'react-router-dom'
import { FromNovaya } from './pages/FromNovaya'
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
      // the site
      { index: true, element: <HomePageV2 /> },
      { path: 'afisha', element: <AfishaPageV2 /> },
      { path: 'repertuar', element: <RepertoirePageV2 /> },
      { path: 'spektakl/:slug', element: <ShowPageV2 /> },
      { path: 'kursy', element: <CoursesPageV2 /> },
      // the old design had a page per course group; its links land on the courses
      { path: 'kursy/:groupKey', element: <Navigate to="/kursy" replace /> },
      { path: 'festival', element: <FestivalPageV2 /> },
      { path: 'o-teatre', element: <AboutPageV2 /> },
      { path: 'komanda', element: <TeamPageV2 /> },
      { path: 'galereya', element: <GalleryPageV2 /> },
      { path: 'kontakty', element: <ContactsPageV2 /> },
      { path: 'politika', element: <PrivacyPageV2 /> },
      // links shared while the new design was being approved
      { path: 'novaya/*', element: <FromNovaya /> },

      // the previous design, kept for reference
      { path: 'staryi', element: <HomePage /> },
      { path: 'staryi/afisha', element: <AfishaPage /> },
      { path: 'staryi/repertuar', element: <RepertoirePage /> },
      { path: 'staryi/o-teatre', element: <AboutPage /> },
      { path: 'staryi/komanda', element: <TeamPage /> },
      { path: 'staryi/galereya', element: <GalleryPage /> },
      { path: 'staryi/kursy', element: <CoursesPage /> },
      { path: 'staryi/kursy/:groupKey', element: <CourseGroupPage /> },
      { path: 'staryi/kontakty', element: <ContactsPage /> },
      { path: 'staryi/politika', element: <PrivacyPolicyPage /> },
      { path: 'staryi/*', element: <NotFoundPage /> },

      { path: '*', element: <NotFoundPageV2 /> },
    ],
  },
])
