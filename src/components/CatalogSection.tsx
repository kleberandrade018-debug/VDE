import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ScooterCard } from './ScooterCard';
import { 
  Filter, 
  Search, 
  RotateCcw, 
  Flame, 
  Zap, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export const CatalogSection: React.FC = () => {
  const { products, searchQuery, setSearchQuery } = useStore();

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [priceRange, setPriceRange] = useState<string>('todos');
  const [powerFilter, setPowerFilter] = useState<string>('todos');
  const [autonomyFilter, setAutonomyFilter] = useState<string>('todos');
  const [onlyOffers, setOnlyOffers] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('destaque');

  // Filter logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Hide unpublished scooters from public catalog
      if (p.isPublished === false) return false;

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesModel = p.model.toLowerCase().includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        if (!matchesName && !matchesModel && !matchesCategory && !matchesDesc) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'todos' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Price Range
      const effectivePrice = p.promoPrice ?? p.price;
      if (priceRange === 'ate5000' && effectivePrice > 5000) return false;
      if (priceRange === '5000a8000' && (effectivePrice < 5000 || effectivePrice > 8000)) return false;
      if (priceRange === 'acima8000' && effectivePrice < 8000) return false;

      // Power
      if (powerFilter === '1500' && p.powerWatts > 1500) return false;
      if (powerFilter === '2000' && p.powerWatts !== 2000) return false;
      if (powerFilter === '3000plus' && p.powerWatts < 3000) return false;

      // Autonomy
      if (autonomyFilter === 'ate60' && p.autonomyKm > 60) return false;
      if (autonomyFilter === '60a80' && (p.autonomyKm < 60 || p.autonomyKm > 80)) return false;
      if (autonomyFilter === '80plus' && p.autonomyKm < 80) return false;

      // Only Offers
      if (onlyOffers && (!p.promoPrice || p.promoPrice >= p.price)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.promoPrice ?? a.price;
      const priceB = b.promoPrice ?? b.price;
      if (sortBy === 'menor-preco') return priceA - priceB;
      if (sortBy === 'maior-preco') return priceB - priceA;
      if (sortBy === 'potencia') return b.powerWatts - a.powerWatts;
      if (sortBy === 'autonomia') return b.autonomyKm - a.autonomyKm;
      // Default: featured first
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, searchQuery, selectedCategory, priceRange, powerFilter, autonomyFilter, onlyOffers, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('todos');
    setPriceRange('todos');
    setPowerFilter('todos');
    setAutonomyFilter('todos');
    setOnlyOffers(false);
    setSearchQuery('');
    setSortBy('destaque');
  };

  const hasActiveFilters =
    selectedCategory !== 'todos' ||
    priceRange !== 'todos' ||
    powerFilter !== 'todos' ||
    autonomyFilter !== 'todos' ||
    onlyOffers ||
    searchQuery.trim().length > 0;

  return (
    <section id="scooters" className="py-20 bg-[#050505] relative">
      
      {/* Decorative top border */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-[#39FF14]/40 text-[#39FF14] text-xs font-bold uppercase tracking-widest mb-3">
            <Zap className="w-3.5 h-3.5 fill-[#39FF14]" />
            Catálogo Oficial de Fábrica
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading uppercase tracking-tight">
            ENCONTRE SUA PRÓXIMA{' '}
            <span className="text-[#39FF14] drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]">
              SCOOTER ELÉTRICA
            </span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[#A3A3A3]">
            Projetadas para a máxima eficiência urbana. Autonomia testada, motores brushless de alto torque e garantia com assistência autorizada.
          </p>
        </div>

        {/* Filter Bar Controls */}
        <div className="bg-[#121212] border border-[#222222] rounded-2xl p-4 sm:p-6 mb-10 shadow-xl space-y-4">
          
          {/* Categories & Search */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {[
                { id: 'todos', label: 'Todos os Modelos' },
                { id: 'urbana', label: 'Urbanas' },
                { id: 'performance', label: 'Performance' },
                { id: 'sport', label: 'Sport' },
                { id: 'carga', label: 'Carga & Delivery' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#39FF14] text-black shadow-[0_0_12px_rgba(57,255,20,0.5)]'
                      : 'bg-[#181818] text-gray-300 hover:text-white hover:bg-[#222222] border border-[#262626]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Search inside filter bar */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por nome ou motor..."
                className="w-full pl-9 pr-4 py-2 bg-[#181818] border border-[#2a2a2a] focus:border-[#39FF14] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition"
              />
            </div>

          </div>

          {/* Secondary Filter Dropdowns & Toggles */}
          <div className="pt-3 border-t border-[#1e1e1e] grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center">
            
            {/* Price Filter */}
            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                Faixa de Preço
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] text-xs text-gray-200 rounded-xl px-2.5 py-1.5 focus:border-[#39FF14] focus:outline-none cursor-pointer"
              >
                <option value="todos">Todos os preços</option>
                <option value="ate5000">Até R$ 5.000,00</option>
                <option value="5000a8000">R$ 5.000 a R$ 8.000</option>
                <option value="acima8000">Acima de R$ 8.000</option>
              </select>
            </div>

            {/* Power Filter */}
            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                Potência
              </label>
              <select
                value={powerFilter}
                onChange={(e) => setPowerFilter(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] text-xs text-gray-200 rounded-xl px-2.5 py-1.5 focus:border-[#39FF14] focus:outline-none cursor-pointer"
              >
                <option value="todos">Qualquer potência</option>
                <option value="1500">Até 1500W</option>
                <option value="2000">2000W</option>
                <option value="3000plus">3000W ou mais</option>
              </select>
            </div>

            {/* Autonomy Filter */}
            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                Autonomia
              </label>
              <select
                value={autonomyFilter}
                onChange={(e) => setAutonomyFilter(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] text-xs text-gray-200 rounded-xl px-2.5 py-1.5 focus:border-[#39FF14] focus:outline-none cursor-pointer"
              >
                <option value="todos">Qualquer autonomia</option>
                <option value="ate60">Até 60 km</option>
                <option value="60a80">60 a 80 km</option>
                <option value="80plus">80 km ou mais</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                Ordenar Por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] text-xs text-gray-200 rounded-xl px-2.5 py-1.5 focus:border-[#39FF14] focus:outline-none cursor-pointer"
              >
                <option value="destaque">Destaques</option>
                <option value="menor-preco">Menor Preço</option>
                <option value="maior-preco">Maior Preço</option>
                <option value="potencia">Maior Potência</option>
                <option value="autonomia">Maior Autonomia</option>
              </select>
            </div>

            {/* Only Offers Toggle */}
            <div className="col-span-2 sm:col-span-2 md:col-span-1 flex items-center justify-between sm:justify-start gap-2 pt-2 md:pt-4">
              <button
                onClick={() => setOnlyOffers(!onlyOffers)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                  onlyOffers
                    ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm'
                    : 'bg-[#181818] text-gray-300 border-[#2a2a2a] hover:border-gray-500'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${onlyOffers ? 'fill-red-400' : ''}`} />
                <span>Só Promoções</span>
              </button>
            </div>

          </div>

          {/* Active Filter summary & Reset */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 text-xs text-gray-400 border-t border-[#1a1a1a]">
              <span>
                Mostrando <strong className="text-[#39FF14]">{filteredProducts.length}</strong> de {products.length} scooters
              </span>
              <button
                onClick={resetFilters}
                className="text-[#39FF14] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Limpar Filtros
              </button>
            </div>
          )}

        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((scooter) => (
              <ScooterCard key={scooter.id} scooter={scooter} />
            ))}
          </div>
        ) : (
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-3xl p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#121212] border border-gray-700 flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">
              Nenhuma Scooter Encontrada
            </h3>
            <p className="mt-2 text-xs text-[#A3A3A3]">
              Tente ajustar os filtros de preço, potência ou busca para encontrar o modelo ideal.
            </p>
            <button
              onClick={resetFilters}
              className="mt-5 px-6 py-2.5 rounded-xl bg-[#39FF14] text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(57,255,20,0.3)]"
            >
              Resetar Filtros
            </button>
          </div>
        )}

      </div>

    </section>
  );
};
