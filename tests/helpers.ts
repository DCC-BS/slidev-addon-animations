import { vi } from "vitest";
import type {
    AnimatableObject,
    AnimationTarget,
    EasingFunction,
} from "../types/animation.js";

/**
 * Test helper functions for animation testing
 */

export const createAnimationTarget = (
    target: AnimatableObject,
    steps: Array<{
        properties: AnimatableObject;
        duration?: number;
        delay?: number;
        easing?: EasingFunction;
    }>,
    initialState?: AnimatableObject,
): AnimationTarget => ({
    target,
    steps,
    initialState: initialState || { ...target },
});

export const createMockEasing = (name: string = "mock"): EasingFunction => {
    const easing = vi.fn((t: number) => t); // Linear easing by default
    Object.defineProperty(easing, "name", { value: name });
    return easing;
};

export const expectAnimationToComplete = async (
    animationPromise: Promise<void>,
    timeout: number = 5000,
): Promise<void> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
            () =>
                reject(
                    new Error(`Animation did not complete within ${timeout}ms`),
                ),
            timeout,
        );
    });

    return Promise.race([animationPromise, timeoutPromise]);
};

export const expectValuesNear = (
    actual: Record<string, number>,
    expected: Record<string, number>,
    tolerance: number = 0.01,
): void => {
    for (const [key, expectedValue] of Object.entries(expected)) {
        const actualValue = actual[key];
        if (typeof actualValue !== "number") {
            throw new Error(
                `Expected ${key} to be a number, got ${typeof actualValue}`,
            );
        }

        const diff = Math.abs(actualValue - expectedValue);
        if (diff > tolerance) {
            throw new Error(
                `Expected ${key} to be near ${expectedValue} (±${tolerance}), but got ${actualValue} (diff: ${diff})`,
            );
        }
    }
};

export const createBatchMockTarget = (count: number): AnimatableObject[] => {
    return Array.from({ length: count }, (_, i) => ({
        x: i * 10,
        y: i * 10,
        opacity: 1,
        scale: 1,
        id: `target-${i}`,
    }));
};

export const waitForNextTick = (): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 0));
};

export const waitForAnimationFrame = (): Promise<number> => {
    return new Promise((resolve) => requestAnimationFrame(resolve));
};

/**
 * Advanced time control utilities
 */
export class TimeController {
    private startTime = 0;

    constructor() {
        this.reset();
    }

    reset(): void {
        this.startTime = performance.now();
    }

    advance(ms: number): void {
        vi.advanceTimersByTime(ms);
    }

    async advanceAndFlush(ms: number): Promise<void> {
        this.advance(ms);
        await vi.runAllTimersAsync();
        await waitForNextTick();
    }

    getElapsed(): number {
        return performance.now() - this.startTime;
    }

    async runUntil(
        condition: () => boolean,
        maxTime: number = 5000,
    ): Promise<void> {
        const startTime = this.getElapsed();

        while (!condition() && this.getElapsed() - startTime < maxTime) {
            await this.advanceAndFlush(16); // One frame
        }

        if (!condition()) {
            throw new Error(`Condition not met within ${maxTime}ms`);
        }
    }
}

/**
 * Mock animation targets with realistic properties
 */
export const createMockKonvaNode = (
    props: Partial<AnimatableObject> = {},
): AnimatableObject => ({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    opacity: 1,
    skewX: 0,
    skewY: 0,
    offsetX: 0,
    offsetY: 0,
    width: 100,
    height: 100,
    fill: "#000000",
    stroke: "#000000",
    strokeWidth: 1,
    ...props,
});

export const createMockSvgElement = (
    props: Partial<AnimatableObject> = {},
): AnimatableObject => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    opacity: 1,
    transform: "translate(0, 0) scale(1, 1) rotate(0)",
    fill: "#000000",
    stroke: "#000000",
    "stroke-width": 1,
    ...props,
});

/**
 * Assertion helpers
 */
export const expectPropertiesUpdated = (
    target: AnimatableObject,
    expectedUpdates: Partial<AnimatableObject>,
    tolerance = 0.01,
): void => {
    for (const [key, expectedValue] of Object.entries(expectedUpdates)) {
        const actualValue = target[key];

        if (
            typeof expectedValue === "number" &&
            typeof actualValue === "number"
        ) {
            expectValuesNear(
                { [key]: actualValue },
                { [key]: expectedValue },
                tolerance,
            );
        } else {
            if (actualValue !== expectedValue) {
                throw new Error(
                    `Expected ${key} to be ${expectedValue}, but got ${actualValue}`,
                );
            }
        }
    }
};
