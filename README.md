#  Scientific Visualization Multi-Agent Studio

> **Plataforma Multi-Agente de Síntese Científica, Verificação Simbólica Determinística (SymPy & Pint) e Simulações Interativas em HTML5 Canvas 2D com Rigor Epistemológico.**

---

##  Sumário Executivo

O **Scientific Visualization Multi-Agent Studio** é uma plataforma full-stack orientada por Inteligência Artificial que decompõe conceitos matemáticos, físicos, biológicos, processos estocásticos e notas técnicas inéditas em simulações interativas a 60 FPS em HTML5 Canvas 2D.

Diferente de geradores de código monolíticos sujeitos a alucinações conceituais e pseudo-física, o sistema implementa uma esteira **Multi-Agente Sequencial (Lead Scientist → Scene Director → Graphics Engineer → QA Auditor)** acoplada a um **Motor de Verificação Simbólica e Dimensional Determinístico (SymPy & Pint)**, um sistema de **Veredito em 3 Estados** e um loop de **Autocura Cirúrgica de AST**.

---

##  Arquitetura dos Agentes & Camada Simbólica

```
                   [ Prompt do Usuário / Documento Técnico ]
                                      │
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │            1. LEAD SCIENTIST AGENT              │
             │  - Dedução Formal e Equações LaTeX             │
             │  - Distinção Tripartite (Modelo/Impl/Metáfora)  │
             │  - Formulação Lagrangiana/Hamiltoniana Explícita│
             └────────────────────────┬────────────────────────┘
                                      │
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │            2. SCENE DIRECTOR AGENT              │
             │  - Storyboard Pedagógico & Fronteira Epistêmica │
             │  - Sliders e Graus de Liberdade com Unidades    │
             │  - Mapeamento Métrico de Telemetria             │
             └────────────────────────┬────────────────────────┘
                                      │
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │          3. GRAPHICS ENGINEER AGENT             │
             │  - Compilação de Canvas 2D em JS Puro           │
             │  - Integrador Numérico (Verlet / Runge-Kutta)   │
             │  - Loop de Renderização a 60 FPS                │
             └────────────────────────┬────────────────────────┘
                                      │
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │   CAMADA DETERMINÍSTICA (SymPy & Pint - Python) │
             │  - Equações de Euler-Lagrange analíticas        │
             │  - Derivação On-Shell de dE/dt                  │
             │  - Homogeneidade Dimensional Estrita via Pint   │
             └────────────────────────┬────────────────────────┘
                                      │
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │       4. QA SCIENTIFIC AUDITOR & AUTOHEAL       │
             │  - Avaliação do Veredito em 3 Estados           │
             │  - Auditoria Estática de AST & Escopo de Vars   │
             │  - Checagem das 6 Regras Epistemológicas        │
             │  - Motor de Autocura Cirúrgica (se reprovado)   │
             └────────────────────────┬────────────────────────┘
                                      │
                                      ▼
          [ Simulação Interativa no Viewport + Telemetria em Tempo Real ]
```

---

##  O Veredito de Verificação em 3 Estados

Para garantir honestidade epistemológica e impedir que o sistema declare falsos sucessos, a validação é classificada estritamente em um de 3 estados:

| Estado | Rótulo na Interface | Condição do Motor Simbólico | Tratamento na UI |
| :--- | :--- | :--- | :--- |
| **`verified`** | **Verificado formalmente** | Álgebra simbólica (SymPy) fechou com $\frac{dE}{dt} = 0$, unidades homogêneas (Pint). | Fidelity Score verde (ex: 98%), selo "Física Real", 6 regras com selo **Validado**. |
| **`contradiction`** | **Contradição detectada** | $\frac{dE}{dt} \neq 0$ on-shell, discrepância $\Delta = H_{\text{real}} - E_{\text{declarada}}$, ou erro dimensional. | Fidelity Score vermelho/baixo, alerta de violação, disparo automático do loop de autocura. |
| **`unverifiable`** | **Não verificável automaticamente** | Sistemas puramente estocásticos, discretos, ou sem formulação analítica fechada. | **Fidelity Score cinza/não-computado (`—`), checklist como "Não avaliado on-shell", e as 6 regras marcadas explicitamente como "Não avaliado (Camada simbólica não executada)"**. |

>  **Princípio Anti-Alucinação**: Quando a verificação analítica não pode ser executada numericamente, a plataforma **proíbe terminantemente** a exibição de scores ou checkmarks verdes fictícios.

---

##  As 6 Regras de Rigor Epistemológico

1. **Consistência Dedutiva**: Nenhuma equação é introduzida sem que possa ser formalmente derivada das premissas anteriores.
2. **Rigor Markoviano**: Processos com dependência de memória/histórico não são denominados Markovianos sem explicitar o espaço de estado estendido ($S \times \mathcal{H}_t$).
3. **Demarcação de Estados Discretos vs. Landscape**: Projeções visuais 2D de grafos ou feixes discretos não são tratadas como coordenadas contínuas de um relevo físico real.
4. **Operadores Diferenciais com Domínio Explícito**: Gradientes ($\nabla$), divergências e derivadas em relação à memória só são admitidos com métrica e função objetivo definidas.
5. **Ground Truth Derivável**: Toda grandeza de conservação e telemetria é diretamente computável do modelo formal.
6. **Distinção Tripartite Obrigatória**:
   - **(a) Modelo Matemático Idealizado**: O formalismo teórico contínuo ou exato.
   - **(b) Equações da Implementação**: A discretização numérica ($\Delta t$, integrador, grafo).
   - **(c) Metáfora Visual & Fronteira Epistêmica**: A representação visual demarcando exatamente onde termina a matemática e onde começa a analogia estética.

---

##  Caso de Teste Reproduzível: Pêndulo Quártico Anarmônico

