# Auditoría de la plataforma experimental — 2026-06-10

**Alcance:** flujo completo del participante (registro → consentimiento → runner → debriefing),
backend `/cal/api`, protocolos (`pilot_protocol.md`, `participant_session_protocol.md`,
`experimental_roadmap_v2.md`) y su consistencia con el pipeline analítico (`analysis/`).
**Disparador:** preparación del piloto n=4 y del contacto con universidades.

---

## A. Hallazgo científico crítico — S4 ausente de la sesión vs. contraste H_OBS pre-especificado

**El problema.** El contraste de la hipótesis primaria H_OBS está especificado como
`ΔPIQ(S3,S5) >> ΔPIQ(S1,S4)` (`analysis/h_obs_causal.py`, `LOW_CCI = ["S1","S4"]`).
Pero la secuencia real de la sesión (`TASK_SEQUENCE` en `dashboard/src/api/types.ts`)
administra **solo S1, S2, S3 y S5** (T1–T4). **S4 nunca se presenta a ningún participante**,
por lo que la celda low-CCI del contraste quedaría con la mitad de sus datos faltantes.

**Por qué el dry-run no lo detectó:** `analysis/_data.py:266` fabrica una fila sintética
`("T4b", "S4")` en el fixture ("plus S4 as a probe row") — el pipeline analítico valida
contra datos que el experimento real no producirá.

**Opciones (decisión del IP antes de cualquier recolección de datos):**

1. **Re-especificar el contraste como `{S1, S2}` vs `{S3, S5}`** — S2 tiene CCI=2, igual
   que S4, y ya se administra como T2. Costo de sesión: cero. Requiere documentar la
   re-especificación ANTES del RCT (enmienda al plan de análisis, mismo estándar de
   pre-registro que DT-032). **Recomendada.**
2. Agregar S4 como quinta tarea (~15–20 min más de sesión; el total se acerca al límite
   de 3h30m del criterio go/no-go del piloto).

En cualquier caso: eliminar o condicionar la fila sintética "T4b" del fixture para que el
dry-run refleje el diseño real.

> **RESUELTO (2026-06-10, decisión del IP):** opción 1 — contraste low-CCI re-especificado
> como `{S1, S2}`; fila sintética "T4b"/S4 eliminada del fixture. Enmienda pre-datos
> documentada en `analysis/AMENDMENT_2026-06-10_HOBS_LOWCCI.md`. S4 permanece en el
> benchmark SID (artifact-level) y en `CCI`; solo está ausente de la secuencia de sesión.

## B. Validez — corregidos en esta auditoría

| # | Hallazgo | Severidad | Fix aplicado |
|---|----------|-----------|--------------|
| B1 | **Respuestas del pre-test descartadas.** `PreTest` acumulaba `answers` y nunca las enviaba — el pre-test es covariable del ANCOVA (DT-030). | Crítica | `TaskSequencer` persiste vía `POST /session/{id}/task` con `task='PRETEST'`, `response={answers, score, total}`; captura parcial al expirar el timer. |
| B2 | **Timer policy no implementada.** `TASK_SEQUENCE` declara `durationSecs` pero ninguna fase (tareas, pre-test, TLX) mostraba countdown ni auto-cerraba — violaba la política de timers del protocolo (countdown visible + auto-close + captura parcial). | Crítica | `HeaderTimer` en el header de cada fase temporizada; expiry → captura parcial (tracker / pre-test) → avance automático. El timer se monta cuando el contenido está listo, de modo que la espera de vectorización LLM no consume tiempo de tarea. |
| B3 | **Crash del warm-up en grupo experimental.** El branch genérico experimental renderizaba `TCODashboard` con `trackerRef.current!` nulo (el tracker solo se creaba para fases con `task`; warm-up no tiene) → `TypeError` al cargar datos. El branch dedicado de warm-up era código muerto (inalcanzable). | Crítica | Tracker se inicializa para toda fase con `scenario`; branch muerto eliminado. |
| B4 | **Fuga del single-blind.** El dashboard del participante mostraba `Group: EXPERIMENTAL/CONTROL` y el estrato antes de la sesión — revela la existencia de un grupo de comparación y la asignación. | Crítica | Eliminado del dashboard. El grupo solo se revela en el debriefing (`ResultsView`), como prescribe el protocolo. |
| B5 | **`time_to_first_correction_s` a nivel tarea = tiempo total transcurrido** (`tracker.elapsedMs()`), no el tiempo a la *primera* corrección — contaminaba el proxy NCF de fragmentación de atención (IQR). | Alta | Ahora se envía `min(TTFC)` sobre las correcciones; `undefined` si no hubo. |
| B6 | **Consentimiento sin contenido.** El botón "I consent" no mostraba ningún texto de consentimiento; `consent_form_template.md` estaba **vacío** (1 línea). Bloqueante para cualquier aval de comité de ética universitario. | Crítica | Texto completo embebido en la plataforma (scroll + checkbox "he leído" + botón); template canónico bilingüe escrito (EN para plataforma, ES para sesiones presenciales). |
| B7 | **Pre-screening no aplicado en el registro.** Cualquiera con <2 años o con exposición previa a TCO recibía asignación de grupo y podía ser invitado por error. | Alta | `register` ahora solo asigna grupo/estrato si `years_experience ≥ 2 && !prior_tco_exposure`; el admin ve los campos descalificantes en el listado y no invita. |
| B8 | **Resultados inaccesibles al re-loguearse.** `/me` solo devolvía sesiones invited/in_progress; un participante que cerraba sesión tras completar no podía ver su debriefing ("View results" no hacía nada). | Media | `/me` devuelve la última sesión `completed` como fallback; el dashboard ahora la usa para cargar resultados. |
| B9 | **Pre-test con 5 preguntas** — el protocolo especifica 10. | Media | Completado a 10 (race conditions, credenciales hardcodeadas, N+1, idempotencia, degradación entre releases). |
| B10 | **`create_admin.py` sin validación de email** (higiene DT-028: cuentas con TLD reservado quedan sin poder loguear vía API). | Baja | Valida con el mismo `EmailStr` del API antes de crear. |

