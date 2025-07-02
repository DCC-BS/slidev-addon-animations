import type { AnimatableValue } from "./lerpSystem.js";

// Konva easing function type
export type EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number,
) => number;

// Generic object that can be animated with any supported value types
export type AnimatableObject = Record<string, AnimatableValue>;

export interface AnimationStep {
    duration?: number;
    easing?: EasingFunction;
    delay?: number;
    properties: AnimatableObject;
}

export interface AnimationTarget {
    target: AnimatableObject;
    steps: AnimationStep[];
    initialState: AnimatableObject;
}

export interface AnimationOptions {
    skipThreshold?: number; // Time in ms - if step is advanced before this, skip animation
    defaultDuration?: number;
    defaultEasing?: EasingFunction;
}

export interface ProcessedAnimation {
    target: AnimatableObject;
    keys: string[];
    startVals: AnimatableValue[];
    endVals: AnimatableValue[];
    duration: number;
    delay: number;
    easing: EasingFunction | undefined;
    completed: boolean;
}

export interface AnimationBatchUpdate {
    target: AnimatableObject;
    updates: Record<string, AnimatableValue>;
}

export interface AnimationState {
    isAnimating: boolean;
    currentStep: number;
    stepStartTime: number;
    activeTweens: Array<{ id: number | null; cancel: () => void }>;
}
