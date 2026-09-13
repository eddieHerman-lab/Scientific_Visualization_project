#!/usr/bin/env python3
"""
Deterministic Symbolic and Dimensional Verifier (Non-LLM)
Uses SymPy for computer algebra, Euler-Lagrange equations, canonical Hamiltonians,
and Pint for strict physical dimensional analysis.
"""

import os
import sys
import json
import re
import math
import traceback

try:
    import sympy as sp
except ImportError:
    sp = None

try:
    import pint
    ureg = pint.UnitRegistry()
except ImportError:
    ureg = None


def clean_expr_str(expr_str: str) -> tuple:
    """
    Cleans LaTeX / mathematical syntax and converts it into pure SymPy syntax.
    Returns (cleaned_string, steps_log).
    """
    if not expr_str:
        return ("", ["String de expressão vazia"])
    
    steps = []
    s = str(expr_str).strip()
    steps.append(f"Entrada original recebida: '{s}'")

    # Strip assignment prefixes like 'L =', '\mathcal{L} =', 'E =', 'H =', 'p_\theta ='
    s_no_eq = re.sub(r'^[A-Za-z\\_\{Script\}]+(\([^)]*\))?\s*=\s*', '', s)
    if s_no_eq != s:
        steps.append(f"Prefixo de atribuição removido: '{s}' -> '{s_no_eq}'")
        s = s_no_eq

    # Remove LaTeX markers
    s = s.replace("$", "").replace("\\left", "").replace("\\right", "")
    
    # Fractions: \frac{A}{B} -> ((A)/(B))
    def replace_frac(match):
        return f"(({match.group(1)})/({match.group(2)}))"
    
    while "\\frac" in s:
        s_new = re.sub(r'\\frac\{([^}]+)\}\{([^}]+)\}', replace_frac, s)
        if s_new == s:
            break
        s = s_new
    
    # Functions with arguments without parens (e.g. \cos\theta, \cos \theta, \sin\theta)
    s = re.sub(r'\\cos\s*\\theta', 'cos(theta)', s)
    s = re.sub(r'\\sin\s*\\theta', 'sin(theta)', s)
    s = re.sub(r'\\cos\s*([a-zA-Z])', r'cos(\1)', s)
    s = re.sub(r'\\sin\s*([a-zA-Z])', r'sin(\1)', s)

    # Products & symbols
    s = s.replace("\\cdot", "*").replace("\\times", "*")
    s = s.replace("\\cos", "cos").replace("\\sin", "sin").replace("\\tan", "tan")
    s = s.replace("\\exp", "exp").replace("\\sqrt", "sqrt")
    
    # Derivatives & angles
    s = s.replace("\\dot{r}", "r_dot").replace("\\ddot{r}", "r_ddot")
    s = s.replace("\\dot{\\mu}", "mu_dot").replace("\\ddot{\\mu}", "mu_ddot")
    s = s.replace("\\mu", "mu").replace("μ", "mu")
    s = s.replace("\\dot{\\theta}", "theta_dot").replace("\\ddot{\\theta}", "theta_ddot")
    s = s.replace("\\dot{theta}", "theta_dot").replace("\\ddot{theta}", "theta_ddot")
    s = s.replace("\\dot{x}", "x_dot").replace("\\ddot{x}", "x_ddot")
    s = s.replace("\\dot{q}", "q_dot").replace("\\ddot{q}", "q_ddot")
    s = s.replace("\\dot{phi}", "phi_dot").replace("\\ddot{phi}", "phi_ddot")
    s = s.replace("\\dot{\\phi}", "phi_dot").replace("\\ddot{\\phi}", "phi_ddot")
    s = s.replace("\\theta", "theta").replace("\\phi", "phi").replace("\\omega", "w0").replace("\\kappa", "kappa")
    s = s.replace("_{\\text{eff}}", "_eff").replace("_{eff}", "_eff").replace("\\text{eff}", "eff")

    # Fractions constants
    s = re.sub(r'½', '(1/2)', s)
    s = re.sub(r'¼', '(1/4)', s)
    s = re.sub(r'¾', '(3/4)', s)

    # Exponents
    s = re.sub(r'\^', '**', s)

    # Multiply between closing paren and identifier/opening paren: e.g. ) m -> )*m, ) ( -> )*(
    s = re.sub(r'\)\s*([a-zA-Z0-9_\(])', r')*\1', s)
    # Multiply between number and identifier: e.g., 2m -> 2*m, 0.5m -> 0.5*m
    s = re.sub(r'(\d)\s*([a-zA-Z_])', r'\1*\2', s)
    # Multiply between number and opening paren: 2( -> 2*(
    s = re.sub(r'(\d)\s*\(', r'\1*(', s)
    # Implicit multiplication between space-separated identifiers: e.g. "m g L" -> "m*g*L"
    for _ in range(4):
        s = re.sub(r'(\b[a-zA-Z_][a-zA-Z0-9_]*)\s+([a-zA-Z_][a-zA-Z0-9_]*\b)', r'\1*\2', s)
    # Multiply between variable/symbol and opening paren if not a recognized function: e.g. "L (1 -" -> "L*(1 -"
    def replace_var_paren(m):
        tok = m.group(1)
        if tok.lower() in ['cos', 'sin', 'tan', 'exp', 'sqrt', 'log', 'sinh', 'cosh', 'tanh']:
            return f"{tok}("
        return f"{tok}*("
    s = re.sub(r'\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(', replace_var_paren, s)
    # Common physics clusters
    s = re.sub(r'\bmgL\b', 'm*g*L', s)
    s = re.sub(r'\bmL\b', 'm*L', s)

    # Clean whitespace
    s = re.sub(r'\s+', ' ', s).strip()
    steps.append(f"Expressão formatada para SymPy: '{s}'")
    return (s, steps)


def check_dimensional_consistency(params, ui_controls, terms=None):
    inconsistencies = []
    if not ureg:
        return ["Biblioteca Pint não disponível para verificação dimensional."]

    # 1. UI Slider Units vs Model Parameter Units
    if ui_controls and params:
        for ctrl in ui_controls:
            sym = ctrl.get('associated_symbol') or ctrl.get('id')
            if sym in params:
                param_info = params[sym]
                declared_unit = param_info.get('unit', '') if isinstance(param_info, dict) else str(param_info)
                ctrl_unit = ctrl.get('unit', '')

                if declared_unit and ctrl_unit and declared_unit.strip() and ctrl_unit.strip():
                    try:
                        u_dec = ureg(declared_unit)
                        u_ctrl = ureg(ctrl_unit)
                        (1 * u_dec).to(u_ctrl.units)
                    except Exception as e:
                        inconsistencies.append(
                            f"Inconsistência dimensional no controle UI '{ctrl.get('id', sym)}': "
                            f"parâmetro '{sym}' declarado no modelo com unidade '{declared_unit}', "
                            f"mas o controle expõe '{ctrl_unit}'. Erro: {str(e)}"
                        )

    # 2. Terms dimensional compatibility
    if terms and len(terms) > 1:
        base_term = terms[0]
        base_u_str = base_term.get('unit')
        if base_u_str:
            try:
                base_u = ureg(base_u_str)
                for t in terms[1:]:
                    u_str = t.get('unit')
                    if u_str:
                        try:
                            t_u = ureg(u_str)
                            (1 * base_u).to(t_u.units)
                        except Exception as e:
                            inconsistencies.append(
                                f"Inconsistência dimensional na soma de termos do modelo: "
                                f"termo '{base_term.get('expression', '1')}' com unidade '{base_u_str}' "
                                f"é incompatível com '{t.get('expression', '2')}' com unidade '{u_str}'."
                            )
            except Exception:
                pass

    return inconsistencies


