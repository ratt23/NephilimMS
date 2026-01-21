import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './views/HomeView';
import McuView from './views/McuView';
import HomeCareView from './views/HomeCareView';
import ArticleView from './views/ArticleView';
import ArticleDetailView from './views/ArticleDetailView';
import SitemapView from './views/SitemapView';
import SlideshowView from './views/SlideshowView';
import HealthPopup from './components/HealthPopup';
import GmbWidget from './components/GmbWidget';
import CategoryNav from './components/CategoryNav';
import AnalyticsTracker from './components/AnalyticsTracker';

import { SearchProvider } from './context/SearchContext';
import { ConfigProvider } from './context/ConfigContext';

const AppContent = () => {
  const location = useLocation();

  const isSlideshow = location.pathname === '/slideshow';

  // Dynamic Canonical Tag Update
  useEffect(() => {
    const canonicalLink = document.querySelector("link[rel='canonical']");
    if (canonicalLink) {
      // Ensure we point to the main domain
      canonicalLink.href = `https://shab.web.id${location.pathname}`;
    }
  }, [location.pathname]);

  return (
    <div className="font-[Inter] bg-slate-50 min-h-screen relative overflow-x-hidden text-[#1f2937]">
      <AnalyticsTracker />
      {!isSlideshow && <HealthPopup />}
      {!isSlideshow && <Header />}
      {!isSlideshow && <CategoryNav />}

      <main className={!isSlideshow ? "main-content" : ""}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeView />} />
          <Route path="/jadwal-dokter/siloam-ambon/:specialtyId" element={<HomeView />} />
          <Route path="/mcu" element={<McuView />} />
          <Route path="/homecare" element={<HomeCareView />} />
          <Route path="/article" element={<ArticleView />} />
          <Route path="/article/:slug" element={<ArticleDetailView />} />
          <Route path="/sitemap.xml" element={<SitemapView />} />
          <Route path="/slideshow" element={<SlideshowView />} />
        </Routes>
      </main>

      {!isSlideshow && <GmbWidget />}
      {!isSlideshow && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ConfigProvider>
      <SearchProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </SearchProvider>
    </ConfigProvider>
  );
}

export default App;
