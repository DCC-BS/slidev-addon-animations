import type Konva from "konva";

export type AnchorPoint = "left" | "right" | "top" | "bottom" | "center";
export type ConnectionType = "straight" | "curved" | "orthogonal";
export type LineType = "line" | "arrow" | "double-arrow";

/**
 * Shape interface that supports scaling
 * scaleX and scaleY factors are applied from the top-left corner of the shape
 */
export interface Shape {
    x: number;
    y: number;
    width: number;
    height: number;
    scaleX?: number;
    scaleY?: number;
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
 * Get anchor point coordinates for a shape
 *
 * This function now supports scaled shapes. When scaleX/scaleY are provided,
 * the function calculates anchor points based on the effective scaled dimensions.
 *
 * Scale transformation is applied from the top-left corner of the shape.
 *
 * Example:
 * ```typescript
 * const shape = { x: 100, y: 100, width: 200, height: 100, scaleX: 1.5, scaleY: 2 };
 * const rightAnchor = getAnchorPoint(shape, 'right');
 * // Returns the right edge of the scaled shape, accounting for top-left corner scaling
 * ```
 */
export function getAnchorPoint(
    shape: Shape,
    anchor: AnchorPoint,
): { x: number; y: number } {
    const { x, y, width, height, scaleX = 1, scaleY = 1 } = shape;

    // Calculate effective dimensions considering scale factors
    // Scaling happens from the top-left corner, so position stays the same
    const effectiveWidth = width * scaleX;
    const effectiveHeight = height * scaleY;

    switch (anchor) {
        case "left":
            return { x: x, y: y + effectiveHeight / 2 };
        case "right":
            return {
                x: x + effectiveWidth,
                y: y + effectiveHeight / 2,
            };
        case "top":
            return { x: x + effectiveWidth / 2, y: y };
        case "bottom":
            return {
                x: x + effectiveWidth / 2,
                y: y + effectiveHeight,
            };
        case "center":
            return {
                x: x + effectiveWidth / 2,
                y: y + effectiveHeight / 2,
            };
        default:
            return {
                x: x + effectiveWidth / 2,
                y: y + effectiveHeight / 2,
            };
    }
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
 * Calculate points for a curved connection
 */
function getCurvedPoints(
    from: { x: number; y: number },
    to: { x: number; y: number },
): number[] {
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    // Add some curvature by offsetting the middle point
    const offset = Math.abs(to.x - from.x) * 0.2;
    const controlX = midX;
    const controlY = midY - offset;

    return [from.x, from.y, controlX, controlY, to.x, to.y];
}

/**
 * Calculate points for an orthogonal (right-angle) connection
 */
function getOrthogonalPoints(
    from: { x: number; y: number },
    to: { x: number; y: number },
    fromAnchor: AnchorPoint,
    toAnchor: AnchorPoint,
    cornerRadius = 10,
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
            points = getCurvedPoints(fromPoint, toPoint);
            tension = defaultConfig.tension || 0.5;
            break;
        case "orthogonal":
            points = getOrthogonalPoints(
                fromPoint,
                toPoint,
                fromAnchor,
                toAnchor,
                defaultConfig.cornerRadius,
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
    connection: any, // Using any to avoid complex Konva type issues
    options: ConnectionOptions,
): void {
    const {
        fromShape,
        toShape,
        fromAnchor,
        toAnchor,
        connectionType,
        config = {},
    } = options;

    const fromPoint = getAnchorPoint(fromShape, fromAnchor);
    const toPoint = getAnchorPoint(toShape, toAnchor);

    let points: number[];
    let tension = 0;

    switch (connectionType) {
        case "straight":
            points = getStraightPoints(fromPoint, toPoint);
            break;
        case "curved":
            points = getCurvedPoints(fromPoint, toPoint);
            tension = config.tension || 0.5;
            break;
        case "orthogonal":
            points = getOrthogonalPoints(
                fromPoint,
                toPoint,
                fromAnchor,
                toAnchor,
                config.cornerRadius,
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
): any[] {
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
): any {
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
