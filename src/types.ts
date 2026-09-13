export type ExplanationMode = 'intuitive_metaphor' | 'academic_rigorous';

export interface MathematicalInvariant {
  property_name: string;
  formal_expression: string; // LaTeX expression for KaTeX
  sympy_expression?: string; // Pure SymPy string parseable by sympify()
  expected_behavior: string;
  derivation_origin?: string; // Derived directly from the idealized model definition
}

export interface TripartiteDistinction {
  idealized_model: {
    title: string;
    description: string;
    canonical_equations: string[];
  };
  implementation_equations: {
    title: string;
    discretization_method: string;
    algorithmic_equations: string[];
  };
  visual_metaphor: {
    metaphor_name: string;
    mapping_rules: string[];
    epistemic_boundary: string; // Explicit distinction between physical model and aesthetic visualization
  };
}

export interface EpistemicRigorAudit {
  is_markovian_qualified: boolean;
  state_space_extension_notes?: string;
  discrete_vs_continuous_landscape_notes?: string;
  differential_operators_explicitly_defined?: string[];
  ground_truth_derivation_chain?: string[];
}

export type VerificationVerdict = 'verified' | 'contradiction' | 'unverifiable';
export type UnverifiableReason = 'parse_error' | 'no_closed_form';
export type VerificationLabel =
  | 'Verificado formalmente'
  | 'Contradição detectada'
  | 'Contradição detectada — energia declarada abaixo do mínimo fisicamente permitido'
  | 'Não verificável automaticamente'
  | 'Não verificável (Falha de parsing/conversão)'
  | 'Não verificável (Sem forma fechada conhecida)';

export interface ConversionTrace {
  stage?: string;
  received_raw?: string;
  attempted_sympy?: string;
  error_message?: string;
  trace_steps?: string[];
  diagnostics?: string;
}

export interface SymbolicVerificationResult {
  status: VerificationVerdict;
  status_label: VerificationLabel;
  unverifiable_reason?: UnverifiableReason;
  unverifiable_sublabel?: string;
  conversion_trace?: ConversionTrace;
  energia_conservada: boolean | null;
  residuo_simbolico: string;
  equacao_movimento_derivada?: string;
  hamiltoniano_verdadeiro?: string;
  discrepancia_hamiltoniano?: string;
  inconsistencias_dimensionais: string[];
  detalhes_derivacao?: string;
  // Algebraic viability (E >= V_eff,min)
  viabilidade_algebrica?: boolean | null;
  violacao_viabilidade_algebrica?: boolean;
  v_eff_min?: number | string | null;
  v_eff_min_simbolico?: string | null;
  r_min?: number | string | null;
  r_min_simbolico?: string | null;
  energia_declarada_val?: number | string | null;
  delta_energia_min?: number | string | null;
  mensagem_viabilidade?: string;
  fonte_dados?: 'sympy_verified' | 'unverified_lead_scientist' | 'fallback_interno';
  metodo_auditoria?: string;
  system_class?: string;
  system_title?: string;
  primary_tab_label?: string;
  force_center_label?: string;
  moving_body_label?: string;
  v_eff_formula_str?: string;
  kinetic_radial_formula?: string;
}

export interface DualFormQuantity {
  name: string;
  latex: string;
  sympy: string;
  description?: string;
}

export interface SymbolicFormulation {
  system_type?: 'lagrangian' | 'hamiltonian' | 'ode_system' | 'discrete_stochastic' | 'chaotic_attractor' | 'kepler' | 'harmonic_oscillator' | 'coulomb' | 'central_general' | 'other';
  coordinates?: string[];
  velocities?: string[];
  lagrangian?: string; // SymPy string
  lagrangian_latex?: string; // LaTeX
  hamiltonian?: string; // SymPy string
  hamiltonian_latex?: string; // LaTeX
  declared_energy?: string; // SymPy string
  declared_energy_latex?: string; // LaTeX
  momentum?: string; // SymPy string
  momentum_latex?: string; // LaTeX
  dual_quantities?: DualFormQuantity[];
  energy_conservation_claimed?: boolean;
  declared_equations_of_motion?: string[];
  parameters?: Record<string, { symbol?: string; unit?: string; description?: string; value?: number }>;
  terms?: Array<{ expression: string; unit: string }>;
}

export interface ScientificSpec {
  reasoning_summary: string;
  core_phenomenon: string;
  formal_equations: string[];
  invariants: MathematicalInvariant[];
  state_variables: string[];
  dynamic_parameters: Record<string, string>;
  comparative_dynamics?: Record<string, string>;
  tripartite_distinction?: TripartiteDistinction;
  epistemic_rigor?: EpistemicRigorAudit;
  symbolic_formulation?: SymbolicFormulation;
}

export interface ControlSlider {
  id: string;
  label: string;
  min_val: number;
  max_val: number;
  default_val: number;
  step: number;
  unit?: string;
  description?: string;
  associated_symbol?: string;
}

export interface SceneStoryboard {
  pedagogical_explanation: string;
  visual_metaphor: string;
  canvas_layout?: string;
  controls: ControlSlider[];
  metrics_to_track: string[];
  tripartite_metaphor_clarification?: string;
}

export interface QAReport {
  syntax_valid: boolean;
  scientific_fidelity_score: number | null; // 0.0 to 1.0, null if unverifiable
  invariants_preserved: boolean | null; // null if unverifiable
  hallucination_detected: boolean | null; // null if unverifiable
  critique_notes: string;
  potential_bottlenecks?: string[];
  is_approved: boolean;
  feedback_for_regeneration?: string | null;
  verification_verdict: VerificationVerdict;
  verification_label: VerificationLabel;
  unverifiable_reason?: UnverifiableReason;
  conversion_trace?: ConversionTrace;
  symbolic_result?: SymbolicVerificationResult;
  epistemic_checks?: {
    equations_derivable: boolean | null;
    markovian_rigor_respected: boolean | null;
    discrete_landscape_distinguished: boolean | null;
    differential_operators_defined: boolean | null;
    ground_truth_rigorously_derived: boolean | null;
    tripartite_distinction_respected: boolean | null;
  };
}

export type AgentRole = 'lead_scientist' | 'scene_director' | 'graphics_engineer' | 'qa_auditor';

export interface AgentLog {
  step: number;
  role: AgentRole;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'retrying';
  timestamp: number;
  durationMs?: number;
  message?: string;
  data?: any;
}

export interface SimulationResponse {
  scientific_spec: ScientificSpec;
  pedagogical_text: string;
  ui_controls: ControlSlider[];
  executable_code: string;
  qa_report: QAReport;
  attempts: number;
  logs?: AgentLog[];
}

export interface PresetSimulation {
  id: string;
  title: string;
  category: string;
  prompt: string;
  scientific_spec: ScientificSpec;
  pedagogical_text: string;
  ui_controls: ControlSlider[];
  executable_code: string;
  qa_report: QAReport;
}

