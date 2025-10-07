export type CallbackContext = {
  data?: unknown;
  error?: Error | { message: string };
};

type Callbacks = {
    onRequest?: () => void;
    onSuccess?: (ctx: CallbackContext) => void;
    onError?: (ctx: CallbackContext) => void;
  };
  
  async function callApi(path: string, payload: Record<string, unknown>) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }
  
  export const authClient = {
    signUp: {
      email: async (payload: { email: string; password: string; name?: string; image?: string; callbackURL?: string }, callbacks: Callbacks = {}) => {
        callbacks.onRequest?.();
        try {
          const data = await callApi("/api/auth/signup", payload);
          callbacks.onSuccess?.({ data });
          return { data, error: null };
        } catch (error: unknown) {
          const errorObj = error instanceof Error ? error : { message: 'Unknown error occurred' };
          callbacks.onError?.({ error: errorObj });
          return { data: null, error: errorObj };
        }
      },
    },
    signIn: {
      email: async (payload: { email: string; password: string }, callbacks: Callbacks = {}) => {
        callbacks.onRequest?.();
        try {
          const data = await callApi("/api/auth/signin", payload);
          callbacks.onSuccess?.({ data });
          return { data, error: null };
        } catch (error: unknown) {
          const errorObj = error instanceof Error ? error : { message: 'Unknown error occurred' };
          callbacks.onError?.({ error: errorObj });
          return { data: null, error: errorObj };
        }
      },
    },
    signOut: async (callbacks: Callbacks = {}) => {
      callbacks.onRequest?.();
      try {
        const data = await callApi("/api/auth/signout", {});
        callbacks.onSuccess?.({ data });
        return { data, error: null };
      } catch (error: unknown) {
        const errorObj = error instanceof Error ? error : { message: 'Unknown error occurred' };
        callbacks.onError?.({ error: errorObj });
        return { data: null, error: errorObj };
      }
    },
    social: async ({ provider, callbackURL }: { provider: string; callbackURL?: string }) => {
      window.location.href = `/api/auth/signin/${provider}?callbackURL=${callbackURL || "/dashboard"}`;
    },
};