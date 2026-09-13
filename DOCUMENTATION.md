# 📚 Documentação Técnica Completa: Scientific Visualization Multi-Agent Studio

> **Versão:** 2.0.0  
> **Arquitetura:** Multi-Agente Sequencial + Motor Simbólico Determinístico (SymPy 1.14 & Pint 0.24) + HTML5 Canvas 2D 60FPS + Autocura AST  
> **Última Atualização:** Setembro de 2026

---

## 1. Visão Geral e Filosofia do Projeto

### 1.1 O Problema da Pseudo-Física em Modelos de Linguagem
Modelos de Linguagem de Grande Porte (LLMs) são excepcionais em gerar descrições textuais verossímeis e código sintaticamente correto. No entanto, quando solicitados a produzir simulações científicas interativas, eles frequentemente caem na armadilha da **pseudo-física** ou **alucinação matemática**:
- Declaram que uma grandeza física é conservada ($dE/dt = 0$) simplesmente repetindo a premissa no texto explicativo, sem derivar as equações de movimento.
- Misturam dimensões físicas incoerentes (ex: somar Joules com Newtons ou segundos).
- Tratam representações espaciais 2D arbitrárias (como projeções de grafos ou autovetores) como se fossem terrenos físicos contínuos ("landscapes").
- Apresentam "scores de fidelidade" elevados validados apenas pelo próprio modelo que gerou o erro.

### 1.2 A Solução Arquitetural
O **Scientific Visualization Multi-Agent Studio** resolve esse problema separando estritamente a **geração criativa** da **auditoria determinística**:
1. Uma esteira sequencial de **4 Agentes Especializados** com prompts altamente restritivos.
2. Uma camada externa de **Computação Algébrica Simbólica (SymPy)** e **Análise Dimensional (Pint)** em Python, imune a alucinações de LLMs.
3. Um sistema de **Veredito em 3 Estados** que impede a apresentação de scores e selos de aprovação em sistemas que não foram formalmente derivados.
4. Um loop de **Autocura Cirúrgica (AST Self-Healing)** com reescrita orientada à conservação exata de invariantes.

---

## 2. Pipeline dos 4 Agentes Especializados

A esteira opera no padrão sequencial estrito, onde cada agente recebe como entrada as decisões auditadas do agente anterior:

```
[Prompt do Usuário / Documento Técnico / Teorema Inédito]
                         │
                         ▼
             1. LEAD SCIENTIST AGENT
                         │
                         ▼
             2. SCENE DIRECTOR AGENT
                         │
                         ▼
           3. GRAPHICS ENGINEER AGENT
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │  CAMADA DETERMINÍSTICA ANALÍTICA             │
    │  (SymPy 1.14 + Pint 0.24 em Python 3)        │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
       4. QA SCIENTIFIC AUDITOR & AUTO-HEAL
                         │
                         ▼
 [ Simulação Interativa no Viewport + Telemetria em Tempo Real ]
```

### Agente 1: Lead Scientist
- **Papel**: Físico-Matemático Chefe.
- **Responsabilidade**:
  - Extrai e formaliza o fenômeno fundamental sem simplificações excessivas.
  - Formula as equações teóricas em LaTeX rigoroso.
  - Define a **Formulação Simbólica** (Lagrangiana $L(q, \dot{q})$, coordenadas generalizadas, grandezas conservadas e unidades SI).
  - Estabelece os contratos de invariantes (ex: energia $H$, momento angular $L$, probabilidade $\sum P_i = 1$).
  - Aplica a **Distinção Tripartite** (Modelo Teórico Idealizado vs. Equação da Discretização vs. Metáfora Visual).

