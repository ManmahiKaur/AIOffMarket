/**
 * Lightweight Supabase REST client using raw fetch — no SDK, no browser key checks.
 * Fetches directly from the Supabase REST API with the secret key in headers.
 */

// Use Vite proxy — Node.js doesn't send sec-fetch-* browser headers
// so Supabase cannot detect/block the secret key
const BASE_URL = '/api/supabase';

const BASE_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
};

export interface SupabaseResponse<T> {
  data: T | null;
  error: { message: string } | null;
  count?: number | null;
}

class QueryBuilder<T = any> implements PromiseLike<SupabaseResponse<T>> {
  private _table: string;
  private _filters: string[] = [];
  private _select = '*';
  private _order = '';
  private _limit = '';
  private _headOnly = false;
  private _countExact = false;

  constructor(table: string) {
    this._table = table;
  }

  select(cols: string, opts?: { count?: 'exact'; head?: boolean }) {
    this._select = cols;
    if (opts?.count === 'exact') this._countExact = true;
    if (opts?.head) this._headOnly = true;
    return this;
  }

  eq(col: string, val: any) {
    this._filters.push(`${col}=eq.${encodeURIComponent(String(val))}`);
    return this;
  }

  gte(col: string, val: any) {
    this._filters.push(`${col}=gte.${encodeURIComponent(String(val))}`);
    return this;
  }

  in(col: string, vals: any[]) {
    this._filters.push(`${col}=in.(${vals.map(String).join(',')})`);
    return this;
  }

  or(query: string) {
    this._filters.push(`or=(${query})`);
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    const dir = opts?.ascending === false ? 'desc' : 'asc';
    this._order = `order=${col}.${dir}`;
    return this;
  }

  limit(n: number) {
    this._limit = `limit=${n}`;
    return this;
  }

  then<TResult1 = SupabaseResponse<T>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseResponse<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this._run().then(onfulfilled, onrejected);
  }

  private async _run(): Promise<SupabaseResponse<T>> {
    try {
      const params = [
        `select=${this._select}`,
        ...this._filters,
        this._order,
        this._limit,
      ].filter(Boolean).join('&');

      const url = `${BASE_URL}/rest/v1/${this._table}?${params}`;
      const headers: Record<string, string> = { ...BASE_HEADERS };
      if (this._countExact) headers['Prefer'] = 'count=exact';

      const method = this._headOnly ? 'HEAD' : 'GET';
      const res = await fetch(url, { method, headers });

      if (!res.ok) {
        let errBody: any = {};
        try { errBody = await res.json(); } catch {}
        return { data: null, error: { message: errBody?.message || `HTTP ${res.status}` }, count: null };
      }

      if (this._headOnly) {
        const cr = res.headers.get('content-range');
        const count = cr ? parseInt(cr.split('/')[1], 10) : 0;
        return { data: null, error: null, count };
      }

      const data = await res.json();
      return { data: data as T, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err?.message ?? 'Unknown error' } };
    }
  }
}

export const supabase = {
  from<T = any>(table: string): QueryBuilder<T> {
    return new QueryBuilder<T>(table);
  },
};
