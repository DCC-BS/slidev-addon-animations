<script setup lang="ts">
import type { RectConfig } from "konva/lib/shapes/Rect";
import type { TextConfig } from "konva/lib/shapes/Text";
import { computed } from "vue";

export interface BlockConfig {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text?: string;
    scaleX?: number;
    scaleY?: number;
    opacity?: number;
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
    };
});

const rectConfg = computed(() => {
    return {
        width: config.value.width,
        height: config.value.height,
        fill: "lightblue",
        stroke: "black",
        strokeWidth: 2,
        scaleX: config.value.scaleX ?? 1,
        scaleY: config.value.scaleY ?? 1,
        opacity: config.value.opacity ?? 1,
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
        ...config.value.textConfig,
    };
});
</script>

<template>
    <v-group :x="config.x" :y="config.y">
        <v-rect :config="rectConfg" />
        <v-text :config="textConfig" />
    </v-group>
</template>