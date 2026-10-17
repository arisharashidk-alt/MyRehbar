import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home from './pages/Home'

// Every page except Home is loaded only when visited, to keep the first download small.
const Rehbars = lazy(() => import('./pages/Rehbars'))
const RehbarProfile = lazy(() => import('./pages/RehbarProfile'))
const Scholarships = lazy(() => import('./pages/Scholarships'))
const ScholarshipDetail = lazy(() => import('./pages/ScholarshipDetail'))
const Students = lazy(() => import('./pages/Students'))
const BecomeRehbar = lazy(() => import('./pages/BecomeRehbar'))
const Resources = lazy(() => import('./pages/Resources'))
const ResourceDetail = lazy(() => import('./pages/ResourceDetail'))
const Schools = lazy(() => import('./pages/Schools'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Privacy = lazy(() => import('./pages/Privacy'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="rehbars" element={<Rehbars />} />
        <Route path="rehbars/:slug" element={<RehbarProfile />} />
        <Route path="scholarships" element={<Scholarships />} />
        <Route path="scholarships/:slug" element={<ScholarshipDetail />} />
        <Route path="students" element={<Students />} />
        <Route path="become-a-rehbar" element={<BecomeRehbar />} />
        <Route path="resources" element={<Resources />} />
        <Route path="resources/:slug" element={<ResourceDetail />} />
        <Route path="schools" element={<Schools />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
