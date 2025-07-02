/**
 * Types for Graphic component
 */
import type { BlockConfig } from "./block.js";
import type { ConnectionOptions } from "./shapeConnector.js";

export interface GraphicProps {
    width?: number;
    height?: number;
    blocks?: BlockConfig[];
    connections?: ConnectionOptions[];
}
