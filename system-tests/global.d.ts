export {};

declare global {
  interface Window {
    simulateApiFailure?: boolean;
    simulateNetworkLoss?: boolean;
    simulateSessionApiFailure?: boolean;
    simulateLLMFailure?: boolean;
    simulateSessionComplete?: boolean;
    simulateNewDay?: boolean;
  }
}

