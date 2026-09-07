/**
 * Groq LLM API client for AI Property Intelligence.
 * Reads VITE_GROQ_API_KEY from environment or localStorage.
 */

const STORAGE_KEY = 'ai_groq_api_key';

export function getGroqApiKey(): string {
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (localKey && localKey.trim()) return localKey.trim();

  const envKey = (import.meta as any).env?.VITE_GROQ_API_KEY;
  if (envKey && envKey.trim() && envKey !== 'your_groq_api_key_here') {
    return envKey.trim();
  }

  return '';
}

export function setGroqApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export function isGroqConfigured(): boolean {
  const key = getGroqApiKey();
  return Boolean(key && key.startsWith('gsk_') || (key.length > 20 && key !== 'your_groq_api_key_here'));
}

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

/**
 * Execute chat completion with Groq LLM using LLaMA 3.3 70B Versatile
 */
export async function queryGroqChat(
  messages: GroqChatMessage[],
  options: GroqCompletionOptions = {}
): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('Groq API key is not configured. Please set VITE_GROQ_API_KEY in .env or the UI.');
  }

  const model = options.model || 'llama-3.3-70b-versatile';
  const temperature = options.temperature ?? 0.2;
  const max_tokens = options.maxTokens ?? 2048;

  const payload: any = {
    model,
    messages,
    temperature,
    max_tokens,
  };

  if (options.jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  // Attempt proxy endpoint first, fallback to direct api.groq.com
  let response: Response;
  try {
    response = await fetch('/api/groq/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // If proxy failed, call direct
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    let errorText = '';
    try {
      const errJson = await response.json();
      errorText = errJson?.error?.message || JSON.stringify(errJson);
    } catch {
      errorText = `HTTP ${response.status} ${response.statusText}`;
    }
    throw new Error(`Groq API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  if (!choice?.message?.content) {
    throw new Error('No completion returned from Groq API');
  }

  return choice.message.content;
}
