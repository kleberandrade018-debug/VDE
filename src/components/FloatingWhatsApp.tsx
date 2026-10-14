import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MessageSquare, X, Send, Sparkles, CheckCheck } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const rawPhone = settings.officialWhatsApp || '5511972040833';
  const digits = rawPhone.replace(/\D/g, '');
  const cleanPhone = digits.startsWith('55') ? digits : `55${digits}`;
  const defaultMessage = 'Olá! Acessei o site da Vai de Elétrica e gostaria de conhecer as Scooters Elétricas disponíveis.';

  const handleOpenWhatsApp = (customMsg?: string) => {
    const text = encodeURIComponent(customMsg || defaultMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Mini Interactive Chat Popup */}
      {isOpen && (
        <div className="mb-4 w-72 sm:w-80 bg-[#121212] border border-[#2a2a2a] rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-[#1f2c20] p-4 border-b border-[#2e4030] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold shadow-md">
                  <MessageSquare className="w-5 h-5 fill-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#39FF14] border-2 border-[#121212]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-heading">
                  Atendimento Vai de Elétrica
                </h4>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Online agora
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Bubble Body */}
          <div className="p-4 space-y-3 bg-[#0d0d0d] text-xs">
            <div className="bg-[#181818] border border-[#262626] p-3 rounded-2xl rounded-tl-none text-gray-200 space-y-1">
              <p className="font-semibold text-white">
                Olá! Como podemos te ajudar a encontrar sua scooter elétrica hoje?
              </p>
              <div className="flex items-center justify-end gap-1 text-[9px] text-gray-500">
                <span>Agora</span>
                <CheckCheck className="w-3 h-3 text-[#39FF14]" />
              </div>
            </div>

            {/* Quick Action Chips */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => handleOpenWhatsApp('Olá! Quero conhecer os modelos e preços das scooters elétricas disponíveis.')}
                className="w-full text-left p-2 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#262626] hover:border-[#39FF14]/50 text-gray-300 hover:text-white text-[11px] transition flex items-center justify-between cursor-pointer"
              >
                <span>🛵 Conhecer Modelos e Preços</span>
                <Send className="w-3 h-3 text-[#39FF14]" />
              </button>

              <button
                onClick={() => handleOpenWhatsApp('Olá! Gostaria de consultar prazos de entrega e frete para minha cidade.')}
                className="w-full text-left p-2 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#262626] hover:border-[#39FF14]/50 text-gray-300 hover:text-white text-[11px] transition flex items-center justify-between cursor-pointer"
              >
                <span>📦 Dúvidas sobre Frete e Entrega</span>
                <Send className="w-3 h-3 text-[#39FF14]" />
              </button>

              <button
                onClick={() => handleOpenWhatsApp('Olá! Gostaria de falar diretamente com um consultor técnico.')}
                className="w-full text-left p-2 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#262626] hover:border-[#39FF14]/50 text-gray-300 hover:text-white text-[11px] transition flex items-center justify-between cursor-pointer"
              >
                <span>💬 Falar com um Consultor Técnico</span>
                <Send className="w-3 h-3 text-[#39FF14]" />
              </button>
            </div>
          </div>

          {/* Footer Trigger */}
          <div className="p-3 bg-[#121212] border-t border-[#222222]">
            <button
              onClick={() => handleOpenWhatsApp()}
              className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(37,211,102,0.4)] transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-black" />
              <span>Iniciar Conversa no WhatsApp</span>
            </button>
          </div>

        </div>
      )}

      {/* Main Floating Neon WhatsApp Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-black flex items-center justify-center shadow-[0_0_25px_rgba(37,211,102,0.6)] hover:shadow-[0_0_35px_rgba(37,211,102,0.9)] transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Atendimento via WhatsApp"
        id="btn-whatsapp-flutuante"
      >
        <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 fill-black" />

        {/* Pulsing Green Halo */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40 pointer-events-none" />

        {/* Small Notification Badge */}
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#39FF14] border-2 border-black" />

        {/* Hover Tooltip */}
        <span className="hidden sm:group-hover:inline-block absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-[#121212] border border-[#2a2a2a] text-white text-xs font-bold whitespace-nowrap shadow-xl">
          Fale Conosco no WhatsApp
        </span>
      </button>

    </div>
  );
};
