# TENSOR-BASED COGNITIVE OVERSIGHT (TCO)

### A Framework for Human Orchestration of AI-Driven Software Systems

**Author:** Juan Pablo Chancay  
**Version:** v3.0 — Working Paper / Preprint  
**Date:** April 2026  
**License:** [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)

> *This repository constitutes the public registration of the TCO framework and the Natural Cognitive Frontier (NCF) theoretical construct. Deposited for intellectual priority purposes ahead of experimental execution and formal venue submission.*

---

## Abstract

The rapid adoption of AI in software development has shifted human roles from creators to supervisors of increasingly complex, AI-generated systems. This transition introduces a structural cognitive bottleneck — described by practitioners as *"brain fry"* — produced by sustained exposure to high-volume, technically dense outputs that systematically exceed human working memory capacity.

**Tensor-based Cognitive Oversight (TCO)** proposes a fundamentally different model of human-AI interaction: rather than validating raw outputs artifact by artifact, human operators *orchestrate system states* through structured, cognitively efficient representations.

The central theoretical contribution is the **Natural Cognitive Frontier (NCF)**: the level of abstraction at which human cognitive demand is calibrated to human capacity — achievable through natural language policy injection without technical friction.

**Keywords:** cognitive oversight · tensor representation · multi-agent systems · human orchestration · Natural Cognitive Frontier · policy injection · software quality · AI supervision · controlled experiment

---

## The Problem: Cognitive Mismatch in AI Supervision

Current Human-in-the-Loop (HITL) models position humans as output validators operating at the wrong abstraction level:

| Mode | Human Role | Cognitive Cost |
|------|-----------|---------------|
| Traditional HITL | Reviews raw code, logs, configs line by line | Maximum intrinsic + extraneous load → brain fry |
| TCO — NCF | Reads aggregated tensor state, injects natural language policy | Calibrated germane load → active orchestration |

Empirical evidence of the problem:
- 60% decline in refactored code (2020–2024, 211M lines analyzed)
- Code churn doubled in AI-assisted workflows
- METR 2025: 39–44% perception gap — developers felt 20% faster while measuring 19% *slower* in real codebases
- Automation bias documented across clinical, aviation, and software contexts

---

## The TCO Framework

### Six-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 6 — Human Orchestration (NCF)                                │
│  Reads {Ω,Δ,Ρ,Ξ} · Interprets in natural language · Policy P_new   │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 5 — Inference  I: T → {Ω, Δ, Ρ, Ξ}                          │
│  Global state · Trend analysis · Risk detection · Recommendations   │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 4 — Tensor Aggregation  T[d, i, j, k]    ← TCO CORE         │
│  f: {V} → T ∈ ℝⁿˣˢˣᵃˣᵗ   ·   stage × agent × time                 │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 3 — Vectorization  φ: A → V ∈ [0,1]ⁿ                        │
│  V = (v₁...v₁₁) · Normalized · Semantically independent            │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 2 — QA Evaluation (Multi-agent)                              │
│  QA Agent · Security Agent · Perf Agent · Arch Agent               │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 1 — AI Generation                                            │
│  Code Agent · Design Agent · Deploy Agent · Test Agent             │
└─────────────────────────────────────────────────────────────────────┘
         ↑ Policy P_new (upstream — natural language)
         ↓ Artifacts (downstream — machine outputs)
```

### The 11-Dimension Quality Vector  φ: A → V ∈ [0,1]¹¹

| Dim | Pilar | Definition |
|-----|-------|-----------|
| v₁ | `functional_correctness` | Degree to which the artifact fulfills specified functional requirements |
| v₂ | `architectural_alignment` | Coherence with defined architectural patterns and principles |
| v₃ | `scalability_projection` | Projected capacity to grow under incremental load |
| v₄ | `security_risk` ↓ | Level of detected vulnerability (inverted: 1 = no risk) |
| v₅ | `observability_coverage` | Extent of log, metric, and trace coverage |
| v₆ | `testability` | Ease of automated validation |
| v₇ | `maintainability` | Ease of understanding, modifying, and extending |
| v₈ | `technical_debt` ↓ | Accumulation of shortcuts compromising future health (inverted) |
| v₉ | `performance` | Efficiency in resource use and response latency |
| v₁₀ | `confidence` | Certainty level of the QA evaluation |
| v₁₁ | `anomaly_score` ↓ | Deviation from expected historical patterns (inverted) |

### The Cognitive Tensor  T[d, i, j, k]

```
T ∈ ℝⁿ × |S| × |A| × |T_idx|

where:  d  ∈ {1...11}   quality dimension
        i  ∈ S           pipeline stage {design, build, test, deploy}
        j  ∈ A           generating agent
        k  ∈ T_idx       time index
