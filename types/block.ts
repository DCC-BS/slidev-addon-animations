/**
 * Types for Block component
 */
import type { RectConfig } from "konva/lib/shapes/Rect";
import type { TextConfig } from "konva/lib/shapes/Text";

export interface BlockConfig {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text?: string;
    scaleX?: number;
    scaleY?: number;
    opacity?: number;
    rotation?: number;
    offsetX?: number;
    offsetY?: number;
    offset?: { x: number; y: number };
    rectConfig?: Partial<RectConfig>;
    textConfig?: Partial<TextConfig>;
}
