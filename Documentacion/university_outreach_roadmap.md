# Roadmap — Llegada a universidades para el RCT n=40 (TCO-L2)

**Versión:** 1.0 — 2026-06-10
**Objetivo:** asegurar el canal institucional del experimento: difusión a participantes
elegibles (≥20 de los n=40), aval de comité de ética, y respaldo académico (incl.
posible endorsement de arXiv cs.HC).
**Documentos hermanos:** `protocols/experimental_roadmap_v2.md` (plan experimental),
`protocols/platform_audit_2026-06-10.md` (estado de la plataforma),
`protocols/participant_session_protocol.md` (protocolo de sesión).

---

## 0. Posición de partida (qué tenemos para ofrecer)

| Activo | Estado |
|---|---|
| Pre-paper CAL con DOI citable | ✅ Zenodo 10.5281/zenodo.20430343 (+ v1.4: 10.5281/zenodo.20628125) |
| Working paper TCO-L2 v3.0 + draft LaTeX ACM | ✅ completo |
| Plataforma web del experimento (registro → sesión → debriefing) | ✅ verificada local + auditada 2026-06-10 |
| Instrumento φ calibrado (gate GO) | ✅ DT-021 v2 |
| Protocolo de sesión + piloto + consentimiento informado bilingüe | ✅ |
| Pre-registro de hipótesis (H_cross / SID) commiteado antes del RCT | ✅ DT-032 |
| Resultados downstream que dan contexto (L3 cerrado, L4 mecanismo) | ✅ DOIs por capa |

**La narrativa de venta en una frase:** *"Tenemos un experimento listo para correr —
plataforma, instrumentos calibrados, protocolo pre-registrado y consentimiento — y
buscamos socios académicos para ejecutarlo con estándar institucional; la universidad
aporta participantes y aval ético, y recibe co-autoría/colaboración en un paper
apuntado a CHI 2027."*

---

## 1. Qué pedimos y qué ofrecemos (definirlo antes de cualquier reunión)

### Pedimos (en orden de importancia)

1. **Difusión del llamado** a poblaciones elegibles: estudiantes de posgrado,
   docentes, ayudantes y graduados recientes con ≥2 años de experiencia en code
   review. NO pedimos alumnos de grado sin experiencia (criterio de elegibilidad).
2. **Aval del comité de ética / consentimiento institucional** (o constancia de
   exención). Es el ítem de mayor lead time — iniciarlo en el primer contacto.
3. Opcional: **espacio físico** para sesiones presenciales (laboratorio con PC),
   aunque el protocolo soporta remoto.
4. Opcional pero valioso: **endorsement arXiv cs.HC** de un docente-investigador.

### Ofrecemos

1. **Co-autoría o agradecimiento institucional** en el paper CHI 2027 (a acordar
   según nivel de involucramiento — definir el criterio ANTES de firmar nada:
   contribución intelectual = co-autoría; difusión/logística = acknowledgment).
2. **Charla/seminario abierto** sobre supervisión humana de pipelines multi-agente
   (el vehículo de entrada: dar antes de pedir).
3. **Acceso a la plataforma y al benchmark S1–S5** para docencia/replicación
   (licencias ya compatibles: CC BY-NC docs, AGPL código).
4. **Datos anonimizados open-science** post-estudio (depósito Zenodo/OSF).
5. Para los participantes: acceso anticipado a resultados + acknowledgment opcional.

---

## 2. Fases y calendario

> Restricción dura: la submission CHI 2027 es **septiembre 2026**. Eso obliga a
> correr el RCT entre fines de julio y fines de agosto. El comité de ética es el
> camino crítico (4–8 semanas típicas) → debe entrar en evaluación en junio.
> El calendario académico argentino juega a favor: el 2º cuatrimestre arranca en
> agosto con las poblaciones presentes.

### Fase 0 — Paquete de contacto (semana del 10–16 jun)

Armar el **dossier de 4 piezas** (todo ya existe en borrador o fuente):

| Pieza | Contenido | Fuente |
|---|---|---|
| One-pager (ES, 1 carilla) | Problema, qué se pide, qué se ofrece, contacto, DOI | Destilar de README + este doc |
| Dossier técnico (5–8 pág.) | Protocolo de sesión, criterios de elegibilidad, consentimiento, manejo de datos, pre-registro | `participant_session_protocol.md` + consent template |
| Pre-print | Working paper v3.0 / pre-paper CAL | Ya publicado (DOI) |
| Solicitud de ética | Formulario del comité + protocolo + consentimiento + instrumentos (TLX) | Consent bilingüe ya escrito |

**Gate de salida F0:** dossier completo en PDF, en español, revisado.

### Fase 1 — Mapa de targets y primer contacto (semanas 1–2: 15–28 jun)

Contactar **en paralelo, no en serie** (la latencia institucional domina; 3–5
targets simultáneos):

| Target | Vía de entrada sugerida | Qué tienen |
|---|---|---|
| UBA — FIUBA / FCEyN (Computación) | Cátedras de Ing. de Software / TdP; secretaría de investigación | Posgrados con población elegible grande |
| UTN — FRBA | Cátedras de IS / laboratorios de sistemas | Alumnos-profesionales (mayoría trabaja: ≥2 años reales) |
| UNLP — Facultad de Informática (LIFIA) | LIFIA trabaja HCI/SE — afinidad temática directa | Grupo de investigación que puede co-autorar |
| UNICEN — ISISTAN | Grupo SE/agentes — afinidad con multi-agente | Co-autoría técnica potencial |
| ITBA / UdeSA / Di Tella (Ing./CS) | Contactos de posgrado; charla como vehículo | Maestrías con profesionales |

