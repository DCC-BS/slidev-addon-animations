/**
 * Types for the lerp system
 */

// Color type for RGB/RGBA values
export interface Color {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
    a?: number; // 0-1
}

// Supported animatable value types
export type AnimatableValue = number | string | Color;

// Lerp function type
export type LerpFunction<T = AnimatableValue> = (
    start: T,
    end: T,
    progress: number,
) => T;

// Generic lerp function type for the registry
export type GenericLerpFunction = (
    start: AnimatableValue,
    end: AnimatableValue,
    progress: number,
) => AnimatableValue;
