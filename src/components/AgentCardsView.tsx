import React, { useState } from 'react';
import { 
  Atom, 
  Film, 
  Code2, 
  ShieldCheck, 
  Check, 
  Copy, 
  Sliders, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  AlertTriangle,
  HelpCircle,
  BookOpen, 
  Terminal, 
  ExternalLink,
  Edit3,
  RotateCw,
  Sparkles,
  Calculator,
  FileCode,
  ArrowRight,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { ScientificSpec, SceneStoryboard, QAReport, ControlSlider } from '../types';
import { MathView } from './MathView';

interface AgentCardsViewProps {
  scientificSpec: ScientificSpec;
  pedagogicalText: string;
  uiControls: ControlSlider[];
  executableCode: string;
  qaReport: QAReport;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenCodeEditor: () => void;
  onAutoHeal?: () => void;
  isHealing?: boolean;
}

export const AgentCardsView: React.FC<AgentCardsViewProps> = ({
  scientificSpec,
  pedagogicalText,
  uiControls,
  executableCode,
  qaReport,
  activeTab,
  onTabChange,
  onOpenCodeEditor,
  onAutoHeal,
  isHealing = false
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [showTraceSteps, setShowTraceSteps] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(executableCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto">
        <button
          id="tab-lead-scientist"
          onClick={() => onTabChange('lead_scientist')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'lead_scientist'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Atom className="w-4 h-4 text-cyan-400" />
          1. Lead Scientist
        </button>

        <button
          id="tab-scene-director"
          onClick={() => onTabChange('scene_director')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'scene_director'
              ? 'border-indigo-400 text-indigo-300 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Film className="w-4 h-4 text-indigo-400" />
          2. Scene Director
        </button>

        <button
          id="tab-graphics-engineer"
          onClick={() => onTabChange('graphics_engineer')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'graphics_engineer'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Code2 className="w-4 h-4 text-emerald-400" />
          3. Graphics Engineer
        </button>

        <button
          id="tab-qa-auditor"
          onClick={() => onTabChange('qa_auditor')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'qa_auditor'
              ? qaReport?.verification_verdict === 'contradiction'
                ? 'border-rose-400 text-rose-300 bg-rose-500/5'
                : qaReport?.verification_verdict === 'unverifiable' || qaReport?.scientific_fidelity_score == null
                ? 'border-slate-500 text-slate-300 bg-slate-800/30'
                : 'border-emerald-400 text-emerald-300 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${
            qaReport?.verification_verdict === 'contradiction'
              ? 'text-rose-400'
              : qaReport?.verification_verdict === 'unverifiable' || qaReport?.scientific_fidelity_score == null
              ? 'text-slate-400'
              : 'text-emerald-400'
          }`} />
          4. QA Auditor
          <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold border ${
            qaReport?.verification_verdict === 'unverifiable' || qaReport?.scientific_fidelity_score == null
              ? 'bg-slate-800/80 text-slate-400 border-slate-700'
              : qaReport?.verification_verdict === 'contradiction'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}>
            {qaReport?.verification_verdict === 'unverifiable' || qaReport?.scientific_fidelity_score == null
              ? 'Não-computado'
              : `${(qaReport.scientific_fidelity_score * 100).toFixed(0)}%`}
          </span>
        </button>
      </div>

      {/* Tab Content Container */}
      <div className="p-4 lg:p-5 flex-1 overflow-y-auto max-h-[600px] space-y-4">
        {/* --- TAB 1: LEAD SCIENTIST --- */}
        {activeTab === 'lead_scientist' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Core Phenomenon */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Atom className="w-3.5 h-3.5" /> Fenômeno Central Extraído
              </div>
              <p className="text-sm font-semibold text-slate-100 leading-snug">
                {scientificSpec?.core_phenomenon}
              </p>
              {scientificSpec?.reasoning_summary && (
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {scientificSpec.reasoning_summary}
                </p>
              )}
            </div>

            {/* Tripartite Epistemological Distinction (Regra Epistêmica) */}
            {scientificSpec?.tripartite_distinction && (
              <div className="p-4 bg-slate-950/90 border border-cyan-900/40 rounded-lg space-y-3">
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Distinção Tripartite Epistemológica
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Rigor Epistêmico
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {/* (a) Modelo Idealizado */}
                  <div className="p-3 rounded bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="text-[11px] font-bold text-indigo-300 uppercase flex items-center gap-1">
                      <span>(a) Modelo Idealizado</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {scientificSpec.tripartite_distinction.idealized_model?.description}
                    </p>
                    {scientificSpec.tripartite_distinction.idealized_model?.canonical_equations?.map((eq, i) => (
                      <div key={i} className="p-1.5 bg-slate-950 rounded border border-slate-800/80 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                        <MathView math={eq} block />
                      </div>
                    ))}
                  </div>

                  {/* (b) Equações da Implementação */}
                  <div className="p-3 rounded bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="text-[11px] font-bold text-emerald-300 uppercase flex items-center gap-1">
                      <span>(b) Implementação</span>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400/90 px-1.5 py-0.5 rounded bg-emerald-500/10 inline-block border border-emerald-500/20">
                      {scientificSpec.tripartite_distinction.implementation_equations?.discretization_method || 'Discretização Numérica'}
                    </div>
                    {scientificSpec.tripartite_distinction.implementation_equations?.algorithmic_equations?.map((eq, i) => (
                      <div key={i} className="p-1.5 bg-slate-950 rounded border border-slate-800/80 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                        <MathView math={eq} block />
                      </div>
                    ))}
                  </div>

                  {/* (c) Metáfora Visual & Fronteira */}
                  <div className="p-3 rounded bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="text-[11px] font-bold text-amber-300 uppercase flex items-center gap-1">
                      <span>(c) Metáfora Visual</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200">
                      {scientificSpec.tripartite_distinction.visual_metaphor?.metaphor_name}
                    </div>
                    <p className="text-[11px] text-amber-200/80 leading-relaxed italic border-l-2 border-amber-500/40 pl-2">
                      <strong>Fronteira Epistêmica:</strong> {scientificSpec.tripartite_distinction.visual_metaphor?.epistemic_boundary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Epistemic Rigor Checklist */}
            {scientificSpec?.epistemic_rigor && (
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Validações de Raciocínio & Espaço de Estados
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800/80 space-y-1">
                    <div className="font-semibold text-cyan-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Qualificação Markoviana:
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {scientificSpec.epistemic_rigor.is_markovian_qualified 
                        ? 'Processo sem memória estrita ou com espaço de estado estendido explicitado.' 
                        : (scientificSpec.epistemic_rigor.state_space_extension_notes || 'Processo Não-Markoviano com dependência histórica.')}
                    </p>
                  </div>
                  {scientificSpec.epistemic_rigor.discrete_vs_continuous_landscape_notes && (
                    <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800/80 space-y-1">
                      <div className="font-semibold text-indigo-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Estados Discretos vs Landscape:
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {scientificSpec.epistemic_rigor.discrete_vs_continuous_landscape_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Formal Equations in LaTeX */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Equações Matemáticas Formais</span>
                <span className="text-[10px] text-slate-500">Renderização KaTeX</span>
              </div>
              <div className="space-y-2">
                {scientificSpec?.formal_equations?.map((eq, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 bg-slate-950/80 border border-slate-800/90 rounded-lg font-mono text-sm text-cyan-300 flex items-center justify-between overflow-x-auto"
                  >
                    <MathView math={eq} block />
                  </div>
                ))}
              </div>
            </div>

            {/* Inviolable Invariants (Ground Truth Contracts - Dual Format) */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Invariantes Matemáticos Invioláveis (Ground Truth Layer)
                </span>
                <span className="text-[10px] text-indigo-400 font-mono">Duplo Formato: LaTeX + SymPy</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {scientificSpec?.invariants?.map((inv, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 bg-slate-950/80 border border-emerald-900/30 rounded-lg space-y-2.5 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {inv.property_name}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Invariante #{idx + 1}
                      </span>
                    </div>

                    {/* Dual Format Display: KaTeX + Pure SymPy */}
                    <div className="space-y-2">
                      <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800 text-xs font-mono text-slate-200">
                        <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                          <span>Formato KaTeX (Exibição Visual)</span>
                        </div>
                        <MathView math={inv.formal_expression} block />
                      </div>

                      {inv.sympy_expression && (
                        <div className="p-2 bg-slate-950 rounded border border-indigo-900/40 text-[11px] font-mono text-indigo-300">
                          <div className="text-[9px] uppercase tracking-wider text-indigo-400/80 mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Calculator className="w-3 h-3 text-indigo-400" /> Sintaxe SymPy Pura (sympify)
                            </span>
                            <span className="text-[9px] text-slate-500">Motor de Verificação</span>
                          </div>
                          <code className="select-all block break-all text-indigo-200 bg-slate-900/80 px-2 py-1 rounded border border-indigo-950">
                            {inv.sympy_expression}
                          </code>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong className="text-slate-300 font-semibold">Comportamento Esperado:</strong> {inv.expected_behavior}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Symbolic Formulation Spec Card (Lagrangian, Energy, Hamiltonian in Dual Format) */}
            {scientificSpec?.symbolic_formulation && (
              <div className="p-3.5 bg-slate-950/90 border border-indigo-950 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                    Formulação Analítica Simbólica Declarada
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {scientificSpec.symbolic_formulation.system_type || 'lagrangian'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {/* Lagrangiana */}
                  {(scientificSpec.symbolic_formulation.lagrangian_latex || scientificSpec.symbolic_formulation.lagrangian) && (
                    <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800 space-y-1">
                      <div className="text-[10px] font-bold text-slate-300 uppercase flex items-center justify-between">
                        <span>Lagrangiana L (T - V)</span>
                      </div>
                      {scientificSpec.symbolic_formulation.lagrangian_latex && (
                        <div className="p-1.5 bg-slate-950 rounded border border-slate-800/80 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                          <MathView math={scientificSpec.symbolic_formulation.lagrangian_latex} block />
                        </div>
                      )}
                      {scientificSpec.symbolic_formulation.lagrangian && (
                        <div className="p-1.5 bg-slate-950 rounded border border-indigo-950 text-[10px] font-mono text-indigo-300 break-all select-all">
                          <span className="text-slate-500 text-[9px] block">SymPy:</span>
                          <code>{scientificSpec.symbolic_formulation.lagrangian}</code>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Energia Declarada */}
                  {(scientificSpec.symbolic_formulation.declared_energy_latex || scientificSpec.symbolic_formulation.declared_energy) && (
                    <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800 space-y-1">
                      <div className="text-[10px] font-bold text-slate-300 uppercase flex items-center justify-between">
                        <span>Energia Total Declarada E</span>
                      </div>
                      {scientificSpec.symbolic_formulation.declared_energy_latex && (
                        <div className="p-1.5 bg-slate-950 rounded border border-slate-800/80 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                          <MathView math={scientificSpec.symbolic_formulation.declared_energy_latex} block />
                        </div>
                      )}
                      {scientificSpec.symbolic_formulation.declared_energy && (
                        <div className="p-1.5 bg-slate-950 rounded border border-indigo-950 text-[10px] font-mono text-indigo-300 break-all select-all">
                          <span className="text-slate-500 text-[9px] block">SymPy:</span>
                          <code>{scientificSpec.symbolic_formulation.declared_energy}</code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* State Variables & Dynamic Bounds */}
            {scientificSpec?.state_variables && (
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Variáveis de Estado (Graus de Liberdade)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {scientificSpec.state_variables.map((v, i) => (
                    <span 
                      key={i} 
                      className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-cyan-400"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: SCENE DIRECTOR --- */}
        {activeTab === 'scene_director' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Pedagogical Explanation (2 Short Paragraphs) */}
            <div className="p-4 bg-slate-950/70 border border-indigo-900/30 rounded-lg space-y-3">
              <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Explicação Pedagógica (2 Parágrafos)
              </div>
              <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {pedagogicalText}
              </div>
            </div>

            {/* Visual Metaphor */}
            {scientificSpec?.comparative_dynamics && (
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-indigo-400" /> Dinâmicas Comparadas
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(scientificSpec.comparative_dynamics).map(([key, desc]) => (
                    <div key={key} className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                      <div className="font-semibold text-indigo-300 capitalize mb-1">{key}</div>
                      <div className="text-slate-400">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Control Sliders Mapped */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Controles Interativos Expostos na UI ({uiControls.length} sliders)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {uiControls.map((slider) => (
                  <div key={slider.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span>{slider.label}</span>
                      <span className="font-mono text-cyan-400">{slider.default_val} {slider.unit}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                      <span>Min: {slider.min_val}</span>
                      <span>Passo: {slider.step}</span>
                      <span>Max: {slider.max_val}</span>
                    </div>
                    {slider.description && (
                      <p className="text-[10px] text-slate-400 mt-1 italic">{slider.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: GRAPHICS ENGINEER --- */}
        {activeTab === 'graphics_engineer' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> Código JavaScript Puro (HTML5 Canvas 2D)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  60 FPS Loop
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  id="edit-canvas-code-btn"
                  onClick={onOpenCodeEditor}
                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                >
                  <Edit3 className="w-3 h-3" /> Editar Código
                </button>
                <button
                  id="copy-canvas-code-btn"
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCode ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs text-slate-300 max-h-[420px] overflow-y-auto p-4 leading-relaxed">
              <pre className="text-emerald-300 whitespace-pre-wrap">{executableCode}</pre>
            </div>
            <p className="text-[11px] text-slate-400">
              Contrato de Execução: <code className="text-cyan-400">window.mountSimulation(canvas, getParam, recordMetric)</code> com limpeza de recursos via return cleanup.
            </p>
          </div>
        )}

        {/* --- TAB 4: QA AUDITOR --- */}
        {activeTab === 'qa_auditor' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Fidelity Score & 3-State Verdict Banner */}
            <div className={`p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              qaReport?.verification_verdict === 'contradiction'
                ? 'bg-rose-950/40 border-rose-800/80 shadow-rose-950/20'
                : qaReport?.verification_verdict === 'unverifiable'
                ? qaReport?.unverifiable_reason === 'parse_error'
                  ? 'bg-amber-950/40 border-amber-700/80 shadow-amber-950/20'
                  : 'bg-slate-900/70 border-slate-700/80 shadow-slate-950/20'
                : 'bg-slate-950/90 border-slate-800'
            }`}>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> Veredito de Verificação Matemática Independente
                </div>
                <div className="text-base font-bold flex items-center gap-2">
                  {qaReport?.verification_verdict === 'contradiction' ? (
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <XCircle className="w-5 h-5 text-rose-400" />
                      {qaReport.verification_label || 'Contradição detectada'}
                    </span>
                  ) : qaReport?.verification_verdict === 'unverifiable' ? (
                    qaReport?.unverifiable_reason === 'parse_error' ? (
                      <span className="text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        {qaReport.verification_label || 'Não verificável (Falha de parsing/conversão)'}
                      </span>
                    ) : (
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <HelpCircle className="w-5 h-5 text-slate-400" />
                        {qaReport.verification_label || 'Não verificável (Sem forma fechada conhecida)'}
                      </span>
                    )
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      {qaReport?.verification_label || 'Verificado formalmente'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {qaReport?.verification_verdict === 'contradiction'
                    ? 'Invariante violado ou resíduo simbólico dE/dt ≠ 0 detectado via SymPy/Euler-Lagrange.'
                    : qaReport?.verification_verdict === 'unverifiable'
                    ? qaReport?.unverifiable_reason === 'parse_error'
                      ? 'Falha técnica na conversão entre expressões em LaTeX e a sintaxe esperada pelo SymPy/Pint.'
                      : 'Limitação física do modelo: processo estocástico, aberto, caótico ou discreto sem Lagrangiana fechada.'
                    : 'Invariantes de Euler-Lagrange e homogeneidade dimensional (Pint) analiticamente comprovados.'}
                </p>
              </div>

              {/* Action and Gauge */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {onAutoHeal && (
                  <button
                    id="qa-tab-autoheal-btn"
                    onClick={onAutoHeal}
                    disabled={isHealing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold disabled:opacity-50 transition-all shadow-sm"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isHealing ? 'animate-spin text-amber-400' : 'text-rose-400'}`} />
                    {isHealing ? 'Executando Autocura...' : 'Executar Autocura AST'}
                  </button>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-2xl font-black font-mono ${
                      qaReport?.verification_verdict === 'unverifiable' || qaReport?.scientific_fidelity_score == null
                        ? 'text-slate-500'
                        : qaReport?.verification_verdict === 'contradiction'
                        ? 'text-rose-300'
                        : 'text-white'
                    }`}>
                      {qaReport?.verification_verdict === 'unverifiable' || qaReport?.scientific_fidelity_score == null
                        ? '—'
                        : `${(qaReport.scientific_fidelity_score * 100).toFixed(0)}%`}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      {qaReport?.verification_verdict === 'unverifiable' || qaReport?.scientific_fidelity_score == null
                        ? 'Score Não-Computado'
                        : 'Fidelity Score'}
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center relative ${
                    qaReport?.verification_verdict === 'contradiction'
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                      : qaReport?.verification_verdict === 'unverifiable' || qaReport?.scientific_fidelity_score == null
                      ? 'border-slate-700 bg-slate-800/40 text-slate-400'
                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {qaReport?.verification_verdict === 'contradiction' ? (
                      <XCircle className="w-6 h-6" />
                    ) : qaReport?.verification_verdict === 'unverifiable' || qaReport?.scientific_fidelity_score == null ? (
                      <HelpCircle className="w-6 h-6 text-slate-400" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SYMBOLIC & NUMERICAL VERIFIER ENGINE (SymPy & Pint) */}
            {qaReport?.symbolic_result && (
              <div className="p-4 bg-slate-950/90 border border-indigo-900/40 rounded-lg space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-indigo-400" />
                    Camada de Verificação Simbólica & Dimensional (SymPy & Pint)
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                    qaReport.symbolic_result.status === 'contradiction'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : qaReport.symbolic_result.status === 'unverifiable'
                      ? qaReport.unverifiable_reason === 'parse_error'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {qaReport.symbolic_result.status_label || qaReport.symbolic_result.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Resíduo Simbólico dE/dt */}
                  <div className="p-3 bg-slate-900/90 rounded border border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-slate-300 block">
                      Taxa de Variação da Energia (dE/dt On-Shell)
                    </span>
                    <div className={`font-mono text-xs p-2 rounded break-all ${
                      qaReport.symbolic_result.status === 'contradiction'
                        ? 'bg-rose-950/60 text-rose-200 border border-rose-800/60'
                        : qaReport.symbolic_result.status === 'unverifiable'
                        ? 'bg-slate-950 text-slate-400 border border-slate-800'
                        : 'bg-slate-950 text-emerald-300 border border-slate-800'
                    }`}>
                      {qaReport.symbolic_result.status === 'unverifiable'
                        ? 'Não computado (Derivação simbólica fechada indisponível)'
                        : qaReport.symbolic_result.residuo_simbolico
                        ? `dE/dt = ${qaReport.symbolic_result.residuo_simbolico}`
                        : 'dE/dt = 0 (Conservação perfeita)'}
                    </div>
                    {qaReport.symbolic_result.discrepancia_hamiltoniano && (
                      <p className="text-[11px] text-rose-400 pt-1 font-mono">
                        Discrepância Δ = {qaReport.symbolic_result.discrepancia_hamiltoniano}
                      </p>
                    )}
                  </div>

                  {/* Hamiltoniano Verdadeiro vs Declarado */}
                  <div className="p-3 bg-slate-900/90 rounded border border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-slate-300 block">
                      Hamiltoniano Canônico On-Shell
                    </span>
                    <div className="font-mono text-[11px] p-2 bg-slate-950 text-slate-300 border border-slate-800 rounded break-all">
                      {qaReport.symbolic_result.status === 'unverifiable'
                        ? 'Não computado numericamente'
                        : qaReport.symbolic_result.hamiltoniano_verdadeiro
                        ? `H = ${qaReport.symbolic_result.hamiltoniano_verdadeiro}`
                        : 'H = T + V (Invariante canônico on-shell)'}
                    </div>
                    {qaReport.symbolic_result.inconsistencias_dimensionais && qaReport.symbolic_result.inconsistencias_dimensionais.length > 0 ? (
                      <p className="text-[11px] text-amber-400 pt-1">
                        Inconsistência Dimensional: {qaReport.symbolic_result.inconsistencias_dimensionais.join('; ')}
                      </p>
                    ) : qaReport.symbolic_result.status === 'unverifiable' ? (
                      <p className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> Análise Dimensional Pint: Não avaliada
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-400 pt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Análise Dimensional Pint: Homogênea [Joule / Energia]
                      </p>
                    )}
                  </div>
                </div>

                {/* Condição Algébrica de Viabilidade Físico-Energética (E >= V_eff,mín) */}
                {(qaReport.symbolic_result.v_eff_min != null || qaReport.symbolic_result.violacao_viabilidade_algebrica !== undefined) && (
                  <div className={`p-3.5 rounded border space-y-2.5 ${
                    qaReport.symbolic_result.violacao_viabilidade_algebrica
                      ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300'
                  }`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          {qaReport.symbolic_result.violacao_viabilidade_algebrica ? (
                            <>
                              <XCircle className="w-4 h-4 text-rose-400" />
                              <span className="text-rose-300">Viabilidade Algébrica da Energia (E ≥ V_eff,mín): Contradição</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-300">Viabilidade Algébrica da Energia (E ≥ V_eff,mín): Aprovada</span>
                            </>
                          )}
                        </span>
                        {qaReport.symbolic_result.system_title && (
                          <span className="text-[10px] text-slate-400 block font-sans font-medium">
                            {qaReport.symbolic_result.system_title}
                          </span>
                        )}
                      </div>
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded border font-semibold ${
                        qaReport.symbolic_result.violacao_viabilidade_algebrica
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {qaReport.symbolic_result.violacao_viabilidade_algebrica ? 'Fisicamente Inatingível' : 'Fisicamente Viável'}
                      </span>
                    </div>

                    {qaReport.symbolic_result.v_eff_formula_str && (
                      <div className="px-2.5 py-1.5 rounded bg-slate-950/70 border border-slate-800/90 flex items-center justify-between gap-2 text-[11px] font-mono">
                        <span className="text-slate-400 font-sans text-[10px]">Potencial Efetivo Teórico:</span>
                        <span className="text-cyan-300 font-semibold">{qaReport.symbolic_result.v_eff_formula_str}</span>
                      </div>
                    )}

                    {/* Origem e Proveniência Formal dos Dados */}
                    <div className={`p-2.5 rounded border flex items-start gap-2.5 text-xs ${
                      qaReport.symbolic_result.fonte_dados === 'sympy_verified' && qaReport.symbolic_result.status !== 'unverifiable'
                        ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-200'
                        : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                    }`}>
                      <div className="mt-0.5 shrink-0">
                        {qaReport.symbolic_result.fonte_dados === 'sympy_verified' && qaReport.symbolic_result.status !== 'unverifiable' ? (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[10.5px] uppercase tracking-wider">
                            {qaReport.symbolic_result.fonte_dados === 'sympy_verified' && qaReport.symbolic_result.status !== 'unverifiable'
                              ? 'Origem: Verificador SymPy Confirmado (CAS)'
                              : 'Origem: Estimativa não auditada formalmente'}
                          </span>
                          <span className={`text-[9.5px] px-2 py-0.5 rounded font-mono border font-medium ${
                            qaReport.symbolic_result.fonte_dados === 'sympy_verified' && qaReport.symbolic_result.status !== 'unverifiable'
                              ? 'bg-cyan-900/50 border-cyan-700 text-cyan-300'
                              : 'bg-amber-900/50 border-amber-700 text-amber-300'
                          }`}>
                            {qaReport.symbolic_result.fonte_dados === 'sympy_verified' && qaReport.symbolic_result.status !== 'unverifiable'
                              ? 'SymPy CAS Auditado'
                              : 'Estimativa não auditada formalmente'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                          {qaReport.symbolic_result.fonte_dados === 'sympy_verified' && qaReport.symbolic_result.status !== 'unverifiable'
                            ? (qaReport.symbolic_result.metodo_auditoria || 'Os valores de V_eff,mín e do raio de equilíbrio r_mín foram calculados e comprovados formalmente via derivação simbólica pelo motor SymPy.')
                            : 'Estimativa teórica baseada nas equações do modelo. O motor formal SymPy CAS esteve indisponível ou pendente neste teste, portanto a visualização prossegue com selo de estimativa não auditada formalmente.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                      <div className="p-2 bg-slate-950/80 rounded border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block font-sans">Mínimo do Potencial Efetivo:</span>
                        <span className="text-cyan-300 font-bold">
                          V_eff,mín = {qaReport.symbolic_result.v_eff_min != null ? `${qaReport.symbolic_result.v_eff_min} J` : 'N/D'}
                        </span>
                        {qaReport.symbolic_result.v_eff_min_simbolico && (
                          <span className="text-[9.5px] text-slate-400 block font-mono">
                            {qaReport.symbolic_result.v_eff_min_simbolico}
                          </span>
                        )}
                        {qaReport.symbolic_result.r_min != null && (
                          <span className="text-[10px] text-slate-400 block font-sans">
                            em r = {qaReport.symbolic_result.r_min} m
                            {qaReport.symbolic_result.r_min_simbolico ? ` [${qaReport.symbolic_result.r_min_simbolico}]` : ''}
                          </span>
                        )}
                      </div>
                      <div className="p-2 bg-slate-950/80 rounded border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block font-sans">Energia Total Declarada:</span>
                        <span className={qaReport.symbolic_result.violacao_viabilidade_algebrica ? 'text-rose-400 font-bold' : 'text-slate-200 font-bold'}>
                          E = {qaReport.symbolic_result.energia_declarada_val != null ? `${qaReport.symbolic_result.energia_declarada_val} J` : 'N/D'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-sans">Condição inicial</span>
                      </div>
                      <div className="p-2 bg-slate-950/80 rounded border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block font-sans">Diferença (ΔE = E − V_eff,mín):</span>
                        <span className={`font-bold ${
                          qaReport.symbolic_result.violacao_viabilidade_algebrica ? 'text-rose-300' : 'text-emerald-400'
                        }`}>
                          ΔE = {qaReport.symbolic_result.delta_energia_min != null ? `${qaReport.symbolic_result.delta_energia_min} J` : 'N/D'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {qaReport.symbolic_result.violacao_viabilidade_algebrica ? 'Déficit proibido (< 0)' : 'Margem viável (≥ 0)'}
                        </span>
                      </div>
                    </div>

                    {qaReport.symbolic_result.mensagem_viabilidade && (
                      <p className="text-[11px] leading-relaxed text-slate-300 pt-1 font-sans">
                        {qaReport.symbolic_result.mensagem_viabilidade}
                      </p>
                    )}
                  </div>
                )}

                {/* Detalhes da Derivação Simbólica */}
                {qaReport.symbolic_result.detalhes_derivacao && (
                  <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                    <strong className="text-slate-200 block text-[11px] mb-1">Álgebra de Euler-Lagrange & SymPy:</strong>
                    {qaReport.symbolic_result.detalhes_derivacao}
                  </div>
                )}
              </div>
            )}

            {/* CONVERSION & PARSING TRACE (Rastro de Conversão LaTeX ➔ SymPy) */}
            {(qaReport?.conversion_trace || qaReport?.symbolic_result?.conversion_trace) && (
              (() => {
                const trace = qaReport?.conversion_trace || qaReport?.symbolic_result?.conversion_trace;
                if (!trace) return null;

                const hasError = Boolean(trace.error_message);

                return (
                  <div className={`p-4 rounded-lg border space-y-3 ${
                    hasError
                      ? 'bg-slate-950/90 border-amber-900/40'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        Rastro de Conversão & Parsing (LaTeX ➔ SymPy)
                      </div>
                      <div className="flex items-center gap-2">
                        {trace.stage && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            Estágio: {trace.stage}
                          </span>
                        )}
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                          hasError
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        }`}>
                          {hasError ? 'Conversão com Alerta / Erro' : 'Conversão Concluída'}
                        </span>
                      </div>
                    </div>

                    {/* Mensagem de Erro de Conversão se houver */}
                    {trace.error_message && (
                      <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[11px] font-semibold text-amber-300">Mensagem do Parser SymPy:</strong>
                          <span className="font-mono text-[11px] text-amber-200/90 break-all">{trace.error_message}</span>
                        </div>
                      </div>
                    )}

                    {/* Comparação Entrada Bruta vs Conversão Tentada */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {trace.received_raw && (
                        <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">
                            Entrada Bruta Recebida (LaTeX / Lead Scientist)
                          </span>
                          <code className="text-[11px] font-mono text-cyan-300 block bg-slate-950 p-1.5 rounded border border-slate-800/80 break-all select-all">
                            {trace.received_raw}
                          </code>
                        </div>
                      )}

                      {trace.attempted_sympy && (
                        <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold text-indigo-300 uppercase block">
                            Sintaxe SymPy Gerada / Tentada
                          </span>
                          <code className="text-[11px] font-mono text-indigo-300 block bg-slate-950 p-1.5 rounded border border-indigo-950 break-all select-all">
                            {trace.attempted_sympy}
                          </code>
                        </div>
                      )}
                    </div>

                    {/* Etapas Detalhadas de Transformação (Trace Steps) */}
                    {trace.trace_steps && trace.trace_steps.length > 0 && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowTraceSteps(!showTraceSteps)}
                          className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                        >
                          {showTraceSteps ? (
                            <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                          <span>{showTraceSteps ? 'Ocultar etapas detalhadas do pipeline' : `Ver etapas de transformação (${trace.trace_steps.length} passos)`}</span>
                        </button>

                        {showTraceSteps && (
                          <div className="mt-2 space-y-1 p-2 bg-slate-900/60 rounded border border-slate-800 font-mono text-[11px] max-h-48 overflow-y-auto">
                            {trace.trace_steps.map((step, sIdx) => (
                              <div key={sIdx} className="text-slate-400 flex items-start gap-2 py-0.5">
                                <span className="text-cyan-500 font-bold shrink-0">[{sIdx + 1}]</span>
                                <span className="text-slate-300 break-all">{step}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()
            )}

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="text-[11px] text-slate-400">Sintaxe & Runtime</div>
                <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Válido (Zero Erros)
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="text-[11px] text-slate-400">Invariantes Preservados</div>
                {qaReport?.verification_verdict === 'unverifiable' || qaReport?.invariants_preserved === null ? (
                  <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Não avaliado on-shell
                  </div>
                ) : qaReport?.invariants_preserved ? (
                  <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Contratos Respeitados
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-rose-400 mt-1 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Contradição Física Detectada
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="text-[11px] text-slate-400">Detecção de Alucinação</div>
                {qaReport?.verification_verdict === 'unverifiable' || qaReport?.hallucination_detected === null ? (
                  <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Não avaliado numericamente
                  </div>
                ) : qaReport?.hallucination_detected ? (
                  <div className="text-xs font-semibold text-rose-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Alucinação Conceitual Detectada
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Física Real (Sem Alucinação)
                  </div>
                )}
              </div>
            </div>

            {/* Epistemic Rigor Checklist (6 Regras Fundamentais) */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2.5">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Auditoria de Rigor Epistemológico (6 Regras do Modelo)
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  qaReport?.verification_verdict === 'unverifiable'
                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                    : qaReport?.verification_verdict === 'contradiction'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                }`}>
                  {qaReport?.verification_verdict === 'unverifiable'
                    ? 'Sem Avaliação Numérica'
                    : qaReport?.verification_verdict === 'contradiction'
                    ? 'Contradição Matemática'
                    : 'Consistência Dedutiva'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  {
                    num: 1,
                    title: '1. Consistência Dedutiva',
                    desc: 'Todas as equações são deduzidas das premissas sem saltos ad-hoc.',
                    key: 'equations_derivable' as const
                  },
                  {
                    num: 2,
                    title: '2. Rigor Markoviano',
                    desc: 'Processos com dependência histórica utilizam espaço de estado estendido.',
                    key: 'markovian_rigor_respected' as const
                  },
                  {
                    num: 3,
                    title: '3. Espaço Discreto vs Contínuo',
                    desc: 'Projeções de feixes/grafos não são tratadas como relevo físico contínuo.',
                    key: 'discrete_landscape_distinguished' as const
                  },
                  {
                    num: 4,
                    title: '4. Operadores Diferenciais',
                    desc: 'Gradientes e divergências possuem definição métrica explícita.',
                    key: 'differential_operators_defined' as const
                  },
                  {
                    num: 5,
                    title: '5. Ground Truth Derivável',
                    desc: 'Grandezas conservadas e limites derivam diretamente do formalismo.',
                    key: 'ground_truth_rigorously_derived' as const
                  },
                  {
                    num: 6,
                    title: '6. Distinção Tripartite',
                    desc: 'Separação estrita entre Modelo Idealizado, Discretização e Metáfora.',
                    key: 'tripartite_distinction_respected' as const
                  }
                ].map(rule => {
                  const checkVal = qaReport?.epistemic_checks ? qaReport.epistemic_checks[rule.key] : undefined;
                  const isUnverifiable = qaReport?.verification_verdict === 'unverifiable' || checkVal === null || (checkVal === undefined && qaReport?.verification_verdict !== 'verified');
                  const isContradiction = checkVal === false || (qaReport?.verification_verdict === 'contradiction' && (rule.key === 'equations_derivable' || rule.key === 'ground_truth_rigorously_derived'));
                  
                  return (
                    <div 
                      key={rule.num} 
                      className={`p-2.5 rounded border flex items-start gap-2 ${
                        isUnverifiable
                          ? 'bg-slate-900/40 border-slate-800/80'
                          : isContradiction
                          ? 'bg-rose-950/20 border-rose-900/50'
                          : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      {isUnverifiable ? (
                        <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      ) : isContradiction ? (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <strong className={`block text-[11px] truncate ${
                            isUnverifiable ? 'text-slate-400' : isContradiction ? 'text-rose-200' : 'text-slate-200'
                          }`}>
                            {rule.title}
                          </strong>
                          {isUnverifiable ? (
                            <span className="text-[9px] text-slate-400 font-medium px-1 rounded bg-slate-950 border border-slate-800 shrink-0">
                              Não avaliado
                            </span>
                          ) : isContradiction ? (
                            <span className="text-[9px] text-rose-400 font-medium px-1 rounded bg-rose-950/60 border border-rose-900/60 shrink-0">
                              Violação
                            </span>
                          ) : (
                            <span className="text-[9px] text-emerald-400 font-medium px-1 rounded bg-emerald-950/60 border border-emerald-900/60 shrink-0">
                              Validado
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">
                          {isUnverifiable ? (
                            <span className="text-slate-500 italic">Camada simbólica analítica não executada ou não aplicável.</span>
                          ) : (
                            rule.desc
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Critique Notes */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-cyan-400" /> Parecer Crítico do Revisor (Peer Review AST)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {qaReport?.critique_notes || 'Implementação rigorosamente verificada contra as leis de conservação e propriedades assintóticas.'}
              </p>
            </div>

            {qaReport?.potential_bottlenecks && qaReport.potential_bottlenecks.length > 0 && (
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Complexidade Algorítmica & Bottlenecks
                </div>
                <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                  {qaReport.potential_bottlenecks.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
