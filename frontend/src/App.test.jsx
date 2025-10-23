import { render, screen } from '@testing-library/react';
import App from './App';

test('renders credit card parser', () => {
  render(<App />);
  const titleElement = screen.getByText(/Smart CC Parser/i);
  expect(titleElement).toBeInTheDocument();
});