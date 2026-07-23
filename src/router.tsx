// createHashRouter, not createBrowserRouter -- GitHub Pages has no server-side
// rewrite, so a direct link / refresh on e.g. /afisha would 404. This is a
// deploy-target crutch, not a permanent choice: swap back to
// createBrowserRouter (one line) the day the site moves to a host that can
// rewrite unknown paths to index.html.
import { createHashRouter } from 'react-router-dom'
import App from './App'
import HomePage from './pages/HomePage'
import AfishaPage from './pages/AfishaPage'
import RepertoirePage from './pages/RepertoirePage'
import AboutPage from './pages/AboutPage'
import TeamPage from './pages/TeamPage'
import GalleryPage from './pages/GalleryPage'
import CoursesPage from './pages/CoursesPage'
import ContactsPage from './pages/ContactsPage'
import NotFoundPage from './pages/NotFoundPage'

export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'afisha', element: <AfishaPage /> },
      { path: 'repertuar', element: <RepertoirePage /> },
      { path: 'o-teatre', element: <AboutPage /> },
      { path: 'komanda', element: <TeamPage /> },
      { path: 'galereya', element: <GalleryPage /> },
      { path: 'kursy', element: <CoursesPage /> },
      { path: 'kontakty', element: <ContactsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
