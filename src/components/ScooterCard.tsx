import React from 'react';
import { Scooter } from '../types';
import { useStore } from '../context/StoreContext';
import { formatBRL, calculateDiscountPercent, calculateInstallment } from '../utils/formatters';
import { 
  Zap, 
  Battery, 
  Gauge, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  ShoppingCart,
  Sparkles
} from 'lucide-react';

interface ScooterCardProps {
  scooter: Scooter;
}

export const ScooterCard: React.FC<ScooterCardProps> = ({ scooter }) => {
  const { setSelectedProduct, addToCart } = useStore();

  const currentPrice = scooter.promoPrice ?? scooter.price;
  const hasDiscount = !!scooter.promoPrice && scooter.promoPrice < scooter.price;
  const discountPercent = hasDiscount ? calculateDiscountPercent(scooter.price, scooter.promoPrice!) : 0;
  const installmentInfo = calculateInstallment(currentPrice, 12);

  return (
    <div className="group relative bg-[#181818] rounded-2xl border border-[#262626] hover:border-[#39FF14]/60 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-[0_10px_30px_rgba(57,255,20,0.15)] transform hover:-translate-y-1">
      
      {/* Product Image Area */}
      <div 
        onClick={() => setSelectedProduct(scooter)}
        className="relative aspect-[4/3] bg-black/60 overflow-hidden cursor-pointer"
      >
        <img
          src={scooter.images && scooter.images.length > 0 ? scooter.images[0] : '/images/scooter_stake_red.jpg'}
          alt={`${scooter.name} - ${scooter.model}`}
          className="w-full h-full object-contain p-2 group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/scooter_stake_red.jpg';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent opacity-60" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {scooter.badge && (
            <span className="bg-[#39FF14] text-black font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-md tracking-wider shadow-[0_0_10px_rgba(57,255,20,0.6)]">
              {scooter.badge}
            </span>
          )}
          {hasDiscount && (
            <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Stock status badge */}
        <div className="absolute top-3 right-3 z-10">
          {scooter.inStock ? (
            <span className="inline-flex items-center gap-1 bg-[#121212]/90 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {scooter.stockQuantity <= 3 ? `Últimas ${scooter.stockQuantity} un.` : 'Em Estoque'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-red-950/80 border border-red-500/30 text-red-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Esgotado
            </span>
          )}
        </div>

        {/* Quick View Floating Hint */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-4 py-2 rounded-xl bg-[#050505]/90 border border-[#39FF14] text-white text-xs font-bold flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-[#39FF14]" />
            Ver Detalhes Completos
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        {/* Name and Model */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#A3A3A3] mb-1">
            <span className="uppercase tracking-wider font-semibold">{scooter.category}</span>
            <span className="text-gray-400 font-mono-tech">{scooter.model}</span>
          </div>

          <h3 
            onClick={() => setSelectedProduct(scooter)}
            className="text-lg font-bold text-white group-hover:text-[#39FF14] transition-colors cursor-pointer font-heading leading-snug line-clamp-1"
          >
            {scooter.name}
          </h3>

          {/* Key Specs Row */}
          <div className="mt-3 grid grid-cols-3 gap-2 py-2.5 px-3 bg-[#121212] rounded-xl border border-[#222222] text-[11px]">
            <div className="flex flex-col items-center text-center">
              <span className="text-gray-400 text-[10px] flex items-center gap-0.5">
                <Zap className="w-3 h-3 text-[#39FF14]" />
                Potência
              </span>
              <span className="text-white font-bold font-mono-tech truncate max-w-full">
                {scooter.powerWatts}W
              </span>
            </div>

            <div className="flex flex-col items-center text-center border-x border-[#222222]">
              <span className="text-gray-400 text-[10px] flex items-center gap-0.5">
                <Battery className="w-3 h-3 text-[#39FF14]" />
                Autonomia
              </span>
              <span className="text-white font-bold font-mono-tech truncate max-w-full">
                {scooter.autonomyKm}km
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              <span className="text-gray-400 text-[10px] flex items-center gap-0.5">
                <Gauge className="w-3 h-3 text-[#39FF14]" />
                Vel. Máx
              </span>
              <span className="text-white font-bold font-mono-tech truncate max-w-full">
                {scooter.maxSpeed}
              </span>
            </div>
          </div>

          <p className="mt-2.5 text-xs text-[#A3A3A3] line-clamp-2">
            {scooter.description}
          </p>
        </div>

        {/* Pricing & Buttons */}
        <div className="mt-5 pt-4 border-t border-[#242424]">
          
          <div className="mb-3.5">
            {hasDiscount && (
              <div className="text-xs text-gray-500 line-through">
                De {formatBRL(scooter.price)}
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-heading">
                {formatBRL(currentPrice)}
              </span>
              <span className="text-[11px] text-[#39FF14] font-bold">
                à vista no PIX
              </span>
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              ou até <strong className="text-gray-200">12x de {installmentInfo.value}</strong> sem juros
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedProduct(scooter)}
              className="py-2.5 px-3 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] text-gray-200 hover:text-white text-xs font-bold border border-transparent hover:border-gray-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-gray-400" />
              <span>DETALHES</span>
            </button>

            <button
              onClick={() => addToCart(scooter)}
              disabled={!scooter.inStock}
              className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                scooter.inStock
                  ? 'bg-[#39FF14] hover:bg-[#32e012] text-black shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_20px_rgba(57,255,20,0.6)]'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>COMPRAR</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
