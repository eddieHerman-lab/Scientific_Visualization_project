import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Camera, 
  Maximize2, 
  Activity,
  Zap,
  Gauge,
  Wrench,
  Loader2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { QAReport } from '../types';

interface SimulationViewportProps {
  code: string;
  sliderValues: Record<string, number>;
  metrics: Record<string, string | number>;
  qaReport?: QAReport | null;
  onMetricUpdate: (key: string, value: string | number) => void;
  onResetParams: () => void;
  onAutoHeal?: (errorNotes?: string) => void;
  isHealing?: boolean;
}

export const SimulationViewport: React.FC<SimulationViewportProps> = ({
  code,
  sliderValues,
  metrics,
  qaReport,
  onMetricUpdate,
  onResetParams,
  onAutoHeal,
  isHealing = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const sliderValuesRef = useRef<Record<string, number>>(sliderValues);
  
  const [isPaused, setIsPaused] = useState(false);
  const [fps, setFps] = useState(60);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keep ref up to date with reactive slider values
  useEffect(() => {
    sliderValuesRef.current = sliderValues;
  }, [sliderValues]);

  // Track fullscreen state & notify window resize for instant letterbox recalculation
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // ResizeObserver on container to guarantee responsive letterboxing on container size changes
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      window.dispatchEvent(new Event('resize'));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Global window error catcher for asynchronous animation frames
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event?.message || '';
      if (
        msg.includes('totalWeight') ||
        msg.includes('not defined') ||
        msg.includes('mountSimulation') ||
        msg.includes('CanvasRenderingContext2D') ||
        msg.includes('requestAnimationFrame')
      ) {
        console.error('[Simulation Error Intercepted]:', event.error || msg);
        setRuntimeError(msg);
      }
    };

    window.addEventListener('error', handleGlobalError);
    return () => window.removeEventListener('error', handleGlobalError);
  }, []);

  // Execute Canvas Simulation code
  useEffect(() => {
    if (!canvasRef.current || !code) return;

    // Clean up previous simulation
    if (cleanupRef.current) {
      try {
        cleanupRef.current();
      } catch (e) {
        console.error('Cleanup error:', e);
      }
      cleanupRef.current = null;
    }

    setRuntimeError(null);

    const canvas = canvasRef.current;
    const getParam = (key: string) => {
      if (sliderValuesRef.current && sliderValuesRef.current[key] !== undefined) {
        return sliderValuesRef.current[key];
      }
      return undefined;
    };

    const recordMetric = (key: string, value: string | number) => {
      onMetricUpdate(key, value);
    };

    try {
      // Evaluate generated JS code safely with common accumulator scope fallback
      const executor = new Function('canvas', 'getParam', 'recordMetric', `
        // Safety scope fallback variables to prevent reference errors during dynamic rendering
        var totalWeight = 0;
        var weight = 0;
        var sum = 0;
        var count = 0;
        var total = 0;

        try {
          ${code}
          if (typeof window.mountSimulation === 'function') {
            return window.mountSimulation(canvas, getParam, recordMetric);
          } else if (typeof window.startSimulation === 'function') {
            return window.startSimulation(canvas, getParam, recordMetric);
          }
        } catch(err) {
          throw err;
        }
      `);

      const cleanupFn = executor(canvas, getParam, recordMetric);
      if (typeof cleanupFn === 'function') {
        cleanupRef.current = cleanupFn;
      }
    } catch (err: any) {
      console.error('Canvas execution runtime error:', err);
      setRuntimeError(err?.message || 'Erro de execução do Canvas');
    }

    return () => {
      if (cleanupRef.current) {
        try {
          cleanupRef.current();
        } catch (e) {
          console.error('Cleanup error:', e);
        }
        cleanupRef.current = null;
      }
    };
  }, [code]);

  // Simple FPS measure
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const loop = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleTakeScreenshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `scientific_simulation_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col relative group ${
        isFullscreen ? 'w-screen h-screen rounded-none border-none' : 'w-full'
      }`}
    >
      {/* Top Bar of Viewport */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${runtimeError ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`}></span>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              HTML5 Canvas Runtime
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
            {runtimeError ? '0 FPS' : `${fps} FPS`}
          </span>
          {qaReport?.symbolic_result && (
            <div className={`hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-medium tracking-wide ${
              qaReport.symbolic_result.fonte_dados === 'sympy_verified' && qaReport.symbolic_result.status !== 'unverifiable'
                ? 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                : 'bg-amber-950/60 border-amber-800 text-amber-300'
            }`}>
              {qaReport.symbolic_result.fonte_dados === 'sympy_verified' && qaReport.symbolic_result.status !== 'unverifiable' ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  <span>SymPy CAS Confirmado</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Estimativa não auditada formalmente</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Viewport Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            id="reset-simulation-btn"
            onClick={onResetParams}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-all"
            title="Redefinir Parâmetros"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            id="screenshot-simulation-btn"
            onClick={handleTakeScreenshot}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-all"
            title="Salvar Captura PNG"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button
            id="fullscreen-simulation-btn"
            onClick={handleFullscreen}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-all"
            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Area with Letterbox Container */}
      <div className={`relative w-full ${
        isFullscreen ? 'flex-1 min-h-0' : 'h-[380px] sm:h-[430px] lg:h-[480px]'
      } bg-[#060913] flex items-center justify-center overflow-hidden transition-all select-none`}>
        {runtimeError ? (
          <div className="p-6 text-center text-rose-400 bg-rose-950/40 border border-rose-800/80 rounded-xl m-4 max-w-lg space-y-3 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 text-rose-300">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <p className="font-bold text-sm">Intercorrência no Canvas Runtime</p>
            </div>
            <p className="text-xs font-mono p-2.5 rounded bg-slate-950/80 border border-rose-900/50 text-rose-300 overflow-x-auto text-left">
              {runtimeError}
            </p>
            {onAutoHeal && (
              <button
                type="button"
                id="viewport-autoheal-btn"
                onClick={() => onAutoHeal(`Erro capturado no canvas: ${runtimeError}`)}
                disabled={isHealing}
                className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
              >
                {isHealing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Executando Autocura AST...
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4 text-cyan-200" />
                    Acionar Motor de Autocura AST & Invariantes
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            id="viewport"
            className="block cursor-crosshair max-w-full max-h-full transition-shadow shadow-2xl"
          />
        )}
      </div>

      {/* Live Telemetry Footer */}
      {Object.keys(metrics).length > 0 && (
        <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center gap-3 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
            <Activity className="w-3.5 h-3.5 text-cyan-400" /> Telemetria em Tempo Real:
          </span>
          <div className="flex items-center gap-2">
            {Object.entries(metrics).map(([key, val]) => {
              const isOrigin = key.toLowerCase().includes('origem');
              const isSymPy = String(val).toLowerCase().includes('sympy');
              return (
                <div 
                  key={key} 
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md shrink-0 text-xs border ${
                    isOrigin
                      ? isSymPy
                        ? 'bg-cyan-950/60 border-cyan-800 text-cyan-200'
                        : 'bg-amber-950/60 border-amber-800 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-slate-400 text-[11px]">{key}:</span>
                  <span className={`font-mono font-bold ${
                    isOrigin 
                      ? isSymPy ? 'text-cyan-300' : 'text-amber-300'
                      : 'text-cyan-300'
                  }`}>
                    {String(val)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
