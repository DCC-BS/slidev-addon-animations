import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createAnimationTarget,
  createMockEasing,
  expectValuesNear,
  createMockKonvaNode,
  expectPropertiesUpdated
} from './helpers.js'
import { prepareAnimations } from '../utils/animationEngine.js'
import type { AnimatableObject } from '../types/animation.js'

/**
 * Example test file demonstrating best practices for animation testing
 * This file shows how to use the enhanced testing utilities
 */

describe('Enhanced Animation Testing Examples', () => {
  let mockTarget: AnimatableObject

  beforeEach(() => {
    mockTarget = createMockKonvaNode({ x: 0, y: 0, opacity: 1 })
  })

  describe('Using Animation Targets', () => {
    it('should create animation targets correctly', () => {
      const target = createAnimationTarget(
        mockTarget,
        [{ properties: { x: 100 }, duration: 1000 }]
      )

      expect(target.target).toBe(mockTarget)
      expect(target.steps).toHaveLength(1)
      expect(target.steps[0].properties.x).toBe(100)
      expect(target.steps[0].duration).toBe(1000)
    })

    it('should prepare animations from targets', () => {
      const target = createAnimationTarget(
        mockTarget,
        [{ properties: { x: 100, y: 50 }, duration: 1000 }]
      )

      const animations = prepareAnimations([target], 0, 1000, undefined)
      
      expect(animations).toHaveLength(1)
      expect(animations[0].target).toBe(mockTarget)
      expect(animations[0].keys).toEqual(['x', 'y'])
      expect(animations[0].startVals).toEqual([0, 0])
      expect(animations[0].endVals).toEqual([100, 50])
      expect(animations[0].duration).toBe(1000)
      expect(animations[0].completed).toBe(false)
    })
  })

  describe('Using Mock Easings', () => {
    it('should create trackable easing functions', () => {
      const mockEasing = createMockEasing('test-easing')
      
      // Test the easing function
      const result = mockEasing(0.5, 0, 1, 1)
      expect(result).toBe(0.5) // Linear by default
      expect(mockEasing).toHaveBeenCalledWith(0.5, 0, 1, 1)
    })

    it('should use custom easing logic', () => {
      const customEasing = vi.fn((t: number) => t * t) // Quadratic
      const target = createAnimationTarget(
        mockTarget,
        [{ properties: { x: 100 }, duration: 1000, easing: customEasing }]
      )

      const animations = prepareAnimations([target], 0, 1000, customEasing)
      expect(animations[0].easing).toBe(customEasing)
    })
  })

  describe('Using Property Assertions', () => {
    it('should verify multiple properties with tolerance', () => {
      // Simulate some animation state
      Object.assign(mockTarget, {
        x: 99.98,
        y: 50.02,
        opacity: 0.999
      })

      expectPropertiesUpdated(mockTarget, {
        x: 100,
        y: 50,
        opacity: 1
      }, 0.1) // 0.1 tolerance
    })

    it('should verify exact non-numeric properties', () => {
      const svgTarget = {
        fill: '#ff0000',
        stroke: '#00ff00',
        id: 'test-element'
      }

      expectPropertiesUpdated(svgTarget, {
        fill: '#ff0000',
        id: 'test-element'
      })
    })

    it('should use expectValuesNear for floating point comparisons', () => {
      const target = { x: 99.999, y: 50.001 }
      
      expectValuesNear(target, { x: 100, y: 50 }, 0.01)
    })
  })

  describe('Using Mock Objects', () => {
    it('should create realistic Konva-style objects', () => {
      const konvaNode = createMockKonvaNode({
        x: 10,
        y: 20,
        scaleX: 0.5,
        opacity: 0.8
      })

      expect(konvaNode.x).toBe(10)
      expect(konvaNode.y).toBe(20)
      expect(konvaNode.scaleX).toBe(0.5)
      expect(konvaNode.opacity).toBe(0.8)
      // Should have default values for other properties
      expect(konvaNode.rotation).toBe(0)
      expect(konvaNode.width).toBe(100)
    })

    it('should have sensible defaults', () => {
      const defaultNode = createMockKonvaNode()
      
      expect(defaultNode.x).toBe(0)
      expect(defaultNode.y).toBe(0)
      expect(defaultNode.scaleX).toBe(1)
      expect(defaultNode.scaleY).toBe(1)
      expect(defaultNode.opacity).toBe(1)
      expect(defaultNode.rotation).toBe(0)
    })
  })

  describe('Using testUtils globals', () => {
    it('should use global test utilities', () => {
      const target = testUtils.createMockTarget({ x: 0, scale: 1 })
      
      // Simulate some animation progress
      target.x = 50
      target.scale = 1.5

      expect(target.x).toBe(50)
      expect(target.scale).toBe(1.5)
    })

    it('should provide timer utilities', () => {
      // These are available but don't run in this simple test
      expect(typeof testUtils.advanceTimersAndFlush).toBe('function')
      expect(typeof testUtils.resetPerformanceTimer).toBe('function')
      expect(typeof testUtils.setPerformanceOffset).toBe('function')
    })
  })

  describe('Multiple Animation Steps', () => {
    it('should handle multi-step animations', () => {
      const target = createAnimationTarget(
        mockTarget,
        [
          { properties: { x: 50 }, duration: 500 },
          { properties: { y: 100 }, duration: 300, delay: 100 },
          { properties: { opacity: 0.5 }, duration: 200 }
        ]
      )

      expect(target.steps).toHaveLength(3)
      
      // Test first step
      const firstStepAnimations = prepareAnimations([target], 0, 1000, undefined)
      expect(firstStepAnimations[0].endVals).toEqual([50])
      expect(firstStepAnimations[0].duration).toBe(500)
      
      // Test second step
      const secondStepAnimations = prepareAnimations([target], 1, 1000, undefined)
      expect(secondStepAnimations[0].endVals).toEqual([100])
      expect(secondStepAnimations[0].duration).toBe(300)
      expect(secondStepAnimations[0].delay).toBe(100)
    })
  })

  describe('Animation State Management', () => {
    it('should track animation completion state', () => {
      const target = createAnimationTarget(
        mockTarget,
        [{ properties: { x: 100 }, duration: 1000 }]
      )

      const animations = prepareAnimations([target], 0, 1000, undefined)
      
      expect(animations[0].completed).toBe(false)
      
      // Manually mark as completed (in real tests, this would happen via animation loop)
      animations[0].completed = true
      expect(animations[0].completed).toBe(true)
    })

    it('should handle empty steps gracefully', () => {
      const target = createAnimationTarget(mockTarget, [])
      const animations = prepareAnimations([target], 0, 1000, undefined)
      
      expect(animations).toHaveLength(0)
    })

    it('should handle out-of-bounds step index', () => {
      const target = createAnimationTarget(
        mockTarget,
        [{ properties: { x: 100 }, duration: 1000 }]
      )

      // Request step index 5 when only step 0 exists
      const animations = prepareAnimations([target], 5, 1000, undefined)
      
      expect(animations).toHaveLength(0)
    })
  })
})
