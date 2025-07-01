import type {
    AnimationBatchUpdate,
    AnimationTarget,
    EasingFunction,
    ProcessedAnimation,
} from "../types/animation.js";
import { type AnimatableValue, lerp } from "./lerpSystem.js";

/**
 * Processes animation targets into optimized animation objects
 */
export function prepareAnimations(
    targets: AnimationTarget[],
    stepIndex: number,
    defaultDuration: number,
    defaultEasing: EasingFunction | undefined,
): ProcessedAnimation[] {
    const animations: ProcessedAnimation[] = [];

    targets.forEach((target) => {
        if (stepIndex < target.steps.length) {
            const step = target.steps[stepIndex];

            const keys = Object.keys(step.properties);
            const startVals = keys.map((key) => target.target[key]);
            const endVals = keys.map((key) => step.properties[key]);

            animations.push({
                target: target.target,
                keys,
                startVals,
                endVals,
                duration: step.duration ?? defaultDuration,
                delay: step.delay ?? 0,
                easing: step.easing ?? defaultEasing,
                completed: false,
            });
        }
    });

    return animations;
}

/**
 * Prepares reverse animations from current state to target state
 */
export function prepareReverseAnimations(
    targets: AnimationTarget[],
    stepIndex: number,
    defaultDuration: number,
    defaultEasing: EasingFunction | undefined,
): ProcessedAnimation[] {
    const animations: ProcessedAnimation[] = [];

    // Calculate target state for the step
    const targetStates = targets.map((target) => {
        const state = { ...target.initialState };

        // Apply all steps up to the target step
        for (let i = 0; i <= stepIndex; i++) {
            if (i < target.steps.length) {
                Object.assign(state, target.steps[i].properties);
            }
        }
        return state;
    });

    // Create reverse animations
    targets.forEach((target, targetIndex) => {
        const targetState = targetStates[targetIndex];
        const keys = Object.keys(targetState);
        const startVals = keys.map((key) => target.target[key]);
        const endVals = keys.map((key) => targetState[key]);

        animations.push({
            target: target.target,
            keys,
            startVals,
            endVals,
            duration: defaultDuration, // Use default for reverse animations
            delay: 0,
            easing: defaultEasing,
            completed: false,
        });
    });

    return animations;
}

/**
 * Applies easing function safely
 */
export function applyEasing(
    progress: number,
    easingFn: EasingFunction | undefined,
): number {
    if (!easingFn || typeof easingFn !== "function") {
        return progress;
    }

    try {
        return easingFn(progress, 0, 1, 1);
    } catch {
        return progress;
    }
}

/**
 * Processes a single animation frame and returns batch updates
 */
export function processAnimationFrame(
    animations: ProcessedAnimation[],
    currentTime: number,
    masterStartTime: number,
): AnimationBatchUpdate[] {
    const batchUpdates: AnimationBatchUpdate[] = [];

    for (const anim of animations) {
        if (anim.completed) continue;

        const elapsed = currentTime - masterStartTime - anim.delay;

        if (elapsed < 0) continue;

        const progress = Math.min(elapsed / anim.duration, 1);
        const easedProgress = applyEasing(progress, anim.easing);

        const updates: Record<string, AnimatableValue> = {};
        for (let i = 0; i < anim.keys.length; i++) {
            const key = anim.keys[i];
            const startVal = anim.startVals[i];
            const endVal = anim.endVals[i];
            updates[key] = lerp(startVal, endVal, easedProgress);
        }

        batchUpdates.push({ target: anim.target, updates });

        if (progress >= 1) {
            anim.completed = true;
            // Ensure final values are exact
            for (let i = 0; i < anim.keys.length; i++) {
                updates[anim.keys[i]] = anim.endVals[i];
            }
        }
    }

    return batchUpdates;
}

/**
 * Checks if all animations are completed
 */
export function areAllAnimationsCompleted(
    animations: ProcessedAnimation[],
): boolean {
    return animations.every((anim) => anim.completed);
}

/**
 * Applies batch updates to targets using a microtask for better performance
 */
export function applyBatchUpdates(batchUpdates: AnimationBatchUpdate[]): void {
    if (batchUpdates.length === 0) return;

    Promise.resolve().then(() => {
        batchUpdates.forEach(({ target, updates }) => {
            Object.assign(target, updates);
        });
    });
}

/**
 * Creates a master animation loop using RAF
 */
export function createAnimationLoop(
    animations: ProcessedAnimation[],
    onComplete: () => void,
    updateThreshold = 32, // ~30fps for better performance
): { frameId: number | null; cancel: () => void } {
    let masterStartTime: number | null = null;
    let frameId: number | null = null;
    let lastUpdateTime = 0;

    const animate = (currentTime: number) => {
        if (!masterStartTime) {
            masterStartTime = currentTime;
        }

        // Throttle updates to reduce reactive overhead
        if (currentTime - lastUpdateTime < updateThreshold) {
            frameId = requestAnimationFrame(animate);
            return;
        }
        lastUpdateTime = currentTime;

        const batchUpdates = processAnimationFrame(
            animations,
            currentTime,
            masterStartTime,
        );
        applyBatchUpdates(batchUpdates);

        if (areAllAnimationsCompleted(animations)) {
            onComplete();
            if (frameId) {
                cancelAnimationFrame(frameId);
                frameId = null;
            }
        } else {
            frameId = requestAnimationFrame(animate);
        }
    };

    frameId = requestAnimationFrame(animate);

    return {
        frameId,
        cancel: () => {
            if (frameId) {
                cancelAnimationFrame(frameId);
                frameId = null;
            }
        },
    };
}
