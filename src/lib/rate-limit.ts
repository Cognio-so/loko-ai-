type RateLimitOptions = {
  uniqueTokenPerInterval: number;
  interval: number;
};

type TokenState = {
  count: number;
  resetAt: number;
};

const stores = new Map<string, Map<string, TokenState>>();

function getStore(options: RateLimitOptions) {
  const key = `${options.uniqueTokenPerInterval}:${options.interval}`;
  let store = stores.get(key);

  if (!store) {
    store = new Map<string, TokenState>();
    stores.set(key, store);
  }

  return store;
}

export function RateLimiter(options: RateLimitOptions) {
  const tokenCache = getStore(options);

  return {
    check: (res: Response, limit: number, token: string) => {
      const now = Date.now();
      const existing = tokenCache.get(token);
      const state =
        existing && existing.resetAt > now
          ? existing
          : { count: 0, resetAt: now + options.interval };

      state.count += 1;
      tokenCache.set(token, state);

      if (tokenCache.size > options.uniqueTokenPerInterval) {
        const oldestToken = tokenCache.keys().next().value;
        if (oldestToken) tokenCache.delete(oldestToken);
      }

      const remaining = Math.max(0, limit - state.count);

      res.headers.set("X-RateLimit-Limit", String(limit));
      res.headers.set("X-RateLimit-Remaining", String(remaining));
      res.headers.set("X-RateLimit-Reset", String(Math.ceil(state.resetAt / 1000)));

      return state.count <= limit;
    },
  };
}
