import type Konva from "konva";

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

/**
 * Rotate a point around a center point by a given angle in degrees
 */
function rotatePoint(
    point: { x: number; y: number },
    center: { x: number; y: number },
    angleInDegrees: number,
): { x: number; y: number } {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    const cos = Math.cos(angleInRadians);
    const sin = Math.sin(angleInRadians);

    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return {
        x: center.x + (dx * cos - dy * sin),
        y: center.y + (dx * sin + dy * cos),
    };
}

/**
 * Get anchor point coordinates for a shape
 *
 * This function supports scaled and rotated shapes following Konva's transformation model:
 * - Position (x, y) defines the coordinate system origin
 * - Offset (offsetX, offsetY) moves the drawing origin but rotation still happens around (x, y)
 * - Scale is applied from the drawing origin
 * - Rotation is applied around the position (x, y), not the visual location
 * - offset property takes priority over offsetX/offsetY if both are specified
 *
 * Example:
 * ```typescript
 * const shape = {
 *   x: 100, y: 100, width: 200, height: 100,
 *   scaleX: 1.5, scaleY: 2, rotation: 45,
 *   offset: { x: 100, y: 50 }  // Shape draws from (0, 50) but rotates around (100, 100)
 * };
 * const rightAnchor = getAnchorPoint(shape, 'right');
 * ```
 */
export function getAnchorPoint(
    shape: Shape,
    anchor: AnchorPoint,
): { x: number; y: number } {
    let {
        x,
        y,
        width,
        height,
        scaleX = 1,
        scaleY = 1,
        rotation = 0,
        offsetX = 0,
        offsetY = 0,
        offset,
    } = shape;

    // Validate shape dimensions
    x ??= 0;
    y ??= 0;
    width ??= 0;
    height ??= 0;

    // Get the final offset values (offset property takes priority)
    const finalOffsetX = offset?.x ?? offsetX;
    const finalOffsetY = offset?.y ?? offsetY;

    // In Konva's model:
    // - The shape visually appears at (x - offsetX, y - offsetY)
    // - But rotation happens around (x, y)
    const visualX = x - finalOffsetX;
    const visualY = y - finalOffsetY;

    // Calculate effective dimensions considering scale factors
    const effectiveWidth = width * scaleX;
    const effectiveHeight = height * scaleY;

    // Calculate anchor point based on the visual position (before rotation)
    let anchorPoint: { x: number; y: number };

    switch (anchor) {
        case "left":
            anchorPoint = { x: visualX, y: visualY + effectiveHeight / 2 };
            break;
        case "right":
            anchorPoint = {
                x: visualX + effectiveWidth,
                y: visualY + effectiveHeight / 2,
            };
            break;
        case "top":
            anchorPoint = { x: visualX + effectiveWidth / 2, y: visualY };
            break;
        case "bottom":
            anchorPoint = {
                x: visualX + effectiveWidth / 2,
                y: visualY + effectiveHeight,
            };
            break;
        case "center":
            anchorPoint = {
                x: visualX + effectiveWidth / 2,
                y: visualY + effectiveHeight / 2,
            };
            break;
        default:
            anchorPoint = {
                x: visualX + effectiveWidth / 2,
                y: visualY + effectiveHeight / 2,
            };
    }

    // If there's no rotation, return the anchor point as is
    if (rotation === 0) {
        return anchorPoint;
    }

    // In Konva, rotation happens around the position (x, y), not the visual position
    // This is the key insight from the Konva documentation
    const rotationCenter = {
        x: x,
        y: y,
    };

    // Rotate the anchor point around the shape's position
    return rotatePoint(anchorPoint, rotationCenter, rotation);
}

/**
 * Calculate points for a straight connection
 */
function getStraightPoints(
    from: { x: number; y: number },
    to: { x: number; y: number },
): number[] {
    return [from.x, from.y, to.x, to.y];
}

/**
 * Calculate points for a curved connection that exits perpendicular to shape edges
 */
