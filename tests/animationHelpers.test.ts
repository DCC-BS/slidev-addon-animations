import { beforeEach, describe, expect, it } from "vitest";
import type { AnimatableObject, AnimationTarget } from "../types/animation.js";
import {
    applyStepEndState,
    applyStepsUpTo,
    calculateTotalSteps,
    createAnimationStep,
    createAnimationTarget,
    initializeTargets,
} from "../utils/animationHelpers.js";

describe("animationHelpers", () => {
    let mockTarget: AnimatableObject;
    let initialState: AnimatableObject;
    let animationTarget: AnimationTarget;

    beforeEach(() => {
        mockTarget = { x: 50, y: 100, opacity: 0.5 };
        initialState = { x: 0, y: 0, opacity: 1 };
        animationTarget = {
            target: mockTarget,
            initialState,
            steps: [
                { properties: { x: 100, y: 50 } },
                { properties: { opacity: 0.5 } },
                { properties: { x: 200, y: 200, opacity: 0 } },
            ],
        };
    });

    describe("createAnimationStep", () => {
        it("should create an animation step with properties only", () => {
            const step = createAnimationStep({ x: 100, y: 50 });

            expect(step.properties).toEqual({ x: 100, y: 50 });
            expect(step.duration).toBeUndefined();
            expect(step.easing).toBeUndefined();
            expect(step.delay).toBeUndefined();
        });

        it("should create an animation step with all options", () => {
            const mockEasing = (t: number) => t * t;
            const step = createAnimationStep(
                { x: 100, y: 50 },
                { duration: 1000, delay: 500, easing: mockEasing },
            );

            expect(step.properties).toEqual({ x: 100, y: 50 });
            expect(step.duration).toBe(1000);
            expect(step.delay).toBe(500);
            expect(step.easing).toBe(mockEasing);
        });

        it("should create step with partial options", () => {
            const step = createAnimationStep({ x: 100 }, { duration: 500 });

            expect(step.duration).toBe(500);
            expect(step.easing).toBeUndefined();
            expect(step.delay).toBeUndefined();
        });
    });

    describe("createAnimationTarget", () => {
        it("should create an animation target", () => {
            const target = { x: 0, y: 0 };
            const initialState = { x: 0, y: 0 };
            const steps = [{ properties: { x: 100 } }];

            const animTarget = createAnimationTarget(
                target,
                initialState,
                steps,
            );

            expect(animTarget.target).toBe(target);
            expect(animTarget.initialState).toBe(initialState);
            expect(animTarget.steps).toBe(steps);
        });
    });

    describe("initializeTargets", () => {
        it("should reset all targets to their initial states", () => {
            // Target starts with modified values
            expect(mockTarget.x).toBe(50);
            expect(mockTarget.y).toBe(100);
            expect(mockTarget.opacity).toBe(0.5);

            initializeTargets([animationTarget]);

            // Should be reset to initial state
            expect(mockTarget.x).toBe(0);
            expect(mockTarget.y).toBe(0);
            expect(mockTarget.opacity).toBe(1);
        });

        it("should handle multiple targets", () => {
            const target2 = { scale: 2 };
            const animTarget2 = createAnimationTarget(target2, { scale: 1 }, [
                { properties: { scale: 3 } },
            ]);

            initializeTargets([animationTarget, animTarget2]);

            expect(mockTarget.x).toBe(0);
            expect(target2.scale).toBe(1);
        });

        it("should handle empty targets array", () => {
            expect(() => initializeTargets([])).not.toThrow();
        });
    });

    describe("applyStepEndState", () => {
        beforeEach(() => {
            // Reset to initial state
            Object.assign(mockTarget, initialState);
        });

        it("should apply the end state of a specific step", () => {
            applyStepEndState([animationTarget], 0);

            expect(mockTarget.x).toBe(100);
            expect(mockTarget.y).toBe(50);
            expect(mockTarget.opacity).toBe(1); // unchanged from step 0
        });

        it("should apply step 1 properties", () => {
            applyStepEndState([animationTarget], 1);

            expect(mockTarget.x).toBe(0); // unchanged from step 1
            expect(mockTarget.y).toBe(0); // unchanged from step 1
            expect(mockTarget.opacity).toBe(0.5);
        });

        it("should handle step index out of bounds", () => {
            const originalState = { ...mockTarget };
            applyStepEndState([animationTarget], 10);

            // Target should remain unchanged
            expect(mockTarget).toEqual(originalState);
        });

        it("should handle multiple targets", () => {
            const target2 = { scale: 1 };
            const animTarget2 = createAnimationTarget(target2, { scale: 1 }, [
                { properties: { scale: 2 } },
            ]);

            applyStepEndState([animationTarget, animTarget2], 0);

            expect(mockTarget.x).toBe(100);
            expect(target2.scale).toBe(2);
        });
    });

    describe("applyStepsUpTo", () => {
        beforeEach(() => {
            // Reset to initial state
            Object.assign(mockTarget, initialState);
        });

        it("should apply all steps up to the specified index", () => {
            applyStepsUpTo([animationTarget], 0, 2);

            // Should have applied steps 0, 1, and 2
            expect(mockTarget.x).toBe(200); // from step 2
            expect(mockTarget.y).toBe(200); // from step 2
            expect(mockTarget.opacity).toBe(0); // from step 2
        });

        it("should apply steps from specific start index", () => {
            // First apply step 0
            applyStepEndState([animationTarget], 0);
            expect(mockTarget.x).toBe(100);

            // Then apply from step 1 to 2
            applyStepsUpTo([animationTarget], 1, 2);

            expect(mockTarget.x).toBe(200); // overwritten by step 2
            expect(mockTarget.opacity).toBe(0); // from step 2
        });

        it("should handle single step application", () => {
            applyStepsUpTo([animationTarget], 1, 1);

            expect(mockTarget.x).toBe(0); // unchanged
            expect(mockTarget.opacity).toBe(0.5); // from step 1
        });

        it("should handle negative start index", () => {
            applyStepsUpTo([animationTarget], -1, 1);

            // Should start from step 0
            expect(mockTarget.x).toBe(100); // from step 0
            expect(mockTarget.opacity).toBe(0.5); // from step 1
        });

        it("should handle fromStep greater than toStep", () => {
            const originalState = { ...mockTarget };
            applyStepsUpTo([animationTarget], 2, 1);

            // Should not apply any steps
            expect(mockTarget).toEqual(originalState);
        });
    });

    describe("calculateTotalSteps", () => {
        it("should return the maximum number of steps across all targets", () => {
            const target2 = createAnimationTarget({ scale: 1 }, { scale: 1 }, [
                { properties: { scale: 2 } },
                { properties: { scale: 3 } },
                { properties: { scale: 4 } },
                { properties: { scale: 5 } },
            ]);

            const totalSteps = calculateTotalSteps([animationTarget, target2]);

            expect(totalSteps).toBe(4); // target2 has 4 steps, animationTarget has 3
        });

        it("should return 0 for empty targets array", () => {
            expect(calculateTotalSteps([])).toBe(0);
        });

        it("should return 0 for targets with no steps", () => {
            const emptyTarget = createAnimationTarget({ x: 0 }, { x: 0 }, []);
            expect(calculateTotalSteps([emptyTarget])).toBe(0);
        });

        it("should handle single target", () => {
            expect(calculateTotalSteps([animationTarget])).toBe(3);
        });
    });
});
