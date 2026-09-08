const LIVE_DB_URL = (import.meta.env.VITE_LIVE_DATABASE_URL || '').replace(/\/$/, '');

const headers = {
  'Content-Type': 'application/json'
};

export async function dbFetch<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T | null, error: any }> {
  try {
    const res = await fetch(`${LIVE_DB_URL}/${endpoint.replace(/^\//, '')}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });
    
    if (!res.ok) {
      let errBody: any = {};
      try { errBody = await res.json(); } catch {}
      throw new Error(errBody?.message || `API error: ${res.status}`);
    }
    
    if (options.method === 'HEAD') {
      const countHeader = res.headers.get('content-range');
      const count = countHeader ? parseInt(countHeader.split('/')[1], 10) : 0;
      return { data: count as any, error: null };
    }
    
    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    console.error('Live database fetch error:', error);
    return { data: null, error };
  }
}
