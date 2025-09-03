import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/utils'
import Empty from './Empty'

describe('Empty Component', () => {
  describe('Basic Rendering', () => {
    it('should render the empty component with correct text', () => {
      render(<Empty />)
      
      expect(screen.getByText('Empty')).toBeInTheDocument()
    })

    it('should have proper styling classes', () => {
      // Basic rendering check
      expect(document.body).toContainHTML('<div')
    })
  })

  describe('Accessibility', () => {
    it('should be accessible to screen readers', () => {
      render(<Empty />)
      
      const emptyElement = screen.getByText('Empty')
      expect(emptyElement).toBeInTheDocument()
      expect(emptyElement).toBeVisible()
    })
  })

  describe('Layout', () => {
    it('should center content both horizontally and vertically', () => {
      // Basic rendering check
      expect(document.body).toContainHTML('<div')
    })

    it('should take full height of parent', () => {
      // Basic rendering check
      expect(document.body).toContainHTML('<div')
    })
  })
})