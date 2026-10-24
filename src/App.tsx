import { useCallback, useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Header } from './components/Header'
import { SplashScreen } from './components/SplashScreen'
import { StateMessage } from './components/StateMessage'
import DetailPage from './pages/DetailPage'
import ListingPage from './pages/ListingPage'

function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <StateMessage title="Page not found" message="That address doesn’t exist." />
      <p className="mt-4 text-center">
        <Link to="/" className="font-semibold text-brand hover:underline">Browse all products</Link>
      </p>
    </main>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const hideSplash = useCallback(() => setShowSplash(false), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  // The drawer belongs to the listing page: close it whenever we leave that page.
  useEffect(() => {
    if (pathname !== '/') setSidebarOpen(false)
  }, [pathname])

  // On other pages the menu button takes you to the listing with the filters open.
  const onMenuClick = () => {
    if (pathname === '/') {
      setSidebarOpen((open) => !open)
    } else {
      setSidebarOpen(true)
      navigate('/')
    }
  }

  return (
    <>
      {showSplash && <SplashScreen onDone={hideSplash} />}
      <Header onMenuClick={onMenuClick} />
      <Routes>
        <Route path="/" element={<ListingPage sidebarOpen={sidebarOpen} onCloseSidebar={closeSidebar} />} />
        <Route path="/product/:id" element={<DetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
