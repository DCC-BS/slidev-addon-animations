<script lang="ts" setup>
import { computed, watch } from "vue";
import type { ConnectionProps } from "../types/componentProps.js";
import {
    type ConnectionOptions,
    createConnection,
} from "../utils/shapeConnector";

const props = defineProps<ConnectionProps>();
const config = computed(() => createConnection(props.config));
</script>

<template>
    <v-line :config="config" v-if="props.config.lineType == 'line'" />
    <v-arrow :config="config" v-if="props.config.lineType === 'arrow' || props.config.lineType == 'double-arrow'" />
</template>