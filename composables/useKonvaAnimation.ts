import { useSlideContext } from "@slidev/client";
import Konva from "konva";
import { computed, ref, watch } from "vue";

import type { AnimationOptions, AnimationTarget } from "../types/animation.js";
import {
    createAnimationLoop,
    prepareAnimations,
    prepareReverseAnimations,
} from "../utils/animationEngine.js";
import {
    applyStepsUpTo,
    calculateTotalSteps,
    initializeTargets,
} from "../utils/animationHelpers.js";

export function useKonvaAnimation(
    targets: AnimationTarget[],
    options: AnimationOptions = {},
) {
    const { $slidev } = useSlideContext();

    const {
        skipThreshold = 300,
        defaultDuration = 1000,
        defaultEasing = Konva.Easings.EaseInOut,
    } = options;

    const isAnimating = ref(false);
    const currentStep = ref(-1); // Start at -1 to indicate initial state
    const stepStartTime = ref(0);
    const activeTweens = ref<Array<{ id: number | null; cancel: () => void }>>(
        [],
    );

    // Total number of animation steps across all targets
    const totalSteps = computed(() => calculateTotalSteps(targets));

    // Stop all active tweens
    const stopAllTweens = () => {
        activeTweens.value.forEach((animation) => {
            animation?.cancel();
        });
        activeTweens.value = [];
        isAnimating.value = false;
    };

    // Initialize all targets to their initial states
    const initializeTargetsWrapper = () => {
        initializeTargets(targets);
        currentStep.value = -1;
    };

    // Animate to a specific step with improved logic
    const animateToStep = (stepIndex: number, forceSkip = false) => {
        if (stepIndex < 0 || stepIndex >= totalSteps.value) return;

        const now = Date.now();
        const timeSinceLastStep = now - stepStartTime.value;

        // Stop any currently running animations
        stopAllTweens();

        // Skip animation if advancing quickly or forced
        if (
            forceSkip ||
            (timeSinceLastStep < skipThreshold && stepIndex > currentStep.value)
        ) {
            applyStepsUpTo(targets, currentStep.value + 1, stepIndex);
            currentStep.value = stepIndex;
            stepStartTime.value = now;
            return;
        }

        // No animation needed if already at target step
        if (stepIndex === currentStep.value) {
            stepStartTime.value = now;
            return;
        }

        isAnimating.value = true;
        stepStartTime.value = now;

        // Prepare animations based on direction
        const animations =
            stepIndex < currentStep.value
                ? prepareReverseAnimations(
                      targets,
                      stepIndex,
                      defaultDuration,
                      defaultEasing,
                  )
                : prepareAnimations(
                      targets,
                      stepIndex,
                      defaultDuration,
                      defaultEasing,
                  );

        if (animations.length === 0) {
            isAnimating.value = false;
            currentStep.value = stepIndex;
            return;
        }

        // Start animation loop
        const animationControl = createAnimationLoop(animations, () => {
            isAnimating.value = false;
        });

        // Store cancellation function
        activeTweens.value = [
            {
                id: animationControl.frameId,
                cancel: animationControl.cancel,
            },
        ];

        currentStep.value = stepIndex;
    };

    // Watch for click changes from Slidev
    watch(
        () => $slidev.nav.clicks,
        (newClicks, oldClicks) => {
            if (newClicks === 0) {
                initializeTargetsWrapper();
                return;
            }

            const targetStep = Math.min(newClicks - 1, totalSteps.value - 1);
            const clickDifference = Math.abs(newClicks - (oldClicks || 0));

            // Skip animation for large click differences
            animateToStep(targetStep, clickDifference > 1);
        },
        { immediate: true },
    );

    // Reset when slide changes
    watch(
        () => $slidev.nav.currentPage,
        () => {
            stopAllTweens();
            initializeTargetsWrapper();
        },
    );

    return {
        currentStep: computed(() => currentStep.value),
        totalSteps,
        isAnimating: computed(() => isAnimating.value),
        animateToStep,
        initializeTargets: initializeTargetsWrapper,
        stopAllTweens,
    };
}

// Re-export types for convenience
export type {
    AnimatableObject,
    AnimationOptions,
    AnimationStep,
    AnimationTarget,
    EasingFunction,
} from "../types/animation.js";

// Re-export helper functions for convenience
export {
    createAnimationStep,
    createAnimationTarget,
} from "../utils/animationHelpers.js";
