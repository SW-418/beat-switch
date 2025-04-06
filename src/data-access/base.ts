import RetryConfig from "./spotify/retry-config";
const fetch = require('fetch-retry')(global.fetch);

export class BaseApiClient {
  protected baseUrl: string;
  protected headers: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  protected async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    retryPolicy?: RetryConfig
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
      ...retryPolicy,
    });

    console.log(`${options.method} ${endpoint} ${response.status}`);

    // if (!response.ok) {
    //   console.error('API Error:', response.status);
    //   // console.error('API Body:', await response.text());
    //   throw new Error(`API Error: ${response.status} ${response.statusText}`);
    // }

    return response.json();
  }

  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }
}
