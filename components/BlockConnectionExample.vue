<script lang="ts" setup>
import type { StageConfig } from "konva/lib/Stage";
import { computed, ref, watch } from "vue";
import {
    animate,
    EasingPresets,
    fadeTo,
    moveTo,
    rotateTo,
    scaleTo,
    step,
} from "../composables/useGeneratorAnimation";
import type { ConnectionOptions } from "../utils/shapeConnector";
import Animator from "./Animator.vue";
import type { BlockConfig } from "./Block.vue";
import Block from "./Block.vue";
import Connection from "./Connection.vue";

const stageConfig = ref<StageConfig>({
    width: 700,
    height: 500,
});

// Create reactive refs for our blocks
const block1 = ref<BlockConfig>({
    x: 50,
    y: 100,
    width: 120,
    height: 60,
    text: "Start",
    opacity: 0,
    scaleX: 0.5,
    scaleY: 0.5,
});

const block2 = ref<BlockConfig>({
    x: 250,
    y: 200,
    width: 120,
    height: 60,
    text: "Process",
    opacity: 0,
    scaleX: 0.5,
    scaleY: 0.5,
});

const block3 = ref<BlockConfig>({
    x: 450,
    y: 100,
    width: 120,
    height: 60,
    text: "End",
    opacity: 0,
    scaleX: 0.5,
    scaleY: 0.5,
    rotation: 0,
    offset: { x: 50, y: 50 }, // Center the rotation
});

const block4 = ref<BlockConfig>({
    x: 150,
    y: 350,
    width: 120,
    height: 60,
    text: "Branch",
    opacity: 0,
    scaleX: 0.5,
    scaleY: 0.5,
});

const connection1Config = ref({
    strokeWidth: 1,
    stroke: "blue",
    opacity: 0,
    pointerLength: 15,
    pointerWidth: 15,
});

// Create reactive refs for connections
const connection1 = computed<ConnectionOptions>(() => ({
    fromShape: block1.value,
    toShape: block2.value,
    fromAnchor: "right",
    toAnchor: "left",
    connectionType: "straight",
    lineType: "arrow",
    config: connection1Config.value,
}));

const connection2Config = ref({
    stroke: "green",
    strokeWidth: 3,
    opacity: 0,
    pointerLength: 15,
    pointerWidth: 15,
});

const connection2 = computed<ConnectionOptions>(() => ({
    fromShape: block2.value,
    toShape: block3.value,
    fromAnchor: "right",
    toAnchor: "left",
    connectionType: "curved",
    lineType: "arrow",
    config: connection2Config.value,
}));

const connection3Config = ref({
    stroke: "red",
    strokeWidth: 3,
    opacity: 0,
    pointerLength: 15,
    pointerWidth: 15,
});

const connection3 = computed<ConnectionOptions>(() => ({
    fromShape: block2.value,
    toShape: block4.value,
    fromAnchor: "bottom",
    toAnchor: "top",
    connectionType: "orthogonal",
    lineType: "arrow",
    config: connection3Config.value,
}));

// Animation sequence demonstrating block connections
function* blockConnectionSequence() {
    // Step 1: Introduce first block
    yield step(
        scaleTo(block1, 1, { duration: 800, easing: EasingPresets.backOut }),
        fadeTo(block1, 1, { duration: 600 }),
    );

    // Step 2: Show connection and second block
    yield step(
        animate(connection1Config, { opacity: 1 }, { duration: 600 }),
        scaleTo(block2, 1, { duration: 800, easing: EasingPresets.backOut }),
        animate(block2, { opacity: 1 }, { duration: 600 }),
    );

    // Step 3: Show curved connection to third block
    yield step(
        animate(connection2Config, { opacity: 1 }, { duration: 600 }),
        scaleTo(block3, 1, { duration: 800, easing: EasingPresets.backOut }),
        fadeTo(block3, 1, { duration: 600 }),
    );

    // Step 4: Show branch connection
    yield step(
        animate(connection3Config, { opacity: 1 }, { duration: 600 }),
        scaleTo(block4, 1, { duration: 800, easing: EasingPresets.backOut }),
        fadeTo(block4, 1, { duration: 600 }),
    );

    // Step 5: Rearrange blocks to show dynamic connections
    yield step(
        moveTo(block2, 300, 250, {
            duration: 1000,
            easing: EasingPresets.easeInOut,
        }),
        moveTo(block4, 100, 400, {
            duration: 1000,
            easing: EasingPresets.easeInOut,
        }),
        rotateTo(block3, 45, {
            duration: 800,
            easing: EasingPresets.easeInOut,
        }),
    );
}
</script>

<template>
    <div>
        <h3 class="text-xl font-bold mb-4">Block Connection System Demo</h3>

        <!-- Animator component manages the step-by-step animations -->
        <Animator :generator="blockConnectionSequence">
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
                <!-- Connections (rendered first so they appear behind blocks) -->
                <Connection :config="connection1" />
                <Connection :config="connection2" />
                <Connection :config="connection3" />

                <!-- Blocks -->
                <Block :config="block1" />
                <Block :config="block2" />
                <Block :config="block3" />
                <Block :config="block4" />

                <!-- Title and instructions -->
                <v-text :config="{
                    x: 20,
                    y: 20,
                    text: 'Block Connection Demo: Flowchart with Animated Connections',
                    fontSize: 16,
                    fill: 'black',
                    fontStyle: 'bold'
                }" />

                <!-- Legend -->
                <v-text :config="{
                    x: 20,
                    y: 45,
                    text: 'Blue: Straight → Green: Curved → Red: Orthogonal',
                    fontSize: 12,
                    fill: 'gray'
                }" />
            </v-layer>
        </v-stage>

        <div class="mt-4 text-sm text-gray-600">
            <p><strong>Features demonstrated:</strong></p>
            <ul class="list-disc ml-4">
                <li>Block components with text labels</li>
                <li>Dynamic connections between blocks</li>
                <li>Different connection types: straight, curved, orthogonal</li>
                <li>Connection highlighting and flow animation</li>
                <li>Animated block positioning with automatic connection updates</li>
                <li>Layered rendering (connections behind blocks)</li>
            </ul>
        </div>
    </div>
</template>
