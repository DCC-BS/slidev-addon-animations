/**
 * Types for generator-based animations
 */

// Animation properties with better defaults
export interface AnimationProps {
    duration?: number;
    delay?: number;
    easing?: unknown;
}

// Single animation within a step targeting one object
export interface SingleAnimation {
    target: unknown;
    properties: Record<string, unknown>;
    options?: AnimationProps;
}

// Single animation instruction that can be yielded directly
export interface AnimationInstruction {
    target: unknown;
    properties: Record<string, unknown>;
    options?: AnimationProps;
    type: "animate";
}

// Group of animations that execute together in parallel
export interface AnimationGroup {
    animations: SingleAnimation[];
    label?: string; // Optional label for debugging
}

// Type for things that can be yielded from generator
export type YieldableAnimation = AnimationInstruction | AnimationInstruction[];

// Type for generator animation function
export type AnimationGeneratorFunction = Generator<
    YieldableAnimation,
    void,
    unknown
>;