Plantilla de primer email (estructura, no enviar genérico):
1. Una línea de quién sos + DOI del pre-print (credencial).
2. Una línea del problema (supervisión humana de pipelines de IA — citar que es
   tema CHI/FAccT activo).
3. El pedido concreto y acotado: "difundir un llamado a participantes (sesión
   única de 3h, remota o presencial) + iniciar el trámite de aval ético".
4. La oferta: charla abierta + co-autoría según involucramiento.
5. CTA: reunión de 30 min esta semana o la próxima.

**Gate de salida F1:** ≥2 reuniones agendadas.

### Fase 2 — Reuniones + inicio de trámite de ética (semanas 2–4: 22 jun – 12 jul)

- Reunión de 30 min con el dossier ya enviado. Llevar demo de la plataforma
  (deploy local alcanza; producción no es prerrequisito para esta reunión).
- En la PRIMERA reunión positiva: pedir el formulario del comité de ética y
  someterlo esa misma semana. No esperar al MoU — el trámite corre en paralelo.
- Definir el referente interno (el "champion"): un docente-investigador que
  firme como contraparte del MoU y eventualmente endorsee en arXiv.

**Gate de salida F2:** solicitud de ética PRESENTADA en ≥1 institución + borrador
de MoU circulando.

### Fase 3 — MoU + piloto en paralelo (semanas 4–6: 6–26 jul)

**MoU mínimo (2–3 páginas, no sobre-legalizar):**
1. Objeto: colaboración para el estudio TCO-L2 (referencia al protocolo).
2. Roles: Aural Syncro = diseño, plataforma, análisis; Universidad = difusión,
   aval ético, [espacio físico].
3. Datos: pseudonimización (P001…), grabaciones locales, depósito anonimizado
   post-estudio; titularidad de los datos del estudio: Aural Syncro; la
   universidad puede usarlos para investigación citando la fuente.
4. Autoría: criterio explícito (contribución intelectual vs. logística).
5. No exclusividad (permite firmar con más de una institución) y sin
   compromiso económico de ninguna parte.

**En paralelo (no depende de la universidad):**
- **Piloto n=4** con conocidos sobre deploy local — valida timing, instrumentos
  y los fixes de la auditoría 2026-06-10.
- **DT-028 Fase 3** (deploy producción + SMTP + Postgres) — post-piloto.
- **Decisión H_OBS** (hallazgo A de la auditoría: contraste low-CCI sin S4) —
  documentar la enmienda antes de cualquier dato del RCT.
- Calibración PIQ LLM-Judge (κ ≥ 0.70) con políticas del piloto.

**Gate de salida F3:** MoU firmado (≥1) + aval ético obtenido o con fecha + piloto
go/no-go PASS + plataforma en producción.

### Fase 4 — Reclutamiento (semanas 6–8: 27 jul – 9 ago)

- Llamado por el canal institucional (email de cátedra/posgrado, carteleras) +
  canal online en paralelo (Reddit/Discord/LinkedIn, según
  `participant_session_protocol.md` §1) — target n=40 con **lista de espera 60**.
- Pre-screening de 3 preguntas online; la plataforma ya bloquea inelegibles en
  el registro (auditoría B7).
- Agendado por el admin dashboard (invitaciones por email — requiere SMTP de F3).

**Gate de salida F4:** ≥40 registrados elegibles + ≥50% agendados.

### Fase 5 — Ejecución + análisis (agosto–septiembre)

- Sesiones n=40 (semanas 8–10: 10–30 ago), facilitadas (remoto o lab).
- Análisis sem 11 (sep): pipeline `analysis/` ya validado en dry-run.
- Paper 2 → CHI 2027 (deadline sep 2026). Si el aval ético o el reclutamiento
  se atrasan más de 3 semanas: **plan B declarado** — correr el RCT igual en
  oct-nov y apuntar a FSE/EMSE (el roadmap v2 ya contempla EMSE como full paper),
  manteniendo CHI workshop como vehículo del protocolo + piloto.

---

## 3. Riesgos específicos del canal universitario

| Riesgo | Prob. | Mitigación |
|---|---|---|
| Latencia institucional (semanas para una reunión) | Alta | Contacto paralelo a 3–5 targets; el online channel (n=20) no depende de nadie |
| Comité de ética > 8 semanas | Media | Someter en F2 (no esperar MoU); preguntar por vía de "riesgo mínimo"/exención — estudio conductual no clínico con consentimiento |
| Receso invernal (jul) frena difusión | Alta | F4 arranca con el 2º cuatrimestre (ago); el llamado se deja listo en jul |
| La universidad pide co-autoría sin contribución | Media | Criterio de autoría explícito en el MoU (F3.4) antes de firmar |
| Población elegible escasa (≥2 años code review) | Media | Apuntar a posgrados y UTN (alumnos-profesionales); alumni; el filtro es experiencia, no título |
| Ningún MoU a tiempo | Baja-Media | El RCT NO requiere MoU para existir: el canal online + conocidos + empresas puede llegar a n=40; el MoU agrega aval ético y volumen. La ética puede resolverse con consentimiento robusto + consulta a un comité independiente si hiciera falta para el venue |

---

## 4. Checklist inmediato (esta semana)

- [ ] Redactar one-pager ES (1 carilla) — destilar de este doc + README
- [ ] Exportar dossier técnico a PDF (protocolo + consentimiento + manejo de datos)
- [ ] Lista nominal de 8–10 contactos (nombre, cátedra/lab, email) en los 5 targets
- [ ] Enviar primeros 3 emails (UTN FRBA, UNLP/LIFIA, UBA) — paralelo, no serie
- [ ] Decidir hallazgo A de la auditoría (contraste H_OBS) y documentar la enmienda
- [ ] Agendar piloto n=4 con conocidos (no espera a ninguna universidad)
