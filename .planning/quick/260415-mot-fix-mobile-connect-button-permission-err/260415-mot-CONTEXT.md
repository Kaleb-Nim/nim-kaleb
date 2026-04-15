# Quick Task 260415-mot: Fix mobile Connect button permission error - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Task Boundary

Fix mobile "Connect" button failing with: "The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission."

Error occurs immediately on tap across multiple mobile browsers (iOS Safari, iOS Chrome, Android Chrome) with no permission prompt appearing.

</domain>

<decisions>
## Implementation Decisions

### Error Source
- Affects multiple mobile browsers — not browser-specific, likely a platform/API-level issue
- Error fires immediately on tap with no mic permission prompt appearing at all

### Error Timing
- No permission dialog is shown — the browser blocks getUserMedia before prompting
- Points to: Permissions-Policy header, lost user gesture in async chain, or suspended AudioContext

### Error UX
- Show inline error message in the terminal with clear guidance (e.g. "Enable microphone in browser settings")
- Do not add text chat fallback — just fix the bug and improve error messaging

### Claude's Discretion
- Implementation approach for fixing the root cause (Permissions-Policy, AudioContext resume, gesture propagation)
- Specific error message wording

</decisions>

<specifics>
## Specific Ideas

- Check Next.js/Vercel Permissions-Policy headers for `microphone` allowance
- Ensure AudioContext.resume() is called within the user gesture handler on mobile
- Consider moving getUserMedia call to be more direct from the click handler
- Add mobile-specific error detection and user-friendly messages

</specifics>
