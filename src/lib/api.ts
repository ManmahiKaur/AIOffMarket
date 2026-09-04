// Use Vite proxy — Node.js doesn't send sec-fetch-* browser headers that Supabase blocks
const SUPABASE_PROXY = '/api/supabase';

const headers = {
  'Content-Type': 'application/json'
};

export async function supabaseFetch<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T | null, error: any }> {
  try {
    const res = await fetch(`${SUPABASE_PROXY}/rest/v1/${endpoint}`, {
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
    console.error('Supabase fetch error:', error);
    return { data: null, error };
  }
}
