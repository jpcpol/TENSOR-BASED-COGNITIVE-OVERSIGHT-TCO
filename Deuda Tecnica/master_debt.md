# TCO — Deuda Técnica

Registro de decisiones diferidas, simplificaciones del MVP y trabajo pendiente
que deberá abordarse antes de la submission final o el experimento completo.

---

## Resumen de Estado

| ID | Descripción breve | Categoría | Estado |
| -- | ----------------- | --------- | ------ |
| DT-001 | Instalar entornos de dependencias | Crítica | Pendiente |
| DT-002 | Implementar `vectorizer.py` | Crítica | Implementado |
| DT-003 | Implementar prompt del QA Agent | Crítica | Implementado |
| DT-004 | Implementar `ControlGroupViewer.tsx` | Crítica | Decisión Tomada |
| DT-005 | Definir warm-up pipeline | Importante | Pendiente |
| DT-006 | Implementar `policy_processor.py` | Importante | Decisión Tomada |
| DT-007 | Protocolo de reclutamiento n=40 | Importante | Decisión Tomada |
| DT-008 | Migración a TimescaleDB | Importante | Decisión Tomada |
| DT-009 | `tsconfig.json` y `vite.config.ts` | Importante | Pendiente |
| DT-010 | Dashboard Dockerfile multi-stage | Recomendado | Pendiente |
| DT-011 | `kappa_validator.py` para PIQ | Recomendado | Pendiente |
| DT-012 | Scripts de análisis estadístico | Recomendado | Pendiente |
| DT-013 | `integrity_checker.py` pre-sesión | Recomendado | Pendiente |
| DT-014 | Protocolo de consentimiento informado | Recomendado | Pendiente |
| DT-015 | Sección Related Work del paper | Recomendado | Pendiente |
| DT-016 | Adaptar paper a formato LaTeX/ACM | Recomendado | Implementado |
| DT-017 | Implementar ArtifactCache (Redis) | Recomendado | Decisión Tomada |

**Estados:**
`Pendiente` · `En Progreso` · `Decisión Tomada` · `Implementado` · `Desechado`

---

## CRÍTICA — Bloquea el experimento

### DT-001 · Instalar y configurar entornos de dependencias

**Componente:** Todos  
**Estado:** Pendiente  
**Descripción:** Ningún paquete del stack está instalado en el entorno local. Requiere:

- `src/tco_engine/`: `pip install -r requirements.txt` en virtualenv Python 3.11
- `src/pipeline/`: `pip install -r requirements.txt` en virtualenv Python 3.11
- `analysis/`: `pip install -r requirements.txt` en virtualenv Python 3.11
- `src/dashboard/`: `npm install` con Node ≥ 20

**Impacto si no se resuelve:** Nada del stack ejecuta.

---

### DT-002 · Implementar el cuerpo de `vectorizer.py`

**Componente:** `src/tco_engine/core/vectorizer.py`  
**Estado:** Implementado — vectorizer.py completo con integración radon/bandit/LLM-QA, consensus, anomaly Z-score, ArtifactCache. Shared evaluator en `src/tco_engine/core/qa_evaluator.py`.  
**Descripción:** El vectorizador φ es el componente de mayor complejidad del engine. Requiere:

1. Integración con `radon_runner.py` para v₆ (testability), v₇ (maintainability), v₈ (technical_debt)
2. Integración con `bandit_runner.py` para v₄ (security_risk)
3. Prompt de QA LLM para v₁, v₂, v₃, v₉ con structured output via Pydantic
4. Implementación de `_compute_consensus()` entre static analysis y LLM-QA (v₁₀)
5. Implementación de `_compute_anomaly()` con Z-score vs baseline histórico (v₁₁)
6. Validación post-implementación: Spearman ρ ≥ 0.75 entre output LLM y ground truth estático para v₄, v₆, v₇, v₈

**Prioridad:** Semanas 1-2 (ruta crítica — todo lo demás depende de este módulo).

---

### DT-003 · Implementar el prompt del QA Agent

**Componente:** `src/pipeline/agents/qa_agent.py`  
**Estado:** Implementado — prompt con 3 few-shot examples (clean code, SQL injection, circular dep YAML), structured output via tool_use, EvaluationMetrics Pydantic model, confidence_self_assessment, neutral fallback.  
**Descripción:** El QA Agent es el origen del vector. Su prompt template determina la calidad de φ. Necesita:

- Structured output con Pydantic mapeando directamente a los 11 pillars
- Instrucciones explícitas sobre las dimensiones invertidas (v₄, v₈, v₁₁)
- Few-shot examples para cada pilar con casos buenos y malos calibrados
- Validación contra los 5 escenarios de fault injection antes del piloto

**Riesgo asociado:** Si el QA Agent es inconsistente, contamina simultáneamente el instrumento del experimento y la variable dependiente. Dependency: DT-002.

---

### DT-004 · Implementar la interfaz del grupo control (ControlGroupViewer)

**Componente:** `src/dashboard/src/experiment/ControlGroupViewer.tsx`  
**Estado:** Decisión Tomada — especificada en paper Sección 6.1.1, archivo creado, implementación pendiente  
**Descripción:** La interfaz del grupo control debe ser tan estandarizada como el dashboard TCO. Requiere:

- Multi-tab viewer: código Python, YAML, markdown de arquitectura, logs CI/CD
- Corrección form: textarea + severity dropdown (Low/Medium/High)
- Mismo timer visible y dimensiones de layout que el TCO dashboard
- Sin capacidad de edición directa de artefactos

**Impacto si no se resuelve:** La comparación entre grupos invalida los resultados del experimento.

---

## IMPORTANTE — Baja el score metodológico si falta

### DT-005 · Definir y documentar el warm-up pipeline

**Componente:** `src/pipeline/`, `protocols/participant_session_protocol.md`  
**Estado:** Pendiente  
**Descripción:** El protocolo menciona "practice task on a separate warm-up pipeline" pero el pipeline de warm-up no está definido. Debe ser:

- Un microservicio simple sin faults inyectados
- Suficientemente representativo para que el participante entienda la interfaz
- Idéntico para ambos grupos (solo cambia la representación: código raw vs vector)
- Suficientemente distinto de los 5 escenarios del experimento para evitar aprendizaje

---

### DT-006 · Implementar el policy_processor.py

**Componente:** `src/tco_engine/core/policy_processor.py`  
**Estado:** Decisión Tomada — arquitectura structured extraction híbrida documentada en paper Sección 7.3  
**Descripción:** El procesador de políticas implementa `PolicyIntent` dataclass + extracción LLM + fallback a direct injection si confidence < 0.70.

El flujo es:

1. Recibe `policy_text` (NL) + `tensor_state` (contexto actual)
2. LLM extrae struct: `{target_agents[], action_type, affected_dimensions[], priority, constraint}`
3. El struct se serializa como un patch del system prompt de cada agente afectado
4. El struct se loggea completo para H5 scoring (PIQ puede evaluarse sobre el struct, no solo sobre el texto NL)

**Fallback:** Si extraction confidence < 0.70, inyección directa del texto NL al system prompt del agente.

---

### DT-007 · Protocolo de reclutamiento de participantes (n=40)

**Componente:** `protocols/participant_session_protocol.md`  
**Estado:** Decisión Tomada — estrategia documentada en `protocols/participant_session_protocol.md`  
**Descripción:** Mix n=20 online (Reddit, Discord, LinkedIn) + n=20 local (universidad/empresa). Pre-screening de 3 preguntas. Incentivo no monetario (acceso anticipado a resultados).

---

### DT-008 · Migración a TimescaleDB (upgrade path)

**Componente:** `src/tco_engine/db/`  
**Estado:** Decisión Tomada — PostgreSQL 16 para MVP, upgrade path documentado  
**Descripción:** El MVP usa PostgreSQL 16 con índices estándar. Migración no-destructiva disponible:

```sql
SELECT create_hypertable('evaluation_vectors', 'created_at');
```

**Cuándo hacerlo:** Antes de las Semanas 7-8 (full experiment), no antes.

---

### DT-009 · Configurar `tsconfig.json` y `vite.config.ts` del dashboard

**Componente:** `src/dashboard/`  
**Estado:** Pendiente  
**Descripción:** Configurar TypeScript strict mode y Vite para el dashboard React. Incluye:

- `tsconfig.json`: strict: true, target ES2022
- `vite.config.ts`: plugin React, proxy a `http://localhost:8000` para desarrollo local
- `tailwind.config.js`: configuración de purge paths