### Agente 2: Scene Director
- **Papel**: Diretor de Cena e Pedagogia Científica.
- **Responsabilidade**:
  - Traduz o formalismo em um storyboard visual navegável a 60 FPS.
  - Especifica os **Controles Interativos (Sliders UI)** com limites físicos válidos ($min$, $max$, valor padrão, passo e **unidade física explícita**).
  - Define a **Fronteira Epistêmica**: estabelece claramente onde a física matemática termina e onde começa a convenção gráfica (ex: cores de campo, linhas de fluxo).
  - Redige o texto pedagógico comparativo e conceitual.

### Agente 3: Graphics Engineer
- **Papel**: Engenheiro de Gráficos e Sistemas Dinâmicos.
- **Responsabilidade**:
  - Implementa a simulação exclusivamente em **HTML5 Canvas 2D nativo** em JavaScript puro, sem dependências de frameworks pesados no loop de renderização.
  - Utiliza integradores numéricos adequados (ex: Verlet para mecânica clássica, Runge-Kutta de 4ª ordem para sistemas acoplados, Euler com sub-stepping para fluidos).
  - Implementa tratamento defensivo de runtime (`isFinite`, contenção contra `NaN` e `Infinity`, reconexão de ponteiros após redimensionamento da janela).
  - Renderiza gráficos de telemetria em tempo real on-canvas.

### Agente 4: QA Scientific Auditor & Autocura AST
- **Papel**: Auditor Chefe de Rigor e Revisor por Pares.
- **Responsabilidade**:
  - Analisa a AST (Abstract Syntax Tree) do código JavaScript gerado, verificando escopo de variáveis, listeners de eventos e ciclo de vida do `requestAnimationFrame`.
  - Cruza as afirmações do código e da especificação com o resultado emitido pelo **Motor Simbólico SymPy & Pint**.
  - Emite o **Veredito em 3 Estados** (`verified`, `contradiction`, `unverifiable`).
  - Se reprovado por erro de sintaxe ou violação matemática recuperável, aciona o **Motor de Autocura**, aplicando patches cirúrgicos no código em tempo de milissegundos.

---

## 3. A Camada Determinística de Verificação Simbólica (SymPy & Pint)

A verificação matemática é realizada de forma totalmente desacoplada de LLMs pelo script `/scripts/symbolic_verifier.py`.

### 3.1 Álgebra de Euler-Lagrange On-Shell
Para qualquer sistema mecânico com Lagrangiano declarado $L(q, \dot{q})$, o motor executa analiticamente:
1. **Derivadas Parciais**:
   $$\frac{\partial L}{\partial q_i}, \quad \frac{\partial L}{\partial \dot{q}_i}$$
2. **Equação de Euler-Lagrange**:
   $$\frac{d}{dt}\left(\frac{\partial L}{\partial \dot{q}_i}\right) - \frac{\partial L}{\partial q_i} = 0 \implies \ddot{q}_i = f(q_i, \dot{q}_i)$$
3. **Hamiltoniano Canônico Exato (Transformada de Legendre)**:
   $$H = \sum_{i} \dot{q}_i \frac{\partial L}{\partial \dot{q}_i} - L$$
4. **Verificação de Conservação da Grandeza Declarada $E$**:
   Calcula a derivada total de $E$ no tempo substituindo as acelerações $\ddot{q}_i$ pelas soluções de Euler-Lagrange (cálculo on-shell):
   $$\left.\frac{dE}{dt}\right|_{\text{on-shell}} = \sum_{i} \left( \frac{\partial E}{\partial q_i} \dot{q}_i + \frac{\partial E}{\partial \dot{q}_i} \ddot{q}_i \right)$$
   - Se $\left.\frac{dE}{dt}\right|_{\text{on-shell}} = 0$, a energia declarada é formalmente conservada.
   - Se $\left.\frac{dE}{dt}\right|_{\text{on-shell}} \neq 0$, o sistema detecta a alucinação e calcula a discrepância analítica $\Delta = H - E$.

