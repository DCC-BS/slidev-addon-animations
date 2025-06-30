<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, shallowRef } from "vue";
import {
    type AnimationGeneratorFunction,
    useGeneratorAnimation,
} from "../composables/useGeneratorAnimation";

// Props interface for generator-based animations
interface Props {
    generator?: () => AnimationGeneratorFunction;
    skipThreshold?: number;
    defaultDuration?: number;
    defaultEasing?: string;
}

const props = withDefaults(defineProps<Props>(), {
    skipThreshold: 300,
    defaultDuration: 1000,
    defaultEasing: "easeInOut",
});

// Create the generator animation system once
const { createAnimationFromGenerator } = useGeneratorAnimation({
    skipThreshold: props.skipThreshold,
    defaultDuration: props.defaultDuration,
    defaultEasing: props.defaultEasing,
});

// Use shallowRef for better performance since we don't need deep reactivity
const animationSystem = shallowRef<unknown>(null);
const currentStep = ref(-1);
const totalSteps = ref(0);
const isAnimating = ref(false);

let updateInterval: NodeJS.Timeout | undefined = undefined;

// Throttle the reactive updates to reduce overhead
let updateScheduled = false;
const scheduleUpdate = () => {
    if (updateScheduled) return;
    updateScheduled = true;

    // Use a microtask to batch updates
    Promise.resolve().then(() => {
        if (animationSystem.value) {
            const system = animationSystem.value as {
                currentStep: { value: number };
                totalSteps: { value: number };
                isAnimating: { value: boolean };
            };
            currentStep.value = system.currentStep.value;
            totalSteps.value = system.totalSteps.value;
            isAnimating.value = system.isAnimating.value;
        }
        updateScheduled = false;
    });
};

// Initialize animation system once on mount
onMounted(() => {
    if (props.generator) {
        // Create animation system once and cache it
        animationSystem.value = createAnimationFromGenerator(props.generator);

        // Set up throttled reactive updates
        const system = animationSystem.value as {
            currentStep: { value: number };
            totalSteps: { value: number };
            isAnimating: { value: boolean };
        };

        // Set initial values
        currentStep.value = system.currentStep.value;
        totalSteps.value = system.totalSteps.value;
        isAnimating.value = system.isAnimating.value;

        // Set up a periodic check instead of reactive watching to reduce overhead
        updateInterval = setInterval(() => {
            const newCurrentStep = system.currentStep.value;
            const newTotalSteps = system.totalSteps.value;
            const newIsAnimating = system.isAnimating.value;

            if (
                newCurrentStep !== currentStep.value ||
                newTotalSteps !== totalSteps.value ||
                newIsAnimating !== isAnimating.value
            ) {
                scheduleUpdate();
            }
        }, 50); // Check every 50ms instead of every frame
    }
});

onUnmounted(() => {
    clearInterval(updateInterval);
});

// Expose values to parent component
defineExpose({
    currentStep: computed(() => currentStep.value),
    totalSteps: computed(() => totalSteps.value),
    isAnimating: computed(() => isAnimating.value),
});
</script>

<template>
    <!-- v-click components for each animation step -->
    <v-click v-for="step in totalSteps" :key="`step-${step}`">
        <div></div>
    </v-click>

    <!-- Optional slot for additional content -->
    <slot :current-step="Math.max(0, currentStep + 1)" :total-steps="totalSteps" :is-animating="isAnimating" />
</template>
