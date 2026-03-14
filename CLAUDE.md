# Claw Domains — Project Instructions

## Project Overview

Claw Domains is an MVP-stage project with Solidity smart contracts (Foundry) and a web frontend. We prioritize security and best practices but scope for MVP, not enterprise scale.

## Core Development Policies

### Strict TDD (Test-Driven Development)

1. **Tests FIRST**: Write failing tests before writing implementation code. No exceptions.
2. **Meaningful tests only**: No trivial tests (e.g., testing constants, getters that just return). Tests must verify real behavior.
3. **No underspecified tests**: Every test must have clear, specific assertions. "It doesn't crash" is not a test.
4. **Regression tests mandatory**: Every bug fix MUST include a test that reproduces the bug before fixing it.
5. **Tests must pass before committing**: Never commit with failing tests. If tests fail, fix them first.

### Worktree Workflow

1. **Always work in a worktree** for code changes — use `isolation: "worktree"` when spawning code-writing subagents.
2. **Merge to main automatically** when all tests pass.
3. **Read-only tasks** (exploration, research) do NOT need worktrees.

### Bug Handling

1. When a bug is spotted: log it in `docs/logs/engineering.md` with date, category (BUG), and description.
2. Write a regression test that reproduces the bug.
3. Fix the bug.
4. Verify the regression test passes.
5. Create a GitHub issue if it needs tracking or is non-trivial.

### Feature Implementation

1. **Before coding**: Create a plan document in `docs/plans/` with a checklist.
2. **During coding**: Check items off the checklist as you complete them.
3. **After coding**: Update the plans INDEX.md with status.

### Commit Policy

- All tests must pass before any commit.
- Commit messages should be clear and describe the "why".
- Never commit .env files, secrets, or credentials.

## Documentation Requirements

### Indexes

Every folder under `docs/` has an INDEX.md. When creating or meaningfully changing a file in any docs subfolder:
1. Update that folder's INDEX.md to list the file with a short description.
2. If the file content changes significantly, update the INDEX description.

### Logs

- **Engineering Log** (`docs/logs/engineering.md`): Record bugs found, fixes applied, key decisions. Format: `[YYYY-MM-DD] CATEGORY: Description`
- **Observations Log** (`docs/logs/observations.md`): Record patterns noticed, anomalies, things worth watching. Format: `[YYYY-MM-DD] Description — Impact/Priority`
- **Systems Doc** (`docs/logs/systems.md`): Document how systems interact. Update when adding or modifying system interactions.

### Plans

Plans go in `docs/plans/` as markdown files with checklists. Format:
```
# Feature: [Name]
## Goal
[What we're building and why]
## Checklist
- [ ] Step 1
- [ ] Step 2
...
## Notes
[Anything learned during implementation]
```

### GitHub Issues

Create GitHub issues for:
- Non-trivial bugs discovered during development
- Feature requests that emerge during work
- Technical debt that should be tracked

Issues should be clear enough for a remote agent to pick up and work on independently.

## Communication Style

When speaking to the user:
- Use plain language — avoid jargon unless necessary
- Explain how things connect and work together at a high level
- The user manages many things and needs the big picture, not implementation details
- You handle the technical layer; surface only what matters for decisions

## Agent Task Completion

When completing any task, return a **specific, clear response** stating:
1. Exactly what was done
2. What files were created/modified
3. Any follow-up items or concerns

No vague summaries. Be precise.

## Nightly Tasks

Automated agents should check `docs/nightly-tasks.md` for available work. Follow all project policies (TDD, worktree, etc.) when completing nightly tasks.

## Project Structure

```
claw-domains/
├── contracts/          # Solidity smart contracts (Foundry)
├── web/                # Web frontend
├── docs/               # All documentation
│   ├── INDEX.md        # Master doc index
│   ├── research/       # Research findings
│   ├── design/         # Architecture and design
│   ├── explorations/   # Spikes and proof-of-concepts
│   ├── plans/          # Feature plans with checklists
│   ├── logs/           # Engineering, observations, systems logs
│   ├── runbooks/       # Operational guides (testing, deployment)
│   ├── implementation/ # Implementation notes
│   ├── investigations/ # Deep-dive debugging sessions
│   ├── decisions/      # Technical decision records
│   └── nightly-tasks.md
├── CLAUDE.md           # This file — project rules for agents
└── .gitignore
```

## Runbooks

- **Testing**: See `docs/runbooks/testing.md`
- **Deployment**: See `docs/runbooks/deployment.md`

## MVP Scope

We are building an MVP. This means:
- **Do** use security best practices
- **Do** keep code DRY and well-structured
- **Do** write meaningful tests
- **Don't** optimize for enterprise scale
- **Don't** over-engineer abstractions
- **Don't** add features beyond what's needed