function getCurvedPoints(
    from: { x: number; y: number },
    to: { x: number; y: number },
    fromAnchor: AnchorPoint,
    toAnchor: AnchorPoint,
): number[] {
    // Calculate the distance between points
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Use a proportional curve strength
    const baseOffset = Math.min(distance * 0.35, 80);
    const minOffset = 25;
    const controlOffset = Math.max(baseOffset, minOffset);

    // Create two control points for a cubic Bézier curve
    let fromControlX = from.x;
    let fromControlY = from.y;
    let toControlX = to.x;
    let toControlY = to.y;

    // First control point - extends perpendicular from the "from" anchor
    switch (fromAnchor) {
        case "left":
            fromControlX = from.x - controlOffset;
            fromControlY = from.y;
            break;
        case "right":
            fromControlX = from.x + controlOffset;
            fromControlY = from.y;
            break;
        case "top":
            fromControlX = from.x;
            fromControlY = from.y - controlOffset;
            break;
        case "bottom":
            fromControlX = from.x;
            fromControlY = from.y + controlOffset;
            break;
        case "center": {
            const angle = Math.atan2(dy, dx);
            fromControlX = from.x + Math.cos(angle) * controlOffset;
            fromControlY = from.y + Math.sin(angle) * controlOffset;
            break;
        }
    }

    // Second control point - extends perpendicular from the "to" anchor
    // Use the same direction as the anchor to avoid overshooting
    switch (toAnchor) {
        case "left":
            toControlX = to.x - controlOffset;
            toControlY = to.y;
            break;
        case "right":
            toControlX = to.x + controlOffset;
            toControlY = to.y;
            break;
        case "top":
            toControlX = to.x;
            toControlY = to.y - controlOffset;
            break;
        case "bottom":
            toControlX = to.x;
            toControlY = to.y + controlOffset;
            break;
        case "center": {
            const angle = Math.atan2(dy, dx);
            toControlX = to.x - Math.cos(angle) * controlOffset;
            toControlY = to.y - Math.sin(angle) * controlOffset;
            break;
        }
    }

    // Return cubic Bézier curve points: start, control1, control2, end
    return [
        from.x,
        from.y,
        fromControlX,
        fromControlY,
        toControlX,
        toControlY,
        to.x,
        to.y,
    ];
}

/**
 * Calculate points for an orthogonal (right-angle) connection
 */
function getOrthogonalPoints(
    from: { x: number; y: number },
    to: { x: number; y: number },
    fromAnchor: AnchorPoint,
    toAnchor: AnchorPoint,
): number[] {
    const isFromHorizontal = fromAnchor === "left" || fromAnchor === "right";
    const isToHorizontal = toAnchor === "left" || toAnchor === "right";

    if (isFromHorizontal && !isToHorizontal) {
        // From horizontal to vertical
        const midX = to.x;
        return [from.x, from.y, midX, from.y, midX, to.y];
    } else if (!isFromHorizontal && isToHorizontal) {
        // From vertical to horizontal
        const midY = to.y;
        return [from.x, from.y, from.x, midY, to.x, midY];
    } else if (isFromHorizontal && isToHorizontal) {
        // Both horizontal
        const midX = (from.x + to.x) / 2;
        return [from.x, from.y, midX, from.y, midX, to.y, to.x, to.y];
    } else {
        // Both vertical
        const midY = (from.y + to.y) / 2;
        return [from.x, from.y, from.x, midY, to.x, midY, to.x, to.y];
    }
}

/**
 * Create a connection between two shapes
 */