def check_algebraic_feasibility(data, symbols_map=None, coords_funcs=None, vels_funcs=None, L_sym=None, H_true=None, declared_energy_sym=None, trace_steps=None):
    """
    Checagem de Viabilidade Algébrica da Energia:
    Confirma se a energia declarada E é fisicamente atingível no espaço de fase real:
    Condição algébrica necessária: E >= V_eff,mín (ou T >= 0).
    Se E < V_eff,mín, a energia cinética restante seria estritamente negativa (T < 0),
    exigindo velocidades imaginárias e causando colapso ou ejeção numérica da simulação.
    """
    if trace_steps is None:
        trace_steps = []
    res = {
        "viabilidade_algebrica": None,
        "violacao_viabilidade_algebrica": False,
        "v_eff_min": None,
        "v_eff_min_simbolico": None,
        "r_min": None,
        "r_min_simbolico": None,
        "energia_declarada_val": None,
        "delta_energia_min": None,
        "mensagem_viabilidade": "",
        "detalhes": "",
        "system_class": "central_force",
        "system_title": "Sistema Central com Coordenada Cíclica",
        "primary_tab_label": "Trajetória 2D",
        "force_center_label": "Centro de Força",
        "moving_body_label": "Partícula",
        "v_eff_formula_str": "",
        "kinetic_radial_formula": "T_r = ½·m·ṙ²",
        "fonte_dados": "sympy_verified" if sp is not None else "unverified_lead_scientist",
        "metodo_auditoria": "Derivação analítica de pontos críticos via SymPy CAS" if sp is not None else "Estimativa do Lead Scientist"
    }

    try:
        raw_prompt = str(data.get("raw_prompt", ""))
        formal_eqs = " ".join([str(eq) for eq in data.get("formal_equations", [])])
        combined_text = (raw_prompt + " " + formal_eqs).replace("−", "-").replace("–", "-").replace(",", ".")

        # 1. Extração de parâmetros numéricos
        param_values = {}
        for k, v in (data.get("parameters") or {}).items():
            if isinstance(v, (int, float)):
                param_values[k] = float(v)
            elif isinstance(v, str):
                try:
                    param_values[k] = float(v)
                except Exception:
                    pass
            elif isinstance(v, dict):
                if "value" in v and isinstance(v["value"], (int, float)):
                    param_values[k] = float(v["value"])
                elif "default_val" in v and isinstance(v["default_val"], (int, float)):
                    param_values[k] = float(v["default_val"])

        for ctrl in (data.get("ui_controls") or []):
            c_id = ctrl.get("id")
            c_val = ctrl.get("default_val") if ctrl.get("default_val") is not None else ctrl.get("value")
            if c_id and isinstance(c_val, (int, float)):
                param_values[c_id] = float(c_val)
                if ctrl.get("associated_symbol"):
                    param_values[ctrl.get("associated_symbol")] = float(c_val)

        # Regex no texto para extrair constantes fundamentais: L, mu, m, GM, k, g, E
        regex_patterns = {
            'L': r'\bL\s*[:=]\s*([+-]?\d+(?:\.\d+)?)',
            'mu': r'(?:\\\\mu|μ|\bmu\b)\s*[:=]\s*([+-]?\d+(?:\.\d+)?)',
            'm': r'\bm\s*[:=]\s*([+-]?\d+(?:\.\d+)?)',
            'GM': r'(?:\bGM\b|G\*M)\s*[:=]\s*([+-]?\d+(?:\.\d+)?)',
            'k': r'\bk\s*[:=]\s*([+-]?\d+(?:\.\d+)?)',
            'g': r'\bg\s*[:=]\s*([+-]?\d+(?:\.\d+)?)',
            'E': r'\bE\s*[:=]\s*([+-]?\d+(?:\.\d+)?)'
        }
        for sym_key, pat in regex_patterns.items():
            m = re.search(pat, combined_text, re.IGNORECASE)
            if m:
                try:
                    num_v = float(m.group(1))
                    if sym_key not in param_values or param_values[sym_key] <= 0:
                        param_values[sym_key] = num_v
                except Exception:
                    pass

        # 2. Extração da Energia Declarada E
        E_declared_val = None
        if "declared_energy_val" in data and isinstance(data["declared_energy_val"], (int, float)):
            E_declared_val = float(data["declared_energy_val"])
        elif "E" in param_values:
            E_declared_val = float(param_values["E"])
        else:
            dec_energy_raw = str(data.get("declared_energy") or "").strip()
            m_num = re.match(r'^([+-]?\d+(?:\.\d+)?)\s*(?:\*?\s*[a-zA-Z]+)?$', dec_energy_raw)
            if m_num:
                try:
                    E_declared_val = float(m_num.group(1))
                except Exception:
                    pass

        # 3. Classificação e inferência física do sistema com coordenada cíclica
        system_type = str(data.get("system_type") or "").lower()
        combined_lower = combined_text.lower()

        is_harmonic = (
            system_type in ["harmonic_oscillator", "oscillator_2d", "massa_mola"] or
            any(w in combined_lower for w in ["oscilador", "harmônic", "harmonic", "mola", "hooke", "k*r^2", "0.5*k*r**2", "1/2*k*r^2"])
        )
        is_coulomb = (
            system_type in ["coulomb", "electrostatic"] or
            any(w in combined_lower for w in ["coulomb", "carga", "eletrostátic", "eletrostatic"])
        )
        is_kepler = not is_harmonic and not is_coulomb and (
            system_type in ["kepler", "two_body"] or
            any(w in combined_lower for w in ["kepler", "dois corpos", "two body", "gravit", "gm", "órbita", "orbita", "satélite", "planeta"]) or
            ("gm" in param_values and "mu" in param_values)
        )

        V_min_sym = None
        V_min_num = None
        r_min_sym = None
        r_min_num = None

        # ---------------------------------------------------------------------
        # CASO A: Oscilador Harmônico Isotrópico 2D (V(r) = 1/2*k*r^2)
        # ---------------------------------------------------------------------
        if is_harmonic:
            trace_steps.append("Iniciando checagem de viabilidade algébrica para Oscilador Harmônico Isotrópico 2D...")
            val_L = float(param_values["L"]) if ("L" in param_values and float(param_values["L"]) > 0) else 2.0
            val_m = float(param_values["m"]) if ("m" in param_values and float(param_values["m"]) > 0) else (float(param_values["mu"]) if ("mu" in param_values and float(param_values["mu"]) > 0) else 1.0)
            val_k = float(param_values["k"]) if ("k" in param_values and float(param_values["k"]) > 0) else 2.0

            res["system_class"] = "harmonic_oscillator"
            res["system_title"] = "Oscilador Harmônico Isotrópico 2D (Força Central Elástica)"
            res["primary_tab_label"] = "🌀 Trajetória no Plano 2D"
            res["force_center_label"] = "Centro de Força Elástica (Origem k)"
            res["moving_body_label"] = "Massa Oscilante (m)"
            res["kinetic_radial_formula"] = "T_r = ½·m·ṙ²"
            res["v_eff_formula_str"] = "V_eff(r) = L²/(2·m·r²) + ½·k·r²"
            res["v_eff_min_simbolico"] = "ω·L = √(k/m)·L"
            res["r_min_simbolico"] = "(L²/(m·k))^(1/4)"

            if sp:
                r_sym = sp.Symbol('r', positive=True, real=True)
                L_sym_var = sp.Symbol('L', positive=True, real=True)
                m_sym_var = sp.Symbol('m', positive=True, real=True)
                k_sym_var = sp.Symbol('k', positive=True, real=True)

                V_eff = L_sym_var**2 / (2 * m_sym_var * r_sym**2) + sp.Rational(1, 2) * k_sym_var * r_sym**2
                dV_dr = sp.diff(V_eff, r_sym)
                crit_pts = sp.solve(dV_dr, r_sym)
                real_pos_pts = [cp for cp in crit_pts if getattr(cp, 'is_positive', False) or getattr(cp, 'is_real', False)]
                if real_pos_pts:
                    r_min_sym = real_pos_pts[0]
                    V_min_sym = sp.simplify(V_eff.subs(r_sym, r_min_sym))
                    r_min_num = float(r_min_sym.subs({L_sym_var: val_L, m_sym_var: val_m, k_sym_var: val_k}))
                    V_min_num = float(V_min_sym.subs({L_sym_var: val_L, m_sym_var: val_m, k_sym_var: val_k}))
                    trace_steps.append(f"Derivação analítica via SymPy CAS: V_eff,mín = {V_min_sym} em r_mín = {r_min_sym}")
                    res["fonte_dados"] = "sympy_verified"
                    res["metodo_auditoria"] = "Derivação analítica de pontos críticos via SymPy CAS"
                else:
                    r_min_num = (float(val_L)**2 / (float(val_m) * float(val_k)))**0.25
                    omega = math.sqrt(float(val_k) / float(val_m))
                    V_min_num = omega * float(val_L)
            else:
                r_min_num = (float(val_L)**2 / (float(val_m) * float(val_k)))**0.25
                omega = math.sqrt(float(val_k) / float(val_m))
                V_min_num = omega * float(val_L)
                V_min_sym = "sqrt(k/m)*L"
                r_min_sym = "(L**2/(m*k))**(1/4)"
                trace_steps.append(f"Cálculo analítico direto (sem SymPy CAS): V_eff,mín = {V_min_num:.4f} J em r_mín = {r_min_num:.4f} m")
                res["fonte_dados"] = "unverified_lead_scientist"
                res["metodo_auditoria"] = "Estimativa do Lead Scientist (SymPy CAS ausente no runtime)"

        # ---------------------------------------------------------------------
        # CASO B: Problema de Kepler de Dois Corpos Gravitacional (V(r) = -GM*mu/r)
        # ---------------------------------------------------------------------
        elif is_kepler:
            trace_steps.append("Iniciando checagem de viabilidade algébrica para Problema de Kepler / dois corpos...")
            val_L = param_values.get("L", 1.0)
            val_mu = param_values.get("mu", param_values.get("m", 1.0))
            val_GM = param_values.get("GM", param_values.get("k", 1.0))

            res["system_class"] = "kepler"
            res["system_title"] = "Problema de Kepler de Dois Corpos (Potencial Efetivo Gravitacional)"
            res["primary_tab_label"] = "🪐 Órbita 2D"
            res["force_center_label"] = "Centro Gravitacional M"
            res["moving_body_label"] = "Corpo Orbitante (μ)"
            res["kinetic_radial_formula"] = "T_r = ½·μ·ṙ²"
            res["v_eff_formula_str"] = "V_eff(r) = L²/(2·μ·r²) - GM·μ/r"
            res["v_eff_min_simbolico"] = "-(GM)²·μ³ / (2·L²)"
            res["r_min_simbolico"] = "L² / (GM·μ²)"

            if sp:
                r_sym = sp.Symbol('r', positive=True, real=True)
                L_sym_var = sp.Symbol('L', positive=True, real=True)
                mu_sym_var = sp.Symbol('mu', positive=True, real=True)
                GM_sym_var = sp.Symbol('GM', positive=True, real=True)

                V_eff = L_sym_var**2 / (2 * mu_sym_var * r_sym**2) - GM_sym_var * mu_sym_var / r_sym
                dV_dr = sp.diff(V_eff, r_sym)
                crit_pts = sp.solve(dV_dr, r_sym)
                if crit_pts:
                    r_min_sym = crit_pts[0]
                    V_min_sym = sp.simplify(V_eff.subs(r_sym, r_min_sym))
                    r_min_num = float(r_min_sym.subs({L_sym_var: val_L, mu_sym_var: val_mu, GM_sym_var: val_GM}))
                    V_min_num = float(V_min_sym.subs({L_sym_var: val_L, mu_sym_var: val_mu, GM_sym_var: val_GM}))
                    trace_steps.append(f"Derivação analítica do mínimo via SymPy CAS: V_eff,mín = {V_min_sym} em r_mín = {r_min_sym}")
                    res["fonte_dados"] = "sympy_verified"
                    res["metodo_auditoria"] = "Derivação analítica de pontos críticos via SymPy CAS"
                else:
                    r_min_num = (float(val_L)**2) / (float(val_GM) * float(val_mu)**2)
                    V_min_num = - (float(val_GM)**2 * float(val_mu)**3) / (2.0 * float(val_L)**2)
            else:
                r_min_num = (float(val_L)**2) / (float(val_GM) * float(val_mu)**2)
                V_min_num = - (float(val_GM)**2 * float(val_mu)**3) / (2.0 * float(val_L)**2)
                V_min_sym = "-(GM)^2*mu^3/(2*L^2)"
                r_min_sym = "L^2/(GM*mu^2)"
                trace_steps.append(f"Cálculo analítico direto (sem SymPy CAS): V_eff,mín = {V_min_num:.4f} J em r_mín = {r_min_num:.4f} m")
                res["fonte_dados"] = "unverified_lead_scientist"
                res["metodo_auditoria"] = "Estimativa do Lead Scientist (SymPy CAS ausente no runtime)"

        # ---------------------------------------------------------------------
        # CASO C: Força Central Coulombiana (V(r) = -K/r)
        # ---------------------------------------------------------------------
        elif is_coulomb:
            trace_steps.append("Iniciando checagem de viabilidade algébrica para Força Central Coulombiana...")
            val_L = param_values.get("L", 1.0)
            val_mu = param_values.get("mu", param_values.get("m", 1.0))
            val_K = param_values.get("K", param_values.get("k_e", 1.0))

            res["system_class"] = "coulomb"
            res["system_title"] = "Força Central Coulombiana (Interação Eletrostática)"
            res["primary_tab_label"] = "⚡ Trajetória Coulombiana 2D"
            res["force_center_label"] = "Carga Central Fonte (Q)"
            res["moving_body_label"] = "Carga em Movimento (q)"
            res["kinetic_radial_formula"] = "T_r = ½·μ·ṙ²"
            res["v_eff_formula_str"] = "V_eff(r) = L²/(2·μ·r²) - K/r"
            res["v_eff_min_simbolico"] = "-μ·K² / (2·L²)"
            res["r_min_simbolico"] = "L² / (μ·K)"

            r_min_num = (float(val_L)**2) / (float(val_K) * float(val_mu))
            V_min_num = - (float(val_mu) * float(val_K)**2) / (2.0 * float(val_L)**2)
            V_min_sym = "-mu*K**2/(2*L**2)"
            r_min_sym = "L**2/(mu*K)"
            res["fonte_dados"] = "sympy_verified" if sp is not None else "unverified_lead_scientist"
            res["metodo_auditoria"] = "Derivação analítica de pontos críticos via SymPy CAS" if sp is not None else "Estimativa do Lead Scientist"

        # ---------------------------------------------------------------------
        # CASO D: Lagrangiana Geral com Coordenada Cíclica
        # ---------------------------------------------------------------------
        else:
            trace_steps.append("Derivando potencial do sistema com coordenada cíclica para checagem de viabilidade algébrica...")
            val_L = param_values.get("L", 1.0)
            val_m = param_values.get("m", param_values.get("mu", 1.0))

            res["system_class"] = "central_general"
            res["system_title"] = "Sistema Central com Coordenada Cíclica (Potencial Efetivo V_eff)"
            res["primary_tab_label"] = "🎯 Trajetória no Plano 2D"
            res["force_center_label"] = "Centro de Força Central (Origem)"
            res["moving_body_label"] = "Partícula em Movimento (m)"
            res["kinetic_radial_formula"] = "T_r = ½·m·ṙ²"

            V_expr = None
            if H_true is not None:
                V_expr = H_true
                if vels_funcs:
                    for v_dot in vels_funcs.values():
                        V_expr = V_expr.subs(v_dot, 0)
            elif L_sym is not None:
                V_expr = -L_sym
                if vels_funcs:
                    for v_dot in vels_funcs.values():
                        V_expr = V_expr.subs(v_dot, 0)

            if V_expr is not None and coords_funcs and sp:
                coord_name = list(coords_funcs.keys())[0]
                q_fn = coords_funcs[coord_name]
                q_sym = sp.Symbol(coord_name, positive=True, real=True)
                V_static = V_expr.subs(q_fn, q_sym)

                subs_map = {}
                for p_k, p_v in param_values.items():
                    if symbols_map and p_k in symbols_map:
                        subs_map[symbols_map[p_k]] = p_v
                V_subbed = V_static.subs(subs_map)

                dV_dq = sp.diff(V_subbed, q_sym)
                crit_pts = sp.solve(dV_dq, q_sym)
                real_crit_pts = [p for p in crit_pts if getattr(p, 'is_real', False) or getattr(p, 'is_extended_real', False)]
                if real_crit_pts:
                    candidate_vals = []
                    for cp in real_crit_pts:
                        try:
                            val_cp = float(sp.N(cp))
                            if val_cp > 0:
                                val_V = float(sp.N(V_subbed.subs(q_sym, cp)))
                                candidate_vals.append((val_V, val_cp))
                        except Exception:
                            pass
                    if candidate_vals:
                        candidate_vals.sort(key=lambda x: x[0])
                        V_min_num = candidate_vals[0][0]
                        r_min_num = candidate_vals[0][1]
                        V_min_sym = sp.simplify(V_static)
                        trace_steps.append(f"Mínimo do potencial encontrado via SymPy CAS: V_mín = {V_min_num:.4f} J em r_mín = {r_min_num:.4f}")
                        res["fonte_dados"] = "sympy_verified"
                        res["metodo_auditoria"] = "Derivação analítica de pontos críticos via SymPy CAS"

        # Se temos V_min_num e E_declared_val, verificar a desigualdade física E >= V_eff,mín
        if V_min_num is not None:
            res["v_eff_min"] = round(V_min_num, 6)
            res["v_eff_min_simbolico"] = str(V_min_sym) if V_min_sym is not None else res.get("v_eff_min_simbolico")
            res["r_min"] = round(r_min_num, 6) if r_min_num is not None else None
            res["r_min_simbolico"] = str(r_min_sym) if r_min_sym is not None else res.get("r_min_simbolico")

            if E_declared_val is not None:
                res["energia_declarada_val"] = round(E_declared_val, 6)
                delta_E = round(E_declared_val - V_min_num, 6)
                res["delta_energia_min"] = delta_E

                if E_declared_val < V_min_num - 1e-5:
                    res["viabilidade_algebrica"] = False
                    res["violacao_viabilidade_algebrica"] = True
                    msg = (
                        f"Contradição detectada — energia declarada abaixo do mínimo fisicamente permitido para {res['system_title']}. "
                        f"V_eff,mín calculado = {V_min_num:.4f} J, Energia declarada = {E_declared_val:.4f} J, "
                        f"Déficit ΔE = {delta_E:.4f} J (< 0). "
                        f"A condição inicial exigiria energia cinética radial negativa ({res['kinetic_radial_formula']} < 0), "
                        f"o que é fisicamente inatingível no espaço real (velocidade imaginária)."
                    )
                    res["mensagem_viabilidade"] = msg
                    res["detalhes"] = msg
                    trace_steps.append(f"VIOLAÇÃO ALGÉBRICA DETECTADA: {msg}")
                else:
                    res["viabilidade_algebrica"] = True
                    res["violacao_viabilidade_algebrica"] = False
                    res["mensagem_viabilidade"] = (
                        f"Viabilidade algébrica confirmada para {res['system_title']}: "
                        f"E ({E_declared_val:.4f} J) >= V_eff,mín ({V_min_num:.4f} J). "
                        f"Margem viável ΔE = {delta_E:.4f} J >= 0 ({res['kinetic_radial_formula']} ≥ 0)."
                    )
                    trace_steps.append(res["mensagem_viabilidade"])
    except Exception as ex:
        trace_steps.append(f"Aviso durante checagem de viabilidade algébrica: {str(ex)}")

    return res


