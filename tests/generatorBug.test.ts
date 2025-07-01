import { describe, expect, it } from "vitest";

// Let's create a simplified test that inspects the issue without importing the full system
describe("Generator Animation Bug Analysis", () => {
    it("should understand how step merging works", () => {
        // Let's manually trace through what the generator animation system does
        const fadingElements = [{ opacity: 0 }, { opacity: 0 }, { opacity: 0 }];

        // This is what step() returns - an array of AnimationInstruction objects
        const stepInstructions = [
            {
                target: fadingElements[0],
                properties: { opacity: 1 },
                options: { duration: 1000 },
                type: "animate",
            },
            {
                target: fadingElements[1],
                properties: { opacity: 1 },
                options: { duration: 1000, delay: 1000 },
                type: "animate",
            },
            {
                target: fadingElements[2],
                properties: { opacity: 1 },
                options: { duration: 1000, delay: 2000 },
                type: "animate",
            },
        ];

        // The generator yields this array, which becomes one AnimationGroup
        const animationGroup = {
            animations: stepInstructions.map((instruction) => ({
                target: instruction.target,
                properties: instruction.properties,
                options: instruction.options || {},
            })),
        };

        // Now let's see what the conversion logic does
        // It should create separate AnimationTarget objects for each unique target
        const allTargets = new Set();
        for (const anim of animationGroup.animations) {
            allTargets.add(anim.target);
        }

        expect(allTargets.size).toBe(3); // Should have 3 unique targets

        // Now let's see what the FIXED conversion logic does
        const targetProcessingFixed = Array.from(allTargets).map((target) => {
            const targetAnimations = animationGroup.animations.filter(
                (anim) => anim.target === target,
            );

            // This is the FIXED merging logic
            const mergedProperties = {};
            let duration = 1000; // defaultDuration
            let delay: number | undefined; // Initialize as undefined instead of 0

            for (const targetAnimation of targetAnimations) {
                Object.assign(mergedProperties, targetAnimation.properties);

                // Use the maximum duration among all animations for this target
                duration = Math.max(
                    duration,
                    targetAnimation.options?.duration || 1000,
                );

                // Use the minimum delay, but handle undefined properly
                const animDelay = targetAnimation.options?.delay ?? 0;
                delay =
                    delay === undefined
                        ? animDelay
                        : Math.min(delay, animDelay);
            }

            return {
                target,
                mergedProperties,
                duration,
                delay: delay ?? 0, // Use 0 as default if delay was never set
            };
        });

        // Each target should have its own delay preserved
        expect(targetProcessingFixed[0].delay).toBe(0); // First element
        expect(targetProcessingFixed[1].delay).toBe(1000); // Second element
        expect(targetProcessingFixed[2].delay).toBe(2000); // Third element
    });
});
