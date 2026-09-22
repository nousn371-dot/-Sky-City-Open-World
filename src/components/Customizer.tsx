import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Shirt, Footprints, Shield, Eye, Flame, Check } from 'lucide-react';
import { PlayerCustomization } from '../types';
import { COLOR_PALETTES, HEADGEAR_OPTIONS } from '../game/constants';

interface CustomizerProps {
  customization: PlayerCustomization;
  onUpdateCustomization: (updated: PlayerCustomization) => void;
  onBack: () => void;
  coins: number;
}

type TabType = 'shirt' | 'pants' | 'shoes' | 'gloves' | 'mask' | 'hair' | 'trail' | 'headgear';

export const Customizer: React.FC<CustomizerProps> = ({
  customization,
  onUpdateCustomization,
  onBack,
  coins,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('shirt');

  const tabs = [
    { id: 'shirt' as TabType, label: 'Hoodie / Shirt', icon: Shirt, colorKey: 'shirtColor' },
    { id: 'pants' as TabType, label: 'Track Pants', icon: Shield, colorKey: 'pantsColor' },
    { id: 'shoes' as TabType, label: 'Parkour Shoes', icon: Footprints, colorKey: 'shoesColor' },
    { id: 'gloves' as TabType, label: 'Gloves', icon: Sparkles, colorKey: 'glovesColor' },
    { id: 'mask' as TabType, label: 'Cyber Visor', icon: Eye, colorKey: 'maskColor' },
    { id: 'hair' as TabType, label: 'Hair', icon: Sparkles, colorKey: 'hairColor' },
    { id: 'trail' as TabType, label: 'Speed Trail', icon: Flame, colorKey: 'trailColor' },
    { id: 'headgear' as TabType, label: 'Headgear', icon: Shield, colorKey: null },
  ];

  const handleColorSelect = (color: string) => {
    const active = tabs.find(t => t.id === activeTab);
    if (!active || !active.colorKey) return;
    onUpdateCustomization({
      ...customization,
      [active.colorKey]: color,
    });
  };

  const handleHeadgearSelect = (headgear: PlayerCustomization['headgear']) => {
    onUpdateCustomization({
      ...customization,
      headgear,
    });
  };

  const activeColor = tabs.find(t => t.id === activeTab)?.colorKey
    ? (customization as any)[tabs.find(t => t.id === activeTab)!.colorKey!]
    : null;

  return (
    <div id="customizer-screen" className="fixed inset-0 z-40 bg-neutral-950/90 backdrop-blur-xl flex flex-col p-6 md:p-10 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-4">
          <button
            id="customizer-back-btn"
            onClick={onBack}
            className="p-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl border border-neutral-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              LOCKER ROOM
            </span>
            <h2 className="text-3xl font-extrabold font-display text-white tracking-wide">
              ATHLETE CUSTOMIZATION
            </h2>
          </div>
        </div>

        <div className="text-xs text-neutral-400 bg-neutral-900 px-4 py-2 rounded-xl border border-neutral-800 font-semibold">
          Cosmetic items do not alter athlete agility or jump speed
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col md:flex-row gap-6 overflow-hidden pb-6">
        {/* Category Tabs Sidebar */}
        <div className="w-full md:w-64 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto pr-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-bold text-sm text-left transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Customization Options Area */}
        <div className="flex-1 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <h3 className="text-xl font-bold font-display text-white mb-2">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Choose a color tone or visual style for your parkour runner. Changes update in real-time in the 3D world.
            </p>

            {activeTab === 'headgear' ? (
              /* Headgear Styles */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {HEADGEAR_OPTIONS.map((opt) => {
                  const isSelected = customization.headgear === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleHeadgearSelect(opt.id as any)}
                      className={`p-4 rounded-2xl border font-bold text-sm flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-white'
                          : 'bg-neutral-950/60 hover:bg-neutral-800/80 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Color Swatches Palette */
              <div>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-3">
                  Select Color Tone
                </span>
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                  {COLOR_PALETTES.map((color) => {
                    const isSelected = activeColor?.toLowerCase() === color.toLowerCase();
                    return (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        style={{ backgroundColor: color }}
                        className={`w-12 h-12 rounded-2xl transition-all active:scale-90 flex items-center justify-center cursor-pointer shadow-md ${
                          isSelected
                            ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-neutral-900 scale-110'
                            : 'hover:scale-105 opacity-90 hover:opacity-100'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-5 h-5 text-neutral-950 font-black drop-shadow" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Preset Outfits */}
          <div className="mt-8 pt-4 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Quick Theme Presets
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onUpdateCustomization({
                    shirtColor: '#ef4444',
                    pantsColor: '#1e293b',
                    shoesColor: '#f59e0b',
                    glovesColor: '#0f172a',
                    maskColor: '#0284c7',
                    hairColor: '#f3f4f6',
                    trailColor: '#06b6d4',
                    headgear: 'cyber_mask',
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 border border-neutral-700 cursor-pointer"
              >
                Cyber Runner
              </button>

              <button
                onClick={() => {
                  onUpdateCustomization({
                    shirtColor: '#10b981',
                    pantsColor: '#0f172a',
                    shoesColor: '#10b981',
                    glovesColor: '#1e293b',
                    maskColor: '#10b981',
                    hairColor: '#334155',
                    trailColor: '#10b981',
                    headgear: 'ninja_hood',
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 border border-neutral-700 cursor-pointer"
              >
                Shinobi Stealth
              </button>

              <button
                onClick={() => {
                  onUpdateCustomization({
                    shirtColor: '#f59e0b',
                    pantsColor: '#334155',
                    shoesColor: '#ef4444',
                    glovesColor: '#0f172a',
                    maskColor: '#f59e0b',
                    hairColor: '#f8fafc',
                    trailColor: '#f59e0b',
                    headgear: 'headband',
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 border border-neutral-700 cursor-pointer"
              >
                Apex Solar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
