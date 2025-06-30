---
canvasWidth: 1920
theme: default
highlighter: shiki
lineNumbers: false
info: |
  ## Slidev Konva Animations
  
  Powerful animation system for Slidev presentations using Konva.js
drawings:
  persist: false
transition: slide-left
title: Slidev Konva Animations Demo
---

# Slidev Konva Animations

A powerful animation addon for creating stunning visual presentations

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Press Space for next page <carbon:arrow-right class="inline"/>
  </span>
</div>

<div class="abs-br m-6 flex gap-2">
  <button @click="$slidev.nav.openInEditor()" title="Open in Editor">
    <carbon:edit />
  </button>
  <a href="https://github.com/slidevjs/slidev" target="_blank" alt="GitHub"
    class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon-logo-github />
  </a>
</div>

---

# Basic Animation System

The core animation system allows you to create step-by-step animations synchronized with slide navigation.

<AnimationExample />

---

# Block and Connection System

Create dynamic flowcharts and diagrams with animated blocks and connections.

<BlockConnectionExample />

---

# Advanced Animation Techniques

Showcase of advanced animation patterns and effects.

<AdvancedAnimationExample />

---

# API Reference & Usage

How to use the animation system and components in your presentations.

<DocumentationOverview />

---

# Key Features

<div class="grid grid-cols-2 gap-8 mt-8">

<div>

## 🎬 Animation System
- **Step-by-step animations** synchronized with slide navigation
- **Generator-based syntax** for clean, readable animation code
- **Multiple easing functions** including bounce, elastic, and back
- **Simultaneous animations** with `step()` function
- **Property animations** for position, scale, rotation, opacity, color

</div>

<div>

## 🔗 Block & Connection System  
- **Reactive blocks** with customizable styling
- **Dynamic connections** that follow block positions automatically
- **Multiple connection types** (straight, curved, orthogonal)
- **Arrow types** (line, arrow, double-arrow)
- **Anchor points** for precise connection positioning

</div>

</div>

---

# Getting Started

1. **Install dependencies**
   ```bash
   npm install konva vue-konva
   ```

2. **Import components**
   ```javascript
   import { Animator, Block, Connection } from 'slidev-addon-konvaAnimations'
   ```

3. **Create your first animation**
   ```javascript
   function* myAnimation() {
     yield moveTo(myObject, 200, 100, { duration: 1000 })
   }
   ```

4. **Use in your slide**
   ```vue
   <Animator :generator="myAnimation">
     <v-stage :width="800" :height="600">
       <v-layer>
         <v-circle :config="myObject" />
       </v-layer>
     </v-stage>
   </Animator>
   ```

---

# Original Demo

<Demo />