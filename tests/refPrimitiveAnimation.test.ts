import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { animate, animateValue } from '../composables/useGeneratorAnimation';

// Test the new ref primitive animation functionality
describe('Ref Primitive Animation', () => {
    it('should animate ref primitive values using animate function', () => {
        const numberRef = ref(0);
        const stringRef = ref('start');
        
        // Using the overloaded animate function
        const numberAnimation = animate(numberRef, 100);
        const stringAnimation = animate(stringRef, 'end');
        
        expect(numberAnimation).toEqual({
            type: 'animate',
            target: numberRef,
            properties: { value: 100 },
            options: {}
        });
        
        expect(stringAnimation).toEqual({
            type: 'animate',
            target: stringRef,
            properties: { value: 'end' },
            options: {}
        });
    });
    
    it('should animate ref primitive values using animateValue helper', () => {
        const numberRef = ref(42);
        
        const animation = animateValue(numberRef, 84, { duration: 500 });
        
        expect(animation).toEqual({
            type: 'animate',
            target: numberRef,
            properties: { value: 84 },
            options: { duration: 500 }
        });
    });
    
    it('should still work with object properties for non-ref targets', () => {
        const shape = { x: 0, y: 0, width: 100 };
        
        const animation = animate(shape, { x: 50, y: 25 });
        
        expect(animation).toEqual({
            type: 'animate',
            target: shape,
            properties: { x: 50, y: 25 },
            options: {}
        });
    });
    
    it('should still work with ref object types', () => {
        const shapeRef = ref({ x: 0, y: 0, width: 100 });
        
        const animation = animate(shapeRef, { x: 50, y: 25 });
        
        expect(animation).toEqual({
            type: 'animate',
            target: shapeRef.value,
            properties: { x: 50, y: 25 },
            options: {}
        });
    });
});