### 3.2 Análise Dimensional com Pint
O verificador utiliza a biblioteca de unidades físicas `Pint`:
- Valida se as unidades expostas nos sliders da interface são dimensionalmente equivalentes às grandezas do modelo teórico (ex: impede que um slider de massa use segundos).
- Comprova a homogeneidade de soma de termos (garantindo que todos os termos em uma equação de energia possuam dimensão de $[M \cdot L^2 \cdot T^{-2}]$ ou Joules).

---

## 4. O Sistema de Veredito em 3 Estados

Para respeitar os princípios de honestidade epistemológica, a interface e o orquestrador implementam 3 estados mutuamente exclusivos:

```
                  ┌─────────────────────────────────────┐
                  │   RESULTADO DA AUDITORIA DETERMIN.  │
                  └──────────────────┬──────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
   [ 1. VERIFIED ]           [ 2. CONTRADICTION ]       [ 3. UNVERIFIABLE ]
   dE/dt = 0 on-shell        dE/dt ≠ 0 ou dimensão      Sistemas Estocásticos /
   Pint: Homogêneo           Discrepância Δ calculada   Sem Lagrangiana analítica
   Fidelity Score: 90-100%   Fidelity Score: Vermelho   Fidelity Score: N/A (Cinza)
   6 Regras: Validadas       Autocura Disparada         6 Regras: Não Avaliadas
```

### Detalhamento dos Estados:

| Propriedade | 1. `verified` | 2. `contradiction` | 3. `unverifiable` |
| :--- | :--- | :--- | :--- |
| **Rótulo UI** | `Verificado formalmente` | `Contradição detectada` | `Não verificável automaticamente` |
| **Cor / Tema** | Verde Esmeralda (`#10b981`) | Vermelho Rosa (`#f43f5e`) | Cinza Ardósia Neutro (`#64748b`) |
| **Fidelity Score** | Percentual calculado (ex: `98%`) | Percentual rebaixado (`< 60%`) | **`—` (Score Não-Computado)** |
| **Invariantes** | `Contratos Respeitados` | `Contradição Física Detectada` | **`Não avaliado on-shell`** |
| **Alucinação** | `Física Real (Sem Alucinação)` | `Alucinação Conceitual Detectada`| **`Não avaliado numericamente`** |
| **6 Regras** | `Validado` (Check verde) | `Violação` (X vermelho) | **`Não avaliado` (HelpCircle cinza)** |
| **Autocura** | Não necessária | Disparada automaticamente | Opcional se houver erro de sintaxe |

---

## 5. Caso de Estresse Reproduzível: Pêndulo Quártico Anarmônico

Para comprovar a eficácia do motor, a plataforma inclui o caso canônico do pêndulo com termo cinético de 4ª ordem:

$$E_{\text{declarada}} = \frac{1}{2}mL^2\dot{\theta}^2 + mgL(1-\cos\theta) + \kappa \left(\frac{mL^2}{\omega_0^2}\right)\dot{\theta}^4$$

### Onde os LLMs comumente erram:
O LLM assume que como o termo quártico envolve $\dot{\theta}^4$, trata-se apenas de "energia cinética extra" e afirma incorretamente que $dE/dt = 0$ e $E(t) = \text{const}$.

### O que o Verificador SymPy comprova:
Dado o Lagrangiano:
$$L = \frac{1}{2}mL^2\dot{\theta}^2 - mgL(1-\cos\theta) + \kappa \left(\frac{mL^2}{\omega_0^2}\right)\dot{\theta}^4$$

O momento conjugado é:
$$p_\theta = \frac{\partial L}{\partial \dot{\theta}} = mL^2\dot{\theta} + 4\kappa \left(\frac{mL^2}{\omega_0^2}\right)\dot{\theta}^3$$

Aplicando a Transformada de Legendre:
$$H = \dot{\theta} p_\theta - L = \frac{1}{2}mL^2\dot{\theta}^2 + mgL(1-\cos\theta) + 3\kappa \left(\frac{mL^2}{\omega_0^2}\right)\dot{\theta}^4$$

