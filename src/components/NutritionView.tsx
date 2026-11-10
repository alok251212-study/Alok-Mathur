import React, { useState } from 'react';
import {
  Apple,
  Activity,
  Heart,
  Flame,
  CheckCircle2,
  Utensils,
  ShieldCheck,
  Search,
  Sparkles,
  Info
} from 'lucide-react';
import { FOOD_DATABASE } from '../data/foodDatabase';
import { FoodItem } from '../types';

interface NutritionViewProps {
  initialFoodId?: string;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  initialFoodId
}) => {
  const [selectedFoodId, setSelectedFoodId] = useState<string>(
    initialFoodId || FOOD_DATABASE[0].id
  );
  const [searchFilter, setSearchFilter] = useState<string>('');

  const currentItem =
    FOOD_DATABASE.find((f) => f.id === selectedFoodId) || FOOD_DATABASE[0];

  const filteredList = FOOD_DATABASE.filter((f) =>
    f.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const n = currentItem.nutrition;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Nutritional Bio-Profile & Micronutrient Index</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standardized USDA FoodData Central chemical nutrient profiles per 100g edible portion.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search produce..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none w-40 font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Produce Selector List (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2 max-h-[680px] overflow-y-auto">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block px-2 pb-1">
            Select Commodity ({filteredList.length})
          </span>
          <div className="space-y-1.5">
            {filteredList.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedFoodId(item.id)}
                className={`w-full p-2.5 rounded-xl text-left flex items-center space-x-3 transition-all ${
                  selectedFoodId === item.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-900 border border-slate-700"
                />
                <div className="truncate">
                  <div className="text-xs font-bold truncate">{item.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {item.nutrition.calories} kcal • {item.category}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Detailed Nutrition Analysis (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Hero Food Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-6">
            <img
              src={currentItem.imageUrl}
              alt={currentItem.name}
              className="w-32 h-32 rounded-2xl object-cover shrink-0 border border-slate-700 shadow-xl"
            />
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase">
                {currentItem.category} • {currentItem.scientificName}
              </span>
              <h3 className="text-2xl font-extrabold text-white">{currentItem.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentItem.description}
              </p>
              <div className="text-[11px] text-slate-400 font-mono">
                Serving Size: <span className="text-white font-semibold">{n.servingSize}</span>
              </div>
            </div>
          </div>

          {/* Macronutrients Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center space-y-1">
              <Flame className="w-5 h-5 text-amber-400 mx-auto" />
              <span className="text-[11px] text-slate-400 uppercase font-mono block">Energy</span>
              <div className="text-2xl font-extrabold text-white">{n.calories}</div>
              <span className="text-[10px] text-slate-500">Kilocalories</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center space-y-1">
              <Activity className="w-5 h-5 text-cyan-400 mx-auto" />
              <span className="text-[11px] text-slate-400 uppercase font-mono block">Carbs</span>
              <div className="text-2xl font-extrabold text-white">{n.carbohydrates}g</div>
              <span className="text-[10px] text-slate-500">Sugars: {n.sugars}g</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center space-y-1">
              <ShieldCheck className="w-5 h-5 text-indigo-400 mx-auto" />
              <span className="text-[11px] text-slate-400 uppercase font-mono block">Protein</span>
              <div className="text-2xl font-extrabold text-white">{n.protein}g</div>
              <span className="text-[10px] text-slate-500">Fats: {n.fat}g</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center space-y-1">
              <Heart className="w-5 h-5 text-emerald-400 mx-auto" />
              <span className="text-[11px] text-slate-400 uppercase font-mono block">Dietary Fiber</span>
              <div className="text-2xl font-extrabold text-emerald-400">{n.fiber}g</div>
              <span className="text-[10px] text-slate-500">GI Score: {n.glycemicIndex}</span>
            </div>
          </div>

          {/* Micronutrients: Vitamins & Minerals Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Micronutrient Assays (Vitamins & Trace Minerals)</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Vitamin C</span>
                <span className="text-base font-extrabold text-white">{n.vitamins.vitaminC_mg} mg</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Vitamin A (Beta-Carotene)</span>
                <span className="text-base font-extrabold text-white">{n.vitamins.vitaminA_mcg} mcg</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Potassium (K)</span>
                <span className="text-base font-extrabold text-white">{n.vitamins.potassium_mg} mg</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Calcium (Ca)</span>
                <span className="text-base font-extrabold text-white">{n.vitamins.calcium_mg} mg</span>
              </div>
            </div>
          </div>

          {/* Health Benefits & Culinary Uses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span>Verified Health Benefits</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {n.healthBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>Culinary & Storage Guidance</span>
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  <strong>Recommended Culinary Applications:</strong>{' '}
                  {n.culinaryUses.join(', ')}.
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-200 block mb-0.5">Post-Harvest Storage Advice:</span>
                  {n.storageAdvice}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
