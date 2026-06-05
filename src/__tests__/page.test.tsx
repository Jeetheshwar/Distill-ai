import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mock complex UI components to simplify testing
jest.mock('@/components/ui/aura', () => ({
  Aura: () => <div data-testid="mock-aura" />
}))

jest.mock('@/components/ui/blur-reveal', () => ({
  BlurReveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    
    // Check if the main heading is present
    expect(screen.getByText(/Turn Standup Recordings/i)).toBeInTheDocument()
  })

  it('renders the Try Free Demo button', () => {
    render(<Home />)
    
    // Check if the demo button is present
    expect(screen.getByText(/Try Free Demo/i)).toBeInTheDocument()
  })
})
