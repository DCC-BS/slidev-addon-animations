import { describe, it, expect, beforeEach } from 'vitest'
import { prepareAnimations, processAnimationFrame } from '../utils/animationEngine.js'
import type { AnimationTarget } from '../types/animation.js'

describe('Step with Delays Bug Investigation', () => {
  let fadingElements: Array<{ opacity: number }>

  beforeEach(() => {
    fadingElements = [
      { opacity: 0 },
      { opacity: 0 },
      { opacity: 0 }
    ]
  })

  it('should create separate animation targets for each element with correct delays', () => {
    // Simulate what the generator animation system should create
    const animationTargets: AnimationTarget[] = [
      {
        target: fadingElements[0],
        initialState: { opacity: 0 },
        steps: [{
          properties: { opacity: 1 },
          duration: 1000,
          delay: 0 // No delay for first element
        }]
      },
      {
        target: fadingElements[1], 
        initialState: { opacity: 0 },
        steps: [{
          properties: { opacity: 1 },
          duration: 1000,
          delay: 1000 // 1000ms delay for second element
        }]
      },
      {
        target: fadingElements[2],
        initialState: { opacity: 0 },
        steps: [{
          properties: { opacity: 1 },
          duration: 1000,
          delay: 2000 // 2000ms delay for third element
        }]
      }
    ]

    // Test that prepareAnimations handles delays correctly
    const animations = prepareAnimations(animationTargets, 0, 1000, undefined)
    
    expect(animations).toHaveLength(3)
    
    // Check delays are preserved correctly
    expect(animations[0].delay).toBe(0)
    expect(animations[1].delay).toBe(1000)
    expect(animations[2].delay).toBe(2000)
    
    // Check durations are correct
    expect(animations[0].duration).toBe(1000)
    expect(animations[1].duration).toBe(1000)
    expect(animations[2].duration).toBe(1000)
    
    // Check targets are correct
    expect(animations[0].target).toBe(fadingElements[0])
    expect(animations[1].target).toBe(fadingElements[1])
    expect(animations[2].target).toBe(fadingElements[2])
  })

  it('should animate elements with staggered timing', () => {
    const animationTargets: AnimationTarget[] = [
      {
        target: fadingElements[0],
        initialState: { opacity: 0 },
        steps: [{
          properties: { opacity: 1 },
          duration: 1000,
          delay: 0
        }]
      },
      {
        target: fadingElements[1],
        initialState: { opacity: 0 },
        steps: [{
          properties: { opacity: 1 },
          duration: 1000,
          delay: 1000
        }]
      },
      {
        target: fadingElements[2],
        initialState: { opacity: 0 },
        steps: [{
          properties: { opacity: 1 },
          duration: 1000,
          delay: 2000
        }]
      }
    ]

    const animations = prepareAnimations(animationTargets, 0, 1000, undefined)
    const startTime = 1000

    // Test at 500ms: only first animation should be running
    const updates500 = processAnimationFrame(animations, startTime + 500, startTime)
    
    expect(updates500).toHaveLength(1) // Only first element animating
    expect(updates500[0].target).toBe(fadingElements[0])
    expect(updates500[0].updates.opacity).toBeCloseTo(0.5, 5) // 50% progress

    // Test at 1500ms: first and second animations should be running
    const updates1500 = processAnimationFrame(animations, startTime + 1500, startTime)
    
    expect(updates1500).toHaveLength(2) // First and second elements
    
    const firstUpdate1500 = updates1500.find(u => u.target === fadingElements[0])
    const secondUpdate1500 = updates1500.find(u => u.target === fadingElements[1])
    
    expect(firstUpdate1500?.updates.opacity).toBe(1) // First should be complete
    expect(secondUpdate1500?.updates.opacity).toBeCloseTo(0.5, 5) // Second at 50%
    expect(animations[0].completed).toBe(true)
    expect(animations[1].completed).toBe(false)

    // Test at 2000ms: second animation completes AND third animation starts
    const updates2000 = processAnimationFrame(animations, startTime + 2000, startTime)
    expect(updates2000).toHaveLength(2) // Second completing + third starting
    
    const secondUpdate2000 = updates2000.find(u => u.target === fadingElements[1])
    const thirdUpdate2000 = updates2000.find(u => u.target === fadingElements[2])
    
    expect(secondUpdate2000?.updates.opacity).toBe(1) // Second completes
    expect(thirdUpdate2000?.updates.opacity).toBe(0) // Third just starts (0% progress)
    expect(animations[1].completed).toBe(true) // Second should be marked complete

    // Test at 2500ms: At this time:
    // - First animation (delay: 0, duration: 1000) completed at 1000ms
    // - Second animation (delay: 1000, duration: 1000) completed at 2000ms  
    // - Third animation (delay: 2000, duration: 1000) should be at 50% progress
    const updates2500 = processAnimationFrame(animations, startTime + 2500, startTime) 
    
    // Debug info
    const completionStates = animations.map((anim, i) => ({
      index: i,
      completed: anim.completed,
      delay: anim.delay,
      duration: anim.duration,
      target: fadingElements.indexOf(anim.target as { opacity: number })
    }))
    
    const updateInfo = updates2500.map(update => ({ 
      target: fadingElements.indexOf(update.target as { opacity: number }),
      opacity: update.updates.opacity 
    }))
    
    // If test fails, show the actual state
    if (updates2500.length !== 1) {
      console.error('Expected 1 update but got:', updates2500.length)
      console.error('Completion states:', completionStates)
      console.error('Update info:', updateInfo)
    }
    
    expect(updates2500).toHaveLength(1) // Only third element still animating
    expect(updates2500[0].target).toBe(fadingElements[2])
    expect(updates2500[0].updates.opacity).toBeCloseTo(0.5, 5) // Third at 50%
    expect(animations[0].completed).toBe(true) // First completed
    expect(animations[1].completed).toBe(true) // Second completed  
    expect(animations[2].completed).toBe(false) // Third still running
  })
})
