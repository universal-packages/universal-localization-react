import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import TestApp from './TestApp'

describe('localization-react', (): void => {
  it('lets localize react components', async (): Promise<void> => {
    render(<TestApp />)

    expect(screen.getByText(/Title: /)).toHaveTextContent('Title: This is a test')
    expect(screen.getByText(/Greating: /)).toHaveTextContent('Greating: Hello David')

    fireEvent.click(screen.getByText('Change'))

    expect(screen.getByText(/Title: /)).toHaveTextContent('Title: Esto es una prueba')
    expect(screen.getByText(/Greating: /)).toHaveTextContent('Greating: Hola David')
  })
})
