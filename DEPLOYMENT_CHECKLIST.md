# Deployment Checklist - Prevent Build Failures

## Before Every Deployment

Run these commands in order:

```bash
# 1. Type check (catches TypeScript errors)
npm run type-check

# 2. Lint check (catches code style issues)
npm run lint

# 3. OR run both at once
npm run pre-deploy
```

**Only proceed with deployment if all checks pass!**

## Git Commit & Deploy

```bash
git add .
git commit -m "Your commit message"
git push origin master
```

Vercel auto-deploys on push.

## Common TypeScript Errors

### Type Mismatches
- **Error**: `Argument of type 'X' is not assignable to parameter of type 'Y'`
- **Fix**: Check type definitions in `/lib/types.ts` and ensure matching types

### Missing Properties
- **Error**: `Property 'X' does not exist in type 'Y'`
- **Fix**: Add missing property to interface or use optional chaining

### Object Literal Errors
- **Error**: `Object literal may only specify known properties`
- **Fix**: Check the interface definition and only include defined properties

## Quick Reference

**Type Check Only**: `npm run type-check`
**Full Pre-Deploy Check**: `npm run pre-deploy`
**Local Dev Server**: `npm run dev`

---

**Remember**: TypeScript errors in local dev are the same errors that will fail Vercel builds. Fix them locally first!
