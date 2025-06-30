<script setup lang="ts">
import type { RectConfig } from "konva/lib/shapes/Rect";
import type { TextConfig } from "konva/lib/shapes/Text";
import { computed, watch } from "vue";

export interface BlockConfig {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text?: string;
    scaleX?: number;
    scaleY?: number;
    opacity?: number;
    rotation?: number;
    offsetX?: number;
    offsetY?: number;
    offset?: { x: number; y: number };
    rectConfig?: Partial<RectConfig>;
    textConfig?: Partial<TextConfig>;
}

interface InputProps extends BlockConfig {
    config: BlockConfig;
}

const props = defineProps<InputProps>();

const config = computed(() => {
    return {
        ...props,
        ...props.config,
        offsetX: props.offsetX ?? props.config.offsetX,
        offsetY: props.offsetY ?? props.config.offsetY,
    };
});

const rectConfig = computed(() => {
    return {
        width: config.value.width,
        height: config.value.height,
        fill: "lightblue",
        stroke: "black",
        strokeWidth: 2,
        scaleX: config.value.scaleX ?? 1,
        scaleY: config.value.scaleY ?? 1,
        opacity: config.value.opacity ?? 1,
        rotation: config.value.rotation ?? 0,
        offsetX: config.value.offsetX,
        offsetY: config.value.offsetY,
        offset: config.value.offset,
        ...config.value.rectConfig,
    };
});

const textConfig = computed(() => {
    return {
        text: config.value.text ?? "",
        fontSize: 16,
        fill: "black",
        width: config.value.width,
        height: config.value.height,
        align: "center",
        verticalAlign: "middle",
        scaleX: config.value.scaleX ?? 1,
        scaleY: config.value.scaleY ?? 1,
        opacity: config.value.opacity ?? 1,
        rotation: config.value.rotation ?? 0,
        offsetX: config.value.offsetX,
        offsetY: config.value.offsetY,
        offset: config.value.offset,
        ...config.value.textConfig,
    };
});
</script>

<template>
    <v-group :x="config.x" :y="config.y">
        <v-rect :config="rectConfig" />
        <v-text :config="textConfig" />
    </v-group>
</template>