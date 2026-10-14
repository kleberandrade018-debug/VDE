import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Zap, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Truck, 
  Instagram, 
  Youtube, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  X,
  FileText
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setIsAdminOpen, isPolicyModal, setIsPolicyModal } = useStore();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const getPolicyContent = (type: 'terms' | 'privacy' | 'warranty' | 'shipping') => {
    switch (type) {
      case 'terms':
        return {
          title: 'Termos de Uso',
          text: `Bem-vindo à Vai de Elétrica. Ao acessar nosso site e efetuar compras, você concorda com nossos termos de comercialização. Nossas scooters são entregues com nota fiscal eletrônica, número de chassi gravado e manual do proprietário em português. Os preços divulgados são em Reais (BRL) e podem sofrer alterações sem aviso prévio conforme disponibilidade de lotes.`
        };
      case 'privacy':
        return {
          title: 'Política de Privacidade & LGPD',
          text: `A Vai de Elétrica valoriza a sua privacidade e cumpre rigorosamente as diretrizes da Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018). Seus dados cadastrais (Nome, CPF, endereço e telefone) são utilizados única e exclusivamente para a emissão de nota fiscal, faturamento e logística de despacho de sua scooter. Dados sensíveis de pagamento são processados através de gateways com certificação PCI-DSS nível 1.`
        };
      case 'warranty':
        return {
          title: 'Termo de Garantia Oficial',
          text: `Todas as scooters comercializadas pela Vai de Elétrica possuem garantia legal e contratual de fábrica. O motor brushless, chassi e módulo de potência possuem 12 meses de garantia integral. O pack de bateria de lítio possui 6 meses de garantia contra defeitos de fabricação ou perda abrupta de retenção de carga. Contamos com rede autorizada de assistência e suporte via WhatsApp.`
        };
      case 'shipping':
        return {
          title: 'Política de Entregas & Frete',
          text: `Realizamos entregas em todo o território nacional através de transportadoras parceiras homologadas para transporte de veículos elétricos leves com seguro integral de carga. O prazo de entrega varia de 3 a 10 dias úteis conforme a localidade e o código de rastreamento é informado via WhatsApp assim que a carga for despachada.`
        };
    }
  };

  return (
    <>
      <footer id="contato" className="bg-[#050505] border-t border-[#181818] text-gray-400 text-xs pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Col 1: Brand & Slogan */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#181818] border border-[#39FF14]/40 flex items-center justify-center text-[#39FF14]">
                  <Zap className="w-5 h-5 fill-[#39FF14]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-wider text-white font-heading">
                    VAI DE <span className="text-[#39FF14]">ELÉTRICA</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-[#A3A3A3] font-semibold">
                    MOBILIDADE SEM LIMITES.
                  </span>
                </div>
              </div>

              <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
                Especialistas em Scooters Elétricas de alta performance e sustentabilidade urbana. Transforme seu trajeto diário com economia, autonomia e estilo futurista.
              </p>

              {/* Social Channels */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#121212] hover:bg-[#1f1f1f] border border-[#242424] hover:border-[#39FF14]/50 flex items-center justify-center text-gray-300 hover:text-[#39FF14] transition cursor-pointer"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#121212] hover:bg-[#1f1f1f] border border-[#242424] hover:border-[#39FF14]/50 flex items-center justify-center text-gray-300 hover:text-[#39FF14] transition cursor-pointer"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>

                <a
                  href={`https://wa.me/${(settings.officialWhatsApp || '5511972040833').replace(/\D/g, '').startsWith('55') ? (settings.officialWhatsApp || '5511972040833').replace(/\D/g, '') : `55${(settings.officialWhatsApp || '5511972040833').replace(/\D/g, '')}`}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#121212] hover:bg-[#1f1f1f] border border-[#242424] hover:border-[#39FF14]/50 flex items-center justify-center text-gray-300 hover:text-[#39FF14] transition cursor-pointer"
                  aria-label="WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                Navegação
              </h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollTo('inicio')} className="hover:text-[#39FF14] transition cursor-pointer">
                    Início
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('scooters')} className="hover:text-[#39FF14] transition cursor-pointer">
                    Scooters Elétricas
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('ofertas')} className="hover:text-[#39FF14] transition cursor-pointer">
                    Ofertas Eletrizantes
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('beneficios')} className="hover:text-[#39FF14] transition cursor-pointer">
                    Diferenciais
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('sobre')} className="hover:text-[#39FF14] transition cursor-pointer">
                    Sobre Nós
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Institutional & Policies */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                Políticas & Termos
              </h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setIsPolicyModal('privacy')} className="hover:text-[#39FF14] transition cursor-pointer text-left">
                    Política de Privacidade
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsPolicyModal('terms')} className="hover:text-[#39FF14] transition cursor-pointer text-left">
                    Termos de Uso
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsPolicyModal('warranty')} className="hover:text-[#39FF14] transition cursor-pointer text-left">
                    Garantia do Veículo
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsPolicyModal('shipping')} className="hover:text-[#39FF14] transition cursor-pointer text-left">
                    Prazos & Entregas
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsAdminOpen(true)} className="text-gray-500 hover:text-white transition cursor-pointer text-left text-[11px]">
                    Gestão da Loja
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact & Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                Atendimento
              </h4>
              <div className="space-y-2.5 text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                  <span>{settings.phoneDisplay}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                  <span>{settings.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                  <span>{settings.address} • {settings.cityState}</span>
                </div>
                <div className="pt-1 text-[11px] text-[#A3A3A3]">
                  Segunda a Sábado: 08h às 19h
                </div>
              </div>
            </div>

          </div>

          {/* Security & Payment Badges */}
          <div className="pt-8 border-t border-[#181818] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#1e1e1e] flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#39FF14]" />
              <span className="text-[11px] font-semibold text-gray-300">Garantia Nacional 12 Meses</span>
            </div>
            <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#1e1e1e] flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-[#39FF14]" />
              <span className="text-[11px] font-semibold text-gray-300">Checkout Criptografado SSL</span>
            </div>
            <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#1e1e1e] flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4 text-[#39FF14]" />
              <span className="text-[11px] font-semibold text-gray-300">Até 12x no Cartão ou PIX</span>
            </div>
            <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#1e1e1e] flex items-center justify-center gap-2">
              <Truck className="w-4 h-4 text-[#39FF14]" />
              <span className="text-[11px] font-semibold text-gray-300">Transporte com Seguro Total</span>
            </div>
          </div>

          {/* Legal Bottom Bar */}
          <div className="pt-6 border-t border-[#181818] flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-3">
            <div>
              © {new Date().getFullYear()} {settings.tradeName} • {settings.businessName} • CNPJ {settings.cnpj}
            </div>
            <div className="flex items-center gap-3">
              <span>Todos os direitos reservados • Mobilidade Elétrica Sustentável</span>
              <span>•</span>
              <button
                onClick={() => { window.location.hash = '#admin'; }}
                className="text-gray-400 hover:text-[#39FF14] transition cursor-pointer underline underline-offset-2"
              >
                Painel Admin
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Policies Popup Modal */}
      {isPolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#2a2a2a] w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsPolicyModal(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1e1e1e]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-[#39FF14]">
              <FileText className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white font-heading">
                {getPolicyContent(isPolicyModal).title}
              </h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
              {getPolicyContent(isPolicyModal).text}
            </p>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setIsPolicyModal(null)}
                className="px-5 py-2 rounded-xl bg-[#39FF14] text-black font-extrabold text-xs uppercase"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
