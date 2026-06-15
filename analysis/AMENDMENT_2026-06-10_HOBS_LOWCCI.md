# Amendment — H_OBS low-CCI contrast cell: {S1, S4} → {S1, S2}

**Date:** 2026-06-10
**Status:** Pre-data amendment — committed BEFORE any RCT data collection
(no participant session has been run; the pilot n=4 has not started).
**Affects:** `analysis/h_obs_causal.py` (LOW_CCI), `analysis/_data.py`
(synthetic fixture), H_OBS operational prediction wording.

## What changed

The pre-registered contrast for the primary hypothesis H_OBS was:

```
ΔPIQ(S3, S5)  >>  ΔPIQ(S1, S4)        (original)
ΔPIQ(S3, S5)  >>  ΔPIQ(S1, S2)        (amended)
```

`LOW_CCI` in `h_obs_causal.py` changes from `["S1", "S4"]` to `["S1", "S2"]`.
`HIGH_CCI = ["S3", "S5"]` is unchanged. The omnibus mixed ANOVA
(Group × CCI) is unchanged.

## Why

The session design (`TASK_SEQUENCE`, `dashboard/src/api/types.ts`; also
`protocols/participant_session_protocol.md` §2) administers exactly four
scored scenarios: T1=S1, T2=S2, T3=S3, T4=S5. **S4 is never presented to any
participant**, so the original low-CCI cell would have been half-empty in the
real dataset. The inconsistency was masked by a synthetic-only probe row
("T4b"/S4) in the dry-run fixture (`_data.py`), which has been removed in this
amendment so the fixture matches the administered design.

S2 is the natural replacement:

- **Same CCI as S4 (CCI = 2)** per the pre-registered benchmark
  (`Documentacion/CAL_Benchmark_v1.md`; `CCI = {"S1":1, "S4":2, "S2":2,
  "S3":4, "S5":3}`). The contrast's moderator structure is unchanged.
- S2 **is administered** (T2), so the cell is fully populated.
- Zero cost to session duration (no fifth task added).

## What this is not

- It is not a post-hoc change: no human data exists at the date of this
  amendment (φ calibration used artifact corpora, not participants).
- It does not alter the SID/H_cross pre-registration (DT-032), which is
  artifact-level and includes S4 in its 5-scenario ordering — S4 remains in
  the SID benchmark and in `CCI`/`SCENARIOS`; it is only absent from the
  in-session task sequence, as designed.
- The alternative considered (adding S4 as a fifth in-session task) was
  rejected: +15–20 min pushes the session against the 3h30m pilot go/no-go
  ceiling for no added moderator range (S2 already covers CCI=2).

## Provenance

- Detected by: platform/protocol audit 2026-06-10
  (`protocols/platform_audit_2026-06-10.md`, finding A).
- Decision: PI (J.P. Chancay), 2026-06-10, option (1) of the audit.
