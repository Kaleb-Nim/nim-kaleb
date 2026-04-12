---
phase: 04-ui-preservation-launch-readiness
plan: 03
status: completed
started: 2026-04-12
completed: 2026-04-12
tasks_completed: 2
tasks_total: 2
deviations: 1
---

# Plan 04-03 Summary: Production Deployment

## What Was Built

Deployed the Bun WS server to Alibaba Cloud ECS and connected it to the Vercel production frontend.

### Task 1: Infrastructure Setup (Alibaba Cloud ECS)
- Created VPC (`vpc-t4nj1zotp89vtsuwbg55f`) + VSwitch in ap-southeast-1c
- Security group: ports 22, 80, 443 open
- ECS instance: `ecs.t6-c1m1.large` (1 vCPU, 1GB) running Ubuntu 22.04
- Installed Bun, cloned repo, configured systemd service for auto-restart
- Nginx reverse proxy with Let's Encrypt TLS on `ws.kalebnim.dev`
- Health check: `https://ws.kalebnim.dev/health` → ok

### Task 2: Vercel Production Deploy
- Set `NEXT_PUBLIC_WS_SERVER_URL=wss://ws.kalebnim.dev` on Vercel
- Created `.vercelignore` to exclude ws-server/, tts-server/, .planning/, tests/
- Deployed to production: `https://nim-kaleb.vercel.app`
- Verified `wss://ws.kalebnim.dev` baked into JS bundles

### End-to-End Verification
- Voice pipeline connects successfully: browser → wss://ws.kalebnim.dev → DashScope ASR/LLM/TTS
- Response payloads received correctly
- Known issue deferred: TTS playback quality (overlapping audio, cut-offs, barge-in inconsistency) — tracked separately

## Deviation

- Plan originally specified Railway; changed to Alibaba Cloud ECS (user has $300 free credits, keeps infra on 2 providers instead of 3)

## Key Infrastructure

| Component | URL/ID |
|-----------|--------|
| Production site | https://nim-kaleb.vercel.app |
| WS server | wss://ws.kalebnim.dev |
| ECS instance | ap-southeast-1c, ecs.t6-c1m1.large |
| ECS public IP | 43.106.3.158 |
| VPC | vpc-t4nj1zotp89vtsuwbg55f |
| Security Group | sg-t4nb5c7j84do7mc4dwg1 |
| TLS cert | Let's Encrypt, expires 2026-07-11 (auto-renew via certbot) |

## Commits

| Hash | Message |
|------|---------|
| 71d3c33 | chore: add .vercelignore to exclude ws-server and tts-server from deploy |
