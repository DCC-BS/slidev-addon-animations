import { describe, it, expect } from 'vitest'
import {
  lerp,
  numberLerp,
  colorLerp,
  stringLerp,
  parseColor,
  colorToString,
  isColorString,
  type Color
} from '../utils/lerpSystem.js'

describe('lerpSystem', () => {
  describe('numberLerp', () => {
    it('should interpolate between two numbers', () => {
      expect(numberLerp(0, 10, 0)).toBe(0)
      expect(numberLerp(0, 10, 0.5)).toBe(5)
      expect(numberLerp(0, 10, 1)).toBe(10)
    })

    it('should handle negative numbers', () => {
      expect(numberLerp(-10, 10, 0.5)).toBe(0)
      expect(numberLerp(10, -10, 0.5)).toBe(0)
    })

    it('should handle decimal values', () => {
      expect(numberLerp(0, 1, 0.25)).toBe(0.25)
      expect(numberLerp(0, 1, 0.75)).toBe(0.75)
    })
  })

  describe('colorLerp', () => {
    it('should interpolate between two colors', () => {
      const red: Color = { r: 255, g: 0, b: 0 }
      const blue: Color = { r: 0, g: 0, b: 255 }
      
      const result = colorLerp(red, blue, 0.5)
      expect(result.r).toBe(128)
      expect(result.g).toBe(0)
      expect(result.b).toBe(128)
    })

    it('should handle alpha values', () => {
      const transparent: Color = { r: 255, g: 0, b: 0, a: 0 }
      const opaque: Color = { r: 255, g: 0, b: 0, a: 1 }
      
      const result = colorLerp(transparent, opaque, 0.5)
      expect(result.a).toBe(0.5)
    })

    it('should handle missing alpha values', () => {
      const color1: Color = { r: 255, g: 0, b: 0 }
      const color2: Color = { r: 0, g: 0, b: 255, a: 0.5 }
      
      const result = colorLerp(color1, color2, 0.5)
      expect(result.a).toBe(0.5)
    })
  })

  describe('parseColor', () => {
    it('should parse hex colors', () => {
      expect(parseColor('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(parseColor('#f00')).toEqual({ r: 255, g: 0, b: 0 })
      
      const result = parseColor('#ff000080')
      expect(result.r).toBe(255)
      expect(result.g).toBe(0)
      expect(result.b).toBe(0)
      expect(result.a).toBeCloseTo(0.5, 2)
    })

    it('should parse rgb colors', () => {
      expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 })
      expect(parseColor('rgba(255, 0, 0, 0.5)')).toEqual({ r: 255, g: 0, b: 0, a: 0.5 })
    })

    it('should parse named colors', () => {
      expect(parseColor('red')).toEqual({ r: 255, g: 0, b: 0 })
      expect(parseColor('blue')).toEqual({ r: 0, g: 0, b: 255 })
      expect(parseColor('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 0 })
    })

    it('should throw for invalid colors', () => {
      expect(() => parseColor('invalid')).toThrow()
      expect(() => parseColor('#gg0000')).toThrow()
    })
  })

  describe('colorToString', () => {
    it('should convert color to rgb string', () => {
      expect(colorToString({ r: 255, g: 0, b: 0 })).toBe('rgb(255, 0, 0)')
    })

    it('should convert color with alpha to rgba string', () => {
      expect(colorToString({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('rgba(255, 0, 0, 0.5)')
    })
  })

  describe('isColorString', () => {
    it('should identify color strings', () => {
      expect(isColorString('#ff0000')).toBe(true)
      expect(isColorString('rgb(255, 0, 0)')).toBe(true)
      expect(isColorString('red')).toBe(true)
    })

    it('should reject non-color strings', () => {
      expect(isColorString('not-a-color')).toBe(false)
      expect(isColorString('123')).toBe(false)
    })
  })

  describe('stringLerp', () => {
    it('should interpolate color strings', () => {
      const result = stringLerp('#ff0000', '#0000ff', 0.5)
      expect(result).toBe('rgb(128, 0, 128)')
    })

    it('should switch non-color strings', () => {
      expect(stringLerp('start', 'end', 0.3)).toBe('start')
      expect(stringLerp('start', 'end', 0.7)).toBe('end')
    })
  })

  describe('lerp (generic)', () => {
    it('should handle numbers', () => {
      expect(lerp(0, 10, 0.5)).toBe(5)
    })

    it('should handle color strings', () => {
      const result = lerp('#ff0000', '#0000ff', 0.5)
      expect(result).toBe('rgb(128, 0, 128)')
    })

    it('should handle color objects', () => {
      const red: Color = { r: 255, g: 0, b: 0 }
      const blue: Color = { r: 0, g: 0, b: 255 }
      const result = lerp(red, blue, 0.5) as Color
      expect(result.r).toBe(128)
      expect(result.b).toBe(128)
    })
  })
})
