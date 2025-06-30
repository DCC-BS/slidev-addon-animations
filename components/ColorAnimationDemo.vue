<template>
  <div class="color-animation-demo">
    <h2>Color Animation Demo</h2>
    <div class="demo-container">
      <!-- Color transition examples -->
      <div
        class="color-box"
        :style="{
          backgroundColor: colorBox.backgroundColor,
          borderColor: colorBox.borderColor,
          color: colorBox.textColor,
        }"
      >
        Color Lerp Demo
      </div>
      
      <!-- Numeric animation for comparison -->
      <div
        class="position-box"
        :style="{
          transform: `translate(${positionBox.x}px, ${positionBox.y}px) scale(${positionBox.scale})`,
          opacity: positionBox.opacity,
        }"
      >
        Numeric Lerp Demo
      </div>
    </div>
    
    <div class="controls">
      <p>Click to advance animation steps</p>
      <p>
        This demo shows the new generic lerp system supporting both colors and numbers!
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import {
  useKonvaAnimation,
  createAnimationTarget,
  createAnimationStep,
} from "../index";

// Reactive objects for animation
const colorBox = reactive({
  backgroundColor: "#ff0000", // Start with red
  borderColor: "rgb(255, 0, 0)",
  textColor: "#ffffff",
});

const positionBox = reactive({
  x: 0,
  y: 0,
  scale: 1,
  opacity: 1,
});

// Create animation targets with color and numeric values
const targets = [
  // Color animations
  createAnimationTarget(
    colorBox,
    {
      backgroundColor: "#ff0000", // Red
      borderColor: "rgb(255, 0, 0)",
      textColor: "#ffffff",
    },
    [
      createAnimationStep(
        {
          backgroundColor: "#00ff00", // Green
          borderColor: "rgb(0, 255, 0)",
          textColor: "#000000",
        },
        { duration: 1000 }
      ),
      createAnimationStep(
        {
          backgroundColor: "#0000ff", // Blue
          borderColor: "rgb(0, 0, 255)",
          textColor: "#ffffff",
        },
        { duration: 800 }
      ),
      createAnimationStep(
        {
          backgroundColor: "#ffff00", // Yellow
          borderColor: "rgb(255, 255, 0)",
          textColor: "#000000",
        },
        { duration: 600 }
      ),
    ]
  ),
  
  // Numeric animations
  createAnimationTarget(
    positionBox,
    { x: 0, y: 0, scale: 1, opacity: 1 },
    [
      createAnimationStep(
        { x: 100, y: 50, scale: 1.2, opacity: 0.8 },
        { duration: 1000 }
      ),
      createAnimationStep(
        { x: 200, y: 0, scale: 0.8, opacity: 0.6 },
        { duration: 800 }
      ),
      createAnimationStep(
        { x: 300, y: 100, scale: 1.5, opacity: 1 },
        { duration: 600 }
      ),
    ]
  ),
];

// Initialize animation system
useKonvaAnimation(targets, {
  defaultDuration: 800,
});
</script>

<style scoped>
.color-animation-demo {
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.demo-container {
  display: flex;
  gap: 2rem;
  min-height: 200px;
  margin: 2rem 0;
}

.color-box {
  width: 150px;
  height: 150px;
  border: 4px solid;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  text-align: center;
  transition: none; /* Disable CSS transitions to see lerp in action */
}

.position-box {
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-align: center;
  transition: none; /* Disable CSS transitions to see lerp in action */
}

.controls {
  margin-top: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.controls p {
  margin: 0.5rem 0;
}
</style>
