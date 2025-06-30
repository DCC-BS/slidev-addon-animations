import type {
    AnimatableObject,
    AnimationStep,
    AnimationTarget,
} from "../types/animation.js";

/**
 * Helper function to create animation steps easily
 */
export function createAnimationStep(
    properties: AnimatableObject,
    options: Partial<Omit<AnimationStep, "properties">> = {},
): AnimationStep {
    return {
        properties,
        duration: options.duration,
        easing: options.easing,
        delay: options.delay,
    };
}

/**
 * Helper to create a target with initial state and steps
 */
export function createAnimationTarget(
    target: AnimatableObject,
    initialState: AnimatableObject,
    steps: AnimationStep[],
): AnimationTarget {
    return {
        target,
        initialState,
        steps,
    };
}

/**
 * Initialize all targets to their initial states
 */
export function initializeTargets(targets: AnimationTarget[]): void {
    targets.forEach((target) => {
        Object.assign(target.target, target.initialState);
    });
}

/**
 * Apply the end state of a specific step to all targets
 */
export function applyStepEndState(
    targets: AnimationTarget[],
    stepIndex: number,
): void {
    targets.forEach((target) => {
        if (stepIndex < target.steps.length) {
            const step = target.steps[stepIndex];
            Object.assign(target.target, step.properties);
        }
    });
}

/**
 * Apply all steps up to a given step index instantly
 */
export function applyStepsUpTo(
    targets: AnimationTarget[],
    fromStep: number,
    toStep: number,
): void {
    for (let i = Math.max(0, fromStep); i <= toStep; i++) {
        applyStepEndState(targets, i);
    }
}

/**
 * Calculate the total number of animation steps across all targets
 */
export function calculateTotalSteps(targets: AnimationTarget[]): number {
    return Math.max(...targets.map((target) => target.steps.length), 0);
}
