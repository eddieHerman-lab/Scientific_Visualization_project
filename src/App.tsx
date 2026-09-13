import React, { useState, useEffect, useCallback } from 'react';
import { PRESET_SIMULATIONS } from './data/presets';
import { 
  ScientificSpec, 
  SceneStoryboard, 
  QAReport, 
  ControlSlider, 
  AgentLog, 
  SimulationResponse, 
  PresetSimulation,
  ExplanationMode
} from './types';
import { Header } from './components/Header';
import { PipelineStepsBar } from './components/PipelineStepsBar';
import { AgentCardsView } from './components/AgentCardsView';
import { SimulationViewport } from './components/SimulationViewport';
import { ControlPanel } from './components/ControlPanel';
import { PromptConsole } from './components/PromptConsole';
import { ArchitectureModal } from './components/ArchitectureModal';
import { CodeEditorModal } from './components/CodeEditorModal';
import { AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Current Active Simulation State
  const defaultPreset = PRESET_SIMULATIONS[0];
  const [currentPresetId, setCurrentPresetId] = useState<string>(defaultPreset.id);
  const [scientificSpec, setScientificSpec] = useState<ScientificSpec>(defaultPreset.scientific_spec);
  const [pedagogicalText, setPedagogicalText] = useState<string>(defaultPreset.pedagogical_text);
  const [uiControls, setUiControls] = useState<ControlSlider[]>(defaultPreset.ui_controls);
  const [executableCode, setExecutableCode] = useState<string>(defaultPreset.executable_code);
  const [qaReport, setQaReport] = useState<QAReport>(defaultPreset.qa_report);
  
  // Sliders Dynamic Values State
  const [sliderValues, setSliderValues] = useState<Record<string, number>>(() => {
    const initVals: Record<string, number> = {};
    defaultPreset.ui_controls.forEach(c => {
      initVals[c.id] = c.default_val;
    });
    return initVals;
  });

  // Real-time Telemetry Metrics
  const [metrics, setMetrics] = useState<Record<string, string | number>>({});

  // Agent Pipeline States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [currentStep, setCurrentStep] = useState(4);
  const [activeRoleTab, setActiveRoleTab] = useState('lead_scientist');
  const [attempts, setAttempts] = useState(1);
  const [healSuccessMsg, setHealSuccessMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([
    {
      step: 1,
      role: 'lead_scientist',
      name: 'Lead Scientist',
      status: 'success',
      timestamp: Date.now(),
      message: 'Decomposição formal e invariantes matemáticos invioláveis extraídos.'
    },
    {
      step: 2,
      role: 'scene_director',
      name: 'Scene Director',
      status: 'success',
      timestamp: Date.now(),
      message: 'Metáfora pedagógica (2 parágrafos) e controles interativos mapeados.'
    },
    {
      step: 3,
      role: 'graphics_engineer',
      name: 'Graphics Engineer',
      status: 'success',
      timestamp: Date.now(),
      message: 'Código Canvas 2D 60 FPS compilado e conectado aos sliders reativos.'
    },
    {
      step: 4,
      role: 'qa_auditor',
      name: 'QA & Scientific Auditor',
      status: 'success',
      timestamp: Date.now(),
      message: 'Auditoria de invariantes aprovada: 98% de fidelidade científica.'
    }
  ]);

  // Modals
  const [isArchOpen, setIsArchOpen] = useState(false);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Switch Preset Handler
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_SIMULATIONS.find(p => p.id === presetId);
    if (!preset) return;

    setCurrentPresetId(preset.id);
    setScientificSpec(preset.scientific_spec);
    setPedagogicalText(preset.pedagogical_text);
    setUiControls(preset.ui_controls);
    setExecutableCode(preset.executable_code);
    setQaReport(preset.qa_report);
    setMetrics({});
    setCurrentStep(4);
    setAttempts(1);
    setHealSuccessMsg(null);

    const newVals: Record<string, number> = {};
    preset.ui_controls.forEach(c => {
      newVals[c.id] = c.default_val;
    });
    setSliderValues(newVals);
  };

  // Slider Change Handler
  const handleSliderChange = (id: string, val: number) => {
    setSliderValues(prev => ({
      ...prev,
      [id]: val
    }));
  };

  // Reset Sliders
  const handleResetSliders = () => {
    const defaultVals: Record<string, number> = {};
    uiControls.forEach(c => {
      defaultVals[c.id] = c.default_val;
    });
    setSliderValues(defaultVals);
  };

  // Telemetry Metric Callback
  const handleMetricUpdate = useCallback((key: string, value: string | number) => {
    setMetrics(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Multi-Agent Synthesis API
  const handleSynthesize = async (prompt: string, mode: ExplanationMode = 'intuitive_metaphor', docContext?: string) => {
    setIsGenerating(true);
    setGlobalError(null);
    setHealSuccessMsg(null);
    setMetrics({});
    setCurrentStep(1);
    setActiveRoleTab('lead_scientist');

    try {
      const response = await fetch('/api/v1/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          explanation_mode: mode,
          doc_context: docContext
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        if (contentType.includes('application/json')) {
          const errData = await response.json();
          throw new Error(errData.details || errData.error || `Erro do servidor (${response.status})`);
        } else {
          const textErr = await response.text();
          if (response.status === 413) {
            throw new Error('Arquivo ou documento muito grande. Por favor envie um resumo ou trecho de texto menor.');
          }
          throw new Error(`Erro na síntese (${response.status}): ${textErr.slice(0, 150)}`);
        }
      }

      if (!contentType.includes('application/json')) {
        throw new Error('Resposta do servidor em formato inesperado (não-JSON).');
      }

      const data: SimulationResponse = await response.json();

      setScientificSpec(data.scientific_spec);
      setPedagogicalText(data.pedagogical_text);
      setUiControls(data.ui_controls);
      setExecutableCode(data.executable_code);
      setQaReport(data.qa_report);
      setAttempts(data.attempts || 1);
      if (data.logs) setLogs(data.logs);

      // Initialize new sliders
      const newVals: Record<string, number> = {};
      data.ui_controls.forEach(c => {
        newVals[c.id] = c.default_val;
      });
      setSliderValues(newVals);

      setCurrentStep(4);
    } catch (err: any) {
      console.error('Synthesis error:', err);
      const isFetchErr = err.name === 'TypeError' && err.message.includes('fetch');
      const friendlyMsg = isFetchErr
        ? 'Erro de comunicação temporário com o servidor de síntese. Por favor, tente novamente ou selecione uma das sugestões rápidas.'
        : (err.message || 'Erro durante a síntese multi-agente.');
      setGlobalError(friendlyMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // On-Demand AST & Invariants Self-Healing Loop
  const handleAutoHeal = async (customFeedbackOrCode?: string) => {
    setIsHealing(true);
    setGlobalError(null);
    setHealSuccessMsg(null);

    try {
      const isCode = customFeedbackOrCode && (customFeedbackOrCode.includes('mountSimulation') || customFeedbackOrCode.includes('canvas'));
      const targetCode = isCode ? customFeedbackOrCode : executableCode;
      const feedbackNotes = !isCode && customFeedbackOrCode ? customFeedbackOrCode : qaReport?.critique_notes;

      const response = await fetch('/api/v1/autoheal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scientific_spec: scientificSpec,
          ui_controls: uiControls,
          executable_code: targetCode,
          pedagogical_text: pedagogicalText,
          critique_notes: feedbackNotes
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        if (contentType.includes('application/json')) {
          const errData = await response.json();
          throw new Error(errData.details || errData.error || 'Falha no processo de autocura');
        } else {
          throw new Error(`Falha no servidor durante autocura (${response.status})`);
        }
      }

      const result = await response.json();
      if (result.executable_code) {
        setExecutableCode(result.executable_code);
      }
      if (result.qa_report) {
        setQaReport(result.qa_report);
      }
      setAttempts(prev => prev + 1);
      const scoreDisplay = result.qa_report?.scientific_fidelity_score != null
        ? `${(result.qa_report.scientific_fidelity_score * 100).toFixed(0)}%`
        : 'Não-computado (Revisão Qualitativa)';
      setHealSuccessMsg(`Autocura AST & Invariantes executada com sucesso em ${result.durationMs || 450}ms! Score de Fidelidade: ${scoreDisplay}.`);
      
      // Update logs with healing event
      setLogs(prev => [
        ...prev,
        {
          step: 4,
          role: 'qa_auditor',
          name: 'Motor de Autocura AST (Executado)',
          status: 'success',
          timestamp: Date.now(),
          durationMs: result.durationMs,
          message: `Autocura cirúrgica aplicada. Invariantes e sintaxe revalidados (${scoreDisplay} fidelidade).`
        }
      ]);
    } catch (err: any) {
      console.error('Autoheal error:', err);
      setGlobalError(`Erro na autocura: ${err?.message || 'Falha desconhecida'}`);
    } finally {
      setIsHealing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        onOpenArchitecture={() => setIsArchOpen(true)}
        isGenerating={isGenerating}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error Alert with Smart Diagnosis & Retry */}
        {globalError && (
          <div className="p-4 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in shadow-lg">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-rose-200">
                  {globalError.includes('503') || globalError.includes('demand') || globalError.includes('UNAVAILABLE')
                    ? 'Pico Temporário de Demanda na API Gemini (503 Unavailable)'
                    : 'Aviso do Pipeline Multi-Agente'}
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {globalError.includes('503') || globalError.includes('demand') || globalError.includes('UNAVAILABLE')
                    ? 'O cluster de IA está processando um alto volume de requisições simultâneas. O sistema já implementa retentativas automáticas e fallback entre modelos. Tente novamente em alguns instantes ou selecione um preset imediato.'
                    : globalError}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button 
                onClick={() => setGlobalError(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Heal Success Toast */}
        {healSuccessMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium text-emerald-200">{healSuccessMsg}</span>
            </div>
            <button 
              onClick={() => setHealSuccessMsg(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Prompt Console Bar */}
        <PromptConsole
          onSynthesize={handleSynthesize}
          isGenerating={isGenerating}
        />

        {/* 4-Agent Pipeline Steps Tracker */}
        <PipelineStepsBar
          logs={logs}
          isGenerating={isGenerating}
          isHealing={isHealing}
          currentStep={currentStep}
          attempts={attempts}
          activeRoleTab={activeRoleTab}
          onSelectRoleTab={(tab) => setActiveRoleTab(tab)}
          onTriggerAutoHeal={() => handleAutoHeal()}
        />

        {/* Main Grid: Left = Simulation Viewport & Controls; Right = Agent Outputs Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Simulation & Sliders (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Viewport */}
            <SimulationViewport
              code={executableCode}
              sliderValues={sliderValues}
              metrics={metrics}
              qaReport={qaReport}
              onMetricUpdate={handleMetricUpdate}
              onResetParams={handleResetSliders}
              onAutoHeal={(notes) => handleAutoHeal(notes)}
              isHealing={isHealing}
            />

            {/* Dynamic Sliders */}
            <ControlPanel
              controls={uiControls}
              values={sliderValues}
              onChange={handleSliderChange}
              onReset={handleResetSliders}
            />
          </div>

          {/* Right Column: Multi-Agent Deep Inspection Cards (5 cols on lg) */}
          <div className="lg:col-span-5 h-full">
            <AgentCardsView
              scientificSpec={scientificSpec}
              pedagogicalText={pedagogicalText}
              uiControls={uiControls}
              executableCode={executableCode}
              qaReport={qaReport}
              activeTab={activeRoleTab}
              onTabChange={(tab) => setActiveRoleTab(tab)}
              onOpenCodeEditor={() => setIsCodeEditorOpen(true)}
              onAutoHeal={() => handleAutoHeal()}
              isHealing={isHealing}
            />
          </div>
        </div>
      </main>

      {/* Architecture Modal */}
      <ArchitectureModal
        isOpen={isArchOpen}
        onClose={() => setIsArchOpen(false)}
      />

      {/* Live Code Editor Modal */}
      <CodeEditorModal
        isOpen={isCodeEditorOpen}
        onClose={() => setIsCodeEditorOpen(false)}
        code={executableCode}
        onApplyCode={(newCode) => setExecutableCode(newCode)}
        onAutoHealCode={(codeToHeal) => handleAutoHeal(codeToHeal)}
        isHealing={isHealing}
      />
    </div>
  );
}
