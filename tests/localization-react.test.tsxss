import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import TestApp from './TestApp'

describe('localization-react', (): void => {
  it('supports property-based access with function calls for translations', async (): Promise<void> => {
    render(<TestApp />)

    // Test basic property access
    expect(screen.getByText(/Basic:/)).toHaveTextContent('Basic: This is a test')
    expect(screen.getByText(/Greeting:/)).toHaveTextContent('Greeting: Hello David')

    // Test forced locale component (uses more specific text to avoid duplicate matches)
    expect(screen.getByText(/^Forced Locale \(es\):/)).toHaveTextContent('Forced Locale (es): Esto es una prueba')

    // Test component-specific dictionary
    expect(screen.getByText(/^Component Dictionary:/)).toHaveTextContent('Component Dictionary: Additional text')

    // Use getAllByText and take the first one (for standard component)
    const withParamsElements = screen.getAllByText(/With Parameters:/)
    expect(withParamsElements[0]).toHaveTextContent('With Parameters: Parameter: test')

    // Test component dictionary with forced locale (uses more specific text)
    expect(screen.getByText(/^Component Dictionary with Forced Locale \(fr\):/)).toHaveTextContent('Component Dictionary with Forced Locale (fr): Texte supplémentaire')

    // Use getAllByText and take the second one (for forced locale component)
    expect(withParamsElements[1]).toHaveTextContent('With Parameters: Paramètre: test')

    // Test nested property access
    expect(screen.getByText(/Nested Properties:/)).toHaveTextContent('Nested Properties: Nested Section Title')
    expect(screen.getByText(/Nested with Params:/)).toHaveTextContent('Nested with Params: This is a nested description')

    // Test toggle locale
    fireEvent.click(screen.getByText('Toggle Locale'))

    // Verify everything updated correctly
    expect(screen.getByText(/Basic:/)).toHaveTextContent('Basic: Esto es una prueba')
    expect(screen.getByText(/Greeting:/)).toHaveTextContent('Greeting: Hola David')
    expect(screen.getByText(/^Forced Locale \(es\):/)).toHaveTextContent('Forced Locale (es): Esto es una prueba')
    expect(screen.getByText(/^Component Dictionary:/)).toHaveTextContent('Component Dictionary: Texto adicional')
    expect(screen.getByText(/Nested Properties:/)).toHaveTextContent('Nested Properties: Título de Sección Anidada')
  })
})
