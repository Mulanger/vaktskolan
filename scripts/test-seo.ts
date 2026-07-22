import sharp from "sharp";

const baseUrl = (process.env.BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

const canonicalPaths = [
  "/",
  "/plattformen",
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

const trustPaths = new Set(["/plattformen", "/om-vaktskolan", "/redaktionell-policy", "/kontakt"]);

type StructuredNode = Record<string, unknown>;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function structuredDataNodes(html: string): StructuredNode[] {
  const nodes: StructuredNode[] = [];
  for (const match of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    const parsed = JSON.parse(match[1]) as StructuredNode | StructuredNode[];
    nodes.push(...(Array.isArray(parsed) ? parsed : [parsed]));
  }
  return nodes;
}

function hasTimeZone(value: unknown): boolean {
  return typeof value === "string" && /T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(value);
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
  const structuredImages = new Set<string>();
  const seenTitles = new Map<string, string>();
  const seenDescriptions = new Map<string, string>();
  for (const path of canonicalPaths) {
    const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
    assert(response.status === 200, `${path}: expected 200, got ${response.status}`);
    const html = await response.text();
    assert(/<html[^>]+lang="sv"/.test(html), `${path}: missing Swedish lang attribute`);
    assert(/<main[^>]+id="main-content"/.test(html), `${path}: missing main-content landmark`);
    assert((html.match(/<h1[\s>]/g) || []).length === 1, `${path}: expected exactly one H1`);

    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert(title, `${path}: missing title`);
    const previousTitle = seenTitles.get(title);
    assert(!previousTitle, `${path}: duplicate title also used by ${previousTitle}`);
    seenTitles.set(title, path);

    const description = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/)?.[1];
    assert(description, `${path}: missing meta description`);
    const previousDescription = seenDescriptions.get(description);
    assert(!previousDescription, `${path}: duplicate description also used by ${previousDescription}`);
    seenDescriptions.set(description, path);

    const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1];
    assert(canonical, `${path}: missing canonical`);
    const canonicalUrl = new URL(canonical, "https://vaktskolan.se");
    assert(canonicalUrl.pathname === path, `${path}: canonical path is ${canonicalUrl.pathname}`);
    assert(!canonicalUrl.search && !canonicalUrl.hash, `${path}: canonical must not contain query or fragment`);

    const structuredNodes = structuredDataNodes(html);
    if (path === "/") {
      const webSite = structuredNodes.find((node) => node["@type"] === "WebSite");
      const organization = structuredNodes.find((node) => node["@type"] === "Organization");
      assert(webSite?.name === "Vaktskolan", "/: missing WebSite name structured data");
      assert(webSite?.alternateName === "vaktskolan.se", "/: missing WebSite alternateName");
      assert(organization?.email === "kontakt@vaktskolan.se", "/: missing public organization email");
      assert(organization?.logo, "/: missing organization logo");
    } else {
      const breadcrumb = structuredNodes.find((node) => node["@type"] === "BreadcrumbList");
      const breadcrumbItems = breadcrumb?.itemListElement;
      assert(Array.isArray(breadcrumbItems) && breadcrumbItems.length >= 2, `${path}: invalid BreadcrumbList`);

      const expectedType = trustPaths.has(path) ? "WebPage" : "Article";
      const pageNode = structuredNodes.find((node) => node["@type"] === expectedType);
      assert(pageNode, `${path}: missing ${expectedType} structured data`);
      assert(hasTimeZone(pageNode.datePublished), `${path}: datePublished lacks timezone`);
      assert(hasTimeZone(pageNode.dateModified), `${path}: dateModified lacks timezone`);

      if (expectedType === "Article") {
        assert(Array.isArray(pageNode.image) && pageNode.image.length === 3, `${path}: Article must have three image ratios`);
        assert((pageNode.publisher as StructuredNode | undefined)?.name === "Vaktskolan", `${path}: incomplete Article publisher`);
        assert((pageNode.author as StructuredNode | undefined)?.url, `${path}: incomplete Article author`);
        for (const image of pageNode.image as unknown[]) {
          assert(typeof image === "string", `${path}: Article image URL is invalid`);
          structuredImages.add(image);
        }
      }
    }

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
  assert(/User-Agent: \*\s+Allow: \//i.test(robotsBody), "robots.txt does not allow public crawling");
  assert(robotsBody.includes("Sitemap:"), "robots.txt does not advertise the sitemap");

  const sitemap = await fetch(`${baseUrl}/sitemap.xml`);
  const sitemapBody = await sitemap.text();
  assert(sitemap.status === 200 && sitemap.headers.get("content-type")?.includes("xml"), "sitemap.xml is invalid");
  assert(!/<(?:changefreq|priority)>/.test(sitemapBody), "sitemap contains fields Google ignores");
  const sitemapPaths = new Set(
    [...sitemapBody.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname),
  );
  assert(!sitemapPaths.has("/plattform") && !sitemapPaths.has("/integritet"), "sitemap contains noindex routes");
  for (const path of canonicalPaths) {
    assert(sitemapPaths.has(path), `sitemap is missing ${path}`);
  }

  for (const imageUrl of structuredImages) {
    const imagePath = new URL(imageUrl).pathname;
    const response = await fetch(`${baseUrl}${imagePath}`);
    assert(response.status === 200, `${imagePath}: structured image returned ${response.status}`);
    assert(response.headers.get("content-type")?.includes("image/png"), `${imagePath}: invalid image content type`);
    const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
    assert((metadata.width || 0) * (metadata.height || 0) > 50_000, `${imagePath}: image is below 50K pixels`);
  }

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