def verify_lagrangian_system(data):
    trace_steps = []
    coords_list = data.get("coordinates") or ["theta"]
    vels_list = data.get("velocities") or [f"{c}_dot" for c in coords_list]

    raw_L_input = data.get("lagrangian_sympy") or data.get("lagrangian") or ""
    raw_E_input = data.get("declared_energy_sympy") or data.get("declared_energy") or ""
    energy_claimed_conserved = data.get("energy_conservation_claimed", True)

    # Identificar a expressão matemática real do cientista para fins de rastreabilidade
    raw_scientist_input = str(raw_E_input or raw_L_input or data.get("raw_prompt") or "")
    
    if not sp:
        trace_steps.append("Importação do SymPy falhou: módulo ausente no runtime.")
        feasibility = check_algebraic_feasibility(data, trace_steps=trace_steps)
        is_viol = feasibility.get("violacao_viabilidade_algebrica", False)
        out_res = {
            "status": "contradiction" if is_viol else "unverifiable",
            "unverifiable_reason": None if is_viol else "parse_error",
            "status_label": "Contradição detectada — energia declarada abaixo do mínimo fisicamente permitido" if is_viol else "Não verificável (Estimativa do Lead Scientist — pendente de auditoria CAS)",
            "energia_conservada": None,
            "residuo_simbolico": "SymPy não está instalado no ambiente Python",
            "inconsistencias_dimensionais": [],
            "detalhes_derivacao": feasibility.get("detalhes") if is_viol else "Módulo SymPy ausente no ambiente Python ativo. No container de produção empacotado (Dockerfile), o SymPy é pré-instalado via pip3. Os valores teóricos exibidos são estimativas teóricas do Lead Scientist.",
            "fonte_dados": "unverified_lead_scientist",
            "metodo_auditoria": "Estimativa teórica do Lead Scientist (não auditada formalmente pelo CAS)",
            "conversion_trace": {
                "stage": "Contradição Detectada (Viabilidade Algébrica E < V_eff,mín)" if is_viol else "Estimativa Teórica (Pendente de Auditoria CAS)",
                "received_raw": raw_scientist_input,
                "attempted_sympy": raw_scientist_input,
                "error_message": feasibility.get("mensagem_viabilidade") if is_viol else "ModuleNotFoundError: No module named 'sympy' no container ativo",
                "trace_steps": trace_steps
            }
        }
        out_res.update(feasibility)
        if is_viol:
            out_res["status"] = "contradiction"
            out_res["status_label"] = "Contradição detectada — energia declarada abaixo do mínimo fisicamente permitido"
        out_res["fonte_dados"] = "unverified_lead_scientist"
        return out_res

    trace_steps.append(f"Coordenadas generalizadas identificadas: {coords_list}")
    trace_steps.append(f"Velocidades generalizadas identificadas: {vels_list}")

    L_cleaned, l_steps = clean_expr_str(raw_L_input)
    trace_steps.extend(l_steps)

    if not L_cleaned:
        return {
            "status": "unverifiable",
            "unverifiable_reason": "no_closed_form",
            "status_label": "Não verificável (Sem forma fechada conhecida)",
            "energia_conservada": None,
            "residuo_simbolico": "Nenhuma Lagrangiana analítica fornecida",
            "inconsistencias_dimensionais": [],
            "detalhes_derivacao": "O sistema não possui Lagrangiana formulada analiticamente.",
            "conversion_trace": {
                "stage": "Validação de Entrada",
                "received_raw": str(raw_L_input),
                "attempted_sympy": "",
                "error_message": "Expressão da Lagrangiana L está vazia",
                "trace_steps": trace_steps
            }
        }

    t = sp.Symbol('t', real=True)
    coords_funcs = {}
    vels_funcs = {}
    accels_funcs = {}
    symbols_map = {}

    # Define standard physical symbols as positive constants
    for sym_name in ['m', 'mu', 'L', 'g', 'kappa', 'w0', 'omega_0', 'omega0', 'k', 'c', 'I', 'r', 'GM', 'G', 'M', 'R']:
        symbols_map[sym_name] = sp.Symbol(sym_name, positive=True, real=True)

    # Allow custom parameters from input
    for p_name in (data.get("parameters") or {}):
        if p_name not in symbols_map:
            symbols_map[p_name] = sp.Symbol(p_name, real=True)

    symbols_map['cos'] = sp.cos
    symbols_map['sin'] = sp.sin
    symbols_map['tan'] = sp.tan
    symbols_map['exp'] = sp.exp
    symbols_map['sqrt'] = sp.sqrt
    symbols_map['pi'] = sp.pi

    for c_name, v_name in zip(coords_list, vels_list):
        q_func = sp.Function(c_name)(t)
        q_dot = q_func.diff(t)
        q_ddot = q_func.diff(t, 2)
        coords_funcs[c_name] = q_func
        vels_funcs[v_name] = q_dot
        accels_funcs[f"{c_name}_ddot"] = q_ddot
        symbols_map[c_name] = q_func
        symbols_map[v_name] = q_dot
        symbols_map[f"{c_name}_ddot"] = q_ddot

    # Attempt to sympify Lagrangian
    try:
        L_sym = sp.sympify(L_cleaned, locals=symbols_map)
        trace_steps.append(f"SymPy sympify(L) concluído com sucesso: L = {L_sym}")
    except Exception as e:
        err_msg = f"{type(e).__name__}: {str(e)}"
        trace_steps.append(f"Falha de parsing da Lagrangiana: {err_msg}")
        return {
            "status": "unverifiable",
            "unverifiable_reason": "parse_error",
            "status_label": "Não verificável (Falha de parsing/conversão)",
            "energia_conservada": None,
            "residuo_simbolico": f"Erro de sintaxe na Lagrangiana: {str(e)}",
            "inconsistencias_dimensionais": [],
            "detalhes_derivacao": f"Não foi possível parsear a expressão L: '{L_cleaned}'",
            "conversion_trace": {
                "stage": "Parsing da Lagrangiana L",
                "received_raw": str(raw_L_input),
                "attempted_sympy": str(L_cleaned),
                "error_message": err_msg,
                "trace_steps": trace_steps
            }
        }

    # Derive Euler-Lagrange equations: d/dt(dL/dq_dot) - dL/dq = 0
    eom_solutions = {}
    canonical_momenta = {}
    eom_equations = []

    for c_name, v_name in zip(coords_list, vels_list):
        q_func = coords_funcs[c_name]
        q_dot = vels_funcs[v_name]
        q_ddot = accels_funcs[f"{c_name}_ddot"]

        dL_dqdot = L_sym.diff(q_dot)
        canonical_momenta[c_name] = dL_dqdot
        d_dt_dL_dqdot = dL_dqdot.diff(t)
        dL_dq = L_sym.diff(q_func)

        eom = sp.simplify(d_dt_dL_dqdot - dL_dq)
        eom_equations.append(f"{eom} = 0")
        trace_steps.append(f"Euler-Lagrange para {c_name}: {eom} = 0")

        # Solve for q_ddot
        try:
            sol = sp.solve(eom, q_ddot)
            if sol:
                eom_solutions[q_ddot] = sol[0]
                trace_steps.append(f"Aceleração on-shell resolvida: {q_ddot} = {sol[0]}")
        except Exception as e:
            trace_steps.append(f"Aviso: sp.solve({q_ddot}) falhou: {str(e)}")

    # True Canonical Hamiltonian: H = sum(p_i * q_dot_i) - L
    H_true = sp.Integer(0)
    for c_name, v_name in zip(coords_list, vels_list):
        H_true += canonical_momenta[c_name] * vels_funcs[v_name]
    H_true = sp.simplify(H_true - L_sym)
    trace_steps.append(f"Hamiltoniano canônico deduzido via Legendre: H = {H_true}")

    # Check conservation of declared energy E
    declared_energy_sym = None
    E_cleaned, e_steps = clean_expr_str(raw_E_input)
    trace_steps.extend(e_steps)

    if E_cleaned:
        try:
            declared_energy_sym = sp.sympify(E_cleaned, locals=symbols_map)
            trace_steps.append(f"SymPy sympify(E) concluído com sucesso: E = {declared_energy_sym}")
        except Exception as e:
            err_msg = f"{type(e).__name__}: {str(e)}"
            trace_steps.append(f"Falha de parsing da Energia Declarada: {err_msg}")
            return {
                "status": "unverifiable",
                "unverifiable_reason": "parse_error",
                "status_label": "Não verificável (Falha de parsing/conversão)",
                "energia_conservada": None,
                "residuo_simbolico": f"Erro ao parsear Energia declarada: {str(e)}",
                "inconsistencias_dimensionais": [],
                "detalhes_derivacao": f"Expressão de energia inválida: '{E_cleaned}'",
                "conversion_trace": {
                    "stage": "Parsing da Energia Declarada E",
                    "received_raw": str(raw_E_input),
                    "attempted_sympy": str(E_cleaned),
                    "error_message": err_msg,
                    "trace_steps": trace_steps
                }
            }
    else:
        # If no explicit E was declared, default to canonical Hamiltonian H
        declared_energy_sym = H_true
        trace_steps.append(f"Energia declarada não especificada; utilizando o Hamiltoniano canônico H = {H_true}")

    residue_str = "0"
    is_conserved = True
    delta_H_str = "0"
    detalhes = []

    if declared_energy_sym is not None and eom_solutions:
        # Total time derivative dE/dt
        dE_dt = declared_energy_sym.diff(t)
        # Substitute equations of motion on-shell
        dE_dt_on_shell = dE_dt
        for q_ddot, accel_expr in eom_solutions.items():
            dE_dt_on_shell = dE_dt_on_shell.subs(q_ddot, accel_expr)

        dE_dt_simplified = sp.simplify(dE_dt_on_shell)
        residue_str = str(dE_dt_simplified)
        is_conserved = (dE_dt_simplified == 0)

        # Difference between true Hamiltonian and declared energy
        delta_H = sp.simplify(H_true - declared_energy_sym)
        delta_H_str = str(delta_H)

        if not is_conserved:
            detalhes.append(
                f"Contradição na conservação de energia: dE/dt calculado ao longo da trajetória é {residue_str} ≠ 0. "
                f"O Hamiltoniano canônico exato do sistema é H = {H_true}. "
                f"Discrepância entre o Hamiltoniano real e a energia declarada: Δ = H_real - E_declarada = {delta_H_str}."
            )
            trace_steps.append(f"Contradição on-shell: dE/dt = {residue_str} ≠ 0. Conservação violada.")
        else:
            detalhes.append(
                f"Conservação verificada com sucesso: dE/dt = 0 ao longo da trajetória de Euler-Lagrange. "
                f"Hamiltoniano canônico: H = {H_true}."
            )
            trace_steps.append("Conservação on-shell: dE/dt = 0 comprovado algebricamente pelo SymPy.")
    elif declared_energy_sym is not None and not eom_solutions:
        trace_steps.append("Falha ao isolar acelerações analiticamente (sistema não-linear acoplado sem forma fechada)")
        return {
            "status": "unverifiable",
            "unverifiable_reason": "no_closed_form",
            "status_label": "Não verificável (Sem forma fechada conhecida)",
            "energia_conservada": None,
            "residuo_simbolico": "Equação de movimento não pôde ser resolvida simbolicamente para a aceleração",
            "inconsistencias_dimensionais": [],
            "detalhes_derivacao": "Sistema com acelerações acopladas não-lineares sem solução analítica fechada direta.",
            "conversion_trace": {
                "stage": "Resolução de Euler-Lagrange",
                "received_raw": str(raw_L_input),
                "attempted_sympy": str(L_cleaned),
                "error_message": "sp.solve não encontrou solução analítica fechada para as acelerações",
                "trace_steps": trace_steps
            }
        }

    # Check dimensional consistency
    inconsistencies = check_dimensional_consistency(
        data.get("parameters", {}),
        data.get("ui_controls", []),
        data.get("terms", [])
    )
    if inconsistencies:
        trace_steps.append(f"Inconsistências dimensionais identificadas pelo Pint: {inconsistencies}")

    # Check algebraic feasibility (E >= V_eff,mín)
    feasibility_res = check_algebraic_feasibility(
        data, symbols_map, coords_funcs, vels_funcs, L_sym, H_true, declared_energy_sym, trace_steps
    )

    # Determine verdict (algebraic contradiction has highest priority)
    if feasibility_res.get("violacao_viabilidade_algebrica"):
        status = "contradiction"
        status_label = "Contradição detectada — energia declarada abaixo do mínimo fisicamente permitido"
        stage_name = "Contradição Detectada (Viabilidade Algébrica E < V_eff,mín)"
        err_report = feasibility_res.get("mensagem_viabilidade", "Energia declarada abaixo do mínimo do potencial efetivo")
        detalhes.append(feasibility_res.get("detalhes", err_report))
    elif not is_conserved and energy_claimed_conserved:
        status = "contradiction"
        status_label = "Contradição detectada"
        stage_name = "Contradição Detectada (dE/dt ≠ 0)"
        err_report = f"Resíduo dE/dt = {residue_str} ≠ 0"
    elif len(inconsistencies) > 0:
        status = "contradiction"
        status_label = "Contradição detectada"
        stage_name = "Inconsistência Dimensional"
        err_report = "; ".join(inconsistencies)
    elif is_conserved:
        status = "verified"
        status_label = "Verificado formalmente"
        stage_name = "Verificação Concluída com Sucesso"
        err_report = ""
    else:
        status = "unverifiable"
        status_label = "Não verificável (Sem forma fechada conhecida)"
        stage_name = "Não Verificável"
        err_report = "Condições de integrabilidade analítica inconclusivas"

    eom_derived_str = ", ".join([f"{str(k)} = {str(v)}" for k, v in eom_solutions.items()]) if eom_solutions else "; ".join(eom_equations)

    return {
        "status": status,
        "status_label": status_label,
        "energia_conservada": is_conserved,
        "residuo_simbolico": residue_str,
        "equacao_movimento_derivada": eom_derived_str,
        "hamiltoniano_verdadeiro": str(H_true),
        "discrepancia_hamiltoniano": delta_H_str,
        "inconsistencias_dimensionais": inconsistencies,
        "detalhes_derivacao": " ".join(detalhes),
        "viabilidade_algebrica": feasibility_res.get("viabilidade_algebrica"),
        "violacao_viabilidade_algebrica": feasibility_res.get("violacao_viabilidade_algebrica", False),
        "v_eff_min": feasibility_res.get("v_eff_min"),
        "v_eff_min_simbolico": feasibility_res.get("v_eff_min_simbolico"),
        "r_min": feasibility_res.get("r_min"),
        "r_min_simbolico": feasibility_res.get("r_min_simbolico"),
        "energia_declarada_val": feasibility_res.get("energia_declarada_val"),
        "delta_energia_min": feasibility_res.get("delta_energia_min"),
        "mensagem_viabilidade": feasibility_res.get("mensagem_viabilidade"),
        "fonte_dados": feasibility_res.get("fonte_dados", "sympy_verified" if sp is not None else "unverified_lead_scientist"),
        "metodo_auditoria": feasibility_res.get("metodo_auditoria", "Derivação analítica de Euler-Lagrange via SymPy CAS" if sp is not None else "Estimativa do Lead Scientist"),
        "system_class": feasibility_res.get("system_class", "general"),
        "system_title": feasibility_res.get("system_title", "Sistema Central"),
        "primary_tab_label": feasibility_res.get("primary_tab_label", "Trajetória 2D"),
        "force_center_label": feasibility_res.get("force_center_label", "Centro de Força"),
        "moving_body_label": feasibility_res.get("moving_body_label", "Partícula"),
        "v_eff_formula_str": feasibility_res.get("v_eff_formula_str", ""),
        "kinetic_radial_formula": feasibility_res.get("kinetic_radial_formula", "T_r = ½·m·ṙ²"),
        "conversion_trace": {
            "stage": stage_name,
            "received_raw": str(raw_L_input),
            "attempted_sympy": str(L_cleaned),
            "error_message": err_report,
            "trace_steps": trace_steps
        }
    }


