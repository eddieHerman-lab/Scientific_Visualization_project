import React from 'react';
import { Sliders, RotateCcw, Info, Sparkles } from 'lucide-react';
import { ControlSlider } from '../types';

interface ControlPanelProps {
  controls: ControlSlider[];
  values: Record<string, number>;
  onChange: (id: string, val: number) => void;
  onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  controls,
  values,
  onChange,
  onReset
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Painel de Parâmetros Dinâmicos
          </h3>
        </div>
        <button
          id="reset-sliders-btn"
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Redefinir
        </button>
      </div>

      <div className="space-y-4">
        {controls.map((ctrl) => {
          const currentVal = values[ctrl.id] !== undefined ? values[ctrl.id] : ctrl.default_val;

          return (
            <div key={ctrl.id} className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <label 
                  htmlFor={`slider-${ctrl.id}`}
                  className="font-semibold text-slate-200 flex items-center gap-1.5"
                >
                  {ctrl.label}
                </label>
                <span className="font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700/60">
                  {typeof currentVal === 'number' ? currentVal.toFixed(ctrl.step < 0.1 ? 2 : (ctrl.step < 1 ? 1 : 0)) : currentVal}
                  {ctrl.unit ? ` ${ctrl.unit}` : ''}
                </span>
              </div>

              <input
                id={`slider-${ctrl.id}`}
                type="range"
                min={ctrl.min_val}
                max={ctrl.max_val}
                step={ctrl.step}
                value={currentVal}
                onChange={(e) => onChange(ctrl.id, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>{ctrl.min_val}</span>
                {ctrl.description && (
                  <span className="text-slate-400 truncate max-w-[200px]">{ctrl.description}</span>
                )}
                <span>{ctrl.max_val}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
