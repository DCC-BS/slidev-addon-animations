<script lang="ts" setup>
import { computed } from "vue";
import {
    type ConnectionOptions,
    createConnection,
} from "../utils/shapeConnector";

interface Props {
    config: ConnectionOptions;
}

const props = defineProps<Props>();
const config = computed(() => createConnection(props.config));
</script>

<template>
    <v-line :config="config" v-if="props.config.lineType == 'line'" />
    <v-arrow :config="config" v-if="props.config.lineType === 'arrow' || props.config.lineType == 'double-arrow'" />
</template>