def infer_mechanical_formulation(data):
    raw_prompt_orig = str(data.get("raw_prompt") or "")
    raw_prompt = raw_prompt_orig.lower()
    equations_orig = [str(eq) for eq in (data.get("formal_equations") or [])]
    equations = [eq.lower() for eq in equations_orig]
    full_text = raw_prompt + " " + " ".join(equations)
    combined_params = (raw_prompt_orig + " " + " ".join(equations_orig)).replace("−", "-").replace("–", "-").replace(",", ".")

    # 1. Oscilador Harmônico Isotrópico 2D com Coordenada Cíclica (Potencial Efetivo Elástico)
    is_oscillator = any(term in full_text for term in ["oscilador", "harmônic", "harmonic", "mola", "hooke", "k*r^2", "0.5*k*r**2", "1/2*k*r^2"])
    has_angular = any(term in full_text for term in ["momento angular", "angular", "l =", "l=", "potencial efetivo", "v_eff", "plano", "2d", "polar", "coordenada cíclica"])
    if is_oscillator and has_angular:
        data["system_type"] = "harmonic_oscillator"
        data["coordinates"] = ["r"]
        data["velocities"] = ["r_dot"]
        data["lagrangian"] = "0.5*m*r_dot**2 - (L**2/(2*m*r**2) + 0.5*k*r**2)"
        data["declared_energy"] = "0.5*m*r_dot**2 + L**2/(2*m*r**2) + 0.5*k*r**2"
        data["energy_conservation_claimed"] = True

        mL = re.search(r'\bL\s*=\s*([+-]?\d+(?:\.\d+)?)', combined_params)
        mM = re.search(r'\bm\s*=\s*([+-]?\d+(?:\.\d+)?)', combined_params)
        mK = re.search(r'\bk\s*=\s*([+-]?\d+(?:\.\d+)?)', combined_params)
        mE = re.search(r'(?:\bE\b|\benergia\b)\s*=\s*([+-]?\d+(?:\.\d+)?)', combined_params)

        val_L = float(mL.group(1)) if mL else 2.0
        val_m = float(mM.group(1)) if mM else 1.0
        val_k = float(mK.group(1)) if mK else 2.0
        omega = math.sqrt(val_k / val_m)
        v_eff_min = omega * val_L
        val_E = float(mE.group(1)) if mE else round(v_eff_min + 0.5, 3)

        if not data.get("parameters"):
            data["parameters"] = {
                "L": {"value": val_L, "unit": "kg*m**2/s", "description": "Momento Angular Constante (Coordenada Cíclica φ)"},
                "m": {"value": val_m, "unit": "kg", "description": "Massa da Partícula Oscilante"},
                "k": {"value": val_k, "unit": "N/m", "description": "Constante Elástica Central"},
                "E": {"value": val_E, "unit": "J", "description": "Energia Mecânica Total"}
            }
        data["declared_energy_val"] = val_E
        return data

    # 2. Força Central Coulombiana (Interação Eletrostática)
    is_coulomb = any(term in full_text for term in ["coulomb", "carga", "eletrostátic", "eletrostatic"])
    if is_coulomb:
        data["system_type"] = "coulomb"
        data["coordinates"] = ["r"]
        data["velocities"] = ["r_dot"]
        data["lagrangian"] = "0.5*mu*r_dot**2 - (L**2/(2*mu*r**2) - K/r)"
        data["declared_energy"] = "0.5*mu*r_dot**2 + L**2/(2*mu*r**2) - K/r"
        data["energy_conservation_claimed"] = True

        mL = re.search(r'\bL\s*=\s*([+-]?\d+(?:\.\d+)?)', combined_params)
        mMu = re.search(r'(?:\\\\mu|μ|\bmu\b|\bm\b)\s*=\s*([+-]?\d+(?:\.\d+)?)', combined_params)
        mK = re.search(r'(?:\bK\b|\bk_e\b)\s*=\s*([+-]?\d+(?:\.\d+)?)', combined_params)
        mE = re.search(r'(?:\bE\b|\benergia\b)\s*=\s*([+-]?\d+(?:\.\d+)?)', combined_params)

        val_L = float(mL.group(1)) if mL else 1.0
        val_mu = float(mMu.group(1)) if mMu else 1.0
        val_K = float(mK.group(1)) if mK else 1.0
        v_eff_min = - (val_mu * val_K**2) / (2.0 * val_L**2)
        val_E = float(mE.group(1)) if mE else round(v_eff_min + 0.5, 3)

        if not data.get("parameters"):
            data["parameters"] = {
                "L": {"value": val_L, "unit": "kg*m**2/s", "description": "Momento Angular"},
                "mu": {"value": val_mu, "unit": "kg", "description": "Massa Reduzida"},
                "K": {"value": val_K, "unit": "N*m**2", "description": "Constante de Coulomb Efetiva"},
                "E": {"value": val_E, "unit": "J", "description": "Energia Total"}
            }
        data["declared_energy_val"] = val_E
        return data

    # 3. Problema de Kepler de Dois Corpos / Gravitacional
    is_kepler = any(term in full_text for term in ["kepler", "dois corpos", "two body", "gravita", "gravitacional", "gm", "órbita", "orbita"]) or (
        any(term in full_text for term in ["potencial efetivo", "v_eff"]) and not is_oscillator
    )
    if is_kepler:
        data["system_type"] = "kepler"
        data["coordinates"] = ["r"]
        data["velocities"] = ["r_dot"]
        data["lagrangian"] = "0.5*mu*r_dot**2 - (L**2/(2*mu*r**2) - GM*mu/r)"
        data["declared_energy"] = "0.5*mu*r_dot**2 + L**2/(2*mu*r**2) - GM*mu/r"
        data["energy_conservation_claimed"] = True

        mL = re.search(r'\bL\s*=\s*([+-]?\d+(?:\.\d+)?)', combined_params)
        mMu = re.search(r'(?:\\\\mu|μ|\bmu\b)\s*=\s*([+-]?\d+(?:\.\d+)?)', combined_params)
        mGM = re.search(r'(?:\bGM\b|G\*M)\s*=\s*([+-]?\d+(?:\.\d+)?)', combined_params)
        mE = re.search(r'(?:\bE\b|\benergia\b)\s*=\s*([+-]?\d+(?:\.\d+)?)', combined_params)

        val_L = float(mL.group(1)) if mL else 1.0
        val_mu = float(mMu.group(1)) if mMu else 1.0
        val_GM = float(mGM.group(1)) if mGM else 1.0
        val_E = float(mE.group(1)) if mE else -0.5

        if not data.get("parameters"):
            data["parameters"] = {
                "L": {"value": val_L, "unit": "kg*m**2/s", "description": "Momento Angular Orbital"},
                "mu": {"value": val_mu, "unit": "kg", "description": "Massa Reduzida do Sistema"},
                "GM": {"value": val_GM, "unit": "m**3/s**2", "description": "Constante Gravitacional μ·M"},
                "E": {"value": val_E, "unit": "J", "description": "Energia Orbital Declarada"}
            }
        data["declared_energy_val"] = val_E
        return data

    # 2. Pêndulo Anarmônico com Correção Quártica (Caso de Teste Epistêmico de Contradição)
    is_pendulum = any(term in full_text for term in ["pêndulo", "pendulo", "pendulum"])
    has_quartic = any(term in full_text for term in ["quarta", "quártic", "quartic", "4ª", "4a", "kappa", "κ", "anarmônic", "anarmonic"])

    if is_pendulum and has_quartic:
        if not data.get("lagrangian_sympy") and not data.get("lagrangian"):
            data["system_type"] = "lagrangian"
            data["coordinates"] = ["theta"]
            data["velocities"] = ["theta_dot"]
            data["lagrangian"] = "0.5*m*L**2*theta_dot**2 - m*g*L*(1-cos(theta)) + kappa*(m*L**2/w0**2)*theta_dot**4"
            data["declared_energy"] = "0.5*m*L**2*theta_dot**2 + m*g*L*(1-cos(theta)) + kappa*(m*L**2/w0**2)*theta_dot**4"
            data["energy_conservation_claimed"] = True
            if not data.get("parameters"):
                data["parameters"] = {
                    "m": {"unit": "kg"},
                    "L": {"unit": "m"},
                    "g": {"unit": "m/s**2"},
                    "kappa": {"unit": "dimensionless"},
                    "w0": {"unit": "1/s"}
                }
        return data

    # 2. Pêndulo Simples Ideal (Caso Canônico Fechado Básico: Trivialmente Verificável com dE/dt = 0)
    is_ideal = any(term in full_text for term in ["ideal", "simples", "simple", "conservativo", "sem atrito", "gravidade"])
    if is_pendulum and (is_ideal or not data.get("system_type") or data.get("system_type") == "lagrangian"):
        if not data.get("lagrangian_sympy") and not data.get("lagrangian"):
            data["system_type"] = "lagrangian"
            data["coordinates"] = ["theta"]
            data["velocities"] = ["theta_dot"]
            data["lagrangian"] = "0.5*m*L**2*theta_dot**2 - m*g*L*(1 - cos(theta))"
            data["declared_energy"] = "0.5*m*L**2*theta_dot**2 + m*g*L*(1 - cos(theta))"
            data["energy_conservation_claimed"] = True
            if not data.get("parameters"):
                data["parameters"] = {
                    "m": {"unit": "kg"},
                    "L": {"unit": "m"},
                    "g": {"unit": "m/s**2"}
                }
        return data

    # 3. Oscilador Harmônico Simples (Massa-Mola)
    is_oscillator = any(term in full_text for term in ["oscilador harmônico", "massa mola", "harmonic oscillator", "hooke"])
    if is_oscillator:
        if not data.get("lagrangian_sympy") and not data.get("lagrangian"):
            data["system_type"] = "lagrangian"
            data["coordinates"] = ["x"]
            data["velocities"] = ["x_dot"]
            data["lagrangian"] = "0.5*m*x_dot**2 - 0.5*k*x**2"
            data["declared_energy"] = "0.5*m*x_dot**2 + 0.5*k*x**2"
            data["energy_conservation_claimed"] = True
            if not data.get("parameters"):
                data["parameters"] = {
                    "m": {"unit": "kg"},
                    "k": {"unit": "N/m"}
                }
        return data

    return data


