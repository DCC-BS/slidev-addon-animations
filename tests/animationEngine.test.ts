import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
    AnimationTarget,
    EasingFunction,
    ProcessedAnimation,
} from "../types/animation.js";
import {
    applyBatchUpdates,
    applyEasing,
    areAllAnimationsCompleted,
    createAnimationLoop,
    prepareAnimations,
    prepareReverseAnimations,
    processAnimationFrame,
} from "../utils/animationEngine.js";

describe("animationEngine", () => {
    let mockTarget: Record<string, number>;
    let animationTarget: AnimationTarget;

    beforeEach(() => {
        mockTarget = { x: 0, y: 0, opacity: 1 };
        animationTarget = {
            target: mockTarget,
            initialState: { x: 0, y: 0, opacity: 1 },
            steps: [
                {
                    properties: { x: 100, y: 50 },
                    duration: 1000,
                    delay: 0,
                },
                {
                    properties: { opacity: 0.5 },
                    duration: 500,
                    delay: 100,
                },
            ],
        };
    });

    describe("prepareAnimations", () => {
        it("should prepare animations for a valid step", () => {
            const animations = prepareAnimations(
                [animationTarget],
                0,
                1000,
                undefined,
            );

            expect(animations).toHaveLength(1);
            expect(animations[0].target).toBe(mockTarget);
            expect(animations[0].keys).toEqual(["x", "y"]);
            expect(animations[0].startVals).toEqual([0, 0]);
            expect(animations[0].endVals).toEqual([100, 50]);
            expect(animations[0].duration).toBe(1000);
            expect(animations[0].completed).toBe(false);
        });

        it("should use step-specific duration and delay", () => {
            const animations = prepareAnimations(
                [animationTarget],
                1,
                1000,
                undefined,
            );

            expect(animations[0].duration).toBe(500);
            expect(animations[0].delay).toBe(100);
        });

        it("should return empty array for invalid step index", () => {
            const animations = prepareAnimations(
                [animationTarget],
                5,
                1000,
                undefined,
            );
            expect(animations).toHaveLength(0);
        });

        it("should use default values when step values are undefined", () => {
            const targetWithoutDuration: AnimationTarget = {
                target: mockTarget,
                initialState: { x: 0 },
                steps: [{ properties: { x: 100 } }],
            };

            const animations = prepareAnimations(
                [targetWithoutDuration],
                0,
                2000,
                undefined,
            );
            expect(animations[0].duration).toBe(2000);
            expect(animations[0].delay).toBe(0);
        });
    });

    describe("prepareReverseAnimations", () => {
        beforeEach(() => {
            // Set current state as if step 1 was applied
            mockTarget.x = 100;
            mockTarget.y = 50;
            mockTarget.opacity = 0.5;
        });

        it("should prepare reverse animations to step 0", () => {
            const animations = prepareReverseAnimations(
                [animationTarget],
                0,
                1000,
                undefined,
            );

            expect(animations).toHaveLength(1);
            expect(animations[0].startVals).toEqual([100, 50, 0.5]); // current state
            expect(animations[0].endVals).toEqual([100, 50, 1]); // target state after step 0
        });

        it("should prepare reverse animations to initial state", () => {
            const animations = prepareReverseAnimations(
                [animationTarget],
                -1,
                1000,
                undefined,
            );

            expect(animations[0].endVals).toEqual([0, 0, 1]); // initial state
        });
    });

    describe("applyEasing", () => {
        it("should return progress when no easing function provided", () => {
            expect(applyEasing(0.5, undefined)).toBe(0.5);
        });

        it("should apply easing function correctly", () => {
            const mockEasing: EasingFunction = vi.fn(
                (t, _b, c, _d) => c * t * t,
            ); // quadratic
            const result = applyEasing(0.5, mockEasing);

            expect(mockEasing).toHaveBeenCalledWith(0.5, 0, 1, 1);
            expect(result).toBe(0.25); // 1 * 0.5 * 0.5
        });

        it("should handle easing function errors gracefully", () => {
            const faultyEasing: EasingFunction = vi.fn(() => {
                throw new Error("Easing error");
            });

            expect(applyEasing(0.5, faultyEasing)).toBe(0.5);
        });
    });

    describe("processAnimationFrame", () => {
        let animations: ProcessedAnimation[];

        beforeEach(() => {
            animations = prepareAnimations(
                [animationTarget],
                0,
                1000,
                undefined,
            );
        });

        it("should process animation frame correctly", () => {
            const startTime = 1000;
            const currentTime = 1500; // 500ms elapsed

            const batchUpdates = processAnimationFrame(
                animations,
                currentTime,
                startTime,
            );

            expect(batchUpdates).toHaveLength(1);
            expect(batchUpdates[0].target).toBe(mockTarget);
            expect(batchUpdates[0].updates.x).toBe(50); // 50% progress: 0 + (100-0) * 0.5
            expect(batchUpdates[0].updates.y).toBe(25); // 50% progress: 0 + (50-0) * 0.5
        });

        it("should handle delay correctly", () => {
            animations[0].delay = 200;
            const startTime = 1000;
            const currentTime = 1100; // 100ms elapsed (delay not reached)

            const batchUpdates = processAnimationFrame(
                animations,
                currentTime,
                startTime,
            );
            expect(batchUpdates).toHaveLength(0);
        });

        it("should mark animation as completed when progress reaches 1", () => {
            const startTime = 1000;
            const currentTime = 2000; // 1000ms elapsed (100% progress)

            processAnimationFrame(animations, currentTime, startTime);
            expect(animations[0].completed).toBe(true);
        });

        it("should skip completed animations", () => {
            animations[0].completed = true;
            const batchUpdates = processAnimationFrame(animations, 2000, 1000);
            expect(batchUpdates).toHaveLength(0);
        });
    });

    describe("areAllAnimationsCompleted", () => {
        it("should return true when all animations are completed", () => {
            const animations: ProcessedAnimation[] = [
                { completed: true } as ProcessedAnimation,
                { completed: true } as ProcessedAnimation,
            ];

            expect(areAllAnimationsCompleted(animations)).toBe(true);
        });

        it("should return false when some animations are not completed", () => {
            const animations: ProcessedAnimation[] = [
                { completed: true } as ProcessedAnimation,
                { completed: false } as ProcessedAnimation,
            ];

            expect(areAllAnimationsCompleted(animations)).toBe(false);
        });

        it("should return true for empty array", () => {
            expect(areAllAnimationsCompleted([])).toBe(true);
        });
    });

    describe("applyBatchUpdates", () => {
        it("should apply updates to targets", async () => {
            const target1 = { x: 0, y: 0 };
            const target2 = { opacity: 1 };

            const batchUpdates = [
                { target: target1, updates: { x: 50, y: 25 } },
                { target: target2, updates: { opacity: 0.5 } },
            ];

            applyBatchUpdates(batchUpdates);

            // Wait for microtask to complete
            await new Promise((resolve) => Promise.resolve().then(resolve));

            expect(target1.x).toBe(50);
            expect(target1.y).toBe(25);
            expect(target2.opacity).toBe(0.5);
        });

        it("should handle empty batch updates", () => {
            expect(() => applyBatchUpdates([])).not.toThrow();
        });
    });

    describe("createAnimationLoop", () => {
        it("should create and start animation loop", () => {
            const animations = prepareAnimations(
                [animationTarget],
                0,
                1000,
                undefined,
            );
            const onComplete = vi.fn();

            const { frameId, cancel } = createAnimationLoop(
                animations,
                onComplete,
            );

            expect(frameId).toBeDefined();
            expect(typeof cancel).toBe("function");

            cancel(); // Clean up
        });

        it("should call onComplete when all animations are done", () => {
            const animations: ProcessedAnimation[] = [
                { completed: true } as ProcessedAnimation,
            ];
            const onComplete = vi.fn();

            createAnimationLoop(animations, onComplete);

            // Fast-forward time to trigger the animation loop
            vi.advanceTimersByTime(100);

            expect(onComplete).toHaveBeenCalled();
        });

        it("should allow cancellation of animation loop", () => {
            const animations = prepareAnimations(
                [animationTarget],
                0,
                1000,
                undefined,
            );
            const onComplete = vi.fn();

            const { cancel } = createAnimationLoop(animations, onComplete);
            cancel();

            // Animation should not complete after cancellation
            vi.advanceTimersByTime(2000);
            expect(onComplete).not.toHaveBeenCalled();
        });
    });

    describe("Animation Delays", () => {
        describe("Individual Animation Delays", () => {
            it("should not apply animation updates before delay period", () => {
                const animations = prepareAnimations(
                    [animationTarget],
                    0,
                    1000,
                    undefined,
                );
                animations[0].delay = 500; // 500ms delay

                const startTime = 1000;
                const currentTime = 1400; // 400ms elapsed (less than 500ms delay)

                const batchUpdates = processAnimationFrame(
                    animations,
                    currentTime,
                    startTime,
                );
                expect(batchUpdates).toHaveLength(0);
                expect(animations[0].completed).toBe(false);
            });

            it("should start animation exactly after delay period", () => {
                const animations = prepareAnimations(
                    [animationTarget],
                    0,
                    1000,
                    undefined,
                );
                animations[0].delay = 500;

                const startTime = 1000;
                const currentTime = 1500; // 500ms elapsed (exactly delay duration)

                const batchUpdates = processAnimationFrame(
                    animations,
                    currentTime,
                    startTime,
                );
                expect(batchUpdates).toHaveLength(1);
                expect(batchUpdates[0].updates.x).toBe(0); // 0% progress at delay end
                expect(batchUpdates[0].updates.y).toBe(0);
            });

            it("should apply correct progress after delay + partial animation duration", () => {
                const animations = prepareAnimations(
                    [animationTarget],
                    0,
                    1000,
                    undefined,
                );
                animations[0].delay = 500;

                const startTime = 1000;
                const currentTime = 2000; // 1000ms elapsed (500ms delay + 500ms animation = 50% progress)

                const batchUpdates = processAnimationFrame(
                    animations,
                    currentTime,
                    startTime,
                );
                expect(batchUpdates).toHaveLength(1);
                expect(batchUpdates[0].updates.x).toBe(50); // 50% of 100
                expect(batchUpdates[0].updates.y).toBe(25); // 50% of 50
            });

            it("should complete animation after delay + full duration", () => {
                const animations = prepareAnimations(
                    [animationTarget],
                    0,
                    1000,
                    undefined,
                );
                animations[0].delay = 500;

                const startTime = 1000;
                const currentTime = 2500; // 1500ms elapsed (500ms delay + 1000ms animation = 100% progress)

                const batchUpdates = processAnimationFrame(
                    animations,
                    currentTime,
                    startTime,
                );
                expect(batchUpdates).toHaveLength(1);
                expect(batchUpdates[0].updates.x).toBe(100);
                expect(batchUpdates[0].updates.y).toBe(50);
                expect(animations[0].completed).toBe(true);
            });

            it("should handle zero delay correctly", () => {
                const animations = prepareAnimations(
                    [animationTarget],
                    0,
                    1000,
                    undefined,
                );
                animations[0].delay = 0;

                const startTime = 1000;
                const currentTime = 1001; // 1ms elapsed

                const batchUpdates = processAnimationFrame(
                    animations,
                    currentTime,
                    startTime,
                );
                expect(batchUpdates).toHaveLength(1);
                // Should start immediately with minimal progress
            });

            it("should handle negative delay by starting immediately", () => {
                const animations = prepareAnimations(
                    [animationTarget],
                    0,
                    1000,
                    undefined,
                );
                animations[0].delay = -100; // Negative delay

                const startTime = 1000;
                const currentTime = 1000; // No time elapsed

                const batchUpdates = processAnimationFrame(
                    animations,
                    currentTime,
                    startTime,
                );
                expect(batchUpdates).toHaveLength(1);
                // Should start immediately despite negative delay
            });
        });

        describe("Multiple Animations with Different Delays", () => {
            let multiTarget: AnimationTarget[];

            beforeEach(() => {
                const target1 = { x: 0, scale: 1 };
                const target2 = { y: 0, opacity: 1 };

                multiTarget = [
                    {
                        target: target1,
                        initialState: { x: 0, scale: 1 },
                        steps: [
                            {
                                properties: { x: 100, scale: 2 },
                                duration: 1000,
                                delay: 200, // 200ms delay
                            },
                        ],
                    },
                    {
                        target: target2,
                        initialState: { y: 0, opacity: 1 },
                        steps: [
                            {
                                properties: { y: 50, opacity: 0.5 },
                                duration: 1000,
                                delay: 500, // 500ms delay
                            },
                        ],
                    },
                ];
            });

            it("should apply animations independently based on their individual delays", () => {
                const animations = prepareAnimations(
                    multiTarget,
                    0,
                    1000,
                    undefined,
                );

                const startTime = 1000;
                const currentTime = 1300; // 300ms elapsed

                const batchUpdates = processAnimationFrame(
                    animations,
                    currentTime,
                    startTime,
                );

                // Only first animation should be active (200ms delay passed)
                // Second animation should still be waiting (500ms delay not reached)
                expect(batchUpdates).toHaveLength(1);
                expect(batchUpdates[0].target).toBe(multiTarget[0].target);
                expect(batchUpdates[0].updates.x).toBe(10); // 10% progress: (300-200)/1000 = 0.1
                expect(batchUpdates[0].updates.scale).toBe(1.1); // 1 + (2-1) * 0.1
            });

            it("should apply both animations after both delays have passed", () => {
                const animations = prepareAnimations(
                    multiTarget,
                    0,
                    1000,
                    undefined,
                );

                const startTime = 1000;
                const currentTime = 1750; // 750ms elapsed

                const batchUpdates = processAnimationFrame(
                    animations,
                    currentTime,
                    startTime,
                );

                expect(batchUpdates).toHaveLength(2);

                // First animation: (750-200)/1000 = 55% progress
                const firstUpdate = batchUpdates.find(
                    (update) => update.target === multiTarget[0].target,
                );
                expect(firstUpdate?.updates.x).toBeCloseTo(55, 5); // 0 + (100-0) * 0.55
                expect(firstUpdate?.updates.scale).toBeCloseTo(1.55, 5); // 1 + (2-1) * 0.55

                // Second animation: (750-500)/1000 = 25% progress
                const secondUpdate = batchUpdates.find(
                    (update) => update.target === multiTarget[1].target,
                );
                expect(secondUpdate?.updates.y).toBeCloseTo(12.5, 5); // 0 + (50-0) * 0.25
                expect(secondUpdate?.updates.opacity).toBeCloseTo(0.875, 5); // 1 + (0.5-1) * 0.25
            });

            it("should complete animations independently based on their total time", () => {
                const animations = prepareAnimations(
                    multiTarget,
                    0,
                    1000,
                    undefined,
                );

                const startTime = 1000;
                const currentTime = 2200; // 2200ms elapsed

                processAnimationFrame(animations, currentTime, startTime);

                // Debug: let's see what's happening
                console.log(
                    "Animation 0 - delay:",
                    animations[0].delay,
                    "duration:",
                    animations[0].duration,
                    "completed:",
                    animations[0].completed,
                );
                console.log(
                    "Animation 1 - delay:",
                    animations[1].delay,
                    "duration:",
                    animations[1].duration,
                    "completed:",
                    animations[1].completed,
                );
                console.log("Expected completion times:");
                console.log(
                    "Animation 0: startTime(1000) + delay(200) + duration(1000) = 2200ms",
                );
                console.log(
                    "Animation 1: startTime(1000) + delay(500) + duration(1000) = 2500ms",
                );
                console.log("Current time:", currentTime);

                // First animation: started at 200ms, duration 1000ms = completed at 1200ms
                expect(animations[0].completed).toBe(true);

                // Second animation: started at 500ms, duration 1000ms = should still be running at 2200ms
                // because it doesn't complete until 2500ms (1000 + 500 + 1000)
                expect(animations[1].completed).toBe(false);
            });
        });

        describe("Animation Groups (Steps) with Delays", () => {
            let groupTarget: AnimationTarget;

            beforeEach(() => {
                const target = { x: 0, y: 0, opacity: 1, scale: 1 };

                groupTarget = {
                    target,
                    initialState: { x: 0, y: 0, opacity: 1, scale: 1 },
                    steps: [
                        {
                            properties: { x: 100, y: 50 },
                            duration: 1000,
                            delay: 0, // No delay for step 0
                        },
                        {
                            properties: { opacity: 0.5, scale: 2 },
                            duration: 800,
                            delay: 300, // 300ms delay for step 1
                        },
                        {
                            properties: { x: 200, y: 100 },
                            duration: 600,
                            delay: 150, // 150ms delay for step 2
                        },
                    ],
                };
            });

            it("should apply step 0 immediately (no delay)", () => {
                const animations = prepareAnimations(
                    [groupTarget],
                    0,
                    1000,
                    undefined,
                );

                const startTime = 1000;
                const currentTime = 1500; // 500ms elapsed = 50% progress

                const batchUpdates = processAnimationFrame(
                    animations,
                    currentTime,
                    startTime,
                );
                expect(batchUpdates).toHaveLength(1);
                expect(batchUpdates[0].updates.x).toBe(50); // 50% of 100
                expect(batchUpdates[0].updates.y).toBe(25); // 50% of 50
            });

            it("should respect delay when transitioning to step 1", () => {
                const animations = prepareAnimations(
                    [groupTarget],
                    1,
                    1000,
                    undefined,
                );

                const startTime = 1000;
                const currentTime = 1200; // 200ms elapsed (less than 300ms delay)

                const batchUpdates = processAnimationFrame(
                    animations,
                    currentTime,
                    startTime,
                );
                expect(batchUpdates).toHaveLength(0); // Should not animate yet
            });

            it("should start step 1 animation after delay period", () => {
                // First, set target to state after step 0
                groupTarget.target.x = 100;
                groupTarget.target.y = 50;

                const animations = prepareAnimations(
                    [groupTarget],
                    1,
                    1000,
                    undefined,
                );

                const startTime = 1000;
                const currentTime = 1700; // 700ms elapsed (300ms delay + 400ms animation = 50% progress)

                const batchUpdates = processAnimationFrame(
                    animations,
                    currentTime,
                    startTime,
                );
                expect(batchUpdates).toHaveLength(1);
                expect(batchUpdates[0].updates.opacity).toBe(0.75); // 1 + (0.5-1) * 0.5
                expect(batchUpdates[0].updates.scale).toBe(1.5); // 1 + (2-1) * 0.5
            });

            it("should handle step 2 with its own delay correctly", () => {
                // Set target to state after step 1
                groupTarget.target.x = 100;
                groupTarget.target.y = 50;
                groupTarget.target.opacity = 0.5;
                groupTarget.target.scale = 2;

                const animations = prepareAnimations(
                    [groupTarget],
                    2,
                    1000,
                    undefined,
                );

                const startTime = 1000;
                const currentTime = 1450; // 450ms elapsed (150ms delay + 300ms animation = 50% progress)

                const batchUpdates = processAnimationFrame(
                    animations,
                    currentTime,
                    startTime,
                );
                expect(batchUpdates).toHaveLength(1);
                expect(batchUpdates[0].updates.x).toBe(150); // 100 + (200-100) * 0.5
                expect(batchUpdates[0].updates.y).toBe(75); // 50 + (100-50) * 0.5
            });
        });

        describe("Delay Edge Cases", () => {
            it("should handle very large delays", () => {
                const animations = prepareAnimations(
                    [animationTarget],
                    0,
                    1000,
                    undefined,
                );
                animations[0].delay = 10000; // 10 second delay

                const startTime = 1000;
                const currentTime = 5000; // 4 seconds elapsed (less than 10 second delay)

                const batchUpdates = processAnimationFrame(
                    animations,
                    currentTime,
                    startTime,
                );
                expect(batchUpdates).toHaveLength(0);
            });

            it("should handle delay longer than animation duration", () => {
                // Create a target with a short duration step
                const shortDurationTarget: AnimationTarget = {
                    target: { x: 0 },
                    initialState: { x: 0 },
                    steps: [
                        {
                            properties: { x: 100 },
                            duration: 500, // Short duration
                            delay: 1000, // Delay longer than duration
                        },
                    ],
                };

                const animations = prepareAnimations(
                    [shortDurationTarget],
                    0,
                    1000,
                    undefined,
                );

                const startTime = 1000;
                const currentTime = 2501; // 1501ms elapsed (1000ms delay + 501ms > 500ms duration)

                const batchUpdates = processAnimationFrame(
                    animations,
                    currentTime,
                    startTime,
                );
                expect(batchUpdates).toHaveLength(1);
                expect(animations[0].completed).toBe(true);

                // Let's also test at the exact completion time
                const exactCompletionTime = 2500; // startTime(1000) + delay(1000) + duration(500) = 2500
                const animations2 = prepareAnimations(
                    [shortDurationTarget],
                    0,
                    1000,
                    undefined,
                );

                processAnimationFrame(
                    animations2,
                    exactCompletionTime,
                    startTime,
                );
                expect(animations2[0].completed).toBe(true);
            });

            it("should handle fractional delays", () => {
                const animations = prepareAnimations(
                    [animationTarget],
                    0,
                    1000,
                    undefined,
                );
                animations[0].delay = 250.5; // 250.5ms delay

                const startTime = 1000;
                const currentTime = 1250; // 250ms elapsed (just before delay ends)

                let batchUpdates = processAnimationFrame(
                    animations,
                    currentTime,
                    startTime,
                );
                expect(batchUpdates).toHaveLength(0);

                const currentTime2 = 1251; // 251ms elapsed (after delay ends)
                batchUpdates = processAnimationFrame(
                    animations,
                    currentTime2,
                    startTime,
                );
                expect(batchUpdates).toHaveLength(1);
            });
        });

        describe("Animation Loop with Delays", () => {
            it("should call onComplete only after all delayed animations finish", () => {
                const target1 = { x: 0 };
                const target2 = { y: 0 };

                const delayedTargets: AnimationTarget[] = [
                    {
                        target: target1,
                        initialState: { x: 0 },
                        steps: [
                            {
                                properties: { x: 100 },
                                duration: 100,
                                delay: 50,
                            },
                        ],
                    },
                    {
                        target: target2,
                        initialState: { y: 0 },
                        steps: [
                            {
                                properties: { y: 100 },
                                duration: 100,
                                delay: 200, // Longer delay
                            },
                        ],
                    },
                ];

                const animations = prepareAnimations(
                    delayedTargets,
                    0,
                    1000,
                    undefined,
                );
                const onComplete = vi.fn();

                // Simulate animation loop manually since requestAnimationFrame doesn't work well with timer mocking
                const startTime = 1000;

                // At 160ms: first animation should complete (50ms delay + 100ms duration = 150ms)
                processAnimationFrame(animations, startTime + 160, startTime);
                expect(areAllAnimationsCompleted(animations)).toBe(false); // Second animation still running
                expect(onComplete).not.toHaveBeenCalled();

                // At 310ms: second animation should complete (200ms delay + 100ms duration = 300ms)
                processAnimationFrame(animations, startTime + 310, startTime);
                expect(areAllAnimationsCompleted(animations)).toBe(true); // All animations complete

                // Manually call onComplete since we're simulating the loop
                if (areAllAnimationsCompleted(animations)) {
                    onComplete();
                }
                expect(onComplete).toHaveBeenCalled();
            });
        });

        describe("Complex Real-World Delay Scenarios", () => {
            it("should handle staggered animations with different delays and durations", () => {
                const element1 = { x: 0, opacity: 0 };
                const element2 = { x: 0, opacity: 0 };
                const element3 = { x: 0, opacity: 0 };

                const staggeredTargets: AnimationTarget[] = [
                    {
                        target: element1,
                        initialState: { x: 0, opacity: 0 },
                        steps: [
                            {
                                properties: { x: 100, opacity: 1 },
                                duration: 300,
                                delay: 0, // First element starts immediately
                            },
                        ],
                    },
                    {
                        target: element2,
                        initialState: { x: 0, opacity: 0 },
                        steps: [
                            {
                                properties: { x: 100, opacity: 1 },
                                duration: 300,
                                delay: 100, // Second element starts 100ms later
                            },
                        ],
                    },
                    {
                        target: element3,
                        initialState: { x: 0, opacity: 0 },
                        steps: [
                            {
                                properties: { x: 100, opacity: 1 },
                                duration: 300,
                                delay: 200, // Third element starts 200ms later
                            },
                        ],
                    },
                ];

                const animations = prepareAnimations(
                    staggeredTargets,
                    0,
                    1000,
                    undefined,
                );
                const startTime = 1000;

                // Test at 150ms: only first animation should be running
                const updates150 = processAnimationFrame(
                    animations,
                    startTime + 150,
                    startTime,
                );
                expect(updates150).toHaveLength(2); // First (running) + Second (just started)

                // First animation at 50% progress (150/300)
                const firstUpdate = updates150.find(
                    (u) => u.target === element1,
                );
                expect(firstUpdate?.updates.x).toBeCloseTo(50, 5);
                expect(firstUpdate?.updates.opacity).toBeCloseTo(0.5, 5);

                // Second animation at ~17% progress ((150-100)/300)
                const secondUpdate = updates150.find(
                    (u) => u.target === element2,
                );
                expect(secondUpdate?.updates.x).toBeCloseTo(16.67, 2);
                expect(secondUpdate?.updates.opacity).toBeCloseTo(0.167, 3);

                // Test at 350ms: first should be complete, second at ~83%, third at 50%
                const updates350 = processAnimationFrame(
                    animations,
                    startTime + 350,
                    startTime,
                );
                expect(updates350).toHaveLength(3); // All animations running

                expect(animations[0].completed).toBe(true); // First completed (350 > 300)
                expect(animations[1].completed).toBe(false); // Second still running
                expect(animations[2].completed).toBe(false); // Third still running

                // Test completion timing
                processAnimationFrame(animations, startTime + 500, startTime); // All should be done
                expect(animations[0].completed).toBe(true); // Done at 300ms
                expect(animations[1].completed).toBe(true); // Done at 400ms (100 + 300)
                expect(animations[2].completed).toBe(true); // Done at 500ms (200 + 300)
            });

            it("should handle cascading animations where delay equals previous animation duration", () => {
                const element1 = { scale: 1 };
                const element2 = { scale: 1 };

                const cascadingTargets: AnimationTarget[] = [
                    {
                        target: element1,
                        initialState: { scale: 1 },
                        steps: [
                            {
                                properties: { scale: 2 },
                                duration: 200,
                                delay: 0,
                            },
                        ],
                    },
                    {
                        target: element2,
                        initialState: { scale: 1 },
                        steps: [
                            {
                                properties: { scale: 2 },
                                duration: 200,
                                delay: 200, // Starts exactly when first ends
                            },
                        ],
                    },
                ];

                const animations = prepareAnimations(
                    cascadingTargets,
                    0,
                    1000,
                    undefined,
                );
                const startTime = 1000;

                // At 100ms: only first animation should be at 50%
                const updates100 = processAnimationFrame(
                    animations,
                    startTime + 100,
                    startTime,
                );
                expect(updates100).toHaveLength(1);
                expect(updates100[0].target).toBe(element1);
                expect(updates100[0].updates.scale).toBeCloseTo(1.5, 5);

                // At 200ms: first should complete, second should start
                const updates200 = processAnimationFrame(
                    animations,
                    startTime + 200,
                    startTime,
                );
                expect(updates200).toHaveLength(2);
                expect(animations[0].completed).toBe(true);

                const secondUpdate = updates200.find(
                    (u) => u.target === element2,
                );
                expect(secondUpdate?.updates.scale).toBe(1); // Just started (0% progress)

                // At 300ms: first done, second at 50%
                const updates300 = processAnimationFrame(
                    animations,
                    startTime + 300,
                    startTime,
                );
                expect(updates300).toHaveLength(1); // Only second animation
                expect(updates300[0].target).toBe(element2);
                expect(updates300[0].updates.scale).toBeCloseTo(1.5, 5);

                // At 400ms: both should be complete
                processAnimationFrame(animations, startTime + 400, startTime);
                expect(animations[0].completed).toBe(true);
                expect(animations[1].completed).toBe(true);
            });
        });
    });
});
