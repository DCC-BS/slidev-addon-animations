/**
 * Generic lerp system for different value types
 */

// Supported animatable value types
export type AnimatableValue = number | string | Color;

// Color type for RGB/RGBA values
export interface Color {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
    a?: number; // 0-1
}

// Lerp function type
export type LerpFunction<T = AnimatableValue> = (start: T, end: T, progress: number) => T;

// Generic lerp function type for the registry
export type GenericLerpFunction = (start: AnimatableValue, end: AnimatableValue, progress: number) => AnimatableValue;

// Lerp registry for different types
export const lerpRegistry = new Map<string, GenericLerpFunction>();

/**
 * Number lerp implementation
 */
export const numberLerp: LerpFunction<number> = (start: number, end: number, progress: number): number => {
    return start + (end - start) * progress;
};

/**
 * Color lerp implementation
 */
export const colorLerp: LerpFunction<Color> = (start: Color, end: Color, progress: number): Color => {
    return {
        r: Math.round(start.r + (end.r - start.r) * progress),
        g: Math.round(start.g + (end.g - start.g) * progress),
        b: Math.round(start.b + (end.b - start.b) * progress),
        a: start.a !== undefined && end.a !== undefined 
            ? start.a + (end.a - start.a) * progress
            : start.a ?? end.a ?? 1,
    };
};

/**
 * Check if a string looks like a color value
 */
export function isColorString(str: string): boolean {
    // Check for hex colors
    if (str.startsWith('#') && /^#[0-9a-fA-F]{3,8}$/.test(str)) {
        return true;
    }
    
    // Check for rgb/rgba functions
    if (/^rgba?\s*\([^)]+\)$/.test(str)) {
        return true;
    }
    
    // Check for named colors
    const namedColors = ['red', 'green', 'blue', 'white', 'black', 'transparent', 'yellow', 'cyan', 'magenta', 'orange', 'purple', 'pink', 'gray', 'grey'];
    if (namedColors.includes(str.toLowerCase())) {
        return true;
    }
    
    return false;
}

/**
 * Parse a CSS color string to Color object
 * Throws an error if the color string is invalid
 */
export function parseColor(colorStr: string): Color {
    // Handle hex colors
    if (colorStr.startsWith('#')) {
        const hex = colorStr.slice(1);
        if (hex.length === 3 && /^[0-9a-fA-F]{3}$/.test(hex)) {
            return {
                r: parseInt(hex[0] + hex[0], 16),
                g: parseInt(hex[1] + hex[1], 16),
                b: parseInt(hex[2] + hex[2], 16),
            };
        }
        if (hex.length === 6 && /^[0-9a-fA-F]{6}$/.test(hex)) {
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16),
            };
        }
        if (hex.length === 8 && /^[0-9a-fA-F]{8}$/.test(hex)) {
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16),
                a: parseInt(hex.slice(6, 8), 16) / 255,
            };
        }
        throw new Error(`Invalid hex color: ${colorStr}`);
    }
    
    // Handle rgb() and rgba()
    const rgbMatch = colorStr.match(/rgba?\(([^)]+)\)/);
    if (rgbMatch) {
        const values = rgbMatch[1].split(',').map(v => parseFloat(v.trim()));
        if (values.length < 3 || values.some(v => Number.isNaN(v))) {
            throw new Error(`Invalid rgb color: ${colorStr}`);
        }
        return {
            r: Math.max(0, Math.min(255, values[0])),
            g: Math.max(0, Math.min(255, values[1])),
            b: Math.max(0, Math.min(255, values[2])),
            a: values[3] !== undefined ? Math.max(0, Math.min(1, values[3])) : undefined,
        };
    }
    
    // Handle named colors (expanded set)
    const namedColors: Record<string, Color> = {
        red: { r: 255, g: 0, b: 0 },
        green: { r: 0, g: 255, b: 0 },
        blue: { r: 0, g: 0, b: 255 },
        white: { r: 255, g: 255, b: 255 },
        black: { r: 0, g: 0, b: 0 },
        transparent: { r: 0, g: 0, b: 0, a: 0 },
        yellow: { r: 255, g: 255, b: 0 },
        cyan: { r: 0, g: 255, b: 255 },
        magenta: { r: 255, g: 0, b: 255 },
        orange: { r: 255, g: 165, b: 0 },
        purple: { r: 128, g: 0, b: 128 },
        pink: { r: 255, g: 192, b: 203 },
        gray: { r: 128, g: 128, b: 128 },
        grey: { r: 128, g: 128, b: 128 },
    };
    
    const namedColor = namedColors[colorStr.toLowerCase()];
    if (namedColor) {
        return namedColor;
    }
    
    throw new Error(`Unrecognized color: ${colorStr}`);
}

/**
 * Convert Color object to CSS string
 */
export function colorToString(color: Color): string {
    if (color.a !== undefined && color.a !== 1) {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    }
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

/**
 * String lerp implementation (for colors and other CSS values)
 */
export const stringLerp: LerpFunction<string> = (start: string, end: string, progress: number): string => {
    // Only try to parse as colors if both strings look like colors
    if (isColorString(start) && isColorString(end)) {
        try {
            const startColor = parseColor(start);
            const endColor = parseColor(end);
            const lerpedColor = colorLerp(startColor, endColor, progress);
            return colorToString(lerpedColor);
        } catch {
            // If parsing fails, fall back to discrete switching
            return progress < 0.5 ? start : end;
        }
    }
    
    // For non-color strings, return the start or end value based on progress
    return progress < 0.5 ? start : end;
};

/**
 * Determine the type of a value and return the appropriate lerp function
 */
export function getLerpFunction(value: AnimatableValue): GenericLerpFunction {
    if (typeof value === 'number') {
        return numberLerp as GenericLerpFunction;
    }
    if (typeof value === 'string') {
        return stringLerp as GenericLerpFunction;
    }
    if (typeof value === 'object' && value !== null && 'r' in value) {
        return colorLerp as GenericLerpFunction;
    }
    
    // Fallback to number lerp
    return numberLerp as GenericLerpFunction;
}

/**
 * Generic lerp function that automatically determines the type
 */
export function lerp(start: AnimatableValue, end: AnimatableValue, progress: number): AnimatableValue {
    const lerpFn = getLerpFunction(start);
    return lerpFn(start, end, progress);
}

// Register default lerp functions
lerpRegistry.set('number', numberLerp as GenericLerpFunction);
lerpRegistry.set('string', stringLerp as GenericLerpFunction);
lerpRegistry.set('color', colorLerp as GenericLerpFunction);

/**
 * Register a custom lerp function for a specific type
 */
export function registerLerp(typeName: string, lerpFn: GenericLerpFunction): void {
    lerpRegistry.set(typeName, lerpFn);
}

/**
 * Get a registered lerp function by type name
 */
export function getLerpByType(typeName: string): GenericLerpFunction | undefined {
    return lerpRegistry.get(typeName);
}
