// Main composable
export { useKonvaAnimation } from "./composables/useKonvaAnimation.js";

// Types
export type {
    AnimatableObject,
    AnimationOptions,
    AnimationStep,
    AnimationTarget,
    EasingFunction,
} from "./types/animation.js";

// Lerp system types and functions
export type {
    AnimatableValue,
    Color,
    GenericLerpFunction,
    LerpFunction,
} from "./utils/lerpSystem.js";

export {
    colorLerp,
    colorToString,
    getLerpByType,
    getLerpFunction,
    lerp,
    numberLerp,
    parseColor,
    registerLerp,
    stringLerp,
} from "./utils/lerpSystem.js";
// Advanced utilities (for custom implementations)
export {
    applyEasing,
    createAnimationLoop,
    prepareAnimations,
    prepareReverseAnimations,
} from "./utils/animationEngine.js";
// Helper functions
export {
    applyStepEndState,
    applyStepsUpTo,
    calculateTotalSteps,
    createAnimationStep,
    createAnimationTarget,
    initializeTargets,
} from "./utils/animationHelpers.js";
