export interface RetryConfig {
  retryOn?: number[];
  retries?: number;
  retryDelay?: (attempt: number, error: unknown, response: Response) => number;
}

export default RetryConfig;