**Resultado analítico:**
- O coeficiente correto para o termo de quarta ordem no Hamiltoniano conservado é **$3\kappa$**, e não $1\kappa$.
- A quantidade $E_{\text{declarada}}$ possui variação no tempo:
  $$\frac{dE_{\text{declarada}}}{dt} = \frac{8L g \kappa m \sin(\theta)\dot{\theta}^3}{12\kappa\dot{\theta}^2 + \omega_0^2} \neq 0$$
- O motor detecta a violação com resíduo fechado, exibe a discrepância $\Delta = 2\kappa \left(\frac{mL^2}{\omega_0^2}\right)\dot{\theta}^4$ e plota no Canvas simultaneamente a curva de $H$ (conservada plana) versus $E$ (oscilante violada).

---

## 6. Especificação das Rotas da API REST

A aplicação roda em Node.js/Express na porta `3000`.

### 6.1 `POST /api/v1/synthesize`
Sintetiza uma simulação interativa completa a partir de um prompt em linguagem natural ou texto de artigo/documento.

**Payload de Requisição:**
```json
{
  "prompt": "Pêndulo simples com termo de correção cinética de quarta ordem",
  "explanation_mode": "rigorous_formal",
  "doc_context": null
}
```

**Resposta de Sucesso (`200 OK`):**
```json
{
  "scientific_spec": {
    "core_phenomenon": "Pêndulo Anarmônico Quártico",
    "formal_equations": ["L = ...", "H = ..."],
    "invariants": [...],
    "symbolic_formulation": {
      "system_type": "lagrangian",
      "coordinates": ["theta"],
      "velocities": ["theta_dot"],
      "lagrangian": "0.5*m*L**2*theta_dot**2 - m*g*L*(1 - cos(theta)) + kappa*(m*L**2/omega_0**2)*theta_dot**4",
      "declared_energy": "0.5*m*L**2*theta_dot**2 + m*g*L*(1 - cos(theta)) + kappa*(m*L**2/omega_0**2)*theta_dot**4",
      "parameters": { "m": "1.0 kg", "L": "1.0 m", "g": "9.8 m/s^2", "kappa": "0.1", "omega_0": "3.13 rad/s" }
    }
  },
  "pedagogical_text": "...",
  "ui_controls": [...],
  "executable_code": "window.mountSimulation = function(canvas, getParam, recordMetric) { ... }",
  "qa_report": {
    "syntax_valid": true,
    "scientific_fidelity_score": 0.45,
    "invariants_preserved": false,
    "hallucination_detected": true,
    "verification_verdict": "contradiction",
    "verification_label": "Contradição detectada",
    "symbolic_result": {
      "status": "contradiction",
      "energia_conservada": false,
      "residuo_simbolico": "8.0*L*g*kappa*m*sin(theta(t))*Derivative(theta(t), t)**3/...",
      "hamiltoniano_verdadeiro": "3.0*L**2*kappa*m*Derivative(theta(t), t)**4/omega_0**2 + ...",
      "discrepancia_hamiltoniano": "2.0*L**2*kappa*m*Derivative(theta(t), t)**4/omega_0**2"
    }
  },
  "attempts": 1,
  "logs": [...]
}
```

### 6.2 `POST /api/v1/auto-heal`
Aciona o motor de autocura cirúrgica fornecendo o código atual e as notas de reprovação.

**Payload:**
```json
{
  "executable_code": "window.mountSimulation = ...",
  "scientific_spec": { ... },
  "critique_notes": "dE/dt != 0; O coeficiente correto do Hamiltoniano é 3*kappa."
}
```

**Resposta:**
Retorna o código corrigido e o novo `qa_report` revalidado pelo SymPy.

### 6.3 `GET /api/health`
Retorna `{ "status": "ok" }`.

---

## 7. Guia Completo de Deploy em Produção

