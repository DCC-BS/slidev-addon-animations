<script lang="ts" setup>
import { ref, watch } from 'vue';
import {
  animate,
  step,
  moveTo,
  scaleTo,
  fadeTo,
  EasingPresets
} from "../composables/useGeneratorAnimation";
import Animator from './Animator.vue';
import Block from './Block.vue';
import Connection from './Connection.vue';
import type { StageConfig } from 'konva/lib/Stage';
import type { BlockConfig } from './Block.vue';
import type { ConnectionOptions } from '../utils/shapeConnector';

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
  text: 'Start',
  opacity: 0,
  scaleX: 0.5,
  scaleY: 0.5
});

const block2 = ref<BlockConfig>({
  x: 250,
  y: 200,
  width: 120,
  height: 60,
  text: 'Process',
  opacity: 0,
  scaleX: 0.5,
  scaleY: 0.5
});

const block3 = ref<BlockConfig>({
  x: 450,
  y: 100,
  width: 120,
  height: 60,
  text: 'End',
  opacity: 0,
  scaleX: 0.5,
  scaleY: 0.5
});

const block4 = ref<BlockConfig>({
  x: 150,
  y: 350,
  width: 120,
  height: 60,
  text: 'Branch',
  opacity: 0,
  scaleX: 0.5,
  scaleY: 0.5
});

// Create reactive refs for connections
const connection1 = ref<ConnectionOptions>({
  fromShape: { x: 50, y: 100, width: 120, height: 60 },
  toShape: { x: 250, y: 200, width: 120, height: 60 },
  fromAnchor: 'right',
  toAnchor: 'left',
  connectionType: 'straight',
  lineType: 'arrow',
  config: { 
    stroke: 'blue', 
    strokeWidth: 3, 
    opacity: 0,
    pointerLength: 15,
    pointerWidth: 15
  }
});

const connection2 = ref<ConnectionOptions>({
  fromShape: { x: 250, y: 200, width: 120, height: 60 },
  toShape: { x: 450, y: 100, width: 120, height: 60 },
  fromAnchor: 'right',
  toAnchor: 'left',
  connectionType: 'curved',
  lineType: 'arrow',
  config: { 
    stroke: 'green', 
    strokeWidth: 3, 
    opacity: 0,
    pointerLength: 15,
    pointerWidth: 15
  }
});

const connection3 = ref<ConnectionOptions>({
  fromShape: { x: 250, y: 200, width: 120, height: 60 },
  toShape: { x: 150, y: 350, width: 120, height: 60 },
  fromAnchor: 'bottom',
  toAnchor: 'top',
  connectionType: 'orthogonal',
  lineType: 'arrow',
  config: { 
    stroke: 'red', 
    strokeWidth: 3, 
    opacity: 0,
    pointerLength: 15,
    pointerWidth: 15
  }
});

// Animation sequence demonstrating block connections
function* blockConnectionSequence() {
  // Step 1: Introduce first block
  yield step(
    scaleTo(block1, 1, { duration: 800, easing: EasingPresets.backOut }),
    fadeTo(block1, 1, { duration: 600 })
  );

  // Step 2: Show connection and second block
  yield step(
    fadeTo(connection1, 1, { duration: 600 }),
    scaleTo(block2, 1, { duration: 800, easing: EasingPresets.backOut }),
    fadeTo(block2, 1, { duration: 600 })
  );

  // Step 3: Show curved connection to third block
  yield step(
    fadeTo(connection2, 1, { duration: 600 }),
    scaleTo(block3, 1, { duration: 800, easing: EasingPresets.backOut }),
    fadeTo(block3, 1, { duration: 600 })
  );

  // Step 4: Show branch connection
  yield step(
    fadeTo(connection3, 1, { duration: 600 }),
    scaleTo(block4, 1, { duration: 800, easing: EasingPresets.backOut }),
    fadeTo(block4, 1, { duration: 600 })
  );

  // Step 5: Animate the flow - highlight connections in sequence
  yield animate(connection1, { 
    config: { ...connection1.value.config, strokeWidth: 6, stroke: 'orange' } 
  }, { duration: 500 });

  yield animate(connection2, { 
    config: { ...connection2.value.config, strokeWidth: 6, stroke: 'orange' } 
  }, { duration: 500 });

  // Step 6: Show the branch path
  yield animate(connection3, { 
    config: { ...connection3.value.config, strokeWidth: 6, stroke: 'orange' } 
  }, { duration: 500 });

  // Step 7: Rearrange blocks to show dynamic connections
  yield step(
    moveTo(block2, 300, 250, { duration: 1000, easing: EasingPresets.easeInOut }),
    moveTo(block4, 100, 300, { duration: 1000, easing: EasingPresets.easeInOut })
  );

  // Step 8: Reset connection colors
  yield step(
    animate(connection1, { 
      config: { ...connection1.value.config, strokeWidth: 3, stroke: 'blue' } 
    }, { duration: 400 }),
    animate(connection2, { 
      config: { ...connection2.value.config, strokeWidth: 3, stroke: 'green' } 
    }, { duration: 400 }),
    animate(connection3, { 
      config: { ...connection3.value.config, strokeWidth: 3, stroke: 'red' } 
    }, { duration: 400 })
  );
}

// Update connection coordinates when blocks move
function updateConnections() {
  // Update connection1 coordinates
  connection1.value.fromShape = {
    x: block1.value.x || 50,
    y: block1.value.y || 100,
    width: block1.value.width || 120,
    height: block1.value.height || 60
  };
  connection1.value.toShape = {
    x: block2.value.x || 250,
    y: block2.value.y || 200,
    width: block2.value.width || 120,
    height: block2.value.height || 60
  };

  // Update connection2 coordinates
  connection2.value.fromShape = {
    x: block2.value.x || 250,
    y: block2.value.y || 200,
    width: block2.value.width || 120,
    height: block2.value.height || 60
  };
  connection2.value.toShape = {
    x: block3.value.x || 450,
    y: block3.value.y || 100,
    width: block3.value.width || 120,
    height: block3.value.height || 60
  };

  // Update connection3 coordinates
  connection3.value.fromShape = {
    x: block2.value.x || 250,
    y: block2.value.y || 200,
    width: block2.value.width || 120,
    height: block2.value.height || 60
  };
  connection3.value.toShape = {
    x: block4.value.x || 150,
    y: block4.value.y || 350,
    width: block4.value.width || 120,
    height: block4.value.height || 60
  };
}

// Watch for block position changes and update connections
watch([block1, block2, block3, block4], updateConnections, { deep: true });
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
