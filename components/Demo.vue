<script lang="ts" setup>
import { computed, ref } from 'vue';
import { animate, step } from "../composables/useGeneratorAnimation";
import Animator from './Animator.vue';


const transformScale = ref(1);
const transformOriginX = ref(0);
const transformOriginY = ref(0);

const iFrameStyle = computed(() => ({
    transform: `scale(${transformScale.value})`,
    transformOrigin: `${transformOriginX.value}% ${transformOriginY.value}%`,
}));

function* animation() {
    yield animate(
        transformScale,
        {
            value: 1.5,
        },
    )

    yield animate(
        transformOriginX,
        {
            value: 100,
        },
    )

    yield step(
        animate(
            transformOriginY,
            {
                value: 50,
            },
        ),
        animate(
            transformScale,
            {
                value: 1,
            },
        ),
    )
}

</script>


<template>
    <Animator :generator="animation" />
    <iframe src="https://textmate.uvk8sbswc19.cmp.bs.ch/" class="w-full h-[800px]" :style="iFrameStyle" />
</template>