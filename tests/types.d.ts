/// <reference types="vitest" />
/// <reference types="vitest/globals" />

// Global test utilities type declaration
declare global {
    var testUtils: {
        advanceTimersAndFlush(ms?: number): Promise<void>;
        resetPerformanceTimer(): void;
        setPerformanceOffset(offset: number): void;
        createMockTarget(
            initialProps?: Record<string, unknown>,
        ): Record<string, unknown>;
    };
}

export {};