```

### The Inference Layer  I: T → {Ω, Δ, Ρ, Ξ}

| Symbol | Output | Description |
|--------|--------|-------------|
| **Ω** | Global state | `stable` / `warning` / `critical` based on mean tensor score |
| **Δ** | Trend analysis | `T[d,i,j,k] − T[d,i,j,k−1]` — primary early-warning mechanism |
| **Ρ** | Systemic risk | Inter-agent quality conflicts and correlated failures |
| **Ξ** | Recommendations | Prioritized actions ranked by estimated impact ∂Ω/∂action |

### The Natural Cognitive Frontier (NCF)

> The **Natural Cognitive Frontier** is the level of abstraction at which a human agent operates with maximum cognitive efficiency: demand sufficient to activate real judgment, expressible in the human's natural language, without exceeding the capacity of working memory.

TCO maintains the orchestrator at the NCF by:
1. Pre-processing complexity into semantically interpretable state representations (Layers 3–5)
2. Requiring active interpretive judgment as the mechanism of loop closure (Layer 6)
3. Accepting policy responses in natural language — the highest-bandwidth cognitive channel available to humans

---

## Theoretical Grounding

| Theory | Author | TCO Role |
|--------|--------|----------|
| Cognitive Load Theory | Sweller (1988) | Formalizes brain fry; TCO eliminates extraneous load, maximizes germane load |
| Situation Awareness | Endsley (1995) | L1/L2/L3 maps to Vectorization/Tensor/Inference layers |
| Supervisory Control Theory | Sheridan (1992) | Aviation precedent for HITL → orchestrator transition |
| Hybrid Cognitive Alignment | AMR (2025) | Bidirectional human-AI interface formalization |

---

## Research Hypotheses

| H | Hypothesis | Primary Metric |
|---|-----------|----------------|
| **H1** | TCO reduces cognitive load vs. traditional HITL (raw output review) | NASA Raw-TLX score, time-on-task, context switches |
| **H2** | TCO improves supervision decision accuracy | Error detection rate, false positive/negative ratio |
| **H3** | TCO enables greater supervision scalability per operator | Workflows/operator ratio, quality degradation slope |
| **H4** | Tensor inference detects systemic risks before critical thresholds | Lead time to detection, risk prediction AUC |
| **H5** | Natural language policy injection produces higher-quality re-orchestration than direct technical corrections | System quality Δ post-injection, PIQ score |

---

## Experimental Design and Verification Process

### Study Design

**Type:** Between-subjects controlled comparative study, single-blind randomization  
**Participants:** n = 40 software engineers (≥ 2 years code review experience)  
**Sample calculation:** Cohen's d ≥ 0.5, α = 0.05, power = 0.80

| Group | Interface | Correction Mechanism |
|-------|-----------|---------------------|
| Control — Traditional HITL | Raw outputs: code, logs, configs. Standard IDE + terminal. | Direct artifact editing |
| Experimental — TCO | TCO dashboard: vector V, tensor slices, {Ω,Δ,Ρ,Ξ}. | Natural language policy injection |

### The Four Tasks

- **T1 — Error Detection:** Three artifacts with planted faults. Detect, locate, classify severity.
- **T2 — Risk Assessment:** Pipeline in progressive degradation. Assess risk level vs. tensor ground truth.
- **T3 — Deployment Decision:** High-pressure scenario (Ω = warning, active inter-agent conflicts). Proceed / Block / Proceed with restrictions.
- **T4 — Re-orchestration (H5):** Formulate correction. Control: direct code/config edit. Experimental: natural language policy injection.

### The Five Experimental Scenarios

| Scenario | Fault Type | Pilar Affected | Detectable via |
|----------|-----------|----------------|----------------|
| S1 — Auth | SQL injection in auth module | v₄ security_risk, v₁₁ anomaly | Raw: code reading · TCO: red radar + Ρ alert |
| S2 — Arch | Circular dependency (hexagonal violation) | v₂ arch_alignment, v₇ maintainability | Raw: expert knowledge · TCO: tensor slice |
| S3 — Debt | 3-cycle accumulating cyclomatic complexity | v₈ technical_debt, v₃ scalability | Raw: **undetectable** · TCO: Δ trend (H4 test) |
| S4 — Deploy | K8s config disabling Prometheus metrics | v₅ observability, v₉ performance | Raw: full YAML review · TCO: Ξ alert |
| S5 — Conflict | Code agent (stateless) vs. Arch agent (stateful) | v₂ inter-agent diff = 0.41 | Raw: **undetectable in isolation** · TCO only |

> **S3 and S5 are structurally undetectable through individual artifact review.** They require cross-temporal correlation (S3) and simultaneous cross-agent comparison (S5) — both naturally surfaced by the TCO tensor. This asymmetry is the most direct empirical test of TCO's unique detection capability.

### Statistical Analysis Plan

| Hypothesis | Test | Effect Size |
|------------|------|-------------|
| H1–H4 | Mann-Whitney U (two-tailed) | Cohen's d |
| H5 | Linear regression PIQ → Δ_vector | Pearson r + β coefficient |
| All | ANCOVA (control: experience + pre-test score) | Partial η² |
| Multiple comparison | Bonferroni correction (α_eff = 0.01) | Applied uniformly |
| H4 (S3) | ARIMA time series | Lead time Δ in cycles |

### 10-Week Implementation Roadmap

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1–2 | Build | TCO Engine: φ, f₁, I — REST API functional |
| 3 | Build | Simulated pipeline: 4 LLM agents + 5 fault scenarios |
| 4 | Build | Orchestration dashboard (MVP complete) |
| 5 | Pilot | Internal pilot n=4, protocol validation |
| 6 | Calibration | LLM-Judge PIQ calibration (κ ≥ 0.70) |
| 7–8 | Experiment | Full experiment n=40 |
| 9 | Analysis | Statistical analysis |
| 10 | Writing | Results + Discussion |

---

## MVP Architecture

Three decoupled services communicating via REST API:

```
┌──────────────────┬──────────────────┬───────────────────────────────┐
│  COMPONENT A     │  COMPONENT B     │  COMPONENT C                  │
│  Simulated       │  TCO Engine      │  Orchestration                │
│  Pipeline        │  (Core)          │  Dashboard                    │
│                  │                  │                               │
│  4 LLM Agents    │  φ Vectorizer    │  Radar Chart (V)              │
│  1 QA Agent      │  f Aggregator    │  Tensor Heatmap               │
│  5 Scenarios     │  I Inference     │  Inference Panel              │
│  Fault Injector  │  REST API        │  Policy Injection             │
│                  │  TimescaleDB     │  History Log                  │
└──────────────────┴──────────────────┴───────────────────────────────┘
```

**Technology Stack:**
- **Pipeline:** Python 3.11 + LangGraph + Claude API (claude-sonnet-4-6)
- **TCO Engine:** Python 3.11 + FastAPI + TimescaleDB + SonarQube + Bandit
- **Dashboard:** React 18 + Recharts + TailwindCSS
- **Infrastructure:** Docker Compose

**REST API Endpoints:**
```
POST /vector/compute       — φ: Compute V from artifact
GET  /tensor/current       — Get current tensor snapshot T[:,:,:,k_now]
GET  /tensor/slice         — Named tensor slicing for dashboard views
GET  /inference/latest     — I: Get current {Ω, Δ, Ρ, Ξ}
POST /policy/inject        — Receive P_new and re-orchestrate agents
```

---

## Publication Roadmap

| Step | Target | Status |
|------|--------|--------|
| **Preprint** | arXiv cs.HC — establish priority of NCF + TCO framework | In preparation |
| **Workshop paper** | CHI 2027 — framework + experimental design (no data required) | Planned (submission Sep 2026) |
| **Full paper** | EMSE Special Issue "Human-Centered AI for SE" | After Week 10 (with data) |
| **Alternate venue** | FSE 2027 research track / CHI 2027 full paper | Contingency |

### Known Open Gaps (from peer review analysis)

1. **Related Work section** — Needs 15–20 papers in three areas: existing HITL frameworks (HULA/Atlassian, Cummings & Parasuraman), software observability limits, cognitive load in HCI for software
2. **Empirical results** — Experiment designed; not yet executed. Current version is a rigorous proposal. Data collection planned: Weeks 7–8
3. **Format** — Working paper in Markdown; submission requires ACM LaTeX template (CHI/FSE) or IEEEtran (RE)
4. **Discussion section** — Threats to validity are documented (Section 6.6); need integration into a formal Discussion section
5. **Pilot study** — Protocol includes n=4 internal pilot (Week 5); reporting in paper increases methodological credibility

---

## Repository Structure

```
TCO/
├── Documentacion/
│   ├── TCO_Paper_Final_v3.md          # Main working paper
│   ├── Bloqueadores principales.pdf   # Publication gap analysis
│   └── *.docx                         # Supporting documents
├── LICENSE                            # CC BY-NC 4.0
└── README.md                          # This file
```

*MVP source code, experimental datasets, and protocols will be added as they are developed during the 10-week implementation phase.*

---

## Collaboration

This project is seeking collaborators for:

- **Pilot study participants** (Week 5): 4 software engineers for instrument validation
- **Full experiment participants** (Weeks 7–8): 40 software engineers with ≥ 2 years code review experience
- **Expert annotators** (Week 6): 2 independent annotators for PIQ rubric inter-rater reliability

If you are interested in participating or collaborating, please open an issue in this repository.

---

## Citation

If you use or reference this work:

```bibtex
@misc{chancay2026tco,
  title        = {Tensor-Based Cognitive Oversight (TCO): A Framework for
                  Human Orchestration of AI-Driven Software Systems},
  author       = {Chancay, Juan Pablo},
  year         = {2026},
  howpublished = {GitHub preprint. \url{https://github.com/jpcpol/TENSOR-BASED-COGNITIVE-OVERSIGHT-TCO}},
  note         = {Working paper v3.0. CC BY-NC 4.0.}
}
```

---

## License

**Tensor-Based Cognitive Oversight (TCO)** © 2026 Juan Pablo Chancay  
Licensed under [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/).

You are free to share and adapt this material for non-commercial purposes with attribution.  
Commercial use requires explicit written permission from the author.

Contact: <juanpablo.chancay@aural-syncro.com.ar> - <www.aural-syncro.com.ar>