/**
 * Placeholder implementation to satisfy imports during build and deployment.
 * -------------------------------------------------------------------------
 * Some components or pages still reference a utility called `setupTestData`
 * from `app/utils/test-utils.ts`.
 *
 * The original test helpers were removed, so we recreate the file with a
 * no-op export to prevent build-time module-resolution errors.
 *
 * If you need to seed test data in the future, extend the function below
 * with real logic (e.g., Supabase inserts, mock API calls, etc.).
 */

export async function setupTestData(): Promise<void> {
  // Intentionally left blank.
  // Add any test-data-seeding logic here when required.
}
