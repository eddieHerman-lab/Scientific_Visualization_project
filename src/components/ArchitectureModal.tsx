import React from 'react';
import { X, Layers, Atom, Film, Code2, ShieldCheck, ArrowDown, RotateCw, CheckCircle2, Terminal } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Arquitetura da "Software House" de Agentes de Visualização Científica
              </h2>
              <p className="text-xs text-slate-400">
                Orquestração multi-papéis com contratos tipados estritos e ciclo de auto-cura
              </p>
            </div>
          </div>

          <button
            id="close-arch-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm">
          {/* Organograma Visual */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              1. Fluxo Sequencial de Execução com Loop de Feedback
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
              {/* Agent 1 */}
              <div className="p-3.5 bg-slate-950 border border-cyan-900/40 rounded-xl space-y-2 relative">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Atom className="w-4 h-4" /> 1. Lead Scientist
                </div>
                <p className="text-xs text-slate-400">
                  Decompõe equações densas, limites assintóticos e extrai <strong>Invariantes Invioláveis</strong>.
                </p>
                <div className="p-1.5 bg-slate-900 rounded font-mono text-[10px] text-cyan-300">
                  ➔ ScientificSpec (JSON)
                </div>
              </div>

              {/* Agent 2 */}
              <div className="p-3.5 bg-slate-950 border border-indigo-900/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <Film className="w-4 h-4" /> 2. Scene Director
                </div>
                <p className="text-xs text-slate-400">
                  Cria metáfora visual e narrativa em 2 parágrafos; define sliders e métricas dinâmicas.
                </p>
                <div className="p-1.5 bg-slate-900 rounded font-mono text-[10px] text-indigo-300">
                  ➔ SceneStoryboard (JSON)
                </div>
              </div>

              {/* Agent 3 */}
              <div className="p-3.5 bg-slate-950 border border-emerald-900/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Code2 className="w-4 h-4" /> 3. Graphics Engineer
                </div>
                <p className="text-xs text-slate-400">
                  Escreve JavaScript puro para HTML5 Canvas 2D a 60 FPS com integração de controles reativos.
                </p>
                <div className="p-1.5 bg-slate-900 rounded font-mono text-[10px] text-emerald-300">
                  ➔ window.mountSimulation
                </div>
              </div>

              {/* Agent 4 */}
              <div className="p-3.5 bg-slate-950 border border-rose-900/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" /> 4. QA Auditor
                </div>
                <p className="text-xs text-slate-400">
                  Verifica preservação de invariantes e ausência de alucinações. Se falhar, aciona autocura.
                </p>
                <div className="p-1.5 bg-slate-900 rounded font-mono text-[10px] text-rose-300 flex items-center justify-between">
                  <span>➔ QAReport</span>
                  <span className="text-emerald-400">Score &gt;= 90%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Self Healing Feedback Loop */}
          <div className="p-4 bg-slate-950/80 border border-amber-500/20 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <RotateCw className="w-4 h-4" /> Loop de Auto-Cura (Self-Healing Sandbox)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Caso o <strong>QA Auditor</strong> detecte que o código gerado pelo Graphics Engineer violou algum invariante matemático (ex: probabilidade total diferente de 1, energia não conservada, ou divergência descontrolada) ou gerou uma animação decorativa desconectada da física real (alucinação), o relatório com o parecer crítico é realimentado para o <strong>Graphics Engineer</strong> corrigir cirurgicamente o erro em até 2 tentativas automáticas.
            </p>
          </div>

          {/* Runtime Contract */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              2. Contrato de Execução do Canvas 2D
            </h3>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
              <pre className="text-cyan-300 leading-relaxed">
{`window.mountSimulation = function(canvas, getParam, recordMetric) {
  const ctx = canvas.getContext('2d');
  let isRunning = true;
  // ... integradores físicos (RK4, Verlet, Euler) ...
  function render() {
    if (!isRunning) return;
    const p1 = getParam('slider_id'); // Parâmetro em tempo real
    recordMetric('Invariant Check', metricValue); // Telemetria
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
  return () => { isRunning = false; }; // Cleanup de recursos
};`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            id="close-arch-btn-footer"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
