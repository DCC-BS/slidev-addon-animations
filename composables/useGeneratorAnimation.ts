import Konva from "konva";
import type { ShapeConfig } from "konva/lib/Shape";
import type { Ref } from "vue";
import { unref } from "vue";
import type { AnimatableObject, EasingFunction } from "../types/animation.js";
import type {
    AnimationGeneratorFunction,
    AnimationGroup,
    AnimationInstruction,
    AnimationProps,
} from "../types/generatorAnimation.js";
import {
    createAnimationStep,
    createAnimationTarget,
} from "../utils/animationHelpers.js";
import { useKonvaAnimation } from "./useKonvaAnimation.js";

// Helper functions for creating animation instructions
// Overload for ref primitive types - animate the value property directly
export function animate(
    target: Ref<unknown>,
    value: unknown,
    options?: AnimationProps,
): AnimationInstruction;
// Overload for object types - animate multiple properties
export function animate(
    target: unknown | Ref<unknown>,
    properties: Record<string, unknown>,
    options?: AnimationProps,
): AnimationInstruction;
// Implementation
export function animate(
    target: unknown | Ref<unknown>,
    propertiesOrValue: Record<string, unknown> | unknown,
    options?: AnimationProps,
): AnimationInstruction {
    // Check if target is a ref and propertiesOrValue is not a properties object
    const isRefTarget =
        target && typeof target === "object" && "value" in target;
    const isPropertiesObject =
        propertiesOrValue &&
        typeof propertiesOrValue === "object" &&
        !Array.isArray(propertiesOrValue) &&
        propertiesOrValue.constructor === Object;

    if (isRefTarget && !isPropertiesObject) {
        // This is a ref primitive type, animate the value property
        return {
            type: "animate",
            target: target,
            properties: { value: propertiesOrValue },
            options: options || {},
        };
    } else {
        // Standard behavior for object types
        const actualTarget = unref(target);
        return {
            type: "animate",
            target: actualTarget,
            properties: propertiesOrValue as Record<string, unknown>,
            options: options || {},
        };
    }
}

export function animateValue(
    target: Ref<unknown>,
    value: unknown,
    options?: AnimationProps,
): AnimationInstruction {
    return animate(target, value, options);
}

export function moveTo(
    target: Ref<ShapeConfig> | ShapeConfig,
    x: number,
    y: number,
    options?: AnimationProps,
): AnimationInstruction {
    return animate(target, { x, y }, options);
}

export function scaleTo(
    target: Ref<ShapeConfig> | ShapeConfig,
    scale: number | { x: number; y: number },
    options?: AnimationProps,
): AnimationInstruction {
    if (typeof scale === "number") {
        return animate(target, { scaleX: scale, scaleY: scale }, options);
    }
    return animate(target, { scaleX: scale.x, scaleY: scale.y }, options);
}

export function resizeTo(
    target: Ref<ShapeConfig> | ShapeConfig,
    width: number,
    height: number,
    options?: AnimationProps,
): AnimationInstruction {
    return animate(target, { width, height }, options);
}

export function rotateTo(
    target: Ref<ShapeConfig> | ShapeConfig,
    rotation: number,
    options?: AnimationProps,
): AnimationInstruction {
    return animate(target, { rotation }, options);
}

export function fadeTo(
    target: Ref<ShapeConfig> | ShapeConfig,
    opacity: number,
    options?: AnimationProps,
): AnimationInstruction {
    return animate(target, { opacity }, options);
}

export function hide(
    target: Ref<ShapeConfig> | ShapeConfig,
    options?: AnimationProps,
): AnimationInstruction {
    return fadeTo(target, 0, options);
}

export function show(
    target: Ref<ShapeConfig> | ShapeConfig,
    options?: AnimationProps,
): AnimationInstruction {
    return fadeTo(target, 1, options);
}

// Helper to create multiple animations in one step
export function step(
    ...animations: AnimationInstruction[]
): AnimationInstruction[] {
    return animations;
}

// Predefined easing presets for easier use
export const EasingPresets = {
    // Basic
    linear: Konva.Easings.Linear,
    easeIn: Konva.Easings.EaseIn,
    easeOut: Konva.Easings.EaseOut,
    easeInOut: Konva.Easings.EaseInOut,

    // Bouncy
    bounceIn: Konva.Easings.BounceEaseIn,
    bounceOut: Konva.Easings.BounceEaseOut,
    bounceInOut: Konva.Easings.BounceEaseInOut,

    // Elastic
    elasticIn: Konva.Easings.ElasticEaseIn,
    elasticOut: Konva.Easings.ElasticEaseOut,
    elasticInOut: Konva.Easings.ElasticEaseInOut,

    // Back
    backIn: Konva.Easings.BackEaseIn,
    backOut: Konva.Easings.BackEaseOut,
    backInOut: Konva.Easings.BackEaseInOut,

    // Strong
    strongIn: Konva.Easings.StrongEaseIn,
    strongOut: Konva.Easings.StrongEaseOut,
    strongInOut: Konva.Easings.StrongEaseInOut,
} as const;

export type EasingPreset = keyof typeof EasingPresets;