### 7.1 Requisitos de Infraestrutura
A aplicação possui um frontend React compilado estaticamente em `/dist` servido por um servidor Express em `/dist/server.cjs`. Para a verificação formal rodar em produção, o ambiente **deve possuir Python 3 com as bibliotecas `sympy` e `pint` instaladas**.

### 7.2 Opção Recomendada: Google Cloud Run

O **Google Cloud Run** oferece infraestrutura gerenciada sem servidor (serverless) com suporte nativo a containers Docker, HTTPS automático e escalabilidade de 0 a centenas de instâncias.

#### Dockerfile Multi-Stage de Produção (`/Dockerfile`):
```dockerfile
# =======================================================
# Estágio 1: Build do Frontend Vite e Backend TypeScript
# =======================================================
FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# =======================================================
# Estágio 2: Imagem Final de Execução (Node + Python SymPy)
# =======================================================
FROM node:20-slim AS runner
WORKDIR /app

# Instalação de dependências do sistema e Python 3
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instalação dos motores de computação simbólica e dimensional
RUN pip3 install --no-cache-dir sympy pint --break-system-packages

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

# Copia os artefatos gerados no build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000

# Execução do servidor compilado CJS
CMD ["node", "dist/server.cjs"]
```

#### Passo a Passo de Deploy via Google Cloud CLI:
1. Certifique-se de ter o `gcloud` instalado e autenticado:
   ```bash
   gcloud auth login
   gcloud config set project SEU_PROJETO_GCP
   ```
2. Crie o secret com sua chave do Gemini:
   ```bash
   gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
   echo -n "SUA_CHAVE_GEMINI_AQUI" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
   ```
3. Execute o deploy diretamente da pasta do código:
   ```bash
   gcloud run deploy scientific-studio \
     --source . \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars "NODE_ENV=production" \
     --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest" \
     --memory 2Gi \
     --cpu 2 \
     --timeout 60s
   ```

---

### 7.3 Opção com 1 Clique: Render ou Railway

1. Crie uma conta no [Render](https://render.com) ou [Railway](https://railway.app).
2. Conecte seu repositório Git.
3. Escolha o tipo de ambiente como **Docker**. A plataforma lerá o `Dockerfile` automaticamente.
4. Defina a variável de ambiente `GEMINI_API_KEY` no painel.
5. O deploy é automático a cada `git push`.

---

### 7.4 Opção em Servidor Linux Dedicado (Ubuntu 22.04/24.04 LTS)

#### Método A: Com Docker Compose
Crie o arquivo `docker-compose.yml`:
```yaml
version: '3.8'

services:
  scientific-studio:
    build: .
    container_name: scientific_studio_prod
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    resources:
      limits:
        memory: 2048M
        cpus: '2.0'
```
Suba o serviço:
```bash
docker compose up -d --build
```

#### Método B: Bare Metal com PM2 e Nginx
1. Instale o runtime no Ubuntu:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt update && sudo apt install -y nodejs python3 python3-pip nginx
   pip3 install sympy pint
   sudo npm install -g pm2
   ```
2. Instale e compile o projeto:
   ```bash
   npm install
   npm run build
   ```
3. Inicie com PM2:
   ```bash
   pm2 start dist/server.cjs --name "scientific-studio"
   pm2 startup
   pm2 save
   ```
4. Configure o Nginx como proxy reverso:
   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Ative o HTTPS gratuitamente com `certbot --nginx -d seu-dominio.com`.

---

## 8. Manutenção e Adição de Novos Invariantes

Para cadastrar novos tipos de sistemas físicos analíticos:
1. Abra `/scripts/symbolic_verifier.py`.
2. Adicione uma nova função especialista (ex: `verify_hamiltonian_field`, `verify_lorentz_system`).
3. Cadastre a inferência automática em `infer_mechanical_formulation`.
4. Os agentes passarão a utilizar a nova derivação automaticamente durante o passo do `Lead Scientist`.
