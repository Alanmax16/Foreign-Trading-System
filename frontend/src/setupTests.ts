import '@testing-library/jest-dom';
import type { Config } from 'jest';
import { jest } from '@jest/globals';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock Stripe
const mockStripe = {
    elements: jest.fn(() => ({
        create: jest.fn(),
        getElement: jest.fn(),
    })),
    createPaymentMethod: jest.fn(),
    confirmCardPayment: jest.fn(),
};

(window as any).Stripe = jest.fn(() => mockStripe);

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

global.ResizeObserver = MockResizeObserver;

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
    root: Element | null = null;
    rootMargin: string = "0px";
    thresholds: ReadonlyArray<number> = [0];
    
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}
    
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
}

global.IntersectionObserver = MockIntersectionObserver; 