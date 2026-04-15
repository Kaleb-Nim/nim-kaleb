---
status: awaiting_human_verify
trigger: "bun dev causes a runtime crash immediately on server start. The websocket server was working before but now crashes before any browser interaction can happen."
created: 2026-04-15T00:00:00Z
updated: 2026-04-15T00:02:00Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: CONFIRMED — LOG_DIR defaults to /var/log/kaleb-voice which requires root on macOS
test: ran ws-server after fix — starts successfully, health check returns 200 ok
expecting: user confirmation that ws-server starts and voice interface connects
next_action: await human verification

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: `bun dev` starts the Next.js dev server successfully, including websocket functionality
actual: Server crashes immediately on start with a runtime error
errors: `EACCES: permission denied, mkdir '/var/log/kaleb-voice'` from ws-server/src/logger.ts:20
reproduction: Run `bun src/index.ts` inside ws-server/
started: Was working before, broke recently (after logger module was added in feat(06-01))

## Eliminated
<!-- APPEND only - prevents re-investigating -->

- hypothesis: Next.js dev server itself crashing (lock file conflict)
  evidence: Port 3000 responds 200, existing process (PID 21926) is healthy — the lock error only occurs when a second instance is launched
  timestamp: 2026-04-15T00:00:30Z

- hypothesis: Recent UI changes (CognitiveStatus, page.tsx) caused the crash
  evidence: git diff HEAD~3 shows only UI component changes — no ws-server code touched in last 3 commits
  timestamp: 2026-04-15T00:00:40Z

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-04-15T00:00:20Z
  checked: bun dev output
  found: `Unable to acquire lock at .next/dev/lock` — another Next.js instance already running on port 3000
  implication: Next.js dev server itself is not the crash source; crash must be in ws-server

- timestamp: 2026-04-15T00:00:50Z
  checked: ws-server/src/logger.ts line 4
  found: `LOG_DIR = process.env.LOG_DIR ?? '/var/log/kaleb-voice'` — hardcoded system path
  implication: On macOS without root, mkdirSync on /var/log/ throws EACCES before server can bind

- timestamp: 2026-04-15T00:01:00Z
  checked: ran `bun src/index.ts` in ws-server/
  found: crash output: `EACCES: permission denied, mkdir '/var/log/kaleb-voice'` at initLogDir()
  implication: Root cause confirmed — LOG_DIR default is unwritable on macOS

- timestamp: 2026-04-15T00:02:00Z
  checked: ws-server start after fix
  found: `[server] listening on port 8080` + `curl /health` returns `ok`
  implication: Fix verified — server starts successfully with new default path

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: ws-server/src/logger.ts defaulted LOG_DIR to '/var/log/kaleb-voice' — a system directory that requires root on macOS. initLogDir() calls mkdirSync() synchronously at startup before the server binds, so the EACCES error crashes the process immediately.
fix: Changed default LOG_DIR from '/var/log/kaleb-voice' to '$HOME/.local/share/kaleb-voice/logs' — a user-writable XDG-style path. LOG_DIR env var still overrides for production deployments.
verification: ws-server starts cleanly, health endpoint returns 200, server binds on port 8080
files_changed: [ws-server/src/logger.ts]