export function createConnection(
    options: ConnectionOptions,
): Konva.LineConfig | Konva.ArrowConfig {
    const {
        fromShape,
        toShape,
        fromAnchor,
        toAnchor,
        connectionType,
        lineType,
        config = {},
    } = options;

    const defaultConfig: ConnectionConfig = {
        stroke: "black",
        strokeWidth: 2,
        pointerLength: 10,
        pointerWidth: 10,
        tension: 0,
        cornerRadius: 10,
        opacity: 1,
        ...config,
    };

    const fromPoint = getAnchorPoint(fromShape, fromAnchor);
    const toPoint = getAnchorPoint(toShape, toAnchor);

    let points: number[];
    let tension = 0;

    switch (connectionType) {
        case "straight":
            points = getStraightPoints(fromPoint, toPoint);
            break;
        case "curved":
            points = getCurvedPoints(fromPoint, toPoint, fromAnchor, toAnchor);
            tension = 0; // For cubic Bézier curves, tension should be 0
            break;
        case "orthogonal":
            points = getOrthogonalPoints(
                fromPoint,
                toPoint,
                fromAnchor,
                toAnchor,
            );
            break;
        default:
            points = getStraightPoints(fromPoint, toPoint);
    }

    const baseConfig = {
        points,
        stroke: defaultConfig.stroke,
        strokeWidth: defaultConfig.strokeWidth,
        dash: defaultConfig.dash,
        opacity: defaultConfig.opacity,
        tension,
    };

    switch (lineType) {
        case "line":
            // return new Konva.Line(baseConfig);
            return baseConfig;

        case "arrow":
            return {
                ...baseConfig,
                fill: defaultConfig.fill || defaultConfig.stroke,
                pointerLength: defaultConfig.pointerLength,
                pointerWidth: defaultConfig.pointerWidth,
                pointerAtBeginning: false,
                pointerAtEnding: true,
            };

        case "double-arrow":
            return {
                ...baseConfig,
                fill: defaultConfig.fill || defaultConfig.stroke,
                pointerLength: defaultConfig.pointerLength,
                pointerWidth: defaultConfig.pointerWidth,
                pointerAtBeginning: true,
                pointerAtEnding: true,
            };

        default:
            return baseConfig;
    }
}

/**
 * Update an existing connection when shapes move
 */
export function updateConnection(
    connection: {
        points: (points: number[]) => void;
        tension?: (tension: number) => void;
    },
    options: ConnectionOptions,
): void {
    const { fromShape, toShape, fromAnchor, toAnchor, connectionType } =
        options;

    const fromPoint = getAnchorPoint(fromShape, fromAnchor);
    const toPoint = getAnchorPoint(toShape, toAnchor);

    let points: number[];
    let tension = 0;

    switch (connectionType) {
        case "straight":
            points = getStraightPoints(fromPoint, toPoint);
            break;
        case "curved":
            points = getCurvedPoints(fromPoint, toPoint, fromAnchor, toAnchor);
            tension = 0; // For cubic Bézier curves, tension should be 0
            break;
        case "orthogonal":
            points = getOrthogonalPoints(
                fromPoint,
                toPoint,
                fromAnchor,
                toAnchor,
            );
            break;
        default:
            points = getStraightPoints(fromPoint, toPoint);
    }

    connection.points(points);
    if (connection.tension && typeof connection.tension === "function") {
        connection.tension(tension);
    }
}

/**
 * Create multiple connections at once
 */
export function createMultipleConnections(
    connectionsList: ConnectionOptions[],
): (Konva.LineConfig | Konva.ArrowConfig)[] {
    return connectionsList.map((options) => createConnection(options));
}

/**
 * Helper function to get the optimal anchor point for connecting two shapes
 */
export function getOptimalAnchorPoints(
    fromShape: Shape,
    toShape: Shape,
): {
    fromAnchor: AnchorPoint;
    toAnchor: AnchorPoint;
} {
    const fromCenter = getAnchorPoint(fromShape, "center");
    const toCenter = getAnchorPoint(toShape, "center");

    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;

    let fromAnchor: AnchorPoint;
    let toAnchor: AnchorPoint;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal connection is dominant
        if (dx > 0) {
            fromAnchor = "right";
            toAnchor = "left";
        } else {
            fromAnchor = "left";
            toAnchor = "right";
        }
    } else {
        // Vertical connection is dominant
        if (dy > 0) {
            fromAnchor = "bottom";
            toAnchor = "top";
        } else {
            fromAnchor = "top";
            toAnchor = "bottom";
        }
    }

    return { fromAnchor, toAnchor };
}

/**
 * Create a smart connection that automatically chooses the best anchor points
 */
export function createSmartConnection(
    fromShape: Shape,
    toShape: Shape,
    connectionType: ConnectionType = "straight",
    lineType: LineType = "arrow",
    config?: ConnectionConfig,
): Konva.LineConfig | Konva.ArrowConfig {
    const { fromAnchor, toAnchor } = getOptimalAnchorPoints(fromShape, toShape);

    return createConnection({
        fromShape,
        toShape,
        fromAnchor,
        toAnchor,
        connectionType,
        lineType,
        config,
    });
}
