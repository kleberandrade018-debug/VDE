import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Zap, 
  ArrowRight, 
  MessageSquare, 
  Gauge, 
  BatteryCharging, 
  ShieldCheck, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { settings, products, setSelectedProduct } = useStore();

  const stakeProduct = products.find((p) => p.name.includes('Stake') || p.id === 'vde-01');
  const featuredImage = stakeProduct?.images?.[0] || '/images/scooter_stake_red.jpg';
  const featuredPrice = stakeProduct?.promoPrice ?? stakeProduct?.price ?? 4998.90;

  const handleConsultantClick = () => {
    const rawPhone = settings.officialWhatsApp || '5511972040833';
    const digitsOnly = rawPhone.replace(/\D/g, '');
    const phone = digitsOnly.startsWith('55') ? digitsOnly : `55${digitsOnly}`;
    const message = encodeURIComponent(
      'Olá! Gostaria de falar com um consultor da Vai de Elétrica para escolher a scooter ideal para mim.'
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('scooters');
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section id="inicio" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#050505] tech-grid-pattern pt-8 pb-16">
      
      {/* Background Lighting & Neon Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#39FF14]/12 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-[#39FF14]/8 blur-[120px] pointer-events-none rounded-full" />

      {/* Cyber line accents */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#39FF14]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines, Slogan & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#39FF14]/40 shadow-[0_0_15px_rgba(57,255,20,0.15)] animate-in fade-in duration-700">
              <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
              <span className="text-xs uppercase tracking-widest text-[#39FF14] font-bold">
                NOVA GERAÇÃO DE SCOOTERS ELÉTRICAS
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tight text-white font-heading uppercase leading-[1.08]">
              SUA LIBERDADE COMEÇA SOBRE{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] via-[#85ff6b] to-white drop-shadow-[0_0_25px_rgba(57,255,20,0.4)]">
                DUAS RODAS.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-[#A3A3A3] max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Descubra uma nova maneira de se locomover. Tecnologia, economia e estilo para transformar sua experiência de mobilidade.
            </p>

            {/* CTAs */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={scrollToCatalog}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(57,255,20,0.5)] hover:shadow-[0_0_35px_rgba(57,255,20,0.8)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>EXPLORAR SCOOTERS</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={handleConsultantClick}
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#181818] hover:bg-[#222222] text-white hover:text-[#39FF14] border border-[#2a2a2a] hover:border-[#39FF14]/50 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer shadow-lg"
              >
                <MessageSquare className="w-4 h-4 text-[#39FF14]" />
                <span>FALAR COM UM CONSULTOR</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-6 grid grid-cols-3 gap-3 sm:gap-6 border-t border-[#1e1e1e] max-w-xl mx-auto lg:mx-0">
              <div className="bg-[#121212]/80 backdrop-blur-sm border border-[#222222] p-3 rounded-xl text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-black text-[#39FF14] font-heading">
                  100%
                </div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider">
                  Zero Emissões
                </div>
              </div>

              <div className="bg-[#121212]/80 backdrop-blur-sm border border-[#222222] p-3 rounded-xl text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-black text-white font-heading">
                  Bivolt
                </div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider">
                  Recarga Residencial
                </div>
              </div>

              <div className="bg-[#121212]/80 backdrop-blur-sm border border-[#222222] p-3 rounded-xl text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-black text-[#39FF14] font-heading">
                  12 Meses
                </div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider">
                  Garantia de Fábrica
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: High Impact Scooter Imagery with Tech Hologram Aesthetics */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Glowing Backdrop Ring */}
            <div className="absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full border border-[#39FF14]/30 shadow-[0_0_50px_rgba(57,255,20,0.25)] animate-pulse" />
            <div className="absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full border border-dashed border-[#39FF14]/15" />

            {/* Scooter Showcase Card with STAKE 1000W */}
            <div
              onClick={() => {
                if (stakeProduct) setSelectedProduct(stakeProduct);
                else scrollToCatalog();
              }}
              className="relative z-10 w-full max-w-lg group cursor-pointer"
            >
              
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#181818] to-[#0a0a0a] border border-[#262626] group-hover:border-[#39FF14]/60 shadow-[0_20px_50px_rgba(0,0,0,0.9)] transition-all duration-500">
                
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#0d0d0d] flex items-center justify-center p-3">
                  <img
                    src={featuredImage}
                    alt="Scooter Elétrica Stake 1000W Modelo em Destaque"
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/scooter_stake_red.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-40 pointer-events-none" />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 left-4 bg-[#050505]/85 backdrop-blur-md border border-[#39FF14]/60 px-3 py-1 rounded-full text-[11px] font-bold text-[#39FF14] flex items-center gap-1.5 shadow-[0_0_15px_rgba(57,255,20,0.35)]">
                    <Sparkles className="w-3.5 h-3.5 fill-[#39FF14]" />
                    MODELO EM DESTAQUE
                  </div>

                  <div className="absolute top-4 right-4 bg-[#181818]/90 backdrop-blur-md border border-gray-700 px-3 py-1 rounded-full text-[11px] font-semibold text-white">
                    Para-Brisa & Baú Inclusos
                  </div>
                </div>

                {/* Footer bar inside card */}
                <div className="p-5 bg-[#121212] border-t border-[#222222] flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#A3A3A3] block">
                      Sucesso de Vendas • 1000W
                    </span>
                    <h3 className="text-lg font-bold text-white font-heading group-hover:text-[#39FF14] transition-colors">
                      Stake 1000W Pro
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-[#39FF14] font-bold uppercase tracking-wider block">
                      A partir de
                    </span>
                    <span className="text-lg font-extrabold text-white font-mono-tech">
                      R$ {featuredPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

              </div>

              {/* Holographic floating badge bottom */}
              <div className="absolute -bottom-5 -left-4 sm:left-4 bg-[#181818]/95 backdrop-blur-md border border-[#39FF14]/40 p-3 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#39FF14]/20 border border-[#39FF14]/50 flex items-center justify-center">
                  <BatteryCharging className="w-5 h-5 text-[#39FF14]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Recarga em Tomada Comum</div>
                  <div className="text-[10px] text-[#A3A3A3]">110V ou 220V em 4 a 6 horas</div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Scroll indicator */}
        <div className="mt-14 flex justify-center">
          <button 
            onClick={scrollToCatalog}
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#39FF14] transition-colors cursor-pointer"
            aria-label="Rolar para o catálogo"
          >
            <span className="text-[10px] uppercase tracking-widest font-semibold">Ver Catálogo</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-[#39FF14]" />
          </button>
        </div>

      </div>

    </section>
  );
};
