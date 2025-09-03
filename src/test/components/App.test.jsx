import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock the MapComponent since we're only testing App functionality
vi.mock('../../components/map', () => ({
  default: ({ lat, lon }) => (
    <div data-testid="map-component" data-lat={lat} data-lon={lon}>
      Map Component
    </div>
  ),
}));

describe('App Component', () => {
  const mockIpData = {
    ip: '8.8.8.8',
    city: 'Mountain View',
    region: 'California',
    country_name: 'United States',
    latitude: 37.4056,
    longitude: -122.0775,
    org: 'Google LLC',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
  };

  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock successful API response for initial load
    axios.get.mockResolvedValueOnce({ data: mockIpData });
  });

  it('renders the app title', async () => {
    render(<App />);
    expect(screen.getByText('IP Address Finder')).toBeInTheDocument();
  });

  it('loads and displays IP data on initial render', async () => {
    render(<App />);
    
    // Wait for the initial data to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3001/api/lookup');
    });
    
    // Check if IP is displayed
    await waitFor(() => {
      expect(screen.getByText('8.8.8.8')).toBeInTheDocument();
    });
  });

  it('searches for a specific IP when submitted', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    // Mock the API response for the search
    const searchMockData = { ...mockIpData, ip: '1.1.1.1', city: 'Los Angeles' };
    axios.get.mockResolvedValueOnce({ data: mockIpData }) // Initial load
      .mockResolvedValueOnce({ data: searchMockData }); // Search response
    
    render(<App />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('8.8.8.8')).toBeInTheDocument();
    });
    
    // Type in the search input
    const input = screen.getByPlaceholderText('Enter IP address to search (e.g., 8.8.8.8)');
    await user.clear(input);
    await user.type(input, '1.1.1.1');
    
    // Submit the form
    const searchButton = screen.getByText('Search');
    await user.click(searchButton);
    
    // Verify the API was called with the correct IP
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3001/api/lookup/1.1.1.1');
    });
    
    // Check if the new IP data is displayed
    await waitFor(() => {
      expect(screen.getByText('1.1.1.1')).toBeInTheDocument();
      expect(screen.getByText('Los Angeles, United States.')).toBeInTheDocument();
    });
  });

  it('shows error message for invalid IP format', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    render(<App />);
    
    // Type an invalid IP
    const input = screen.getByPlaceholderText('Enter IP address to search (e.g., 8.8.8.8)');
    await user.clear(input);
    await user.type(input, 'invalid-ip');
    
    // Check if error message appears
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid IPv4 or IPv6 address')).toBeInTheDocument();
    });
    
    // Verify search button is disabled
    expect(screen.getByText('Search')).toBeDisabled();
  });

  it('saves and displays IP in saved searches', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    // Mock localStorage.getItem to return empty array initially
    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify([]));
    
    render(<App />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('8.8.8.8')).toBeInTheDocument();
    });
    
    // Click save button
    const saveButton = screen.getByText('Save This IP');
    await user.click(saveButton);
    
    // Verify localStorage was called with the correct data
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'savedSearches',
      expect.stringContaining('8.8.8.8')
    );
  });
});