import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    it('handles undefined and null values', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end')
    })

    it('handles empty strings', () => {
      expect(cn('base', '', 'end')).toBe('base end')
    })

    it('handles arrays of classes', () => {
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
    })

    it('handles objects with boolean values', () => {
      expect(cn({
        'active': true,
        'disabled': false,
        'primary': true
      })).toBe('active primary')
    })

    it('handles complex combinations', () => {
      const isActive = true
      const isDisabled = false
      
      expect(cn(
        'btn',
        'btn-base',
        {
          'btn-active': isActive,
          'btn-disabled': isDisabled,
        },
        isActive && 'state-active',
        'btn-end'
      )).toBe('btn btn-base btn-active state-active btn-end')
    })

    it('handles Tailwind CSS class conflicts', () => {
      // This tests the tailwind-merge functionality
      expect(cn('px-2 py-1 px-3')).toBe('py-1 px-3')
      expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500')
    })

    it('returns empty string for no arguments', () => {
      expect(cn()).toBe('')
    })

    it('handles nested arrays and objects', () => {
      expect(cn(
        'base',
        ['nested', 'array'],
        {
          'obj-true': true,
          'obj-false': false,
        },
        [
          'deep',
          {
            'deep-true': true,
            'deep-false': false,
          }
        ]
      )).toBe('base nested array obj-true deep deep-true')
    })
  })
})