// Main composable for generator-based animations
export function useGeneratorAnimation(
    options: {
        skipThreshold?: number;
        defaultDuration?: number;
        defaultEasing?: EasingPreset | unknown;
    } = {},
) {
    const {
        skipThreshold = 300,
        defaultDuration = 1000,
        defaultEasing = "easeInOut",
    } = options;

    // Execute a generator function to collect all animation steps
    const executeGeneratorFunction = (
        generatorFn: () => AnimationGeneratorFunction,
    ): AnimationGroup[] => {
        const steps: AnimationGroup[] = [];
        const generator = generatorFn();

        try {
            let result = generator.next();
            while (!result.done) {
                const yielded = result.value;

                // Convert yielded value to AnimationGroup
                let animationStep: AnimationGroup;

                if (Array.isArray(yielded)) {
                    // Yielding array of AnimationInstructions
                    animationStep = {
                        animations: yielded.map((instruction) => ({
                            target: instruction.target,
                            properties: instruction.properties,
                            options: instruction.options || {},
                        })),
                    };
                } else if (
                    yielded &&
                    typeof yielded === "object" &&
                    "type" in yielded
                ) {
                    // Yielding single AnimationInstruction
                    const instruction = yielded as AnimationInstruction;
                    animationStep = {
                        animations: [
                            {
                                target: instruction.target,
                                properties: instruction.properties,
                                options: instruction.options || {},
                            },
                        ],
                    };
                } else {
                    console.warn("Unknown yielded value:", yielded);
                    animationStep = { animations: [] };
                }

                if (animationStep.animations.length > 0) {
                    steps.push(animationStep);
                }

                // Continue with the generator
                result = generator.next();
            }
        } catch (error) {
            console.error("Error executing animation generator:", error);
        }

        return steps;
    };

    // Convert generator steps to animation system format
    const createAnimationFromGenerator = (
        generatorFn: () => AnimationGeneratorFunction,
    ) => {
        const steps = executeGeneratorFunction(generatorFn);

        // Collect all unique targets
        const allTargets = new Set<unknown>();
        for (const step of steps) {
            for (const anim of step.animations) {
                allTargets.add(anim.target);
            }
        }

        // Auto-capture initial states
        const captureInitialState = (
            target: unknown,
        ): Record<string, unknown> => {
            const state: Record<string, unknown> = {};
            const commonProps = [
                "x",
                "y",
                "width",
                "height",
                "scaleX",
                "scaleY",
                "rotation",
                "opacity",
            ];

            for (const prop of commonProps) {
                if ((target as Record<string, unknown>)[prop] !== undefined) {
                    state[prop] = (target as Record<string, unknown>)[prop];
                }
            }

            // Also capture properties from animation steps
            for (const step of steps) {
                for (const anim of step.animations) {
                    if (anim.target === target) {
                        for (const prop of Object.keys(anim.properties)) {
                            const targetObj = target as Record<string, unknown>;
                            if (
                                targetObj[prop] !== undefined &&
                                state[prop] === undefined
                            ) {
                                state[prop] = targetObj[prop];
                            }
                        }
                    }
                }
            }

            return state;
        };

        // Convert to animation targets
        const animationTargets = Array.from(allTargets).map((target) => {
            const animationSteps = steps.map((step) => {
                // Find ALL animations for this target in this step
                const targetAnimations = step.animations.filter(
                    (anim) => anim.target === target,
                );

                if (targetAnimations.length > 0) {
                    // Merge all properties from animations targeting this object
                    const mergedProperties: Record<string, unknown> = {};
                    let duration = defaultDuration;
                    let delay: number | undefined; // Initialize as undefined
                    let easing = defaultEasing;

                    // Process each animation and merge properties
                    for (const targetAnimation of targetAnimations) {
                        Object.assign(
                            mergedProperties,
                            targetAnimation.properties,
                        );

                        // Use the maximum duration among all animations for this target
                        duration = Math.max(
                            duration,
                            targetAnimation.options?.duration ||
                                defaultDuration,
                        );

                        // Use the minimum delay (earliest start time), but handle undefined properly
                        const animDelay = targetAnimation.options?.delay ?? 0;
                        delay =
                            delay === undefined
                                ? animDelay
                                : Math.min(delay, animDelay);

                        // Use the last specified easing (could be improved with priority system)
                        if (targetAnimation.options?.easing) {
                            easing = targetAnimation.options.easing;
                        }
                    }

                    const resolvedEasing =
                        typeof easing === "string"
                            ? EasingPresets[easing as EasingPreset]
                            : easing ||
                              (typeof defaultEasing === "string"
                                  ? EasingPresets[defaultEasing as EasingPreset]
                                  : defaultEasing);

                    return createAnimationStep(
                        mergedProperties as AnimatableObject,
                        {
                            duration,
                            delay: delay ?? 0, // Use 0 as default if delay was never set
                            easing: resolvedEasing as unknown as EasingFunction,
                        },
                    );
                }
                // No animation for this target in this step
                return createAnimationStep({}, { duration: 100 });
            });

            return createAnimationTarget(
                target as AnimatableObject,
                captureInitialState(target) as AnimatableObject,
                animationSteps,
            );
        });

        return useKonvaAnimation(animationTargets, {
            skipThreshold,
            defaultDuration,
        });
    };

    return {
        createAnimationFromGenerator,
        EasingPresets,
        animate,
        animateValue,
        moveTo,
        scaleTo,
        resizeTo,
        rotateTo,
        fadeTo,
        hide,
        show,
        step,
    };
}