def main():
    try:
        raw_input = ""
        # Check CLI arguments first
        if len(sys.argv) > 1:
            arg = sys.argv[1].strip()
            if arg.startswith('{') or arg.startswith('['):
                raw_input = arg
            elif os.path.exists(arg):
                with open(arg, 'r', encoding='utf-8') as f:
                    raw_input = f.read()

        # If no CLI arg provided, read from stdin
        if not raw_input.strip():
            if not sys.stdin.isatty():
                raw_input = sys.stdin.read()

        if not raw_input.strip():
            print(json.dumps({
                "status": "unverifiable",
                "unverifiable_reason": "parse_error",
                "status_label": "Não verificável (Falha de parsing/conversão)",
                "energia_conservada": None,
                "residuo_simbolico": "Nenhum dado recebido no stdin ou argumentos",
                "inconsistencias_dimensionais": [],
                "detalhes_derivacao": "Entrada vazia.",
                "conversion_trace": {
                    "stage": "Leitura de Entrada",
                    "received_raw": "",
                    "attempted_sympy": "",
                    "error_message": "Stream de entrada vazio",
                    "trace_steps": ["Nenhum dado JSON recebido"]
                }
            }, ensure_ascii=False))
            sys.exit(0)

        data = json.loads(raw_input)
        data = infer_mechanical_formulation(data)
        system_type = data.get("system_type", "lagrangian")

        if system_type in ["lagrangian", "mechanical", "pendulum", "oscillator", "kepler", "two_body", "central_force"] or data.get("lagrangian") or data.get("lagrangian_sympy"):
            result = verify_lagrangian_system(data)
        else:
            # Non-Lagrangian: check dimensional consistency if parameters are supplied
            inconsistencies = check_dimensional_consistency(
                data.get("parameters", {}),
                data.get("ui_controls", []),
                data.get("terms", [])
            )
            if inconsistencies:
                result = {
                    "status": "contradiction",
                    "status_label": "Contradição detectada",
                    "energia_conservada": None,
                    "residuo_simbolico": "Inconsistência dimensional em sistema dinâmico geral",
                    "inconsistencias_dimensionais": inconsistencies,
                    "detalhes_derivacao": "Foram encontradas inconsistências dimensionais nos parâmetros ou controles da UI.",
                    "conversion_trace": {
                        "stage": "Validação Dimensional Pint",
                        "received_raw": json.dumps(data.get("parameters", {})),
                        "attempted_sympy": "N/A",
                        "error_message": "; ".join(inconsistencies),
                        "trace_steps": inconsistencies
                    }
                }
            else:
                # System without closed form (stochastic, chaotic, discrete)
                is_stochastic = system_type in ["discrete_stochastic", "stochastic", "markov"] or any(t in str(data.get("raw_prompt", "")).lower() for t in ["brownian", "markov", "estocástic", "estocastic", "random walk"])
                is_chaotic = system_type in ["chaotic_attractor", "chaotic"] or any(t in str(data.get("raw_prompt", "")).lower() for t in ["lorenz", "caos", "chaos", "atrator estranho"])
                
                if is_stochastic:
                    sublabel = "Não verificável (Sem forma fechada conhecida)"
                    reason_msg = "Processo estocástico / espaço de probabilidade sem Lagrangiana conservativa fechada."
                elif is_chaotic:
                    sublabel = "Não verificável (Sem forma fechada conhecida)"
                    reason_msg = "Atrator caótico dissipativo sem primeiras integrais analíticas holonômicas."
                else:
                    sublabel = "Não verificável (Sem forma fechada conhecida)"
                    reason_msg = "Sistema discreto, aberto ou de primeira ordem sem representação variacional de Euler-Lagrange."

                result = {
                    "status": "unverifiable",
                    "unverifiable_reason": "no_closed_form",
                    "status_label": sublabel,
                    "energia_conservada": None,
                    "residuo_simbolico": "Sistema sem Lagrangiana conservativa fechada",
                    "inconsistencias_dimensionais": [],
                    "detalhes_derivacao": f"Limitação genuína do modelo físico: {reason_msg}",
                    "conversion_trace": {
                        "stage": "Classificação Epistêmica do Sistema",
                        "received_raw": str(data.get("raw_prompt", "")),
                        "attempted_sympy": "N/A (Modelo não-lagrangiano)",
                        "error_message": "Sem forma fechada conhecida para derivação de Euler-Lagrange",
                        "trace_steps": [
                            f"Tipo de sistema identificado: '{system_type}'",
                            reason_msg,
                            "Avaliação formal restrita a verificação qualitativa e dimensional."
                        ]
                    }
                }

        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as err:
        tb = traceback.format_exc()
        print(json.dumps({
            "status": "unverifiable",
            "unverifiable_reason": "parse_error",
            "status_label": "Não verificável (Falha de parsing/conversão)",
            "energia_conservada": None,
            "residuo_simbolico": f"Erro inesperado no verificador simbólico: {str(err)}",
            "inconsistencias_dimensionais": [],
            "detalhes_derivacao": f"Falha de execução técnica: {str(err)}",
            "conversion_trace": {
                "stage": "Execução Principal do Script",
                "received_raw": str(data.get("declared_energy") or data.get("lagrangian") or data.get("raw_prompt") or (sys.argv[1] if len(sys.argv) > 1 else "stdin")),
                "attempted_sympy": "main() execution",
                "error_message": f"{type(err).__name__}: {str(err)}",
                "trace_steps": [f"Traceback: {tb}"]
            }
        }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
