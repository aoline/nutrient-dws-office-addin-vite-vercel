# CLAUDE.md — Context Contract (Do Not Handwave)

This repository uses **guardrails + golden contracts + demo mode** so assistants never “invent” APIs or formats.

## Reading order (every session)
1) docs/GUARDRAILS.md   ← non-negotiable rules
2) docs/GOLDEN_CONTRACTS.md  ← canonical requests/responses
3) docs/PHASE_PLAN.md   ← current milestone + definition of done
4) docs/DEMO_MODE.md    ← how to prove work without secrets

If anything you’re about to do conflicts with those docs, **STOP and ask**.

---

## What “good” looks like

- **Never assume. Always verify** against the docs above.
- For any external call, show (or call) the **exact golden contract** (method, URL, headers, body, field names).
- If you touch an interface, update its **example** and **smoke test**.
- Every feature PR must include:
  - Code
  - Docs update (if needed)
  - Acceptance checks (automated when possible)
  - Demo path (works without private tokens)

---

## Change policy

- **Contradiction?** Ask for confirmation before proceeding.
- **Spec drift?** Open a PR *only after* updating the golden examples + tests.
- **Secrets:** Never place secrets in client code or logs. Use env vars in CI/CD or server functions only.

---

## Deliverable template (per PR)

- **What changed:** short human summary
- **Guardrails referenced:** list the rules you had to satisfy
- **Golden contract(s):** paste the exact request/response you implemented
- **Acceptance:** show outputs that meet thresholds (status, content-type, byte size, latency)
- **Demo:** step to run it without external accounts (per docs/DEMO_MODE.md)
- **Tests:** CI green; smoke test passes
