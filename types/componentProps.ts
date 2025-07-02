/**
 * Types for component props
 */

import type { BlockConfig } from "./block.js";
import type { AnimationGeneratorFunction } from "./generatorAnimation.js";
import type { ConnectionOptions } from "./shapeConnector.js";

// Props for Connection component
export interface ConnectionProps {
    config: ConnectionOptions;
}

// Props for Animator component
export interface AnimatorProps {
    generator?: () => AnimationGeneratorFunction;
    skipThreshold?: number;
    defaultDuration?: number;
    defaultEasing?: string;
}

// Props for Block component (extends BlockConfig)
export interface BlockProps extends BlockConfig {
    config: BlockConfig;
}
