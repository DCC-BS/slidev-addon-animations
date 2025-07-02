<script setup lang="ts">
import { computed } from "vue";
import type { BlockProps } from "../types/componentProps.js";

const props = defineProps<BlockProps>();

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