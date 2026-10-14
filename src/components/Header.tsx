import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { 
  Zap, 
  ShoppingBag, 
  Search, 
  Download, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles,
  Smartphone,
  SlidersHorizontal,
  Shield
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    settings, 
    cartItemsCount, 
    setIsCartOpen, 
    triggerApkDownload,
    setIsAdminOpen,
    searchQuery,
    setSearchQuery
  } = useStore();

  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const openAdminPanel = () => {
    window.location.hash = '#admin';
    window.dispatchEvent(new Event('hashchange'));
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      {settings.announcementBanner && (
        <div className="bg-[#121212] border-b border-[#222222] py-2 px-4 text-xs font-medium text-center text-gray-300 flex items-center justify-center gap-2 relative z-50">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/40">
            DESTAQUE
          </span>
          <span className="truncate max-w-[85vw] sm:max-w-none">{settings.announcementBanner}</span>
          <button 
            onClick={openAdminPanel}
            className="hidden md:inline-flex text-[10px] text-gray-400 hover:text-[#39FF14] underline ml-2 transition-colors cursor-pointer"
            title="Acessar Gestão da Loja"
          >
            Painel Admin
          </button>
        </div>
      )}

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#050505]/95 backdrop-blur-md border-b border-[#181818] shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
            : 'bg-[#050505] border-b border-[#181818]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left: Brand Logo */}
            <div className="flex items-center gap-3">
              <a 
                href="#inicio" 
                onClick={(e) => { e.preventDefault(); scrollToSection('inicio'); }}
                className="flex items-center gap-2.5 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#181818] to-[#050505] border border-[#39FF14]/40 flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.25)] group-hover:border-[#39FF14] group-hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-all duration-300">
                  <Zap className="w-5 h-5 text-[#39FF14] fill-[#39FF14] animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black tracking-wider text-white font-heading flex items-center gap-1.5">
                    VAI DE <span className="text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">ELÉTRICA</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-[#A3A3A3] font-semibold -mt-1">
                    MOBILIDADE SEM LIMITES
                  </span>
                </div>
              </a>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-300">
              <button
                onClick={() => scrollToSection('inicio')}
                className="hover:text-[#39FF14] transition-colors cursor-pointer hover:drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]"
              >
                Início
              </button>
              <button
                onClick={() => scrollToSection('scooters')}
                className="hover:text-[#39FF14] transition-colors cursor-pointer hover:drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]"
              >
                Scooters
              </button>
              <button
                onClick={() => scrollToSection('ofertas')}
                className="hover:text-[#39FF14] transition-colors cursor-pointer relative group"
              >
                <span className="flex items-center gap-1.5">
                  Ofertas
                  <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
                </span>
              </button>
              <button
                onClick={() => scrollToSection('beneficios')}
                className="hover:text-[#39FF14] transition-colors cursor-pointer"
              >
                Diferenciais
              </button>
              <button
                onClick={() => scrollToSection('sobre')}
                className="hover:text-[#39FF14] transition-colors cursor-pointer"
              >
                Sobre Nós
              </button>
              <button
                onClick={() => scrollToSection('contato')}
                className="hover:text-[#39FF14] transition-colors cursor-pointer"
              >
                Contato
              </button>
            </nav>

            {/* Right: Actions & APK Download Button */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Search Toggle / Input */}
              <div className="relative">
                {showSearchInput ? (
                  <div className="flex items-center bg-[#181818] border border-[#39FF14]/50 rounded-full px-3 py-1.5 shadow-[0_0_10px_rgba(57,255,20,0.2)]">
                    <Search className="w-4 h-4 text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Buscar scooter..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-white text-xs sm:text-sm focus:outline-none w-28 sm:w-44"
                      autoFocus
                    />
                    <button 
                      onClick={() => { setShowSearchInput(false); setSearchQuery(''); }}
                      className="text-gray-400 hover:text-white ml-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSearchInput(true)}
                    className="p-2 sm:p-2.5 rounded-full bg-[#181818] text-gray-300 hover:text-[#39FF14] hover:bg-[#222222] transition-colors border border-transparent hover:border-[#39FF14]/30 cursor-pointer"
                    aria-label="Pesquisar"
                    title="Pesquisar Scooters"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 sm:p-2.5 rounded-full bg-[#181818] text-gray-300 hover:text-[#39FF14] hover:bg-[#222222] transition-colors border border-transparent hover:border-[#39FF14]/30 cursor-pointer"
                aria-label="Carrinho de Compras"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#39FF14] text-black font-extrabold text-[11px] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(57,255,20,0.8)] animate-bounce">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {/* PWA Install Button (If browser supports it and not yet standalone) */}
              {isInstallable && !isInstalled && (
                <button
                  onClick={install}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181818] hover:bg-[#222222] border border-gray-700 hover:border-[#39FF14]/40 text-xs font-semibold text-gray-300 hover:text-white transition cursor-pointer"
                  title="Instalar App no Computador/Navegador"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#39FF14]" />
                  <span>Web App</span>
                </button>
              )}

              {/* Botão Painel Admin (Sempre visível ao lado de BAIXAR APK) */}
              <button
                onClick={openAdminPanel}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] border border-[#2e2e2e] hover:border-[#39FF14]/60 text-xs sm:text-sm font-bold text-gray-200 hover:text-[#39FF14] transition-all shadow-[0_0_12px_rgba(0,0,0,0.6)] cursor-pointer whitespace-nowrap group"
                title="Acessar Painel Administrativo (/admin)"
                id="btn-painel-admin"
              >
                <Shield className="w-4 h-4 text-[#39FF14] group-hover:drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
                <span className="hidden sm:inline">Painel Admin</span>
                <span className="sm:hidden">Admin</span>
              </button>

              {/* MANDATORY BUTTON: BAIXAR APK */}
              <button
                onClick={triggerApkDownload}
                className="flex items-center gap-2 bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.45)] hover:shadow-[0_0_30px_rgba(57,255,20,0.7)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                id="btn-baixar-apk"
              >
                <Download className="w-4 h-4 stroke-[2.8] animate-bounce" />
                <span>BAIXAR APK</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-[#181818] text-gray-300 hover:text-[#39FF14] cursor-pointer"
                aria-label="Abrir Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#0d0d0d] border-b border-[#222222] px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-3 text-base font-semibold">
              <button
                onClick={() => scrollToSection('inicio')}
                className="text-left text-gray-300 hover:text-[#39FF14] py-2 border-b border-[#181818]"
              >
                Início
              </button>
              <button
                onClick={() => scrollToSection('scooters')}
                className="text-left text-gray-300 hover:text-[#39FF14] py-2 border-b border-[#181818]"
              >
                Scooters Elétricas
              </button>
              <button
                onClick={() => scrollToSection('ofertas')}
                className="text-left text-[#39FF14] py-2 border-b border-[#181818] flex items-center justify-between"
              >
                <span>Ofertas Eletrizantes</span>
                <span className="text-[10px] bg-[#39FF14]/20 text-[#39FF14] px-2 py-0.5 rounded-full border border-[#39FF14]/40">
                  Descontos
                </span>
              </button>
              <button
                onClick={() => scrollToSection('beneficios')}
                className="text-left text-gray-300 hover:text-[#39FF14] py-2 border-b border-[#181818]"
              >
                Diferenciais & Benefícios
              </button>
              <button
                onClick={() => scrollToSection('sobre')}
                className="text-left text-gray-300 hover:text-[#39FF14] py-2 border-b border-[#181818]"
              >
                Sobre a Vai de Elétrica
              </button>
              <button
                onClick={() => scrollToSection('contato')}
                className="text-left text-gray-300 hover:text-[#39FF14] py-2 border-b border-[#181818]"
              >
                Fale Conosco
              </button>
            </nav>

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  triggerApkDownload();
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#39FF14] text-black font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.4)]"
              >
                <Download className="w-5 h-5 stroke-[2.5]" />
                BAIXAR APK OFICIAL ANDROID
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.location.hash = '#admin';
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#181818] text-gray-300 hover:text-[#39FF14] py-2.5 rounded-xl border border-[#2a2a2a] text-xs font-semibold"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#39FF14]" />
                Painel Administrativo da Loja (/admin)
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
