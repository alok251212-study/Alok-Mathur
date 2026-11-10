import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Layers,
  ShieldCheck,
  AlertOctagon,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
  Apple,
  Eye,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';
import { FOOD_DATABASE } from '../data/foodDatabase';
import { FoodCategory, FoodItem } from '../types';

interface FoodLibraryProps {
  onSelectInspect3D?: (fruitName: string) => void;
  onSelectChemicals?: (foodName: string) => void;
  onSelectNutrition?: (item: FoodItem) => void;
}

export const FoodLibrary: React.FC<FoodLibraryProps> = ({
  onSelectInspect3D,
  onSelectChemicals,
  onSelectNutrition
}) => {
  // Library Type Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'fresh_reference' | 'treated_labeled' | 'general'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | FoodCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Selected item modal
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);

  // Filter logic
  const filteredItems = useMemo(() => {
    return FOOD_DATABASE.filter((item) => {
      // Library tab filter
      if (activeTab !== 'all' && item.libraryType !== activeTab) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchSci = item.scientificName.toLowerCase().includes(query);
        const matchSource = item.datasetSource.toLowerCase().includes(query);
        const matchLabel = item.datasetLabel.toLowerCase().includes(query);
        if (!matchName && !matchSci && !matchSource && !matchLabel) {
          return false;
        }
      }
      return true;
    });
  }, [activeTab, selectedCategory, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header & Sub-library Tab Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Reference Botanical & Safety Catalog</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Searchable database indexed across Fresh Reference, Chemically Treated/Labeled, and General Libraries.
            </p>
          </div>

          {/* Library Switcher Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'all' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Records ({FOOD_DATABASE.length})
            </button>
            <button
              onClick={() => { setActiveTab('fresh_reference'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'fresh_reference' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              A. Fresh Reference
            </button>
            <button
              onClick={() => { setActiveTab('treated_labeled'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'treated_labeled' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              B. Chemically Treated / Labeled
            </button>
            <button
              onClick={() => { setActiveTab('general'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'general' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              C. General Library
            </button>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-800/80">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by fruit/vegetable name, scientific name, or dataset label..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 shrink-0">Category:</span>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
              {(['ALL', 'Fruit', 'Vegetable'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {paginatedItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-emerald-950/20 transition-all cursor-pointer flex flex-col"
          >
            {/* Image Thumbnail with Lazy Loading */}
            <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-950">
              <img
                src={item.imageUrl}
                alt={item.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Badges Overlay */}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
                <span className="px-2 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-md text-[10px] font-bold text-slate-200 border border-slate-700">
                  {item.category}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-md backdrop-blur-md text-[10px] font-bold uppercase tracking-wider ${
                    item.freshnessStatus === 'Fresh-looking'
                      ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-600/50'
                      : item.freshnessStatus === 'Visually damaged'
                      ? 'bg-amber-950/90 text-amber-300 border border-amber-600/50'
                      : 'bg-red-950/90 text-red-300 border border-red-600/50'
                  }`}
                >
                  {item.freshnessStatus}
                </span>
              </div>

              {/* Chemical Status Tag */}
              <div className="absolute bottom-2.5 right-2.5">
                <span
                  className={`px-2 py-0.5 rounded-md backdrop-blur-md text-[10px] font-mono font-bold ${
                    item.chemicalEvidence === 'WITHIN LIMIT'
                      ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-700'
                      : item.chemicalEvidence === 'EXCEEDS LIMIT'
                      ? 'bg-red-900/90 text-red-200 border border-red-700'
                      : 'bg-slate-900/90 text-slate-400 border border-slate-700'
                  }`}
                >
                  MRL: {item.chemicalEvidence}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                  {item.scientificName}
                </p>
                <div className="mt-2 text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 truncate">
                  Label: {item.datasetLabel}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>{item.nutrition.calories} kcal / 100g</span>
                <span className="text-emerald-400 group-hover:underline flex items-center space-x-1">
                  <span>View Details</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {paginatedItems.length === 0 && (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
          <p className="text-sm font-bold text-white">No items found matching criteria</p>
          <p className="text-xs text-slate-400">Try modifying your search keywords or switching category filters.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl">
          <span className="text-xs text-slate-400">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredItems.length)} of{' '}
            {filteredItems.length} records
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-300 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                  {selectedItem.category} • {selectedItem.libraryType.replace('_', ' ')}
                </span>
                <h3 className="text-xl font-extrabold text-white">{selectedItem.name}</h3>
                <p className="text-xs italic text-slate-400">{selectedItem.scientificName}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image & Fast Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dataset Source:</span>
                    <span className="font-semibold text-slate-200">{selectedItem.datasetSource}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dataset Label:</span>
                    <span className="font-mono text-slate-200">{selectedItem.datasetLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Visual Freshness:</span>
                    <span className="font-semibold text-emerald-400">{selectedItem.freshnessStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Optimal Temp:</span>
                    <span className="text-slate-200">{selectedItem.optimalTemp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chemical Evidence:</span>
                    <span
                      className={`font-bold ${
                        selectedItem.chemicalEvidence === 'WITHIN LIMIT'
                          ? 'text-emerald-400'
                          : selectedItem.chemicalEvidence === 'EXCEEDS LIMIT'
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {selectedItem.chemicalEvidence}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed text-xs">
                  {selectedItem.description}
                </p>
              </div>
            </div>

            {/* Nutritional Facts Grid */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Nutritional Breakdown ({selectedItem.nutrition.servingSize})
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Calories</span>
                  <span className="font-extrabold text-emerald-400">{selectedItem.nutrition.calories}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Carbs</span>
                  <span className="font-bold text-white">{selectedItem.nutrition.carbohydrates}g</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Protein</span>
                  <span className="font-bold text-white">{selectedItem.nutrition.protein}g</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Fiber</span>
                  <span className="font-bold text-white">{selectedItem.nutrition.fiber}g</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Vit C</span>
                  <span className="font-bold text-emerald-300">{selectedItem.nutrition.vitamins.vitaminC_mg}mg</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Potassium</span>
                  <span className="font-bold text-white">{selectedItem.nutrition.vitamins.potassium_mg}mg</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              {onSelectInspect3D && (
                <button
                  onClick={() => {
                    const fruit = selectedItem.name.toLowerCase();
                    onSelectInspect3D(fruit);
                    setSelectedItem(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open in 360° 3D Viewer</span>
                </button>
              )}

              {onSelectChemicals && (
                <button
                  onClick={() => {
                    onSelectChemicals(selectedItem.name);
                    setSelectedItem(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Check Chemical MRLs</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
