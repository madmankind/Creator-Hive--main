import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Polyfill IntersectionObserver for framer-motion tests
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe() {
    // Immediately invoke callback to simulate in-view
    this.callback([], this as unknown as IntersectionObserver);
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
  root: Element | Document | null = null;
  rootMargin: string = "0px";
  thresholds: ReadonlyArray<number> = [0];
}
(globalThis as any).IntersectionObserver = MockIntersectionObserver as any;