Um teste clássico de estresse epistemológico implementado no sistema:

- **Lagrangiano**:
  $$L = \frac{1}{2}mL^2\dot{\theta}^2 - mgL(1-\cos\theta) + \kappa \left(\frac{mL^2}{\omega_0^2}\right)\dot{\theta}^4$$
- **Hamiltoniano Real (Legendre Transform)**:
  $$H = \dot{\theta}\frac{\partial L}{\partial \dot{\theta}} - L = \frac{1}{2}mL^2\dot{\theta}^2 + mgL(1-\cos\theta) + 3\kappa \left(\frac{mL^2}{\omega_0^2}\right)\dot{\theta}^4 \quad \left(\frac{dH}{dt} = 0\right)$$
- **Erro de Intuição Ingênua**: Declarar $E = \frac{1}{2}mL^2\dot{\theta}^2 + mgL(1-\cos\theta) + \kappa \left(\frac{mL^2}{\omega_0^2}\right)\dot{\theta}^4$ com coeficiente $1\kappa$.
- **Detecção SymPy**: O verificador calcula $\frac{dE}{dt} = -2\kappa\frac{mL^2}{\omega_0^2}\ddot{\theta}\dot{\theta}^3 \neq 0$, aponta a discrepância $\Delta = 2\kappa\frac{mL^2}{\omega_0^2}\dot{\theta}^4$ e emite o veredito **Contradição detectada**.

---

##  Stack Tecnológico

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (framer-motion), KaTeX, Lucide Icons.
- **Backend / Orquestrador**: Node.js, Express, ESBuild, TSX.
- **Motor Simbólico & Dimensional**: Python 3.10+, SymPy 1.14+, Pint 0.24+.
- **Engine de IA**: Google GenAI SDK (`@google/genai`) utilizando `gemini-2.5-pro` e `gemini-2.5-flash` com fallback e retry exponencial.
- **Motor Gráfico**: HTML5 Canvas 2D nativo (zero dependências externas no runtime gráfico para performance máxima a 60 FPS).

---

##  Como Executar Localmente

### 1. Pré-requisitos
- **Node.js 20+** e **npm**.
- **Python 3.10+** com `pip`.
- Chave de API do Gemini (`GEMINI_API_KEY`).

### 2. Instalação das Dependências

```bash
# Dependências Node.js
npm install

# Dependências Python (SymPy & Pint)
pip install sympy pint
```

### 3. Configuração de Ambiente

Crie o arquivo `.env` na raiz do projeto:
```env
GEMINI_API_KEY=sua_chave_gemini_aqui
NODE_ENV=development
```

### 4. Executando em Desenvolvimento

```bash
npm run dev
```
Acesse a aplicação em `http://localhost:3000`.

---

##  Onde e Como Colocar em Produção

Como a aplicação é um híbrido **Node.js (Express/Vite) + Python 3 (SymPy & Pint)** compilado em um serviço único, o método padrão de produção é via **Container Docker**.

### Opção 1: Google Cloud Run (Recomendada / Serverless)

O **Cloud Run** é a plataforma ideal por suportar containers com múltiplos runtimes, escalar até zero quando ocioso, e integrar-se nativamente com a infraestrutura do Google Cloud e Gemini API.

#### Dockerfile de Produção Otimizado:
```dockerfile
# =======================================================
# Estágio 1: Build do Frontend Vite e Backend TypeScript
# =======================================================
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# =======================================================
# Estágio 2: Runner com Node.js + Python 3 (SymPy & Pint)
# =======================================================
FROM node:20-slim AS runner
WORKDIR /app

# Instalação do Python 3 e Pip para o motor de verificação analítica
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instalação das bibliotecas determinísticas de computação algébrica e dimensional
RUN pip3 install --no-cache-dir sympy pint --break-system-packages

ENV NODE_ENV=production
ENV PORT=3000

# Copia as dependências já instaladas no estágio de build (evita reinstalar
# via Bun ou npm no runner)
COPY --from=builder /app/node_modules ./node_modules

# Copia a aplicação compilada e os scripts de auditoria simbólica
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000

# Execução do servidor empacotado em CJS
CMD ["node", "dist/server.cjs"]
```

#### Deploy no Cloud Run via gcloud CLI:
```bash
# Build e Deploy automático no Cloud Run
gcloud run deploy scientific-studio \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --memory 2Gi \
  --cpu 2
```

---

### Opção 2: Render ou Railway (Deploy com 1 Clique)

1. Conecte o repositório GitHub ao **Render** (tipo *Web Service*) ou **Railway**.
2. Selecione a opção **Docker** (ele detectará o `Dockerfile` acima automaticamente).
3. Adicione a variável `GEMINI_API_KEY` na aba de Environment Variables.
4. O build compilará o frontend, instalará o SymPy/Pint no runtime Python e iniciará o servidor na porta 3000.

---

### Opção 3: VPS Linux / Ubuntu Dedicado (Docker Compose ou PM2)

#### Com Docker Compose:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    restart: always
```
Execute:
```bash
docker compose up -d --build
```

#### Com PM2 (Instalação Direta no SO):
```bash
# 1. Instale Node 20 e Python
sudo apt update && sudo apt install -y nodejs npm python3 python3-pip
pip3 install sympy pint

# 2. Build da aplicação
npm install
npm run build

# 3. Execução com PM2
sudo npm install -g pm2
pm2 start dist/server.cjs --name "scientific-studio"
pm2 startup
pm2 save
```

---

## 📖 Documentação Completa

Para aprofundamento nos detalhes matemáticos dos agentes, contratos de interface, álgebra de Euler-Lagrange e especificações das rotas de API, consulte o arquivo [`DOCUMENTATION.md`](DOCUMENTATION.md).
