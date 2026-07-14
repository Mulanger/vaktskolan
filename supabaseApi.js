(function () {
  const CONFIG_ENDPOINT = "/api/supabase/config";
  const HEALTH_ENDPOINT = "/api/supabase/health";
  const apiState = {
    config: null,
    error: null,
  };
  let accessToken = null;

  function normalizeBaseUrl(url) {
    return String(url || "").replace(/\/+$/, "");
  }

  async function readJsonResponse(response) {
    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  async function loadConfig() {
    if (window.VAKTSKOLAN_SUPABASE_CONFIG) return window.VAKTSKOLAN_SUPABASE_CONFIG;

    const response = await fetch(CONFIG_ENDPOINT, {
      headers: { Accept: "application/json" },
    });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) {
      throw new Error("Supabase config endpoint is not available. Start the app with node server.mjs.");
    }

    const config = await response.json();
    if (!config.url || !config.publishableKey) {
      throw new Error("Supabase config is missing url or publishableKey.");
    }

    return config;
  }

  async function initialize() {
    try {
      const config = await loadConfig();
      apiState.config = {
        url: normalizeBaseUrl(config.url),
        publishableKey: config.publishableKey,
        jwksUrl: config.jwksUrl || "",
      };
      return apiState.config;
    } catch (error) {
      apiState.error = error;
      throw error;
    }
  }

  const ready = initialize();

  function buildRestUrl(path, query = {}) {
    if (!apiState.config) throw new Error("Supabase API is not initialized.");

    const cleanPath = String(path || "").replace(/^\/+/, "");
    const url = new URL(`${apiState.config.url}/rest/v1/${cleanPath}`);
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
    return url;
  }

  async function request(path, options = {}) {
    await ready;

    const method = options.method || "GET";
    const hasBody = Object.prototype.hasOwnProperty.call(options, "body");
    const apiKey = apiState.config.publishableKey;
    const useAccountToken = options.auth !== "public";
    const resolvedAccessToken = useAccountToken
      ? typeof accessToken === "function"
        ? await accessToken()
        : accessToken
      : null;
    const response = await fetch(buildRestUrl(path, options.query), {
      method,
      headers: {
        Accept: "application/json",
        apikey: apiKey,
        Authorization: `Bearer ${resolvedAccessToken || apiKey}`,
        ...(hasBody ? { "Content-Type": "application/json", Prefer: "return=representation" } : {}),
        ...(options.headers || {}),
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });

    const data = await readJsonResponse(response);
    if (!response.ok) {
      const error = new Error(data?.message || `Supabase API request failed with ${response.status}.`);
      error.status = response.status;
      error.details = data;
      throw error;
    }

    return data;
  }

  async function healthCheck() {
    const response = await fetch(HEALTH_ENDPOINT, {
      headers: { Accept: "application/json" },
    });
    const data = await readJsonResponse(response);
    return {
      ok: response.ok && Boolean(data?.ok),
      status: response.status,
      data,
    };
  }

  function select(table, query = {}, options = {}) {
    return request(table, {
      method: "GET",
      query: { select: "*", ...query },
      auth: options.auth,
    });
  }

  function insert(table, rows, options = {}) {
    return request(table, {
      method: "POST",
      query: options.select ? { select: options.select } : {},
      headers: {
        Prefer: options.returning === "minimal" ? "return=minimal" : "return=representation",
      },
      body: Array.isArray(rows) ? rows : [rows],
    });
  }

  function upsert(table, rows, options = {}) {
    const prefer = ["resolution=merge-duplicates"];
    prefer.push(options.returning === "minimal" ? "return=minimal" : "return=representation");

    return request(table, {
      method: "POST",
      query: {
        ...(options.select ? { select: options.select } : {}),
        ...(options.onConflict ? { on_conflict: options.onConflict } : {}),
      },
      headers: { Prefer: prefer.join(",") },
      body: Array.isArray(rows) ? rows : [rows],
    });
  }

  window.vaktskolanSupabase = {
    ready,
    getConfig: () => ready,
    getError: () => apiState.error,
    setAccessToken: (token) => {
      accessToken = token || null;
    },
    healthCheck,
    request,
    select,
    insert,
    upsert,
  };
})();
