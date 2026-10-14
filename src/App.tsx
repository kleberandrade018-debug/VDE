/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CatalogSection } from './components/CatalogSection';
import { OffersSection } from './components/OffersSection';
import { BenefitsSection } from './components/BenefitsSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname === '/admin' || window.location.hash === '#admin';
    }
    return false;
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const isCurrentAdmin = window.location.pathname === '/admin' || window.location.hash === '#admin';
      setIsAdminRoute(isCurrentAdmin);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToStore = () => {
    if (window.location.hash === '#admin') {
      window.location.hash = '';
    }
    if (window.location.pathname === '/admin') {
      window.history.pushState({}, '', '/');
    }
    setIsAdminRoute(false);
  };

  return (
    <StoreProvider>
      {isAdminRoute ? (
        <AdminDashboardPage onBackToStore={navigateToStore} />
      ) : (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col selection:bg-[#39FF14] selection:text-black">
          {/* Navigation Header */}
          <Header />

          {/* Main Content Sections */}
          <main className="flex-1">
            {/* Hero Section */}
            <HeroSection />

            {/* Catalog of Scooters with dynamic filters */}
            <CatalogSection />

            {/* Special Offers Section */}
            <OffersSection />

            {/* 4 Differentials & Interactive Savings Simulator */}
            <BenefitsSection />

            {/* About Section with Official Manifesto */}
            <AboutSection />
          </main>

          {/* Footer with Legal Info, Policies & Social links */}
          <Footer />

          {/* Modals & Overlays */}
          <ProductDetailModal />
          <CartDrawer />
          <CheckoutModal />
          <ApkDownloadModal />

          {/* Floating WhatsApp FAB Button */}
          <FloatingWhatsApp />
        </div>
      )}
    </StoreProvider>
  );
}
