import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatBRL } from '../utils/formatters';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  ShieldCheck, 
  Truck
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    cartSubtotal, 
    setIsCheckoutOpen 
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'PRIMEIRAVDE' || clean === 'VAI5' || clean === 'ELETRIZANTE') {
      setDiscountPercent(5);
      setCouponApplied(clean);
    } else {
      setCouponError('Cupom inválido ou expirado.');
    }
  };

  const discountValue = (cartSubtotal * discountPercent) / 100;
  const shippingCost = cartSubtotal > 0 ? 0 : 0; // Free shipping standard
  const total = Math.max(0, cartSubtotal - discountValue + shippingCost);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121212] border-l border-[#242424] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-[#222222] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#39FF14]" />
              <h2 className="text-lg font-bold text-white font-heading">
                Seu Carrinho
              </h2>
              <span className="text-xs bg-[#1f1f1f] text-[#39FF14] px-2 py-0.5 rounded-full font-bold">
                {cart.length} {cart.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1a1a] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#181818] border border-[#2a2a2a] flex items-center justify-center mx-auto text-gray-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">Seu carrinho está vazio</h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Explore nosso catálogo e encontre a scooter elétrica perfeita para sua rotina!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-[#39FF14] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Explorar Scooters
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const unitPrice = item.scooter.promoPrice ?? item.scooter.price;
                return (
                  <div
                    key={item.scooter.id}
                    className="bg-[#181818] border border-[#262626] rounded-2xl p-4 flex gap-3 relative group"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-black shrink-0">
                      <img
                        src={item.scooter.images[0]}
                        alt={item.scooter.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white truncate font-heading">
                            {item.scooter.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.scooter.id)}
                            className="text-gray-500 hover:text-red-400 p-1 transition cursor-pointer"
                            title="Remover item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {item.selectedColor && (
                          <span className="text-[10px] text-gray-400 block truncate">
                            {item.selectedColor}
                          </span>
                        )}
                        <span className="text-xs font-black text-white font-mono-tech mt-1 block">
                          {formatBRL(unitPrice)}
                        </span>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#222222]">
                        <div className="flex items-center border border-[#333333] rounded-lg bg-[#121212]">
                          <button
                            onClick={() => updateCartQuantity(item.scooter.id, item.quantity - 1)}
                            className="p-1 hover:text-[#39FF14] text-gray-400 transition cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-white font-mono-tech">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.scooter.id, item.quantity + 1)}
                            className="p-1 hover:text-[#39FF14] text-gray-400 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-xs font-extrabold text-[#39FF14] font-mono-tech">
                          Total: {formatBRL(unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Coupon field */}
            {cart.length > 0 && (
              <div className="bg-[#181818] p-4 rounded-2xl border border-[#242424] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
                  <Tag className="w-3.5 h-3.5 text-[#39FF14]" />
                  <span>Possui cupom de desconto?</span>
                </div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: PRIMEIRAVDE"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] text-xs text-white uppercase rounded-xl px-3 py-1.5 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#262626] hover:bg-[#333333] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Aplicar
                  </button>
                </form>
                {couponApplied && (
                  <p className="text-[11px] text-[#39FF14] font-semibold">
                    Cupom {couponApplied} aplicado com sucesso! (5% de desconto)
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-400">{couponError}</p>
                )}
              </div>
            )}
          </div>

          {/* Footer with Calculations & Checkout Trigger */}
          {cart.length > 0 && (
            <div className="p-6 bg-[#0e0e0e] border-t border-[#222222] space-y-4">
              
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal dos veículos:</span>
                  <span className="font-mono-tech text-white">{formatBRL(cartSubtotal)}</span>
                </div>

                {discountValue > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>Desconto ({discountPercent}%):</span>
                    <span className="font-mono-tech">-{formatBRL(discountValue)}</span>
                  </div>
                )}

                <div className="flex justify-between text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Frete Nacional com Seguro:
                  </span>
                  <span className="font-bold uppercase">Grátis</span>
                </div>

                <div className="pt-2 border-t border-[#222222] flex justify-between items-baseline text-base font-bold">
                  <span className="text-white font-heading">Total Estimado:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#39FF14] font-heading font-mono-tech block">
                      {formatBRL(total)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ou até 12x no cartão de crédito
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 px-6 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-all cursor-pointer"
              >
                <span>FINALIZAR COMPRA</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Ambiente Seguro com Criptografia SSL 256-bit</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
