<script lang="ts" setup>
import type { StageConfig } from "konva/lib/Stage";
import type { CircleConfig } from "konva/lib/shapes/Circle";
import type { RectConfig } from "konva/lib/shapes/Rect";
import { ref } from "vue";
import {
    animate,
    EasingPresets,
    fadeTo,
    moveTo,
    rotateTo,
    scaleTo,
    step,
} from "../composables/useGeneratorAnimation";

const stageConfig = ref<StageConfig>({
    width: 600,
    height: 400,
});

// Create reactive refs for our animated objects
const circle1 = ref<CircleConfig>({
    x: 100,
    y: 200,
    radius: 40,
    fill: "red",
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
});

const circle2 = ref<CircleConfig>({
    x: 300,
    y: 200,
    radius: 30,
    fill: "blue",
    opacity: 0,
    scaleX: 0.5,
    scaleY: 0.5,
});
const rect1 = ref<RectConfig>({
    x: 500,
    y: 150,
    width: 80,
    height: 60,
    fill: "green",
    rotation: 0,
    opacity: 1,
});

// Animation generator function demonstrating various animation types
function* animationSequence() {
    // Step 1: Basic movement and scaling
    yield step(
        moveTo(circle1, 200, 200, {
            duration: 1000,
            easing: EasingPresets.easeOut,
        }),
        fadeTo(circle2, 1, { duration: 600 }),
        scaleTo(circle2, 1, { duration: 800, easing: EasingPresets.bounceOut }),
    );

    // Step 2: Simultaneous animations with different easings
    yield step(
        moveTo(circle1, 350, 100, {
            duration: 1200,
            easing: EasingPresets.elasticOut,
        }),
        moveTo(circle2, 150, 300, {
            duration: 1000,
            easing: EasingPresets.backOut,
        }),
        rotateTo(rect1, Math.PI / 4, {
            duration: 800,
            easing: EasingPresets.easeInOut,
        }),
    );

    // Step 3: Complex choreographed movement
    yield step(
        animate(
            circle1.value,
            { x: 400, y: 250, fill: "orange" },
            { duration: 1000 },
        ),
        animate(
            circle2.value,
            { x: 250, y: 150, radius: 50 },
            { duration: 1200, easing: EasingPresets.elasticOut },
        ),
        animate(
            rect1.value,
            { x: 300, y: 300, width: 120, height: 40 },
            { duration: 800 },
        ),
    );

    // Step 4: Scale and fade effects
    yield step(
        scaleTo(circle1, 1.5, {
            duration: 600,
            easing: EasingPresets.bounceOut,
        }),
        fadeTo(rect1, 0.3, { duration: 800 }),
        animate(circle2.value, { fill: "purple" }, { duration: 400 }),
    );

    // Step 5: Reset to original positions
    yield step(
        moveTo(circle1, 100, 200, {
            duration: 1000,
            easing: EasingPresets.easeInOut,
        }),
        moveTo(circle2, 300, 200, {
            duration: 1000,
            easing: EasingPresets.easeInOut,
        }),
        animate(
            rect1.value,
            {
                x: 500,
                y: 150,
                rotation: 0,
                opacity: 1,
                width: 80,
                height: 60,
            },
            { duration: 1000, easing: EasingPresets.easeInOut },
        ),
        scaleTo(circle1, 1, { duration: 800 }),
        scaleTo(circle2, 1, { duration: 800 }),
        animate(circle1, { fill: "red" }, { duration: 500 }),
        animate(circle2, { fill: "blue", radius: 30 }, { duration: 500 }),
    );
}
</script>

<template>
    <div>
        <h3 class="text-xl font-bold mb-4">Animation System Demo</h3>

        <!-- Animator component manages the step-by-step animations -->
        <Animator :generator="animationSequence">
            <template #default="{ currentStep, totalSteps, isAnimating }">
                <div class="mb-4 text-sm">
                    Step {{ currentStep }} of {{ totalSteps }}
                    <span v-if="isAnimating" class="text-blue-500">(Animating...)</span>
                </div>
            </template>
        </Animator>

        <!-- Konva Stage for rendering graphics -->
        <v-stage :config="stageConfig">
            <v-layer>
                <!-- Animated circles -->
                <v-circle :config="circle1" />
                <v-circle :config="circle2" />

                <!-- Animated rectangle -->
                <v-rect :config="rect1" />

                <!-- Static elements for reference -->
                <v-text :config="{
                    x: 20,
                    y: 20,
                    text: 'Animation Demo: Click through slides to see animations',
                    fontSize: 14,
                    fill: 'black'
                }" />
            </v-layer>
        </v-stage>

        <div class="mt-4 text-sm text-gray-600">
            <p><strong>Features demonstrated:</strong></p>
            <ul class="list-disc ml-4">
                <li>Multiple objects animating simultaneously</li>
                <li>Different easing functions (bounce, elastic, ease-in-out)</li>
                <li>Property animations (position, scale, rotation, opacity, color)</li>
                <li>Synchronized step-by-step progression</li>
            </ul>
        </div>
    </div>
</template>
