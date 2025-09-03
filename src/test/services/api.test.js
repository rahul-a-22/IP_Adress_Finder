import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Create a simple API service module to test
const API_BASE_URL = 'http://localhost:3001/api';

const apiService = {
  fetchIPDetails: async (ipAddress = '') => {
    try {
      const url = `${API_BASE_URL}/lookup${ipAddress ? `/${ipAddress}` : ''}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch IP details');
    }
  },
};

describe('API Service', () => {
  const mockIpData = {
    ip: '8.8.8.8',
    city: 'Mountain View',
    region: 'California',
    country_name: 'United States',
    latitude: 37.4056,
    longitude: -122.0775,
  };

  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
  });

  it('fetches IP details without specific IP (current user IP)', async () => {
    // Mock successful response
    axios.get.mockResolvedValueOnce({ data: mockIpData });

    const result = await apiService.fetchIPDetails();

    // Check if axios was called with the correct URL
    expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/lookup`);
    expect(axios.get).toHaveBeenCalledTimes(1);

    // Check if the result matches the mock data
    expect(result).toEqual(mockIpData);
  });

  it('fetches IP details with specific IP address', async () => {
    // Mock successful response for specific IP
    const specificIpData = { ...mockIpData, ip: '1.1.1.1' };
    axios.get.mockResolvedValueOnce({ data: specificIpData });

    const result = await apiService.fetchIPDetails('1.1.1.1');

    // Check if axios was called with the correct URL including the IP
    expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/lookup/1.1.1.1`);
    expect(axios.get).toHaveBeenCalledTimes(1);

    // Check if the result matches the mock data
    expect(result).toEqual(specificIpData);
  });

  it('handles API error correctly', async () => {
    // Mock error response
    const errorMessage = 'Invalid IP address';
    axios.get.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    // Check if the error is thrown and handled correctly
    await expect(apiService.fetchIPDetails('invalid-ip')).rejects.toThrow(
      'Invalid IP address'
    );

    // Check if axios was called
    expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/lookup/invalid-ip`);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('handles network error correctly', async () => {
    // Mock network error (no response object)
    axios.get.mockRejectedValueOnce(new Error('Network Error'));

    // Check if the error is thrown and handled correctly
    await expect(apiService.fetchIPDetails()).rejects.toThrow('Failed to fetch IP details');

    // Check if axios was called
    expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/lookup`);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});