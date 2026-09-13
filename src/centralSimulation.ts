import { ScientificSpec, SceneStoryboard } from './types';

export function createCentralPotentialSimulation(promptText?: string, isSymPyVerified: boolean = true): {
  scientific_spec: ScientificSpec;
  storyboard: SceneStoryboard;
  executable_code: string;
} {
  const text = (promptText || '').replace(/[−–]/g, '-').replace(/,/g, '.');
  const textLower = text.toLowerCase();

  // Classificação do Sistema Físico
  const isHarmonic = /oscilador|harm[oô]nic|harmonic|mola|hooke|k\*r\^2|0\.5\*k\*r\*\*2|1\/2\*k\*r\^2|\bk\s*=\s*[+-]?\d+/i.test(textLower) && !/gm\s*=\s*[+-]?\d+/i.test(textLower);
  const isCoulomb = /coulomb|carga|eletrost[aá]tic/i.test(textLower);
  const isKepler = !isHarmonic && !isCoulomb;

  // Extração determinística de parâmetros do texto do usuário
  const mL = text.match(/\bL\s*[:=]\s*([+-]?\d+(?:\.\d+)?)/i);
  const mM = text.match(/\bm\s*[:=]\s*([+-]?\d+(?:\.\d+)?)/i);
  const mMu = text.match(/(?:\\mu|μ|\bmu\b)\s*[:=]\s*([+-]?\d+(?:\.\d+)?)/i);
  const mGM = text.match(/(?:\bGM\b|G\*M)\s*[:=]\s*([+-]?\d+(?:\.\d+)?)/i);
  const mK = text.match(/(?:\bk\b|\bK\b|\bk_e\b)\s*[:=]\s*([+-]?\d+(?:\.\d+)?)/i);
  const mE = text.match(/(?:\bE\b|\benergia\b)\s*[:=]\s*([+-]?\d+(?:\.\d+)?)/i);

  const L = mL ? parseFloat(mL[1]) : (isHarmonic ? 2.0 : 1.0);
  const mu = isHarmonic
    ? (mM ? parseFloat(mM[1]) : (mMu ? parseFloat(mMu[1]) : 1.0))
    : (mMu ? parseFloat(mMu[1]) : (mM ? parseFloat(mM[1]) : 1.0));
  const GM = mGM ? parseFloat(mGM[1]) : 1.0;
  const kVal = mK ? parseFloat(mK[1]) : (isHarmonic ? 2.0 : 1.0);

  let V_eff_min = 0;
  let r_min = 1.0;
  let defaultE = 0;
  let system_title = '';
  let system_class = '';
  let primary_tab_label = '';
  let force_center_label = '';
  let moving_body_label = '';
  let v_eff_formula_str = '';
  let v_eff_min_formula_str = '';
  let r_min_formula_str = '';
  let kinetic_radial_formula = '';
  let core_phenomenon = '';

  if (isHarmonic) {
    system_class = 'harmonic_oscillator';
    const omega = Math.sqrt(kVal / mu);
    V_eff_min = omega * L;
    r_min = Math.pow((L * L) / (mu * kVal), 0.25);
    defaultE = Math.round((V_eff_min + 0.5) * 1000) / 1000;
    system_title = 'Oscilador Harmônico Isotrópico 2D (Potencial Efetivo Elástico)';
    primary_tab_label = '🌀 Trajetória 2D';
    force_center_label = 'Centro de Força Elástica (Origem k)';
    moving_body_label = 'Massa Oscilante (m)';
    v_eff_formula_str = 'V_eff(r) = L²/(2·m·r²) + ½·k·r²';
    v_eff_min_formula_str = 'V_eff,mín = ω·L = √(k/m)·L';
    r_min_formula_str = 'r_mín = (L²/(m·k))^(1/4)';
    kinetic_radial_formula = 'T_r = ½·m·ṙ²';
    core_phenomenon = 'Oscilador Harmônico Isotrópico 2D com Coordenada Cíclica (Potencial Efetivo)';
  } else if (isCoulomb) {
    system_class = 'coulomb';
    V_eff_min = - (mu * kVal * kVal) / (2.0 * L * L);
    r_min = (L * L) / (mu * kVal);
    defaultE = Math.round((V_eff_min + 0.5) * 1000) / 1000;
    system_title = 'Força Central Coulombiana (Interação Eletrostática)';
    primary_tab_label = '⚡ Trajetória 2D';
    force_center_label = 'Carga Central Fonte (Q)';
    moving_body_label = 'Carga em Movimento (q)';
    v_eff_formula_str = 'V_eff(r) = L²/(2·μ·r²) - K/r';
    v_eff_min_formula_str = 'V_eff,mín = -μ·K² / (2L²)';
    r_min_formula_str = 'r_mín = L² / (μ·K)';
    kinetic_radial_formula = 'T_r = ½·μ·ṙ²';
    core_phenomenon = 'Força Central Coulombiana (Potencial Efetivo e Viabilidade Algébrica)';
  } else {
    system_class = 'kepler';
    V_eff_min = - (GM * GM * Math.pow(mu, 3)) / (2.0 * L * L);
    r_min = (L * L) / (GM * mu * mu);
    defaultE = -0.5;
    system_title = 'Problema de Kepler de Dois Corpos (Potencial Efetivo Gravitacional)';
    primary_tab_label = '🪐 Órbita 2D';
    force_center_label = 'Centro Gravitacional Atrator (M)';
    moving_body_label = 'Corpo Orbitante (μ)';
    v_eff_formula_str = 'V_eff(r) = L²/(2·μ·r²) - GM·μ/r';
    v_eff_min_formula_str = 'V_eff,mín = -(GM)²·μ³ / (2L²)';
    r_min_formula_str = 'r_mín = L² / (GM·μ²)';
    kinetic_radial_formula = 'T_r = ½·μ·ṙ²';
    core_phenomenon = 'Problema de Kepler de Dois Corpos (Potencial Efetivo e Viabilidade Algébrica)';
  }

  const E = mE ? parseFloat(mE[1]) : defaultE;
  const deltaE = E - V_eff_min;
  const isViolated = deltaE < -1e-5;

  const scientific_spec: ScientificSpec = {
    core_phenomenon,
    reasoning_summary: isHarmonic
      ? `No oscilador harmônico isotrópico plano 2D sob potencial V(r) = 1/2·k·r², a conservação do momento angular L = m·r²·φ̇ reduz o problema à dinâmica radial unidimensional em um potencial efetivo V_eff(r) = L²/(2mr²) + 1/2·k·r². A energia total é E = 1/2·m·ṙ² + V_eff(r). Para existência no espaço de fase real, exige-se energia cinética radial não-negativa (T_r = 1/2·m·ṙ² ≥ 0), impondo a viabilidade E ≥ V_eff,mín = ω·L = √(k/m)·L. Se E = V_eff,mín, a trajetória é perfeitamente circular e isócrona de raio r = r_mín = (L²/(m·k))^(1/4). Se E < V_eff,mín, a velocidade radial seria puramente imaginária, provocando suspensão analítica imediata.`
      : `No problema de força central V(r) = -GM·μ/r com coordenada cíclica angular φ, a conservação do momento angular L = μ·r²·φ̇ reduz o problema à dinâmica radial em potencial efetivo V_eff(r) = L²/(2μr²) - GMμ/r. A energia mecânica total é E = 1/2·μ·ṙ² + V_eff(r). Para que o movimento ocorra no espaço real, a energia cinética radial deve ser não-negativa (T_r = 1/2·μ·ṙ² ≥ 0), impondo a viabilidade E ≥ V_eff,mín = -(GM)²·μ³/(2L²). Se viável (E ≥ V_eff,mín), a órbita no plano é animada continuamente (no caso limite E = V_eff,mín, a trajetória é uma órbita circular estável em r = r_mín). Se E < V_eff,mín, a animação é bloqueada analiticamente para prevenir velocidade imaginária.`,
    formal_equations: [
      v_eff_formula_str,
      `E = ${kinetic_radial_formula} + V_{\\text{eff}}(r)`,
      v_eff_min_formula_str,
      r_min_formula_str,
      `T_r = E - V_{\\text{eff}}(r) \\ge 0 \\implies E \\ge V_{\\text{eff,mín}}`
    ],
    invariants: [
      {
        property_name: 'Viabilidade Algébrica da Energia (E ≥ V_eff,mín)',
        formal_expression: `E \\ge V_{\\text{eff,mín}} = ${V_eff_min.toFixed(4)}`,
        sympy_expression: 'E >= V_eff_min',
        expected_behavior: `A energia mecânica declarada deve ser maior ou igual ao mínimo do potencial efetivo para garantir velocidade radial real (${kinetic_radial_formula} ≥ 0).`
      },
      {
        property_name: 'Conservação da Energia Total (dE/dt = 0)',
        formal_expression: '\\frac{dE}{dt} = 0',
        sympy_expression: 'dE/dt = 0',
        expected_behavior: 'A energia mecânica do sistema é constante ao longo das equações de Euler-Lagrange on-shell.'
      }
    ],
    state_variables: ['r', 'r_dot'],
    dynamic_parameters: isHarmonic
      ? { L: L.toString(), m: mu.toString(), k: kVal.toString(), E: E.toString() }
      : (isCoulomb
          ? { L: L.toString(), mu: mu.toString(), K: kVal.toString(), E: E.toString() }
          : { L: L.toString(), mu: mu.toString(), GM: GM.toString(), E: E.toString() }),
    symbolic_formulation: {
      system_type: isHarmonic ? 'harmonic_oscillator' : (isCoulomb ? 'coulomb' : 'kepler'),
      coordinates: ['r'],
      velocities: ['r_dot'],
      lagrangian: isHarmonic ? '0.5*m*r_dot**2 - (L**2/(2*m*r**2) + 0.5*k*r**2)' : '0.5*mu*r_dot**2 - (L**2/(2*mu*r**2) - GM*mu/r)',
      declared_energy: isHarmonic ? '0.5*m*r_dot**2 + L**2/(2*m*r**2) + 0.5*k*r**2' : '0.5*mu*r_dot**2 + L**2/(2*mu*r**2) - GM*mu/r',
      energy_conservation_claimed: true,
      parameters: isHarmonic
        ? {
            L: { symbol: 'L', value: L, unit: 'kg*m**2/s', description: 'Momento angular constante' },
            m: { symbol: 'm', value: mu, unit: 'kg', description: 'Massa da partícula oscilante' },
            k: { symbol: 'k', value: kVal, unit: 'N/m', description: 'Constante elástica' },
            E: { symbol: 'E', value: E, unit: 'J', description: 'Energia total declarada' }
          }
        : {
            L: { symbol: 'L', value: L, unit: 'kg*m**2/s', description: 'Momento angular constante' },
            mu: { symbol: 'mu', value: mu, unit: 'kg', description: 'Massa reduzida' },
            GM: { symbol: 'GM', value: GM, unit: 'm**3/s**2', description: 'Constante de força central' },
            E: { symbol: 'E', value: E, unit: 'J', description: 'Energia total declarada' }
          },
      terms: []
    }
  };

  const storyboard: SceneStoryboard = {
    pedagogical_explanation: isViolated
      ? `No sistema ${system_title}, o movimento radial é governado pelo potencial efetivo $${v_eff_formula_str}$. Existe uma condição algébrica de viabilidade fundamental: a energia total declarada $E$ deve ser maior ou igual ao mínimo do poço de potencial efetivo: $${v_eff_min_formula_str} = ${V_eff_min.toFixed(3)}\\text{ J}$. Ao declarar $E = ${E.toFixed(3)}\\text{ J}$, a energia encontra-se ${Math.abs(deltaE).toFixed(3)}\\text{ J}$ abaixo do mínimo fisicamente possível. A simulação foi suspensa analiticamente para prevenir velocidade radial imaginária.`
      : `No sistema ${system_title}, o movimento radial é governado pelo potencial efetivo $${v_eff_formula_str}$. O poço possui mínimo em $V_{\\text{eff,mín}} = ${V_eff_min.toFixed(3)}\\text{ J}$ no raio de equilíbrio $r_{\\text{mín}} = ${r_min.toFixed(2)}\\text{ m}$. Com a energia declarada $E = ${E.toFixed(3)}\\text{ J}$, a margem energética é $\\Delta E = ${deltaE.toFixed(3)}\\text{ J} \\ge 0$, garantindo energia cinética radial real ($${kinetic_radial_formula} \\ge 0$). No caso-limite $\\Delta E = 0$ ($E = V_{\\text{eff,mín}}$), a dinâmica resulta em uma **trajetória circular estável** de raio constante $r = r_{\\text{mín}}$, animada em tempo real.`,
    visual_metaphor: isViolated
      ? 'Placeholder de simulação bloqueada por parâmetros fisicamente inválidos'
      : `${primary_tab_label} animada com conservação do momento angular L e dinâmica central`,
    canvas_layout: 'Canvas HiDPI letterboxed com renderização 2D em tempo real',
    controls: isHarmonic
      ? [
          { id: 'L', label: 'Momento Angular (L)', min_val: 0.5, max_val: 5.0, default_val: L, step: 0.1, unit: 'kg·m²/s', associated_symbol: 'L', description: 'Momento angular conservado' },
          { id: 'm', label: 'Massa Oscilante (m)', min_val: 0.2, max_val: 4.0, default_val: mu, step: 0.1, unit: 'kg', associated_symbol: 'm', description: 'Massa da partícula' },
          { id: 'k', label: 'Constante Elástica (k)', min_val: 0.5, max_val: 6.0, default_val: kVal, step: 0.1, unit: 'N/m', associated_symbol: 'k', description: 'Constante de mola' },
          { id: 'E', label: 'Energia Declarada (E)', min_val: Math.max(0.1, V_eff_min - 2.0), max_val: V_eff_min + 4.0, default_val: E, step: 0.05, unit: 'J', associated_symbol: 'E', description: 'Energia total declarada' }
        ]
      : (isCoulomb
          ? [
              { id: 'L', label: 'Momento Angular (L)', min_val: 0.5, max_val: 4.0, default_val: L, step: 0.1, unit: 'kg·m²/s', associated_symbol: 'L', description: 'Momento angular' },
              { id: 'mu', label: 'Massa Reduzida (μ)', min_val: 0.2, max_val: 3.0, default_val: mu, step: 0.1, unit: 'kg', associated_symbol: 'mu', description: 'Massa reduzida' },
              { id: 'K', label: 'Constante Coulomb (K)', min_val: 0.2, max_val: 3.0, default_val: kVal, step: 0.1, unit: 'N·m²', associated_symbol: 'K', description: 'Constante de Coulomb' },
              { id: 'E', label: 'Energia Declarada (E)', min_val: -1.0, max_val: 0.5, default_val: E, step: 0.025, unit: 'J', associated_symbol: 'E', description: 'Energia total declarada' }
            ]
          : [
              { id: 'L', label: 'Momento Angular (L)', min_val: 0.5, max_val: 4.0, default_val: L, step: 0.1, unit: 'kg·m²/s', associated_symbol: 'L', description: 'Momento angular orbital' },
              { id: 'mu', label: 'Massa Reduzida (μ)', min_val: 0.2, max_val: 3.0, default_val: mu, step: 0.1, unit: 'kg', associated_symbol: 'mu', description: 'Massa reduzida' },
              { id: 'GM', label: 'Parâmetro Gravitacional (GM)', min_val: 0.2, max_val: 3.0, default_val: GM, step: 0.1, unit: 'm³/s²', associated_symbol: 'GM', description: 'Constante GM' },
              { id: 'E', label: 'Energia Declarada (E)', min_val: -1.0, max_val: 0.5, default_val: E, step: 0.025, unit: 'J', associated_symbol: 'E', description: 'Energia total declarada' }
            ]),
    metrics_to_track: ['Regime Dinâmico', 'Energia Declarada E', 'V_eff,mín Calculado', 'Déficit Energético ΔE', 'Status Físico']
  };

  const executable_code = `window.mountSimulation = function(canvas, getParam, recordMetric) {
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let isRunning = true;

  const baseAspect = 16 / 9;

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const parentW = parent.clientWidth || 800;
    const parentH = parent.clientHeight || 500;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(parentW * dpr);
    canvas.height = Math.floor(parentH * dpr);
    canvas.style.width = parentW + 'px';
    canvas.style.height = parentH + 'px';
  }

  resize();
  window.addEventListener('resize', resize);

  let orbitAngle = 0;
  let lastTime = performance.now();
  let motionTrail = [];

  function render() {
    if (!isRunning) return;

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    const dpr = window.devicePixelRatio || 1;
    const parentW = canvas.width / dpr;
    const parentH = canvas.height / dpr;

    let renderW = parentW;
    let renderH = parentW / baseAspect;
    if (renderH > parentH) {
      renderH = parentH;
      renderW = parentH * baseAspect;
    }
    const offsetX = (parentW - renderW) / 2;
    const offsetY = (parentH - renderH) / 2;

    ctx.save();
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, parentW, parentH);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.beginPath();
    ctx.rect(0, 0, renderW, renderH);
    ctx.clip();

    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, renderW, renderH);

    // Leitura reativa dos parâmetros
    const pL = getParam('L');
    const pM = getParam('m');
    const pMu = getParam('mu');
    const pGM = getParam('GM');
    const pk = getParam('k');
    const pK = getParam('K');
    const pE = getParam('E');

    const sysType = ${JSON.stringify(system_class)};
    const L_val = typeof pL === 'number' && pL > 0 ? pL : ${L};
    const mu_val = sysType === 'harmonic_oscillator'
      ? (typeof pM === 'number' && pM > 0 ? pM : (typeof pMu === 'number' && pMu > 0 ? pMu : ${mu}))
      : (typeof pMu === 'number' && pMu > 0 ? pMu : (typeof pM === 'number' && pM > 0 ? pM : ${mu}));
    const GM_val = typeof pGM === 'number' && pGM > 0 ? pGM : ${GM};
    const k_val = typeof pk === 'number' && pk > 0 ? pk : (typeof pK === 'number' && pK > 0 ? pK : ${kVal});
    const E_val = typeof pE === 'number' ? pE : ${E};

    let V_eff_min = 0;
    let r_min = 1.0;

    if (sysType === 'harmonic_oscillator') {
      const omega = Math.sqrt(Math.max(0.01, k_val) / Math.max(0.01, mu_val));
      V_eff_min = omega * L_val;
      r_min = Math.pow((L_val * L_val) / (Math.max(0.01, mu_val) * Math.max(0.01, k_val)), 0.25);
    } else if (sysType === 'coulomb') {
      V_eff_min = - (mu_val * k_val * k_val) / (2.0 * Math.max(0.01, L_val * L_val));
      r_min = (L_val * L_val) / (Math.max(0.01, mu_val) * Math.max(0.01, k_val));
    } else {
      V_eff_min = - (GM_val * GM_val * Math.pow(mu_val, 3)) / (2.0 * Math.max(0.01, L_val * L_val));
      r_min = (L_val * L_val) / (Math.max(0.01, GM_val * mu_val * mu_val));
    }

    const deltaE = E_val - V_eff_min;
    const isViolated = deltaE < -1e-5;
    const isSymPyConfirmed = ${isSymPyVerified ? 'true' : 'false'};

    if (recordMetric) {
      recordMetric('Origem dos Dados', isSymPyConfirmed ? 'Verificador SymPy (Confirmado Formalmente)' : 'Estimativa não auditada formalmente');
      recordMetric('Energia Declarada E', E_val.toFixed(3) + ' J');
      recordMetric('V_eff,mín Calculado', V_eff_min.toFixed(3) + ' J');
      recordMetric('Déficit Energético ΔE', deltaE.toFixed(3) + ' J');
      recordMetric('Status Físico', isViolated ? 'CONTRADIÇÃO (E < V_eff,mín)' : 'CONDIÇÃO VIÁVEL (E ≥ V_eff,mín)');
      if (!isViolated) {
        const isCirc = Math.abs(deltaE) < 0.005;
        recordMetric('Regime Dinâmico', isCirc ? 'Trajetória Circular Estável' : (sysType === 'harmonic_oscillator' ? 'Trajetória Elíptica Oscilatória' : 'Órbita Elíptica Fechada'));
        recordMetric('Raio Mínimo r_mín', r_min.toFixed(2) + ' m');
      }
    }

    // =========================================================================
    // CASO 1: SIMULAÇÃO BLOQUEADA (PARÂMETROS FISICAMENTE INVÁLIDOS)
    // =========================================================================
    if (isViolated) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 13px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const blockedMsg = 'Simulação bloqueada — parâmetros fisicamente inválidos. Veja o painel de auditoria para detalhes.';
      if (renderW < 680) {
        ctx.fillText('Simulação bloqueada — parâmetros fisicamente inválidos.', renderW / 2, renderH / 2 - 11);
        ctx.fillText('Veja o painel de auditoria para detalhes.', renderW / 2, renderH / 2 + 11);
      } else {
        ctx.fillText(blockedMsg, renderW / 2, renderH / 2);
      }
      ctx.restore();
    }
    // =========================================================================
    // CASO 2: CONDIÇÃO VIÁVEL (E ≥ V_eff,mín)
    // =========================================================================
    else {
      renderTrajectoryAnimation(renderW, renderH, dt, L_val, mu_val, GM_val, k_val, E_val, V_eff_min, r_min, deltaE, sysType);
    }

    ctx.restore();
    ctx.restore();

    animationId = requestAnimationFrame(render);
  }

  function renderTrajectoryAnimation(renderW, renderH, dt, L_val, mu_val, GM_val, k_val, E_val, V_eff_min, r_min, deltaE, sysType) {
    let isCircular = Math.abs(deltaE) < 0.005;
    ctx.save();
    // Cabeçalho superior
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 13px Inter, sans-serif';
    const regimeTitle = isCircular
      ? (sysType === 'harmonic_oscillator' ? 'Oscilador 2D: Trajetória Circular Isócrona' : 'Órbita Circular Estável')
      : (sysType === 'harmonic_oscillator' ? 'Oscilador 2D: Trajetória Elíptica Oscilatória' : 'Órbita Elíptica Fechada');
    ctx.fillText(regimeTitle, 20, 28);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 11px Inter, sans-serif';
    const subStr = sysType === 'harmonic_oscillator'
      ? ('L = ' + L_val.toFixed(2) + ' kg·m²/s | m = ' + mu_val.toFixed(2) + ' kg | k = ' + k_val.toFixed(2) + ' N/m | E = ' + E_val.toFixed(3) + ' J')
      : (sysType === 'coulomb'
          ? ('L = ' + L_val.toFixed(2) + ' kg·m²/s | μ = ' + mu_val.toFixed(2) + ' kg | K = ' + k_val.toFixed(2) + ' N·m² | E = ' + E_val.toFixed(3) + ' J')
          : ('L = ' + L_val.toFixed(2) + ' kg·m²/s | μ = ' + mu_val.toFixed(2) + ' kg | GM = ' + GM_val.toFixed(2) + ' m³/s² | E = ' + E_val.toFixed(3) + ' J'));
    ctx.fillText(subStr, 20, 46);
    ctx.restore();

    // Posição central
    const centerX = renderW * 0.44;
    const centerY = renderH * 0.52;

    let currentRadius = r_min;
    let dTheta = 0;
    let vMag = 0;

    if (sysType === 'harmonic_oscillator') {
      const omega = Math.sqrt(Math.max(0.01, k_val) / Math.max(0.01, mu_val));
      const radTerm = Math.max(0, E_val * E_val - Math.pow(omega * L_val, 2));
      const r_peri = Math.sqrt(Math.max(0.01, (E_val - Math.sqrt(radTerm)) / Math.max(0.01, k_val)));
      const r_apo = Math.sqrt(Math.max(0.01, (E_val + Math.sqrt(radTerm)) / Math.max(0.01, k_val)));

      if (isCircular) {
        currentRadius = r_min;
      } else {
        const midR2 = (r_peri * r_peri + r_apo * r_apo) / 2.0;
        const ampR2 = (r_apo * r_apo - r_peri * r_peri) / 2.0;
        currentRadius = Math.sqrt(Math.max(0.01, midR2 + ampR2 * Math.cos(2 * orbitAngle)));
      }

      dTheta = (L_val / (Math.max(0.01, mu_val) * Math.max(0.05, currentRadius * currentRadius))) * dt * 1.0;
      orbitAngle += dTheta;
      vMag = Math.sqrt(Math.max(0, (2.0 / Math.max(0.01, mu_val)) * (E_val - 0.5 * k_val * currentRadius * currentRadius)));
    } else {
      const eTerm = 1.0 + (2.0 * E_val * L_val * L_val) / (mu_val * (sysType === 'coulomb' ? k_val * k_val : GM_val * GM_val));
      const eccentricity = eTerm > 0 ? Math.sqrt(Math.max(0, eTerm)) : 0;
      isCircular = Math.abs(deltaE) < 0.005 || eccentricity < 0.005;
      const p = r_min;
      currentRadius = isCircular ? r_min : (p / (1.0 + Math.min(eccentricity, 0.95) * Math.cos(orbitAngle)));

      dTheta = (L_val / (mu_val * Math.max(0.1, currentRadius * currentRadius))) * dt * 1.2;
      orbitAngle += dTheta;
      const kConst = sysType === 'coulomb' ? k_val : (GM_val * mu_val);
      vMag = Math.sqrt(Math.max(0, (2.0 / mu_val) * (E_val + kConst / currentRadius)));
    }

    const scale = Math.min(renderW * 0.36, renderH * 0.36) / Math.max(r_min * 1.8, 0.6);
    const bodyX = centerX + currentRadius * Math.cos(orbitAngle) * scale;
    const bodyY = centerY - currentRadius * Math.sin(orbitAngle) * scale;

    motionTrail.push({ x: bodyX, y: bodyY });
    if (motionTrail.length > 70) motionTrail.shift();

    // Trajetória teórica esperada
    ctx.save();
    ctx.strokeStyle = isCircular ? 'rgba(56, 189, 248, 0.45)' : 'rgba(52, 211, 153, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    if (isCircular) {
      ctx.arc(centerX, centerY, r_min * scale, 0, Math.PI * 2);
    } else {
      let first = true;
      for (let a = 0; a <= Math.PI * 2; a += 0.04) {
        let rA = r_min;
        if (sysType === 'harmonic_oscillator') {
          const omega = Math.sqrt(k_val / mu_val);
          const radTerm = Math.max(0, E_val * E_val - Math.pow(omega * L_val, 2));
          const r_peri = Math.sqrt(Math.max(0.01, (E_val - Math.sqrt(radTerm)) / k_val));
          const r_apo = Math.sqrt(Math.max(0.01, (E_val + Math.sqrt(radTerm)) / k_val));
          rA = Math.sqrt((r_peri * r_peri + r_apo * r_apo) / 2.0 + ((r_apo * r_apo - r_peri * r_peri) / 2.0) * Math.cos(2 * a));
        } else {
          const eTerm = 1.0 + (2.0 * E_val * L_val * L_val) / (mu_val * (sysType === 'coulomb' ? k_val * k_val : GM_val * GM_val));
          const ecc = eTerm > 0 ? Math.sqrt(Math.max(0, eTerm)) : 0;
          rA = r_min / (1.0 + Math.min(ecc, 0.95) * Math.cos(a));
        }
        const px = centerX + rA * Math.cos(a) * scale;
        const py = centerY - rA * Math.sin(a) * scale;
        if (first) { ctx.moveTo(px, py); first = false; }
        else { ctx.lineTo(px, py); }
      }
      ctx.closePath();
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Rastro de movimento
    ctx.save();
    for (let i = 0; i < motionTrail.length - 1; i++) {
      const alpha = (i / motionTrail.length) * 0.6;
      ctx.strokeStyle = isCircular ? ('rgba(56, 189, 248, ' + alpha + ')') : ('rgba(52, 211, 153, ' + alpha + ')');
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(motionTrail[i].x, motionTrail[i].y);
      ctx.lineTo(motionTrail[i + 1].x, motionTrail[i + 1].y);
      ctx.stroke();
    }
    ctx.restore();

    // Vetor raio r(t)
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(bodyX, bodyY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Centro de atração / equilíbrio
    ctx.save();
    if (sysType === 'harmonic_oscillator') {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.lineWidth = 1;
      for (let cr = 10; cr <= 30; cr += 10) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, cr, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = '#818cf8';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c7d2fe';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#c7d2fe';
      ctx.font = 'bold 9.5px Inter, sans-serif';
      ctx.fillText('Origem k = ' + k_val.toFixed(1) + ' N/m', centerX - 32, centerY + 20);
    } else {
      const sunGlow = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 28);
      sunGlow.addColorStop(0, '#ffffff');
      sunGlow.addColorStop(0.2, '#fef08a');
      sunGlow.addColorStop(0.5, '#f59e0b');
      sunGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 9.5px Inter, sans-serif';
      const cLabel = sysType === 'coulomb' ? ('Q (K = ' + k_val.toFixed(1) + ')') : ('M (GM = ' + GM_val.toFixed(1) + ')');
      ctx.fillText(cLabel, centerX - 26, centerY + 22);
    }
    ctx.restore();

    // Partícula em movimento
    ctx.save();
    const bodyGlow = ctx.createRadialGradient(bodyX, bodyY, 1, bodyX, bodyY, 16);
    bodyGlow.addColorStop(0, '#ffffff');
    bodyGlow.addColorStop(0.4, isCircular ? '#38bdf8' : '#34d399');
    bodyGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = bodyGlow;
    ctx.beginPath();
    ctx.arc(bodyX, bodyY, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isCircular ? '#0284c7' : '#059669';
    ctx.beginPath();
    ctx.arc(bodyX, bodyY, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Vetor velocidade
    const vDirX = -Math.sin(orbitAngle);
    const vDirY = -Math.cos(orbitAngle);
    const vLen = 28;
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bodyX, bodyY);
    ctx.lineTo(bodyX + vDirX * vLen, bodyY + vDirY * vLen);
    ctx.stroke();
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(bodyX + vDirX * vLen, bodyY + vDirY * vLen, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillText('m = ' + mu_val.toFixed(1) + ' kg', bodyX + 9, bodyY - 7);
    ctx.restore();

    // Telemetria HUD à direita
    const hudW = Math.min(230, renderW * 0.28);
    const hudX = renderW - hudW - 20;
    const hudY = 20;
    const hudH = renderH - hudY - 20;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.fillRect(hudX, hudY, hudW, hudH);
    ctx.strokeRect(hudX, hudY, hudW, hudH);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('Telemetria em Tempo Real', hudX + 12, hudY + 20);

    let cy = hudY + 36;
    const itemH = 34;

    function drawHudMetric(label, val, col) {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.fillRect(hudX + 8, cy, hudW - 16, itemH);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(hudX + 8, cy, hudW - 16, itemH);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText(label, hudX + 14, cy + 13);

      ctx.fillStyle = col || '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(val, hudX + 14, cy + 27);
      cy += itemH + 6;
    }

    drawHudMetric('Regime Físico:', isCircular ? 'Trajetória Circular Isócrona' : 'Trajetória Elíptica Fechada', '#34d399');
    drawHudMetric('Raio Atual r(t):', currentRadius.toFixed(2) + ' m (r_mín = ' + r_min.toFixed(2) + ' m)', '#38bdf8');
    drawHudMetric('Velocidade v(t):', vMag.toFixed(2) + ' m/s', '#67e8f9');
    drawHudMetric('Energia Mecânica Total E:', E_val.toFixed(3) + ' J (ΔE = +' + deltaE.toFixed(3) + ' J)', '#fbbf24');
    drawHudMetric('Momento Angular L:', L_val.toFixed(2) + ' kg·m²/s (Constante)', '#a78bfa');

    const boxH = hudH - (cy - hudY) - 10;
    if (boxH > 24) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.fillRect(hudX + 8, cy, hudW - 16, boxH);
      ctx.strokeRect(hudX + 8, cy, hudW - 16, boxH);

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('✓ CONDIÇÃO VIÁVEL', hudX + 14, cy + 15);
      ctx.fillStyle = '#a7f3d0';
      ctx.font = '400 8.5px Inter, sans-serif';
      ctx.fillText('E ≥ V_eff,mín garantido (' + ${JSON.stringify(kinetic_radial_formula)} + ' ≥ 0).', hudX + 14, cy + 27);
    }
    ctx.restore();
  }

  animationId = requestAnimationFrame(render);

  return function cleanup() {
    isRunning = false;
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
  };
};`;

  return { scientific_spec, storyboard, executable_code };
}

export const createKeplerSimulation = createCentralPotentialSimulation;
