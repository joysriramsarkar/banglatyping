1. **Understand**: We need to test the edge case in `generateCustomDrill` from `src/lib/custom-drill-generator.ts` where it immediately returns `null` when passed an empty array of `weakCharacters`. The function logs a warning when this happens.
2. **Design Strategy**: Create a new test file `src/__tests__/custom-drill-generator.test.ts`. This file will test the functions inside `custom-drill-generator.ts`. The project uses `jest`. We will need to test `generateCustomDrill` with an empty array.
3. **Implement**:
   - Mock dependencies (`./db`, `./lessons`) just in case.
   - Spy on `console.warn` to suppress output and verify it's called.
   - Call `generateCustomDrill('user1', [])`.
   - Assert it returns `null` and `console.warn` was called with `'No weak characters found for custom drill generation'`.
4. **Pre-commit**: Complete pre-commit steps.
5. **Submit**: Create PR with the specified 🧪 prefix.
