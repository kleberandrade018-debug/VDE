import React from 'react';
import { useStore } from '../context/StoreContext';
import { Zap, ShieldCheck, Award, Users, Compass, ArrowRight, MessageSquare } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { settings } = useStore();

  const handleTestRideClick = () => {
    const rawPhone = settings.officialWhatsApp || '5511972040833';
    const digits = rawPhone.replace(/\D/g, '');
    const phone = digits.startsWith('55') ? digits : `55${digits}`;
    const msg = encodeURIComponent('Olá! Gostaria de agendar um Test-Ride para experimentar as scooters elétricas da Vai de Elétrica.');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <section id="sobre" className="py-24 bg-[#0a0a0a] relative overflow-hidden border-t border-[#181818]">
      
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#39FF14]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Brand Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden bg-[#181818] border border-[#2a2a2a] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              <img
                src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000&auto=format&fit=crop"
                alt="Showroom de Scooters Elétricas Vai de Elétrica"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-90" />

              {/* Floating Slogan inside Card */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-[#050505]/90 backdrop-blur-md border border-[#39FF14]/40">
                <span className="text-[10px] uppercase tracking-widest text-[#39FF14] font-black block">
                  MANIFESTO DA MARCA
                </span>
                <p className="text-sm font-bold text-white font-heading mt-1">
                  VAI DE ELÉTRICA — MOBILIDADE SEM LIMITES.
                </p>
              </div>
            </div>

            {/* Experience Pill */}
            <div className="absolute -top-4 -right-4 sm:right-6 bg-[#181818] border border-[#39FF14]/50 p-4 rounded-2xl shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#39FF14]/20 flex items-center justify-center text-[#39FF14]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-black text-white block font-heading">+5.000</span>
                <span className="text-[11px] text-gray-400">Clientes no Brasil</span>
              </div>
            </div>
          </div>

          {/* Right Column: Institutional Story */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-[#39FF14]/40 text-[#39FF14] text-xs font-bold uppercase tracking-widest">
              <Compass className="w-3.5 h-3.5 text-[#39FF14]" />
              Nossa História & Missão
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading uppercase tracking-tight">
              SOBRE A{' '}
              <span className="text-[#39FF14] drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]">
                VAI DE ELÉTRICA
              </span>
            </h2>

            {/* Required Institutional Paragraphs */}
            <div className="space-y-4 text-base sm:text-lg text-[#A3A3A3] leading-relaxed">
              <p>
                A Vai de Elétrica nasceu com o propósito de tornar a mobilidade elétrica mais acessível, moderna e prática.
              </p>
              <p>
                Trabalhamos para oferecer soluções de mobilidade que unem tecnologia, estilo e liberdade, ajudando nossos clientes a descobrir uma nova forma de se movimentar.
              </p>
            </div>

            {/* Signature Slogan */}
            <div className="p-4 rounded-2xl bg-[#121212] border-l-4 border-[#39FF14] text-white font-bold font-heading text-lg">
              VAI DE ELÉTRICA — MOBILIDADE SEM LIMITES.
            </div>

            {/* Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#181818] p-4 rounded-2xl border border-[#262626]">
                <Zap className="w-5 h-5 text-[#39FF14] mb-2" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Tecnologia de Ponta</h4>
                <p className="text-[11px] text-gray-400">Motores elétricos brushless e baterias de lítio de alta densidade.</p>
              </div>

              <div className="bg-[#181818] p-4 rounded-2xl border border-[#262626]">
                <ShieldCheck className="w-5 h-5 text-[#39FF14] mb-2" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Garantia & Suporte</h4>
                <p className="text-[11px] text-gray-400">Assistência técnica especializada e reposição ágil de peças.</p>
              </div>

              <div className="bg-[#181818] p-4 rounded-2xl border border-[#262626]">
                <Users className="w-5 h-5 text-[#39FF14] mb-2" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Atendimento Humano</h4>
                <p className="text-[11px] text-gray-400">Consultores dedicados prontos para te orientar em cada etapa.</p>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-2">
              <button
                onClick={handleTestRideClick}
                className="px-6 py-3.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#39FF14]/50 text-white hover:text-[#39FF14] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-lg"
              >
                <MessageSquare className="w-4 h-4 text-[#39FF14]" />
                <span>Agendar Test-Ride ou Visita ao Showroom</span>
              </button>
            </div>

          </div>

        </div>
      </div>

    </section>
  );
};
