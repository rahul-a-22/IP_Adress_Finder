import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MapComponent from '../../components/map';

// Mock the react-map-gl/mapbox component
vi.mock('react-map-gl/mapbox', () => ({
  default: vi.fn(({ children, ...props }) => (
    <div data-testid="mock-map" {...props}>
      {children}
    </div>
  )),
  Marker: vi.fn(({ children, ...props }) => (
    <div data-testid="mock-marker" {...props}>
      {children}
    </div>
  )),
}));

// Mock the react-icons component
vi.mock('react-icons/ri', () => ({
  RiUserLocationFill: () => <div data-testid="location-icon">Location Icon</div>,
}));

describe('MapComponent', () => {
  const defaultProps = {
    lat: 37.7749,
    lon: -122.4194,
  };

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('renders the map with correct props', () => {
    render(<MapComponent {...defaultProps} />);
    
    // Check if the map is rendered
    const map = screen.getByTestId('mock-map');
    expect(map).toBeInTheDocument();
    
    // Check if viewState is set correctly
    expect(map).toHaveAttribute('viewState');
    const viewState = JSON.parse(map.getAttribute('viewState'));
    expect(viewState.latitude).toBe(defaultProps.lat);
    expect(viewState.longitude).toBe(defaultProps.lon);
  });

  it('renders a marker at the specified coordinates', () => {
    render(<MapComponent {...defaultProps} />);
    
    // Check if marker is rendered
    const marker = screen.getByTestId('mock-marker');
    expect(marker).toBeInTheDocument();
    
    // Check if marker has correct coordinates
    expect(marker).toHaveAttribute('latitude', String(defaultProps.lat));
    expect(marker).toHaveAttribute('longitude', String(defaultProps.lon));
    
    // Check if location icon is rendered inside marker
    const icon = screen.getByTestId('location-icon');
    expect(icon).toBeInTheDocument();
  });

  it('updates viewState when lat/lon props change', () => {
    const { rerender } = render(<MapComponent {...defaultProps} />);
    
    // Initial render check
    let map = screen.getByTestId('mock-map');
    let viewState = JSON.parse(map.getAttribute('viewState'));
    expect(viewState.latitude).toBe(defaultProps.lat);
    expect(viewState.longitude).toBe(defaultProps.lon);
    
    // Update props
    const newProps = {
      lat: 40.7128,
      lon: -74.0060,
    };
    
    // Re-render with new props
    rerender(<MapComponent {...newProps} />);
    
    // Check if viewState is updated
    map = screen.getByTestId('mock-map');
    viewState = JSON.parse(map.getAttribute('viewState'));
    expect(viewState.latitude).toBe(newProps.lat);
    expect(viewState.longitude).toBe(newProps.lon);
  });
});