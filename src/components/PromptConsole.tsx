import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Zap, 
  BookOpen, 
  UploadCloud, 
  FileText, 
  X, 
  Brain, 
  GraduationCap,
  Layers,
  ChevronDown
} from 'lucide-react';
import { ExplanationMode } from '../types';

interface PromptConsoleProps {
  onSynthesize: (prompt: string, mode: ExplanationMode, docContext?: string) => void;
  isGenerating: boolean;
}

const SAMPLE_IDEAS = [
  {
    title: 'Diverse Beam Search',
    prompt: 'Diverse Beam Search: Topologia rugosa multimodal e penalidade de similaridade inter-grupos com exploradores com feixes de luz.',
    metaphor: 'Lanternas e exploradores descendo vales com névoa'
  },
  {
    title: 'Oscilador Quântico',
    prompt: 'Oscilador Harmônico Quântico: Densidade de probabilidade dos estados estacionários vs pacote de ondas coerente em dispersão com visualização de densidade fluida.',
    metaphor: 'Ondulação quântica com barreira de potencial'
  },
  {
    title: 'Modelo de Ising 2D',
    prompt: 'Modelo de Ising 2D: Transição de fase ferromagnética e magnetização espontânea via algoritmo de Metropolis-Hastings.',
    metaphor: 'Domínios magnéticos e turbulência térmica'
  },
  {
    title: 'Presa-Predador',
    prompt: 'Sistemas Presa-Predador Lotka-Volterra com órbita fechada no espaço de fase, ecossistema vivo de biomassa e conservação invariante.',
    metaphor: 'Ecossistema interativo com oscilação cíclica'
  }
];

export const PromptConsole: React.FC<PromptConsoleProps> = ({
  onSynthesize,
  isGenerating
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [explanationMode, setExplanationMode] = useState<ExplanationMode>('intuitive_metaphor');
  const [docFile, setDocFile] = useState<{ name: string; size: number; content: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('O arquivo selecionado é muito grande (>15MB). Por favor, selecione um arquivo menor ou copie o trecho de equações/texto diretamente.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      let content = (event.target?.result as string) || '';
      // Limit text extract to first 60,000 characters for optimal LLM context window & prompt latency
      if (content.length > 60000) {
        content = content.slice(0, 60000) + '\n\n[... Trecho restante resumido para otimização de síntese ...]';
      }

      setDocFile({
        name: file.name,
        size: file.size,
        content
      });
      setIsUploading(false);
      // Auto fill prompt if empty
      if (!inputPrompt.trim()) {
        setInputPrompt(`Extraia as equações, dinâmica e invariantes centrais do documento "${file.name}" e sintetize a simulação correspondente.`);
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      alert('Erro ao ler o documento. Tente colar o texto ou equações diretamente na caixa de entrada.');
    };

    // Read as text (works seamlessly for txt, md, tex, latex, json, csv, etc.)
    reader.readAsText(file);
  };

  const handleRemoveDoc = () => {
    setDocFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputPrompt.trim() && !docFile) || isGenerating) return;
    onSynthesize(inputPrompt.trim(), explanationMode, docFile?.content);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-xl space-y-3.5">
      {/* Top Header with Mode Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Entrada de Conceito Científico & Artigos
          </h2>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
          <button
            type="button"
            id="mode-intuitive-btn"
            onClick={() => setExplanationMode('intuitive_metaphor')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              explanationMode === 'intuitive_metaphor'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Gera analogias do mundo real tangíveis, estética rica e explicações intuitivas estilo Feynman"
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">Modo</span> Intuitivo & Lúdico
          </button>
          
          <button
            type="button"
            id="mode-academic-btn"
            onClick={() => setExplanationMode('academic_rigorous')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              explanationMode === 'academic_rigorous'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Gera diagramas formais de espaço de fase e análise matemática acadêmica estrita"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xs:inline">Modo</span> Acadêmico Formal
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            id="scientific-prompt-input"
            rows={3}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={
              explanationMode === 'intuitive_metaphor'
                ? "Descreva um fenômeno físico ou matemático (ex: 'Sincronização de vaga-lumes e osciladores acoplados com pulso luminoso', 'Caminho de partículas em busca de recompensa em labirinto nebuloso')..."
                : "Digite o formalismo hamiltoniano, equações diferenciais acopladas ou sistema dinâmico (ex: 'dx/dt = sigma*(y-x), dy/dt = x*(rho-z)-y, dz/dt = x*y - beta*z')..."
            }
            className="w-full bg-slate-950/90 border border-slate-800 rounded-lg p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/30 font-sans transition-all resize-none"
            disabled={isGenerating}
          />

          {/* Attached Document Pill */}
          {docFile && (
            <div className="mt-2 p-2 bg-slate-950 border border-cyan-500/40 rounded-lg flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="text-xs text-slate-200 truncate font-mono">
                  {docFile.name} <span className="text-[10px] text-slate-500">({(docFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveDoc}
                className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition-colors"
                title="Remover documento"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Actions Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Suggestions and File Upload */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.tex,.latex,.json,.csv,.pdf"
              className="hidden"
              id="doc-upload-input"
            />
            
            <button
              type="button"
              id="upload-doc-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isGenerating || isUploading}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 text-slate-300 hover:text-cyan-300 flex items-center gap-1.5 shrink-0 transition-all"
              title="Carregue artigo científico (PDF, TeX, TXT ou Markdown)"
            >
              <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
              {docFile ? 'Trocar Artigo' : 'Upload Artigo/Doc'}
            </button>

            <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Sugestões:
            </span>

            {SAMPLE_IDEAS.map((idea, i) => (
              <button
                key={i}
                type="button"
                id={`sample-idea-${i}`}
                onClick={() => setInputPrompt(idea.prompt)}
                disabled={isGenerating}
                className="text-[11px] px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white truncate max-w-[150px] sm:max-w-[180px] transition-all"
                title={`${idea.prompt} (${idea.metaphor})`}
              >
                {idea.title}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="synthesize-simulation-btn"
            disabled={(!inputPrompt.trim() && !docFile) || isGenerating}
            className={`w-full sm:w-auto px-5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
              (!inputPrompt.trim() && !docFile) || isGenerating
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/25 cursor-pointer'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Sintetizando ({explanationMode === 'intuitive_metaphor' ? 'Modo Intuitivo' : 'Modo Rigoroso'})...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Sintetizar Simulação Multi-Agente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

