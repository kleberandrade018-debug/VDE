import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatBRL, calculateDiscountPercent } from '../utils/formatters';
import { 
  Flame, 
  Clock, 
  ArrowRight, 
  Zap, 
  Battery, 
  Gauge, 
  ShieldCheck,
  Check
} from 'lucide-react';

export const OffersSection: React.FC = () => {
  const { products, setSelectedProduct, addToCart } = useStore();

  // Filter only published products with genuine registered promo discounts
  const offerProducts = products.filter(
    (p) => p.isPublished !== false && p.promoPrice && p.promoPrice < p.price
  );

  if (offerProducts.length === 0) {
    return null;
  }

  return (
    <section id="ofertas" className="py-20 bg-gradient-to-b from-[#050505] via-[#0d0d0d] to-[#050505] relative overflow-hidden">
      
      {/* Background neon ambient */}
      <div className="absolute top-1/2 left-0 w-[450px] h-[450px] bg-[#39FF14]/8 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Flame className="w-3.5 h-3.5 fill-red-400 animate-pulse" />
              CONDIÇÕES ESPECIAIS POR TEMPO LIMITADO
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading uppercase tracking-tight">
              OFERTAS{' '}
              <span className="text-[#39FF14] drop-shadow-[0_0_15px_rgba(57,255,20,0.6)]">
                ELETRIZANTES
              </span>
            </h2>

            <p className="mt-2 text-sm sm:text-base text-[#A3A3A3] max-w-xl">
              Modelos selecionados com descontos exclusivos de fábrica, garantia total e envio prioritário para todo o Brasil.
            </p>
          </div>

          {/* Urgency Badge */}
          <div className="bg-[#181818] border border-[#2a2a2a] px-4 py-3 rounded-2xl flex items-center gap-3 self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
              <Clock className="w-5 h-5 animate-spin duration-3000" />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 block font-semibold">Ofertas Válidas Enquanto Durar o Lote</span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
                Estoque com Desconto Ativo
              </span>
            </div>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offerProducts.map((scooter) => {
            const discountPercent = calculateDiscountPercent(scooter.price, scooter.promoPrice!);
            const savings = scooter.price - scooter.promoPrice!;

            return (
              <div
                key={scooter.id}
                className="bg-[#181818] rounded-3xl border border-[#2a2a2a] hover:border-[#39FF14] transition-all duration-300 flex flex-col overflow-hidden shadow-2xl relative group"
              >
                {/* Promo Badge Top */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    -{discountPercent}% OFF
                  </span>
                  <span className="bg-[#050505]/90 backdrop-blur-md text-[#39FF14] border border-[#39FF14]/40 font-bold text-[10px] px-2.5 py-1 rounded-full">
                    Economize {formatBRL(savings)}
                  </span>
                </div>

                {/* Image */}
                <div 
                  onClick={() => setSelectedProduct(scooter)}
                  className="relative aspect-[16/10] overflow-hidden bg-black cursor-pointer"
                >
                  <img
                    src={scooter.images && scooter.images.length > 0 ? scooter.images[0] : '/images/scooter_stake_red.jpg'}
                    alt={scooter.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/scooter_stake_red.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent opacity-70" />
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-[#39FF14] uppercase tracking-wider mb-1">
                      {scooter.model}
                    </div>

                    <h3 
                      onClick={() => setSelectedProduct(scooter)}
                      className="text-xl font-bold text-white font-heading group-hover:text-[#39FF14] transition-colors cursor-pointer"
                    >
                      {scooter.name}
                    </h3>

                    {/* Quick Specs Pill */}
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2.5 py-1 bg-[#121212] rounded-lg border border-[#262626] text-gray-300 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#39FF14]" />
                        {scooter.power}
                      </span>
                      <span className="px-2.5 py-1 bg-[#121212] rounded-lg border border-[#262626] text-gray-300 flex items-center gap-1">
                        <Battery className="w-3 h-3 text-[#39FF14]" />
                        {scooter.autonomy}
                      </span>
                    </div>

                    <ul className="mt-4 space-y-1.5 text-xs text-gray-400">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                        <span>Pronta entrega imediata</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                        <span>Carregador bivolt inteligente incluso</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                        <span>Garantia de 12 meses autorizada</span>
                      </li>
                    </ul>
                  </div>

                  {/* Pricing Box */}
                  <div className="mt-6 pt-4 border-t border-[#262626]">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-gray-500 line-through">
                        {formatBRL(scooter.price)}
                      </span>
                      <span className="text-xs text-red-400 font-semibold">
                        Preço anterior
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black text-white font-heading">
                        {formatBRL(scooter.promoPrice!)}
                      </span>
                      <span className="text-xs text-[#39FF14] font-bold">
                        no PIX
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-1">
                      ou até 12x no cartão de crédito
                    </p>

                    <button
                      onClick={() => addToCart(scooter)}
                      className="mt-4 w-full py-3.5 px-4 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:shadow-[0_0_25px_rgba(57,255,20,0.7)] transition-all cursor-pointer"
                    >
                      <span>APROVEITAR OFERTA</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>

    </section>
  );
};
