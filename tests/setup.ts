import { afterEach, beforeEach, vi } from "vitest";

// Enhanced RAF mock that maintains proper timing behavior
let rafId = 0;
const rafCallbacks = new Map<number, FrameRequestCallback>();

Object.defineProperty(window, "requestAnimationFrame", {
    writable: true,
    value: vi.fn((cb: FrameRequestCallback) => {
        const id = ++rafId;
        rafCallbacks.set(id, cb);
        return setTimeout(() => {
            if (rafCallbacks.has(id)) {
                rafCallbacks.delete(id);
                cb(performance.now());
            }
        }, 16); // ~60fps
    }),
});

Object.defineProperty(window, "cancelAnimationFrame", {
    writable: true,
    value: vi.fn((id: number) => {
        rafCallbacks.delete(id);
        clearTimeout(id);
    }),
});

// Enhanced performance mock with more realistic timing
let startTime = 0;
Object.defineProperty(window, "performance", {
    writable: true,
    value: {
        now: vi.fn(() => {
            return startTime + Date.now();
        }),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByType: vi.fn(() => []),
        getEntriesByName: vi.fn(() => []),
    },
});

// Mock ResizeObserver for component tests
Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    })),
});

// Mock IntersectionObserver for component tests
Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    })),
});

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
Object.defineProperty(window, "console", {
    writable: true,
    value: {
        ...originalConsole,
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    },
});

// Global test utilities
export const testUtils = {
    // Advance time and trigger all pending animations
    async advanceTimersAndFlush(ms = 100) {
        vi.advanceTimersByTime(ms);
        await vi.runAllTimersAsync();
        await new Promise((resolve) => setTimeout(resolve, 0));
    },

    // Reset performance timer
    resetPerformanceTimer() {
        startTime = 0;
    },

    // Set performance timer offset
    setPerformanceOffset(offset: number) {
        startTime = offset;
    },

    // Create a mock animatable object
    createMockTarget(initialProps: Record<string, unknown> = {}) {
        return {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            rotation: 0,
            ...initialProps,
        };
    },
};

// Make testUtils globally available (only if not already defined)
if (!globalThis.testUtils) {
    Object.defineProperty(globalThis, "testUtils", {
        value: testUtils,
        writable: false,
        configurable: true,
    });
}

// Reset all mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
    rafCallbacks.clear();
    rafId = 0;
    startTime = 0;
});

// Cleanup after each test
afterEach(() => {
    vi.useRealTimers();
    rafCallbacks.clear();
});
