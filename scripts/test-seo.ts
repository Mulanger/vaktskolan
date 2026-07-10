const baseUrl = (process.env.BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

const canonicalPaths = [
  "/",
  "/vaktarprov",
  "/vaktarprov/vu1-ovningsfragor",
  "/vaktarprov/vu2-ovningsfragor",
  "/vaktarutbildning",
  "/vaktarutbildning/vu1",
  "/vaktarutbildning/vu2",
  "/bli-vaktare",
  "/vaktare-eller-ordningsvakt",
  "/lagstod/envarsgripande",
  "/lagstod/nodvarn-och-nod",
  "/studieteknik",
  "/om-vaktskolan",
  "/redaktionell-policy",
  "/kontakt",
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  if (process.env.EXPECT_PRODUCTION_INDEXING === "true") {
    const canonicalHost = await fetch(`${baseUrl}/`, {
      headers: { "x-forwarded-host": "vaktskolan.se" },
      redirect: "manual",
    });
    assert(
      !canonicalHost.headers.get("x-robots-tag")?.includes("noindex"),
      "Canonical production host must be indexable",
    );

    const previewHost = await fetch(`${baseUrl}/`, {
      headers: { "x-forwarded-host": "vaktskolan-preview.instapods.com" },
      redirect: "manual",
    });
    assert(
      previewHost.headers.get("x-robots-tag")?.includes("noindex"),
      "Non-canonical InstaPods host must be noindex",
    );

    const wwwHost = await fetch(`${baseUrl}/vaktarprov`, {
      headers: { "x-forwarded-host": "www.vaktskolan.se" },
      redirect: "manual",
    });
    assert(wwwHost.status === 308, `www host: expected 308, got ${wwwHost.status}`);
    assert(
      wwwHost.headers.get("location") === "https://vaktskolan.se/vaktarprov",
      "www host: incorrect apex redirect",
    );

    const clerkConfigResponse = await fetch(`${baseUrl}/api/clerk/config`, {
      headers: { "x-forwarded-host": "vaktskolan.se" },
    });
    assert(clerkConfigResponse.status === 200, `Clerk config: expected 200, got ${clerkConfigResponse.status}`);
    const clerkConfig = await clerkConfigResponse.json();
    assert(
      !String(clerkConfig.publishableKey || "").startsWith("pk_test_"),
      "Clerk config must not expose a test publishable key in production",
    );
    assert(
      !String(clerkConfig.frontendApiUrl || "").includes("clerk.accounts.dev"),
      "Clerk config must not use the Clerk development frontend API in production",
    );
    if (clerkConfig.ok) {
      assert(String(clerkConfig.publishableKey || "").startsWith("pk_live_"), "Clerk production config must use pk_live");
      assert(
        String(clerkConfig.frontendApiUrl || "") === "https://clerk.vaktskolan.se",
        "Clerk production config must use the custom frontend API domain",
      );
    }
  }

  const internalPaths = new Set<string>();
  for (const path of canonicalPaths) {
    const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
    assert(response.status === 200, `${path}: expected 200, got ${response.status}`);
    const html = await response.text();
    assert(/<html[^>]+lang="sv"/.test(html), `${path}: missing Swedish lang attribute`);
    assert(/<meta[^>]+name="description"/.test(html), `${path}: missing meta description`);
    assert(/<link[^>]+rel="canonical"/.test(html), `${path}: missing canonical`);
    assert((html.match(/<h1[\s>]/g) || []).length === 1, `${path}: expected exactly one H1`);
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const href = match[1].replaceAll("&amp;", "&");
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
      const url = new URL(href, "https://vaktskolan.se");
      if (url.hostname === "vaktskolan.se" && !url.pathname.startsWith("/_next/")) internalPaths.add(`${url.pathname}${url.search}`);
    }
  }

  for (const path of internalPaths) {
    const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
    assert(response.status < 400 || [307, 308].includes(response.status), `${path}: broken internal link (${response.status})`);
  }

  for (const [path, destination] of [
    ["/landing", "/"],
    ["/quiz-demo", "/vaktarprov/vu1-ovningsfragor"],
    ["/studieteknik.html", "/studieteknik"],
    ["/platform", "/plattform"],
  ] as const) {
    const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
    assert([307, 308].includes(response.status), `${path}: expected redirect, got ${response.status}`);
    assert(new URL(response.headers.get("location") || "", baseUrl).pathname === destination, `${path}: incorrect redirect target`);
  }

  const missing = await fetch(`${baseUrl}/seo-test-does-not-exist`, { redirect: "manual" });
  assert(missing.status === 404, `Unknown route: expected 404, got ${missing.status}`);

  const robots = await fetch(`${baseUrl}/robots.txt`);
  const robotsBody = await robots.text();
  assert(robots.status === 200 && robots.headers.get("content-type")?.includes("text/plain"), "robots.txt is invalid");
  assert(robotsBody.includes("OAI-SearchBot") && robotsBody.includes("GPTBot"), "robots.txt lacks AI crawler policy");

  const sitemap = await fetch(`${baseUrl}/sitemap.xml`);
  const sitemapBody = await sitemap.text();
  assert(sitemap.status === 200 && sitemap.headers.get("content-type")?.includes("xml"), "sitemap.xml is invalid");
  assert(!sitemapBody.includes("/plattform") && !sitemapBody.includes("/integritet"), "sitemap contains noindex routes");

  for (const path of ["/plattform", "/login", "/integritet", "/anvandarvillkor"]) {
    const response = await fetch(`${baseUrl}${path}`);
    const html = await response.text();
    const headerNoIndex = response.headers.get("x-robots-tag")?.includes("noindex");
    const metaNoIndex = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(html);
    assert(headerNoIndex || metaNoIndex, `${path}: missing noindex`);
  }

  console.log(`SEO smoke tests passed for ${canonicalPaths.length} canonical pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