---

## RECOMENDADO — Eleva la calidad del paper y la reproducibilidad

### DT-010 · Dashboard Dockerfile multi-stage

**Componente:** `src/dashboard/Dockerfile`  
**Estado:** Pendiente  
**Descripción:** Multi-stage build: stage 1 compila el React, stage 2 sirve con nginx.

---

### DT-011 · Implementar `kappa_validator.py` para PIQ

**Componente:** `src/experiment/piq_evaluation/kappa_validator.py`  
**Estado:** Pendiente  
**Descripción:** Script que calcula Cohen's κ entre:

- Anotador humano 1 vs Anotador humano 2 (inter-rater)
- LLM-Judge vs Anotador humano (calibración Week 6)

Threshold: κ ≥ 0.70 por dimensión antes de usar el LLM-Judge en el experimento completo.

---

### DT-012 · Implementar scripts de análisis estadístico

**Componente:** `analysis/`  
**Estado:** Pendiente  
**Descripción:** Los 8 scripts de análisis son el producto de Semana 9. Son dependientes de los datos del experimento. Sin embargo, el esqueleto de cada script (imports, función stub con los parámetros esperados) debe estar listo en Semana 4 para validar que los datos se están capturando en el formato correcto.

---

### DT-013 · `integrity_checker.py` pre-sesión

**Componente:** `src/experiment/data_pipeline/integrity_checker.py`  
**Estado:** Pendiente  
**Descripción:** Script que valida automáticamente antes de cada sesión experimental:

1. S3 pre-loaded cycles presentes en DB con vector delta correcto (v₈: 0.68→0.44)
2. Todos los escenarios tienen ground truth documentado
3. Participant_id no tiene sesiones previas en la DB
4. QA agent responde correctamente al health check

---

### DT-014 · Protocolo de consentimiento informado

**Componente:** `src/experiment/participant_manager/consent/consent_form_template.md`  
**Estado:** Pendiente  
**Descripción:** Necesario para publicación en CHI/EMSE. Debe incluir:

- Descripción del estudio (single-blind: "evaluación de dos interfaces de supervisión")
- Uso de datos (anonimización, almacenamiento, publicación)
- Derecho a retiro en cualquier momento
- Información de contacto del investigador principal

---

### DT-015 · Sección Related Work del paper

**Componente:** `Documentacion/TCO_Paper_Final_v3.md`  
**Estado:** Pendiente — bloqueador 1 para publicación  
**Descripción:** Requiere revisión de 15-20 papers en tres áreas:

- Frameworks HITL existentes: HULA (Atlassian/arXiv:2411.12924), trabajos de Cummings y Parasuraman en supervisión de autonomía
- Herramientas de observabilidad (Datadog, New Relic) y sus límites cognitivos
- Cognitive load en HCI de software

**Cuándo:** Puede hacerse en paralelo con Semanas 1-2 de implementación.

---

### DT-016 · Adaptación del paper a formato LaTeX (ACM template)

**Componente:** `Documentacion/TCO_LaTeX/`  
**Estado:** Implementado — main.tex (ACM manuscript class, 11 secciones completas, tablas booktabs, fórmulas LaTeX) + references.bib (30 entradas BibTeX). Pendiente: figuras vectoriales y venue-specific class swap antes de submission.  
**Descripción:** El Markdown es el documento de trabajo. Antes de cualquier submission, adaptar al template ACM para CHI/FSE o IEEEtran para RE. Requiere: figuras vectoriales, numeración de tablas, bibliografía en BibTeX, formato de autores según venue.

---

### DT-017 · Implementar ArtifactCache (Redis hash cache)

**Componente:** `src/tco_engine/core/vectorizer.py`, `src/tco_engine/db/models.py`  
**Estado:** Decisión Tomada — diseñada en paper Sección 7.3 y `.env.example`  
**Descripción:** Cache Redis keyed por SHA-256 del contenido del artefacto. Si el mismo código ya fue evaluado, retorna el vector cacheado sin llamar al LLM ni a radon/bandit. Estimación de reducción de costos API: 40–60%. TTL: sin TTL para artifact hash (determinista), 30s para tensor snapshot.

---

*Última actualización: Abril 2026*  
*Próxima revisión: al completar Semana 2 del roadmap*
