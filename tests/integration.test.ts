import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnimationTarget } from "../types/animation.js";
import {
    areAllAnimationsCompleted,
    createAnimationLoop,
    prepareAnimations,
} from "../utils/animationEngine.js";
import {
    createAnimationStep,
    createAnimationTarget,
    initializeTargets,
} from "../utils/animationHelpers.js";

describe("Animation Integration", () => {
    let target: Record<string, number>;
    let animationTarget: AnimationTarget;

    beforeEach(() => {
        target = { x: 0, y: 0, opacity: 1, scale: 1 };

        animationTarget = createAnimationTarget(
            target,
            { x: 0, y: 0, opacity: 1, scale: 1 },
            [
                createAnimationStep(
                    { x: 100, y: 50 },
                    { duration: 100, delay: 0 },
                ),
                createAnimationStep(
                    { opacity: 0.5, scale: 2 },
                    { duration: 100, delay: 0 },
                ),
                createAnimationStep(
                    { x: 200, y: 100, opacity: 0 },
                    { duration: 100, delay: 0 },
                ),
            ],
        );
    });

    it("should complete a full animation workflow", async () => {
        // Initialize targets
        initializeTargets([animationTarget]);
        expect(target.x).toBe(0);
        expect(target.y).toBe(0);
        expect(target.opacity).toBe(1);
        expect(target.scale).toBe(1);

        // Prepare animations for step 0
        const animations = prepareAnimations(
            [animationTarget],
            0,
            1000,
            undefined,
        );
        expect(animations).toHaveLength(1);
        expect(animations[0].keys).toEqual(["x", "y"]);

        // Test animation completion detection
        expect(areAllAnimationsCompleted(animations)).toBe(false);

        // Mark as completed and test again
        animations[0].completed = true;
        expect(areAllAnimationsCompleted(animations)).toBe(true);
    });

    it("should handle animation loop lifecycle", () => {
        const animations = prepareAnimations(
            [animationTarget],
            0,
            100,
            undefined,
        );
        const onComplete = vi.fn();

        // Create animation loop
        const { frameId, cancel } = createAnimationLoop(
            animations,
            onComplete,
            1,
        );

        expect(frameId).not.toBeNull();
        expect(typeof cancel).toBe("function");

        // Cancel the animation
        cancel();

        // Advance time - onComplete should not be called after cancellation
        vi.advanceTimersByTime(200);
        expect(onComplete).not.toHaveBeenCalled();
    });

    it("should handle multiple animation steps correctly", () => {
        // Test step 0
        let animations = prepareAnimations(
            [animationTarget],
            0,
            1000,
            undefined,
        );
        expect(animations[0].endVals).toEqual([100, 50]);

        // Test step 1
        animations = prepareAnimations([animationTarget], 1, 1000, undefined);
        expect(animations[0].keys).toEqual(["opacity", "scale"]);
        expect(animations[0].endVals).toEqual([0.5, 2]);

        // Test step 2
        animations = prepareAnimations([animationTarget], 2, 1000, undefined);
        expect(animations[0].keys).toEqual(["x", "y", "opacity"]);
        expect(animations[0].endVals).toEqual([200, 100, 0]);
    });

    it("should handle out-of-bounds step indices gracefully", () => {
        // Test step index beyond available steps
        let animations = prepareAnimations(
            [animationTarget],
            10,
            1000,
            undefined,
        );
        expect(animations).toHaveLength(0);

        // Test step index at the boundary (should work)
        animations = prepareAnimations([animationTarget], 2, 1000, undefined);
        expect(animations).toHaveLength(1);
    });

    it("should preserve target reference throughout animation", () => {
        const originalTarget = target;
        const animations = prepareAnimations(
            [animationTarget],
            0,
            1000,
            undefined,
        );

        expect(animations[0].target).toBe(originalTarget);
        expect(animationTarget.target).toBe(originalTarget);
    });

    it("should handle empty animation targets", () => {
        const emptyTarget = createAnimationTarget(target, {}, []);
        const animations = prepareAnimations([emptyTarget], 0, 1000, undefined);

        expect(animations).toHaveLength(0);
        expect(areAllAnimationsCompleted(animations)).toBe(true);
    });

    it("should use correct duration and delay from steps", () => {
        const customTarget = createAnimationTarget(target, { x: 0 }, [
            createAnimationStep({ x: 100 }, { duration: 500, delay: 250 }),
        ]);

        const animations = prepareAnimations(
            [customTarget],
            0,
            1000,
            undefined,
        );

        expect(animations[0].duration).toBe(500);
        expect(animations[0].delay).toBe(250);
    });

    it("should fall back to default values when step values are undefined", () => {
        const targetWithDefaults = createAnimationTarget(target, { x: 0 }, [
            createAnimationStep({ x: 100 }), // No duration or delay specified
        ]);

        const animations = prepareAnimations(
            [targetWithDefaults],
            0,
            2000,
            undefined,
        );

        expect(animations[0].duration).toBe(2000); // default duration
        expect(animations[0].delay).toBe(0); // default delay
    });
});
