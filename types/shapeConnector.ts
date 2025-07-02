/**
 * Types for shape connections
 */

export type AnchorPoint = "left" | "right" | "top" | "bottom" | "center";
export type ConnectionType = "straight" | "curved" | "orthogonal";
export type LineType = "line" | "arrow" | "double-arrow";

/**
 * Shape interface that supports scaling and rotation
 * scaleX and scaleY factors are applied from the top-left corner of the shape
 * rotation is applied around the origin (top-left) by default, or around offsetX/offsetY if provided
 * offset can be used as an alternative to offsetX/offsetY
 */
export interface Shape {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    offsetX?: number;
    offsetY?: number;
    offset?: { x: number; y: number };
}

export interface ConnectionConfig {
    stroke?: string;
    strokeWidth?: number;
    dash?: number[];
    fill?: string;
    pointerLength?: number;
    pointerWidth?: number;
    tension?: number;
    cornerRadius?: number;
    opacity?: number;
}

export interface ConnectionOptions {
    fromShape: Shape;
    toShape: Shape;
    fromAnchor: AnchorPoint;
    toAnchor: AnchorPoint;
    connectionType: ConnectionType;
    lineType: LineType;
    config?: ConnectionConfig;
}
