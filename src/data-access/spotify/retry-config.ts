export interface RetryConfig {
  retryOn?: (attempt: number, error: unknown, response: Response) => boolean;
  retries?: number;
  retryDelay?: (attempt: number, error: unknown, response: Response) => number;
}

export default RetryConfig;
