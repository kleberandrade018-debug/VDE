import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatBRL, calculateDiscountPercent, calculateInstallment, formatCEP } from '../utils/formatters';
import { 
  X, 
  Zap, 
  Battery, 
  Gauge, 
  ShieldCheck, 
  Truck, 
  MessageSquare, 
  ShoppingCart, 
  Check, 
  Clock, 
  Weight, 
  Disc,
  ArrowRight,
  Share2,
  Sparkles
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, setIsCheckoutOpen, settings } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [cepInput, setCepInput] = useState('');
  const [shippingResult, setShippingResult] = useState<{
    calculated: boolean;
    standardCost: number;
    standardDays: string;
    expressCost: number;
    expressDays: string;
    city?: string;
  } | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [selectedColor, setSelectedColor] = useState('Preto Cyber com Neon Verde');

  if (!selectedProduct) return null;

  const currentPrice = selectedProduct.promoPrice ?? selectedProduct.price;
  const hasDiscount = !!selectedProduct.promoPrice && selectedProduct.promoPrice < selectedProduct.price;
  const discountPercent = hasDiscount ? calculateDiscountPercent(selectedProduct.price, selectedProduct.promoPrice!) : 0;
  const installmentInfo = calculateInstallment(currentPrice, 12);

  // WhatsApp consultation click
  const handleWhatsAppConsult = () => {
    const rawPhone = settings.officialWhatsApp || '5511972040833';
    const digits = rawPhone.replace(/\D/g, '');
    const phone = digits.startsWith('55') ? digits : `55${digits}`;
    const message = encodeURIComponent(
      `Olá! Estou no site da Vai de Elétrica e gostaria de consultar informações e condições sobre a Scooter ${selectedProduct.name} (${selectedProduct.model}).`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  // Buy now click: add to cart & open checkout
  const handleBuyNow = () => {
    addToCart(selectedProduct, 1, selectedColor);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  // Calculate Shipping simulation
  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCep = cepInput.replace(/\D/g, '');
    if (cleanCep.length < 8) return;

    setIsCalculatingShipping(true);
    setTimeout(() => {
      setIsCalculatingShipping(false);
      // Realistic simulation: free standard shipping or express
      setShippingResult({
        calculated: true,
        standardCost: 0,
        standardDays: '4 a 7 dias úteis',
        expressCost: 189.00,
        expressDays: '2 a 3 dias úteis',
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      <div className="bg-[#121212] border border-[#2a2a2a] w-full max-w-5xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden relative my-6">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-[#1e1e1e] hover:bg-[#333333] text-gray-300 hover:text-white transition cursor-pointer border border-[#2e2e2e]"
          aria-label="Fechar Detalhes"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto">
          
          {/* Left Column: Photo Gallery & Badges */}
          <div className="lg:col-span-6 p-6 sm:p-8 bg-[#0a0a0a] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#222222]">
            
            <div className="space-y-4">
              {/* Category & Badge */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 bg-[#181818] border border-[#333] text-[#39FF14] rounded-md">
                  {selectedProduct.category}
                </span>
                {selectedProduct.badge && (
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 bg-[#39FF14] text-black rounded-md shadow-sm">
                    {selectedProduct.badge}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-red-600 text-white rounded-md">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Main Image Display */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#181818] border border-[#262626]">
                <img
                  src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0] || '/images/scooter_stake_red.jpg'}
                  alt={selectedProduct.name}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/scooter_stake_red.jpg';
                  }}
                />
                
                {/* Status indicator */}
                <div className="absolute bottom-3 left-3 bg-[#050505]/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-gray-300 border border-gray-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#39FF14]" />
                  <span>Foto Real do Veículo</span>
                </div>
              </div>

              {/* Thumbnails Row */}
              {selectedProduct.images.length > 1 && (
                <div className="flex items-center gap-3">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.5)]'
                          : 'border-[#262626] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Specs Highlight Box */}
            <div className="mt-6 pt-6 border-t border-[#1e1e1e] grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#181818] p-3 rounded-xl border border-[#242424]">
                <Zap className="w-4 h-4 text-[#39FF14] mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 block">Potência</span>
                <span className="text-xs font-bold text-white font-mono-tech">{selectedProduct.powerWatts}W</span>
              </div>
              <div className="bg-[#181818] p-3 rounded-xl border border-[#242424]">
                <Battery className="w-4 h-4 text-[#39FF14] mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 block">Autonomia</span>
                <span className="text-xs font-bold text-white font-mono-tech">{selectedProduct.autonomy}</span>
              </div>
              <div className="bg-[#181818] p-3 rounded-xl border border-[#242424]">
                <Gauge className="w-4 h-4 text-[#39FF14] mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 block">Velocidade</span>
                <span className="text-xs font-bold text-white font-mono-tech">{selectedProduct.maxSpeed}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Product Info, Specs, Shipping & Actions */}
          <div className="lg:col-span-6 p-6 sm:p-8 space-y-6">
            
            {/* Title & Model */}
            <div>
              <div className="text-xs font-mono-tech text-gray-400 uppercase tracking-widest">
                Modelo: {selectedProduct.model}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-1">
                {selectedProduct.name}
              </h2>
            </div>

            {/* Pricing Section */}
            <div className="bg-[#181818] p-5 rounded-2xl border border-[#262626]">
              {hasDiscount && (
                <div className="text-xs text-gray-400 line-through mb-0.5">
                  De: {formatBRL(selectedProduct.price)}
                </div>
              )}

              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-white font-heading">
                  {formatBRL(currentPrice)}
                </span>
                <span className="text-xs font-extrabold text-[#39FF14] bg-[#39FF14]/15 px-2.5 py-1 rounded-full border border-[#39FF14]/30">
                  À vista no PIX (5% off aplicado)
                </span>
              </div>

              <div className="mt-2 text-xs text-gray-300">
                Ou até <strong className="text-white font-bold">{installmentInfo.count}x de {installmentInfo.value}</strong> sem juros no cartão de crédito
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Cor do Acabamento: <span className="text-[#39FF14] font-normal">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-2">
                {[
                  { name: 'Preto Cyber com Neon Verde', bg: 'bg-black border-[#39FF14]' },
                  { name: 'Grafite Metálico Escuro', bg: 'bg-[#1f1f1f] border-gray-600' },
                  { name: 'Preto Fosco Stealth', bg: 'bg-[#111111] border-gray-800' },
                ].map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center gap-2 ${
                      selectedColor === color.name
                        ? 'border-[#39FF14] bg-[#181818] text-white shadow-sm'
                        : 'border-[#262626] bg-[#0d0d0d] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${color.bg} border`} />
                    <span className="text-[11px]">{color.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Descrição do Veículo
              </h4>
              <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>

            {/* Technical Specifications Grid */}
            <div>
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
                Especificações Técnicas
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-[#181818] rounded-xl border border-[#222222] flex items-center justify-between">
                  <span className="text-gray-400">Motor:</span>
                  <span className="font-semibold text-white">{selectedProduct.power}</span>
                </div>
                <div className="p-2.5 bg-[#181818] rounded-xl border border-[#222222] flex items-center justify-between">
                  <span className="text-gray-400">Bateria:</span>
                  <span className="font-semibold text-white">{selectedProduct.battery}</span>
                </div>
                <div className="p-2.5 bg-[#181818] rounded-xl border border-[#222222] flex items-center justify-between">
                  <span className="text-gray-400">Tempo de Carga:</span>
                  <span className="font-semibold text-white">{selectedProduct.chargingTime}</span>
                </div>
                <div className="p-2.5 bg-[#181818] rounded-xl border border-[#222222] flex items-center justify-between">
                  <span className="text-gray-400">Peso Suportado:</span>
                  <span className="font-semibold text-white">{selectedProduct.maxWeight}</span>
                </div>
                <div className="p-2.5 bg-[#181818] rounded-xl border border-[#222222] col-span-1 sm:col-span-2 flex items-center justify-between">
                  <span className="text-gray-400">Freios:</span>
                  <span className="font-semibold text-white truncate max-w-[65%]">{selectedProduct.brakes}</span>
                </div>
              </div>
            </div>

            {/* Features checklist */}
            <div className="space-y-1.5">
              {selectedProduct.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                  <Check className="w-3.5 h-3.5 text-[#39FF14] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Shipping Simulator */}
            <div className="bg-[#181818] p-4 rounded-2xl border border-[#262626]">
              <div className="flex items-center gap-2 text-xs font-bold text-white mb-2">
                <Truck className="w-4 h-4 text-[#39FF14]" />
                <span>Simular Frete e Prazo de Entrega</span>
              </div>

              <form onSubmit={handleCalculateShipping} className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  value={cepInput}
                  onChange={(e) => setCepInput(formatCEP(e.target.value))}
                  maxLength={9}
                  className="bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] text-xs text-white rounded-xl px-3 py-2 w-36 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isCalculatingShipping}
                  className="px-4 py-2 bg-[#222222] hover:bg-[#2a2a2a] text-white text-xs font-bold rounded-xl border border-gray-700 transition cursor-pointer"
                >
                  {isCalculatingShipping ? 'Calculando...' : 'Calcular'}
                </button>
              </form>

              {shippingResult && (
                <div className="mt-3 pt-3 border-t border-[#262626] space-y-2 text-xs">
                  <div className="flex justify-between items-center text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Frete Padrão com Seguro ({shippingResult.standardDays}):
                    </span>
                    <strong className="font-extrabold uppercase">GRÁTIS</strong>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14]" />
                      Frete Expresso Prioritário ({shippingResult.expressDays}):
                    </span>
                    <strong className="font-mono-tech">{formatBRL(shippingResult.expressCost)}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Warranty box */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#121212] border border-[#222222] text-xs text-gray-300">
              <ShieldCheck className="w-5 h-5 text-[#39FF14] shrink-0" />
              <div>
                <span className="font-bold text-white block">Garantia Oficial:</span>
                <span className="text-[#A3A3A3] text-[11px]">{selectedProduct.warranty}</span>
              </div>
            </div>

            {/* Action Buttons: COMPRAR AGORA & CONSULTAR PELO WHATSAPP */}
            <div className="pt-3 space-y-3">
              <button
                onClick={handleBuyNow}
                className="w-full py-4 px-6 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(57,255,20,0.5)] hover:shadow-[0_0_35px_rgba(57,255,20,0.8)] transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 stroke-[2.8]" />
                <span>COMPRAR AGORA</span>
              </button>

              <button
                onClick={handleWhatsAppConsult}
                className="w-full py-3.5 px-6 rounded-xl bg-[#1f2c20] hover:bg-[#253927] text-[#39FF14] border border-[#39FF14]/40 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>CONSULTAR PELO WHATSAPP</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
