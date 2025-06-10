import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../src/components/reviewmatch/ProductCard';

describe('ProductCard', () => {
  test('renders product information correctly', () => {
    const mockProduct = {
      productInfo: { name: 'Test Product', brand: 'Test Brand' }
    };
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});