## C. Señalados — NO corregidos (decisión o trabajo posterior)

| # | Hallazgo | Recomendación |
|---|----------|---------------|
| C1 | **`accuracy = 1.0 si detected`** en `submit_task` — "detected" significa "envió ≥1 corrección", no "detectó el fault real". El scoring real contra ground truth es post-hoc (`accuracy_scorer.py` / LLM-Judge), pero el campo `accuracy` de la DB y el % del debriefing **sobreestiman**. | Antes del piloto: renombrar la semántica en el debriefing ("corrections submitted", no "accuracy %") o cablear el scorer real. Para H2 el scoring post-hoc contra `GROUND_TRUTH` de cada escenario es obligatorio. |
| C2 | TLX al expirar el timer pierde el formulario parcial (estado interno de `NASATLXForm`). | Aceptable con facilitador presente (lo prompteará antes); revisar en piloto. |
| C3 | Las fases de **desacople** (puzzle espacial) y **briefing** del protocolo no existen en la plataforma — son facilitador-led. Coherente con sesiones acompañadas; si alguna vez se quieren sesiones no facilitadas, hay que digitalizarlas. | Mantener facilitador-led para n=40. |
| C4 | El pre-test envía `correct` en el bundle JS del cliente (un participante técnico podría leerlas). | Riesgo bajo (sesión supervisada por video); si preocupa, mover el scoring al backend. |
| C5 | El loader real de `_data.py` debe exponer la fila PRETEST como covariable para `ancova_all.py` (hoy los datos quedan en `raw_response`). | Tarea de análisis pre-experimento; los datos ya se capturan (B1). |
| C6 | `randomization.assign_group` balancea por estrato pero conviene verificar el comportamiento con el flujo de elegibilidad nuevo en el piloto (cuentas inelegibles ya no consumen cupos de balanceo — correcto). | Verificar conteos en piloto. |

## D. Gates de entrada al piloto (estado actualizado)

| Gate | Estado |
|---|---|
| Plataforma funcional end-to-end (DT-028 F1–2 + DT-036) | ✅ + fixes de esta auditoría |
| Calibración φ (ρ ≥ 0.75) | ✅ GO (DT-021 v2, 2026-06-06) |
| Tests core verdes (DT-031) | ✅ 61 tests |
| Pre-registro H_cross (DT-032) | ✅ commiteado |
| `integrity_checker.py` operativo | Verificar antes de la primera sesión |
| **Decisión H_OBS low-CCI (hallazgo A)** | ✅ Resuelta 2026-06-10 — `{S1,S2}`, enmienda pre-datos commiteada |
| Rúbrica PIQ struct (DT-022) + proxies NCF en UI (DT-026) | Pendientes pre-piloto según roadmap v2 |
