import React, { useState } from 'react';
import { 
  Zap, 
  Coins, 
  Headphones, 
  ShieldCheck, 
  Calculator, 
  TrendingDown, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { formatBRL } from '../utils/formatters';

export const BenefitsSection: React.FC = () => {
  // Calculator state
  const [kmPerMonth, setKmPerMonth] = useState<number>(600);

  // Economic calculations
  // Gas scooter/bike: ~32 km/L, Gas price ~R$ 6.20/L -> ~R$ 0.194/km + oils/filters ~R$ 0.05/km = ~R$ 0.244/km
  // Gas car: ~10 km/L -> ~R$ 0.62/km + maintenance = ~R$ 0.75/km
  // Electric scooter: 60V 20Ah = 1.2 kWh = ~R$ 1.10 per charge for 60km = ~R$ 0.018/km (round to R$ 0.02/km)
  const electricCostPerKm = 0.02;
  const gasBikeCostPerKm = 0.25;
  const gasCarCostPerKm = 0.75;

  const monthlyElectricCost = kmPerMonth * electricCostPerKm;
  const monthlyGasBikeCost = kmPerMonth * gasBikeCostPerKm;
  const monthlySavingsVsBike = monthlyGasBikeCost - monthlyElectricCost;
  const yearlySavingsVsBike = monthlySavingsVsBike * 12;

  const monthlyGasCarCost = kmPerMonth * gasCarCostPerKm;
  const yearlySavingsVsCar = (monthlyGasCarCost - monthlyElectricCost) * 12;

  const differentials = [
    {
      title: 'MOBILIDADE INTELIGENTE',
      description: 'Uma nova maneira de se deslocar.',
      detail: 'Diga adeus ao trânsito parado, estacionamentos caros e horários rígidos. Liberdade para ir e vir com agilidade sustentável.',
      icon: Zap,
    },
    {
      title: 'ECONOMIA NO DIA A DIA',
      description: 'Mais praticidade para sua rotina.',
      detail: 'Gaste menos de R$ 2,00 por recarga completa. Sem IPVA na maioria dos estados, sem troca de óleo e manutenção simplificada.',
      icon: Coins,
    },
    {
      title: 'ATENDIMENTO ESPECIALIZADO',
      description: 'Nossa equipe ajuda você a escolher o modelo ideal.',
      detail: 'Consultores técnicos prontos no WhatsApp para orientar potência, autonomia necessária e tirar todas as suas dúvidas.',
      icon: Headphones,
    },
    {
      title: 'COMPRA COM SEGURANÇA',
      description: 'Transparência, suporte e informações claras.',
      detail: 'Garantia oficial de fábrica, nota fiscal eletrônica, peças de reposição e canais de pós-venda dedicados.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="beneficios" className="py-20 bg-[#050505] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-[#39FF14]/40 text-[#39FF14] text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 fill-[#39FF14]" />
            Por que escolher a Vai de Elétrica
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading uppercase tracking-tight">
            VANTAGENS QUE TRANSFORMAM SUA{' '}
            <span className="text-[#39FF14] drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]">
              ROTINA
            </span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[#A3A3A3]">
            Muito mais que um meio de transporte: um investimento inteligente que se paga no próprio combustível que você deixa de gastar.
          </p>
        </div>

        {/* 4 Differentials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {differentials.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#181818] rounded-2xl border border-[#262626] p-7 hover:border-[#39FF14]/60 transition-all duration-300 flex flex-col justify-between group hover:shadow-[0_10px_25px_rgba(57,255,20,0.15)]"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#121212] border border-[#2a2a2a] group-hover:border-[#39FF14] flex items-center justify-center text-[#39FF14] mb-6 shadow-inner transition-colors duration-300">
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-base font-black text-white font-heading tracking-wide uppercase mb-1">
                    {item.title}
                  </h3>

                  <p className="text-sm font-semibold text-[#39FF14] mb-3">
                    {item.description}
                  </p>

                  <p className="text-xs text-[#A3A3A3] leading-relaxed">
                    {item.detail}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#222222] flex items-center gap-1.5 text-[11px] font-bold text-gray-400 group-hover:text-[#39FF14] transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF14]" />
                  <span>Diferencial Vai de Elétrica</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Savings Calculator */}
        <div className="bg-gradient-to-br from-[#121212] via-[#181818] to-[#121212] rounded-3xl border border-[#2a2a2a] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#39FF14]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Column: Calculator Controls */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#39FF14]">
                <Calculator className="w-4 h-4" />
                SIMULADOR DE ECONOMIA MENSAL E ANUAL
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white font-heading">
                Veja quanto dinheiro você economiza trocando a gasolina por eletricidade
              </h3>

              <div className="space-y-4 bg-[#0d0d0d] p-5 rounded-2xl border border-[#222222]">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300 font-semibold">Quanto você roda por mês?</span>
                  <span className="text-xl font-extrabold text-[#39FF14] font-mono-tech">
                    {kmPerMonth} km/mês
                  </span>
                </div>

                <input
                  type="range"
                  min={100}
                  max={2500}
                  step={50}
                  value={kmPerMonth}
                  onChange={(e) => setKmPerMonth(Number(e.target.value))}
                  className="w-full accent-[#39FF14] cursor-pointer h-2 bg-[#222222] rounded-lg"
                />

                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>100 km (Passeio)</span>
                  <span>600 km (Trabalho)</span>
                  <span>1.500 km (Uso Intenso)</span>
                  <span>2.500 km (Delivery)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-[#181818] p-3 rounded-xl border border-[#262626]">
                  <span className="text-gray-400 block mb-0.5">Gasto com Moto à Gasolina:</span>
                  <span className="text-base font-bold text-red-400 font-mono-tech">
                    {formatBRL(monthlyGasBikeCost)} /mês
                  </span>
                </div>

                <div className="bg-[#181818] p-3 rounded-xl border border-[#262626]">
                  <span className="text-gray-400 block mb-0.5">Gasto na Scooter Vai de Elétrica:</span>
                  <span className="text-base font-bold text-[#39FF14] font-mono-tech">
                    {formatBRL(monthlyElectricCost)} /mês
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column: Result Highlight */}
            <div className="lg:col-span-5 bg-[#080808] border border-[#39FF14]/40 rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_30px_rgba(57,255,20,0.15)] flex flex-col justify-center">
              
              <div className="inline-flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest text-[#39FF14] font-bold mb-2">
                <TrendingDown className="w-4 h-4" />
                ECONOMIA DIRETA NO SEU BOLSO
              </div>

              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-heading my-2">
                {formatBRL(yearlySavingsVsBike)}
              </div>

              <div className="text-xs text-gray-400">
                economizados em 1 ano comparado a uma moto tradicional
              </div>

              <div className="mt-4 pt-4 border-t border-[#222222] text-xs text-left space-y-2 text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Economia por mês:</span>
                  <strong className="text-[#39FF14] font-mono-tech">{formatBRL(monthlySavingsVsBike)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Se comparar com um carro:</span>
                  <strong className="text-white font-mono-tech">{formatBRL(yearlySavingsVsCar)} /ano</strong>
                </div>
              </div>

              <div className="mt-6 bg-[#39FF14]/15 border border-[#39FF14]/30 rounded-xl p-3 text-[11px] text-[#39FF14] font-semibold">
                ⚡ Em cerca de 10 a 14 meses, sua Scooter Elétrica se paga apenas com a economia gerada!
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
