---
quick_id: 260415-h6s
description: Add domain routing for kalebnim.dev
date: 2026-04-15
status: partial — DNS records pending
---

# Quick Task Summary: Add Domain Routing for kalebnim.dev

## What was done

1. **Added `kalebnim.dev` to Vercel project `nim-kaleb`** — domain registered successfully
2. **Added `www.kalebnim.dev` to Vercel project `nim-kaleb`** — domain registered successfully

## DNS Records Required

Your domain uses **Google Cloud DNS** nameservers (`ns-cloud-b*.googledomains.com`). Add these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `kalebnim.dev` | `76.76.21.21` | 300 |
| CNAME | `www` | `cname.vercel-dns.com` | 300 |

**Note:** The existing `ws.kalebnim.dev` A record (→ `43.106.3.158`) is unaffected — these are separate records.

## Verification

After DNS propagation (usually 5-30 minutes):
- `kalebnim.dev` → serves the portfolio
- `www.kalebnim.dev` → redirects to `kalebnim.dev`
- Vercel auto-provisions SSL/TLS certificate

## No code changes required
This task was purely infrastructure configuration (Vercel domain + DNS).
