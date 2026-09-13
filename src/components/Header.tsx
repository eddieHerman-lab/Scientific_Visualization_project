import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Play, 
  RotateCcw, 
  HelpCircle, 
  Cpu, 
  CheckCircle2, 
  Workflow
} from 'lucide-react';
import { PRESET_SIMULATIONS } from '../data/presets';

interface HeaderProps {
  currentPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onOpenArchitecture: () => void;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPresetId,
  onSelectPreset,
  onOpenArchitecture,
  isGenerating
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & System Roles */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  Scientific Visualization Studio
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  4-Agent Pipeline
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Lead Scientist · Scene Director · Graphics Engineer · QA Auditor
              </p>
            </div>
          </div>

          <button
            id="mobile-arch-btn"
            onClick={onOpenArchitecture}
            className="md:hidden p-2 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-800 bg-slate-900/60"
            title="Ver Arquitetura do Pipeline"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Presets & Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1">
            <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" /> Presets:
            </span>
            {PRESET_SIMULATIONS.map((preset) => {
              const active = preset.id === currentPresetId;
              return (
                <button
                  key={preset.id}
                  id={`preset-btn-${preset.id}`}
                  onClick={() => onSelectPreset(preset.id)}
                  disabled={isGenerating}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-md transition-all whitespace-nowrap ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {preset.title.split(':')[0].split('vs')[0].trim()}
                </button>
              );
            })}
          </div>

          <button
            id="architecture-modal-btn"
            onClick={onOpenArchitecture}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-all shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Arquitetura
          </button>
        </div>
      </div>
    </header>
  );
};
