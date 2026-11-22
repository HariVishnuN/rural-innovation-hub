import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MotionConfig, motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackgroundCanvas from '../components/BackgroundCanvas';
import { useUltraLite } from '../app/UltraLiteContext';

const MainLayout = () => {
  const { ultraLite } = useUltraLite();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Smooth scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Track scroll position to show/hide floating back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MotionConfig reducedMotion={ultraLite ? "always" : "user"}>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 relative selection:bg-teal-100 selection:text-teal-900">
        {/* Subtle dot-grid + scroll-drawing lines */}
        <BackgroundCanvas />

        {/* Sticky Header with 3px reading progress bar */}
        <Navbar />

        {/* Main Content View with smooth route transitions */}
        <main className="flex-1 relative z-10">
          <motion.div
            key={location.pathname}
            initial={ultraLite ? false : { opacity: 0, y: 12 }}
            animate={ultraLite ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Floating Animated Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 20 }}
              whileHover={{ scale: 1.12, y: -3 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-teal-500/30 border border-teal-400/40 cursor-pointer flex items-center justify-center group"
              title="Scroll to Top"
              aria-label="Scroll to top"
            >
              <ChevronUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Footer */}
        <Footer />
      </div>
    </MotionConfig>
  );
};

export default MainLayout;
