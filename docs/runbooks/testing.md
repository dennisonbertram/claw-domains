# Testing Runbook

## TDD Workflow

1. **Write failing tests first** — before any implementation code
2. **Run tests** — confirm they fail for the right reason
3. **Implement** — write the minimum code to pass
4. **Run tests** — confirm they pass
5. **Refactor** — clean up while keeping tests green
6. **Commit** — only when all tests pass

## Running Tests

### Contracts (Foundry)
```bash
cd contracts && forge test
```

### Web
```bash
cd web && npm test  # or yarn test / bun test
```

## Test Quality Standards

- **No trivial tests**: Don't test that `1 + 1 === 2`. Tests must verify meaningful behavior.
- **No underspecified tests**: Every test must have clear assertions about expected behavior.
- **Regression tests required**: Every bug fix MUST include a test that would have caught it.
- **Edge cases**: Cover boundary conditions, error cases, and unexpected inputs.
- **Integration tests**: Test system interactions, not just isolated units.

## Pre-Commit Checklist

- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Regression tests added for any bugs fixed
- [ ] No skipped or pending tests without documented reason
