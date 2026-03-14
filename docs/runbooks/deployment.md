# Deployment Runbook

## Pre-Deploy Checklist

- [ ] All tests passing locally
- [ ] No hardcoded localhost URLs in `src/`
- [ ] No dev API keys or test credentials in code
- [ ] All `process.env.*` references verified against deployment config
- [ ] Build succeeds locally
- [ ] Changes committed AND pushed (commit without push = no deploy)

## Deployment Steps

*TBD — will be filled in once deployment target is chosen.*

## Post-Deploy Verification

- [ ] Verify NEW content/changes are live (not cached old version)
- [ ] Check deployed commit hash matches what was pushed
- [ ] Test critical user paths manually
- [ ] Check for console errors in production

## Rollback Procedure

*TBD — will be filled in once deployment target is chosen.*
