import React, { useState, useEffect } from 'react';
import { X, Code2, Play, RotateCcw, Check, RotateCw, Sparkles } from 'lucide-react';

interface CodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  onApplyCode: (newCode: string) => void;
  onAutoHealCode?: (codeToHeal: string) => void;
  isHealing?: boolean;
}

export const CodeEditorModal: React.FC<CodeEditorModalProps> = ({
  isOpen,
  onClose,
  code,
  onApplyCode,
  onAutoHealCode,
  isHealing = false
}) => {
  const [editedCode, setEditedCode] = useState(code);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    setEditedCode(code);
  }, [code]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyCode(editedCode);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 400);
  };

  const handleReset = () => {
    setEditedCode(code);
  };

  const handleAutoHeal = () => {
    if (onAutoHealCode) {
      onAutoHealCode(editedCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Editor de Código Canvas em Tempo Real
              </h2>
              <p className="text-xs text-slate-400">
                Ajuste a física ou shaders 2D e aplique instantaneamente no canvas
              </p>
            </div>
          </div>

          <button
            id="close-editor-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Textarea */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col bg-slate-950">
          <textarea
            id="canvas-code-textarea"
            value={editedCode}
            onChange={(e) => setEditedCode(e.target.value)}
            spellCheck={false}
            className="w-full h-[460px] bg-slate-950 text-emerald-300 font-mono text-xs p-4 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 resize-none leading-relaxed"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              id="reset-code-editor-btn"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reverter
            </button>
            
            {onAutoHealCode && (
              <button
                id="modal-autoheal-code-btn"
                onClick={handleAutoHeal}
                disabled={isHealing}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 disabled:opacity-50 transition-all"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isHealing ? 'animate-spin text-amber-400' : 'text-amber-300'}`} />
                {isHealing ? 'Autocurando...' : 'Autocura & Validação AST'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="cancel-code-editor-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button
              id="apply-code-editor-btn"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
            >
              {applied ? <Check className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {applied ? 'Aplicado!' : 'Executar no Canvas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
