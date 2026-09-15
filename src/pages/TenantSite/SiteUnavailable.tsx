/**
 * The endpoint answers 404 / `TENANCY.SITE.NOT_FOUND` when the hostname is
 * unknown, the site is not published, the tenant is suspended, or a preview
 * token is bad. Those are **deliberately indistinguishable** — a visitor
 * should not be able to learn a company's billing state from an HTTP status —
 * so this page says one thing for all of them.
 *
 * It never falls back to the Finova landing page: a customer who typed a
 * tenant's address should not land on a page selling them lending software.
 */
const SiteUnavailable = () => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
    <h1 className="text-2xl font-semibold text-foreground">This site isn&apos;t available</h1>
    <p className="max-w-md text-sm text-muted-foreground">
      The address you used doesn&apos;t point to a website we can show right now. Please check the
      link and try again.
    </p>
  </main>
);

export default SiteUnavailable;
