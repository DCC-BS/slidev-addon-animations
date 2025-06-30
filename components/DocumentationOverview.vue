<template>
    <div class="grid grid-cols-2 gap-6">
        <!-- Animation System Usage -->
        <div>
            <h4 class="text-lg font-semibold mb-3 text-blue-600">Animation System Usage</h4>
            <div class="bg-gray-50 p-4 rounded text-sm overflow-hidden">
                <pre><code class="language-javascript">import { animate, step, moveTo, scaleTo, EasingPresets } from "../composables/useGeneratorAnimation";
import Animator from './Animator.vue';

const circle = ref({ x: 100, y: 100, radius: 30, fill: 'red' });

function* myAnimation() {
  // Step 1: Move and scale
  yield step(
    moveTo(circle, 200, 150, { duration: 1000 }),
    scaleTo(circle, 1.5, { easing: EasingPresets.bounceOut })
  );
  
  // Step 2: Change color
  yield animate(circle, { fill: 'blue' }, { duration: 500 });
}</code></pre>
            </div>
        </div>

        <!-- Block & Connection Usage -->
        <div>
            <h4 class="text-lg font-semibold mb-3 text-green-600">Block & Connection Usage</h4>
            <div class="bg-gray-50 p-4 rounded text-sm overflow-hidden">
                <pre><code class="language-javascript">import Block from './Block.vue';
import Connection from './Connection.vue';

const blockA = ref({ 
  x: 50, y: 100, width: 120, height: 60, text: 'Start' 
});
const blockB = ref({ 
  x: 250, y: 100, width: 120, height: 60, text: 'End' 
});

const connection = computed(() => ({
  fromShape: blockA.value,
  toShape: blockB.value,
  fromAnchor: 'right',
  toAnchor: 'left',
  connectionType: 'straight',
  lineType: 'arrow'
}));</code></pre>
            </div>
        </div>

        <!-- Available Easing Functions -->
        <div>
            <h4 class="text-lg font-semibold mb-3 text-purple-600">Available Easing Functions</h4>
            <div class="grid grid-cols-3 gap-2 text-xs">
                <div class="bg-blue-50 p-2 rounded">
                    <div class="font-semibold">Basic</div>
                    <div>linear</div>
                    <div>easeIn</div>
                    <div>easeOut</div>
                    <div>easeInOut</div>
                </div>
                <div class="bg-green-50 p-2 rounded">
                    <div class="font-semibold">Bouncy</div>
                    <div>bounceIn</div>
                    <div>bounceOut</div>
                    <div>bounceInOut</div>
                </div>
                <div class="bg-purple-50 p-2 rounded">
                    <div class="font-semibold">Elastic</div>
                    <div>elasticIn</div>
                    <div>elasticOut</div>
                    <div>elasticInOut</div>
                </div>
                <div class="bg-orange-50 p-2 rounded">
                    <div class="font-semibold">Back</div>
                    <div>backIn</div>
                    <div>backOut</div>
                    <div>backInOut</div>
                </div>
                <div class="bg-red-50 p-2 rounded">
                    <div class="font-semibold">Strong</div>
                    <div>strongIn</div>
                    <div>strongOut</div>
                    <div>strongInOut</div>
                </div>
            </div>
        </div>

        <!-- Connection Types -->
        <div>
            <h4 class="text-lg font-semibold mb-3 text-red-600">Connection Types & Options</h4>
            <div class="space-y-2 text-sm">
                <div class="bg-gray-50 p-2 rounded">
                    <strong>Connection Types:</strong> 'straight', 'curved', 'orthogonal'
                </div>
                <div class="bg-gray-50 p-2 rounded">
                    <strong>Line Types:</strong> 'line', 'arrow', 'double-arrow'
                </div>
                <div class="bg-gray-50 p-2 rounded">
                    <strong>Anchor Points:</strong> 'left', 'right', 'top', 'bottom', 'center'
                </div>
                <div class="bg-gray-50 p-2 rounded">
                    <strong>Styling:</strong> stroke, strokeWidth, dash, fill, opacity
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
// This component is purely for documentation
</script>
