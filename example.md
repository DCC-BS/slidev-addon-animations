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