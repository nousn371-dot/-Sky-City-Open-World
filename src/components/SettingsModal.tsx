import React from 'react';
import { ArrowLeft, Monitor, Volume2, Gamepad2, Eye, Sliders } from 'lucide-react';
import { GameSettings, GraphicsQuality, TargetFPS } from '../types';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (updated: GameSettings) => void;
  onBack: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  const handleGraphicsChange = (quality: GraphicsQuality) => {
    onUpdateSettings({ ...settings, graphicsQuality: quality });
  };

  const handleFPSChange = (fps: TargetFPS) => {
    onUpdateSettings({ ...settings, targetFPS: fps });
  };

  return (
    <div id="settings-screen" className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-xl flex flex-col p-6 md:p-10 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto mb-6">
        <div className="flex items-center gap-4">
          <button
            id="settings-back-btn"
            onClick={onBack}
            className="p-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl border border-neutral-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              CONFIGURATION
            </span>
            <h2 className="text-3xl font-extrabold font-display text-white tracking-wide">
              GAME SETTINGS
            </h2>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="w-full max-w-4xl mx-auto flex-1 overflow-y-auto pr-2 pb-6 space-y-6">
        {/* 1. Graphics & Performance */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6">
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4 text-cyan-400" />
            GRAPHICS & RENDERING QUALITY
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                Quality Preset (Mobile Optimization)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['low', 'medium', 'high', 'ultra'] as GraphicsQuality[]).map((q) => (
                  <button
                    key={q}
                    id={`settings-graphics-${q}`}
                    onClick={() => handleGraphicsChange(q)}
                    className={`py-3 px-4 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      settings.graphicsQuality === q
                        ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                        : 'bg-neutral-950/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-neutral-500 mt-2">
                Low reduces shadow mapping, post-processing, and particle density for weaker devices. Ultra enables soft PCF shadows and reflections.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                Target Frame Rate
              </label>
              <div className="flex gap-3">
                {([30, 60] as TargetFPS[]).map((fps) => (
                  <button
                    key={fps}
                    onClick={() => handleFPSChange(fps)}
                    className={`py-2 px-6 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      settings.targetFPS === fps
                        ? 'bg-cyan-500 text-black border-cyan-400'
                        : 'bg-neutral-950/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {fps} FPS
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Audio Volumes */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6">
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2 mb-4">
            <Volume2 className="w-4 h-4 text-amber-400" />
            AUDIO & SYNTH VOLUME
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1.5">
                <span>Master Volume</span>
                <span>{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, masterVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1.5">
                <span>Sound FX (Steps / Jumps)</span>
                <span>{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, sfxVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1.5">
                <span>Synthwave Music</span>
                <span>{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, musicVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. Controls & Camera Sensitivity */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6">
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-purple-400" />
            CAMERA & SENSITIVITY
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1.5">
                <span>Look Sensitivity</span>
                <span>{settings.mouseSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={settings.mouseSensitivity}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, mouseSensitivity: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <div>
                <span className="text-sm font-bold text-white block">Invert Y-Axis</span>
                <span className="text-[11px] text-neutral-500">Invert vertical pitch rotation</span>
              </div>
              <input
                type="checkbox"
                checked={settings.invertY}
                onChange={(e) => onUpdateSettings({ ...settings, invertY: e.target.checked })}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Touch & Mobile Layout */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6">
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2 mb-4">
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            MOBILE TOUCH CONTROLS
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <div>
                <span className="text-sm font-bold text-white block">Display Touch Controls</span>
                <span className="text-[11px] text-neutral-500">Virtual Joystick and action buttons</span>
              </div>
              <input
                type="checkbox"
                checked={settings.showMobileControls}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, showMobileControls: e.target.checked })
                }
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1.5">
                  <span>Button Size Scale</span>
                  <span>{Math.round(settings.mobileButtonScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={settings.mobileButtonScale}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, mobileButtonScale: parseFloat(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1.5">
                  <span>Button Opacity</span>
                  <span>{Math.round(settings.mobileButtonOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={settings.mobileButtonOpacity}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, mobileButtonOpacity: parseFloat(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
