<script lang="ts" setup>
import { ref } from "vue";
import {
  animate,
  step,
  moveTo,
  scaleTo,
  fadeTo,
  EasingPresets
} from "../composables/useGeneratorAnimation";
import Animator from './Animator.vue';

// Animation objects
const title = ref({
  x: 300,
  y: 50,
  text: 'Advanced Animation Features',
  fontSize: 20,
  opacity: 0,
  scaleX: 0.5,
  scaleY: 0.5
});

const morphingShape = ref({
  x: 100,
  y: 150,
  width: 60,
  height: 60,
  fill: 'red',
  rotation: 0,
  cornerRadius: 0
});

const bouncingBall = ref({
  x: 300,
  y: 200,
  radius: 25,
  fill: 'blue',
  scaleX: 1,
  scaleY: 1
});

const fadingElements = [
  ref({ x: 450, y: 120, width: 40, height: 40, fill: 'green', opacity: 0 }),
  ref({ x: 500, y: 120, width: 40, height: 40, fill: 'orange', opacity: 0 }),
  ref({ x: 550, y: 120, width: 40, height: 40, fill: 'purple', opacity: 0 })
];

// Complex animation showcasing different techniques
function* advancedAnimations() {
  // Step 1: Dramatic title entrance
  yield step(
    scaleTo(title, 1, { duration: 1000, easing: EasingPresets.backOut }),
    fadeTo(title, 1, { duration: 800 })
  );

  // Step 2: Shape morphing - rectangle to rounded rectangle to circle
  yield animate(morphingShape, {
    cornerRadius: 30,
    fill: 'orange'
  }, { duration: 800, easing: EasingPresets.easeInOut });

  // Step 3: Continue morphing while rotating
  yield step(
    animate(morphingShape, {
      width: 80,
      height: 80,
      cornerRadius: 40,
      fill: 'green'
    }, { duration: 1000, easing: EasingPresets.elasticOut }),
    animate(morphingShape, { rotation: Math.PI }, { duration: 1200 })
  );

  // Step 4: Bouncing ball with squash and stretch
  yield step(
    moveTo(bouncingBall, 300, 300, { duration: 400, easing: EasingPresets.easeIn }),
    scaleTo(bouncingBall, { x: 1.3, y: 0.7 }, { duration: 400 })
  );

  // Ball bounces back up with stretch
  yield step(
    moveTo(bouncingBall, 300, 150, { duration: 600, easing: EasingPresets.bounceOut }),
    scaleTo(bouncingBall, { x: 0.8, y: 1.2 }, { duration: 300 })
  );

  // Ball settles
  yield scaleTo(bouncingBall, 1, { duration: 400, easing: EasingPresets.easeOut });

  // Step 5: Sequential fade-in of elements (staggered animation)
  yield fadeTo(fadingElements[0], 1, { duration: 400 });

  yield fadeTo(fadingElements[1], 1, { duration: 400 });

  yield fadeTo(fadingElements[2], 1, { duration: 400 });

  // Step 6: Synchronized complex movement
  yield step(
    moveTo(morphingShape, 200, 250, { duration: 1000, easing: EasingPresets.easeInOut }),
    moveTo(bouncingBall, 400, 250, { duration: 1000, easing: EasingPresets.easeInOut }),
    ...fadingElements.map((el, i) =>
      moveTo(el, 300 + (i - 1) * 50, 300, {
        duration: 1000,
        delay: i * 100,
        easing: EasingPresets.backOut
      })
    )
  );

  // Step 7: Grand finale - everything spins and scales
  yield step(
    animate(morphingShape, {
      rotation: Math.PI * 2,
      scaleX: 1.5,
      scaleY: 1.5
    }, { duration: 1500, easing: EasingPresets.easeInOut }),
    animate(bouncingBall, {
      scaleX: 2,
      scaleY: 2,
      fill: 'gold'
    }, { duration: 1500, easing: EasingPresets.elasticOut }),
    ...fadingElements.map((el, i) =>
      animate(el, {
        rotation: Math.PI * 2,
        scaleX: 1.2,
        scaleY: 1.2
      }, {
        duration: 1500,
        delay: i * 150,
        easing: EasingPresets.bounceOut
      })
    )
  );
}
</script>

<template>
  <div>
    <h3 class="text-xl font-bold mb-4">Advanced Animation Techniques</h3>

    <Animator :generator="advancedAnimations">
      <template #default="{ currentStep, totalSteps, isAnimating }">
        <div class="mb-4 text-sm">
          Advanced Demo - Step {{ currentStep }} of {{ totalSteps }}
          <span v-if="isAnimating" class="text-purple-500 ml-2">✨ Animating</span>
        </div>
      </template>
    </Animator>

    <v-stage :width="700" :height="400" class="border border-gray-300">
      <v-layer>
        <!-- Title -->
        <v-text :config="title" />

        <!-- Morphing shape -->
        <v-rect :config="morphingShape" />

        <!-- Bouncing ball -->
        <v-circle :config="bouncingBall" />

        <!-- Fading elements -->
        <v-rect v-for="(element, index) in fadingElements" :key="index" :config="element" />

        <!-- Animation technique labels -->
        <v-text :config="{
          x: 50,
          y: 350,
          text: 'Techniques: Shape morphing, Squash & stretch, Staggered timing, Synchronized motion',
          fontSize: 12,
          fill: 'gray'
        }" />
      </v-layer>
    </v-stage>

    <div class="mt-4 text-sm text-gray-600">
      <p><strong>Advanced techniques shown:</strong></p>
      <ul class="list-disc ml-4">
        <li><strong>Shape morphing:</strong> Smoothly changing shape properties</li>
        <li><strong>Squash and stretch:</strong> Classic animation principle for bouncing</li>
        <li><strong>Staggered animations:</strong> Elements animating with delays</li>
        <li><strong>Complex easing:</strong> Elastic, bounce, and back easing functions</li>
        <li><strong>Synchronized motion:</strong> Multiple objects moving in coordination</li>
        <li><strong>Property animation:</strong> Color, rotation, scale, and position changes</li>
      </ul>
    </div>
  </div>
</template>
