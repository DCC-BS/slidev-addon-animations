# Slidev Addon Animations

A powerful animation addon for [Slidev](https://github.com/slidevjs/slidev) presentations using Konva.js. Create stunning step-by-step animations, interactive diagrams, and dynamic visual content synchronized with your slide navigation.

## Features

- **Step-by-Step Animations**: Synchronized with Slidev's click navigation system
- **Generator-Based Syntax**: Clean, readable animation code using generator functions
- **Rich Easing Library**: Bounce, elastic, back, and more built-in easing functions
- **Block & Connection System**: Create dynamic flowcharts and diagrams
- **Property Animations**: Animate position, scale, rotation, opacity, color, and more
- **Simultaneous Animations**: Execute multiple animations in parallel with `step()`
- **Smart Performance**: Automatic animation skipping for rapid navigation
- **TypeScript Support**: Fully typed with comprehensive type definitions

## Technology Stack

- **Animation Engine**: Custom-built animation system with Konva.js integration
- **Graphics**: [Konva](https://konvajs.org/) 2D canvas library with [Vue-Konva](https://github.com/konvajs/vue-konva)
- **Framework**: Vue 3 with Composition API and TypeScript
- **Testing**: Vitest with comprehensive test coverage
- **Package Manager**: Bun for fast dependency management
- **Code Quality**: Biome for linting and formatting

## Installation

### Basic Setup

Install the addon in your Slidev project:

```bash
# Using npm
npm install git+https://github.com/DCC-BS/slidev-addon-animations.git 

# Using bun
bun add git+https://github.com/DCC-BS/slidev-addon-animations.git 
```

### Add to Slidev Configuration

Add the addon to your `slides.md` frontmatter:

```yaml
---
theme: default
addons:
  - slidev-addon-animations
---
```

## Quick Start

### Basic Animation Example

```vue
<script setup lang="ts">
import { animate, step, moveTo, scaleTo, EasingPresets } from 'slidev-addon-animations'
import { Animator } from 'slidev-addon-animations/components'

const circle = ref({ x: 100, y: 100, radius: 30, fill: 'red' })

function* myAnimation() {
  // Step 1: Move and scale simultaneously
  yield step(
    moveTo(circle, 200, 150, { duration: 1000 }),
    scaleTo(circle, 1.5, { easing: EasingPresets.bounceOut })
  )
  
  // Step 2: Change color
  yield animate(circle, { fill: 'blue' }, { duration: 500 })
}
</script>

<template>
  <Animator :generator="myAnimation">
  </Animator>
  <v-stage :width="400" :height="300">
    <v-layer>
      <v-circle :config="circle" />
    </v-layer>
  </v-stage>
</template>
```

<video src="_assets/basic-animation.mp4"  controls></video>

### Block & Connection System

```vue
<script setup>
import { Block, Connection, Graphic } from 'slidev-addon-animations/components'

const blockA = ref({ 
  x: 50, y: 100, width: 120, height: 60, text: 'Start' 
})
const blockB = ref({ 
  x: 250, y: 100, width: 120, height: 60, text: 'End' 
})

const connection = computed(() => ({
  fromShape: blockA.value,
  toShape: blockB.value,
  fromAnchor: 'right',
  toAnchor: 'left',
  connectionType: 'straight',
  lineType: 'arrow'
}))
</script>

<template>
  <Graphic :width="400" :height="200">
    <Block :config="blockA" />
    <Block :config="blockB" />
    <Connection :config="connection" />
  </Graphic>
</template>
```

## Development

### Setup Development Environment

Make sure to install dependencies:

```bash
# Using bun (recommended)
bun install

# Using npm
npm install
```

### Start Development Server

Preview the example slides with hot reload:

```bash
# Using bun (recommended)
bun run dev

# Using npm
npm run dev
```

This will start Slidev with the `example.md` presentation showcasing all features.

### Build and Export

Build presentation for production:

```bash
# Using bun
bun run build

# Using npm
npm run build
```

Export as PDF:

```bash
# Using bun
bun run export

# Using npm
npm run export
```

Generate screenshot preview:

```bash
# Using bun
bun run screenshot

# Using npm
npm run screenshot
```

## Testing & Quality Assurance

Run comprehensive test suite:

```bash
# Run all tests
bun test        # or: npm test

# Run tests with UI
bun test:ui     # or: npm run test:ui

# Run tests in watch mode
bun test:watch  # or: npm run test:watch

# Generate coverage report
bun test:coverage  # or: npm run test:coverage

# Run specific test examples
bun test:examples  # or: npm run test:examples
```

Check code quality with Biome:

```bash
# Lint and format
bun run lint    # or: npm run lint

# Check for issues
bun run check   # or: npm run check
```

## API Reference

### Core Composables

#### `useKonvaAnimation(targets, options)`

Main composable for creating animations with fine-grained control.

```typescript
const { currentStep, totalSteps, isAnimating, animateToStep } = useKonvaAnimation(
  animationTargets,
  {
    skipThreshold: 300,
    defaultDuration: 1000,
    defaultEasing: EasingPresets.easeInOut
  }
)
```

#### `useGeneratorAnimation(options)`

High-level composable with generator-based animation syntax.

```typescript
const { createAnimationFromGenerator, animate, moveTo, scaleTo } = useGeneratorAnimation({
  skipThreshold: 300,
  defaultDuration: 1000,
  defaultEasing: 'easeInOut'
})
```

### Animation Helper Functions

- `animate(target, properties, options)` - Animate any properties
- `moveTo(target, x, y, options)` - Move to position
- `scaleTo(target, scale, options)` - Scale uniformly or per-axis
- `rotateTo(target, rotation, options)` - Rotate to angle
- `fadeTo(target, opacity, options)` - Fade to opacity
- `show(target, options)` - Fade in to full opacity
- `hide(target, options)` - Fade out to transparent
- `step(...animations)` - Group animations to run simultaneously

### Components

- **`<Animator>`** - Manages generator-based animations
- **`<Block>`** - Rectangular blocks with text labels
- **`<Connection>`** - Dynamic connections between shapes
- **`<Graphic>`** - Container for Konva stage and layers

### Easing Functions

Available easing presets: `linear`, `easeIn`, `easeOut`, `easeInOut`, `bounceIn`, `bounceOut`, `bounceInOut`, `elasticIn`, `elasticOut`, `elasticInOut`, `backIn`, `backOut`, `backInOut`, `strongIn`, `strongOut`, `strongInOut`

## Project Architecture

```
slidev-addon-animations/
├── components/          # Vue components for UI elements
│   ├── Animator.vue    # Generator-based animation controller
│   ├── Block.vue       # Rectangular block component
│   ├── Connection.vue  # Dynamic connection lines
│   └── Graphic.vue     # Konva stage wrapper
├── composables/        # Reusable animation logic
│   ├── useKonvaAnimation.ts     # Core animation system
│   └── useGeneratorAnimation.ts # Generator-based animations
├── types/              # TypeScript type definitions
│   └── animation.ts    # Animation system types
├── utils/              # Animation engine utilities
│   ├── animationEngine.ts    # Core animation processing
│   ├── animationHelpers.ts   # Helper functions
│   ├── lerpSystem.ts         # Interpolation system
│   └── shapeConnector.ts     # Connection geometry
└── tests/              # Comprehensive test suite
```

## Advanced Usage

### Custom Easing Functions

```javascript
const customEasing = (t, b, c, d) => {
  // Custom easing implementation
  return c * t / d + b
}

yield animate(target, { x: 100 }, { 
  duration: 1000, 
  easing: customEasing 
})
```

### Complex Animation Sequences

```javascript
function* complexAnimation() {
  // Parallel animations with different timings
  yield step(
    moveTo(obj1, 200, 100, { duration: 1000 }),
    scaleTo(obj2, 1.5, { duration: 800, delay: 200 }),
    fadeTo(obj3, 0.5, { duration: 600, delay: 400 })
  )
  
  // Sequential with staggered delays
  yield step(
    ...elements.map((el, i) => 
      animate(el, { opacity: 1 }, { 
        duration: 500, 
        delay: i * 100 
      })
    )
  )
}
```

### Dynamic Connections

```javascript
const connection = computed(() => ({
  fromShape: blockA.value,
  toShape: blockB.value,
  connectionType: 'curved',
  config: {
    stroke: 'blue',
    strokeWidth: 3,
    opacity: connectionOpacity.value
  }
}))

// Animate connection appearance
yield animate(connectionOpacity, { value: 1 }, { duration: 600 })
```

## Contributing

1. **Fork and clone** the repository
2. **Install dependencies**: `bun install` or `npm install`
3. **Start development**: `bun run dev` or `npm run dev`
4. **Run tests**: `bun test` or `npm test`
5. **Check code quality**: `bun run check` or `npm run check`
6. **Submit pull request** with your improvements

### Development Guidelines

- Write tests for new features
- Follow TypeScript best practices
- Use Biome for code formatting
- Document new APIs and components
- Update example.md to showcase new features

## License

[MIT](LICENSE) © Data Competence Center Basel-Stadt

<a href="https://www.bs.ch/schwerpunkte/daten/databs/schwerpunkte/datenwissenschaften-und-ki"><img src="https://github.com/DCC-BS/.github/blob/main/_imgs/databs_log.png?raw=true" alt="DCC Logo" width="200" /></a>

Datenwissenschaften und KI <br>
Developed with ❤️ by Data Alchemy Team