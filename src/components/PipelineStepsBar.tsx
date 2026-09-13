import React from 'react';
import { 
  Atom, 
  Film, 
  Code2, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  RotateCw, 
  AlertTriangle 
} from 'lucide-react';
import { AgentLog } from '../types';

interface PipelineStepsBarProps {
  logs?: AgentLog[];
  isGenerating: boolean;
  isHealing?: boolean;
  currentStep: number;
  attempts?: number;
  activeRoleTab: string;
  onSelectRoleTab: (role: string) => void;
  onTriggerAutoHeal?: () => void;
}

export const PipelineStepsBar: React.FC<PipelineStepsBarProps> = ({
  logs = [],
  isGenerating,
  isHealing = false,
  currentStep,
  attempts = 1,
  activeRoleTab,
  onSelectRoleTab,
  onTriggerAutoHeal
}) => {
  const steps = [
    {
      id: 'lead_scientist',
      stepNum: 1,
      name: 'Lead Scientist',
      shortRole: 'Formalização & Invariantes',
      icon: Atom,
      accent: 'cyan',
    },
    {
      id: 'scene_director',
      stepNum: 2,
      name: 'Scene Director',
      shortRole: 'Roteiro & Sliders',
      icon: Film,
      accent: 'indigo',
    },
    {
      id: 'graphics_engineer',
      stepNum: 3,
      name: 'Graphics Engineer',
      shortRole: 'Código Canvas 2D 60FPS',
      icon: Code2,
      accent: 'emerald',
    },
    {
      id: 'qa_auditor',
      stepNum: 4,
      name: 'QA Auditor',
      shortRole: 'Validação & Autocura',
      icon: ShieldCheck,
      accent: 'rose',
    },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 shadow-lg">
      <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isHealing ? 'bg-amber-400 animate-ping' : 'bg-cyan-400 animate-pulse'}`}></span>
            Pipeline de 4 Agentes Especializados
          </span>
          {isHealing && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
              <RotateCw className="w-2.5 h-2.5 animate-spin" /> Executando Autocura Cirúrgica...
            </span>
          )}
          {!isHealing && attempts > 1 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> Autocura Aplicada ({attempts} iterações)
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onTriggerAutoHeal && (
            <button
              id="trigger-auto-heal-btn"
              onClick={onTriggerAutoHeal}
              disabled={isGenerating || isHealing}
              className="text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-cyan-300 border border-slate-700 flex items-center gap-1 transition-all"
              title="Disparar verificação de invariantes e autocura AST"
            >
              <RotateCw className={`w-3 h-3 ${isHealing ? 'animate-spin text-amber-400' : 'text-cyan-400'}`} />
              {isHealing ? 'Autocurando...' : 'Revalidar & Autocurar'}
            </button>
          )}
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Orquestração Sequencial com Ground Truth
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeRoleTab === step.id;
          const logForStep = logs.find(l => l.role === step.id || l.step === step.stepNum);
          const isStepRunning = isGenerating && currentStep === step.stepNum;
          const isStepDone = !isGenerating || currentStep > step.stepNum;

          return (
            <button
              key={step.id}
              id={`agent-step-tab-${step.id}`}
              onClick={() => onSelectRoleTab(step.id)}
              className={`text-left relative p-3 rounded-lg border transition-all flex items-start gap-3 ${
                isActive
                  ? 'bg-slate-800/90 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/20'
                  : 'bg-slate-950/50 border-slate-800/70 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                isActive 
                  ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-400/30' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {isStepRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Passo {step.stepNum}
                  </span>
                  {isStepRunning ? (
                    <span className="text-[10px] text-cyan-400 font-medium animate-pulse">
                      Processando...
                    </span>
                  ) : isStepDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : null}
                </div>
                <div className="text-xs font-semibold text-slate-100 truncate mt-0.5">
                  {step.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {step.shortRole}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
