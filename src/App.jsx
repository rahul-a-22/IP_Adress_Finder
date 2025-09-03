// App.js

import { useEffect, useState, useCallback } from 'react';
import Axios from 'axios';
import MapComponent from './components/map';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {

    // Setting up the initial state variables
    const [ipDetails, setIpDetails] = useState([]);
    const [lat, setLat] = useState(22.5726);
    const [lon, setLon] = useState(88.3832);
    const [searchIP, setSearchIP] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [savedSearches, setSavedSearches] = useState([]);
    
    // API endpoint - use local backend instead of direct API call
    const API_BASE_URL = 'http://localhost:3001/api';

    // Function to fetch IP details
    const fetchIPDetails = async (ipAddress = '') => {
        setIsLoading(true);
        setError('');
        try {
            const url = `${API_BASE_URL}/lookup${ipAddress ? `/${ipAddress}` : ''}`;
            const response = await Axios.get(url);
            setIpDetails(response.data);
            
            // Check if latitude and longitude are valid numbers
            const latitude = parseFloat(response.data.latitude);
            const longitude = parseFloat(response.data.longitude);
            
            if (isNaN(latitude) || isNaN(longitude)) {
                console.warn('Invalid coordinates received:', response.data);
                // Set default coordinates for London if invalid
                setLat(51.5074);
                setLon(-0.1278);
            } else {
                setLat(latitude);
                setLon(longitude);
            }
        } catch (err) {
            setError('Invalid IP address or unable to fetch details');
            console.error('Error fetching IP details:', err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Load saved searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('savedSearches');
        if (saved) {
            setSavedSearches(JSON.parse(saved));
        }
    }, []);
    
    // Save a search to localStorage
    const saveSearch = useCallback(() => {
        if (!ipDetails.ip) return;
        
        const newSavedSearches = [...savedSearches];
        // Check if this IP is already saved
        if (!newSavedSearches.some(search => search.ip === ipDetails.ip)) {
            const searchToSave = {
                ip: ipDetails.ip,
                location: ipDetails.city ? `${ipDetails.city}, ${ipDetails.country_name}` : 'Unknown',
                timestamp: new Date().toISOString()
            };
            
            newSavedSearches.push(searchToSave);
            setSavedSearches(newSavedSearches);
            localStorage.setItem('savedSearches', JSON.stringify(newSavedSearches));
        }
    }, [ipDetails, savedSearches]);
    
    // Remove a saved search
    const removeSavedSearch = useCallback((ip) => {
        const newSavedSearches = savedSearches.filter(search => search.ip !== ip);
        setSavedSearches(newSavedSearches);
        localStorage.setItem('savedSearches', JSON.stringify(newSavedSearches));
    }, [savedSearches]);

    // Fetching the current IP once when the component is mounted
    useEffect(() => {
        fetchIPDetails();
    }, []);

    // Handle search form submission
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchIP.trim()) {
            fetchIPDetails(searchIP.trim());
        }
    };

    // Validate IP address format
    const validateIP = (ip) => {
        // IPv4 regex pattern
        const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        
        // IPv6 regex pattern (simplified)
        const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$|^:((:[0-9a-fA-F]{1,4}){1,7}|:)$/;
        
        return ip === '' || ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
    };
    
    // Handle input change with debounce
    const [debouncedError, setDebouncedError] = useState('');
    
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchIP(value);
        
        // Clear error when user types
        setError('');
        
        // Validate input format
        if (value && !validateIP(value)) {
            setDebouncedError('Please enter a valid IPv4 or IPv6 address');
        } else {
            setDebouncedError('');
        }
    };
    
    // Use debounce for validation errors
    useEffect(() => {
        const timer = setTimeout(() => {
            setError(debouncedError);
        }, 500);
        
        return () => clearTimeout(timer);
    }, [debouncedError]);

    return (
        <div className="app-wrapper">
            <ToastContainer />
            <h1 className="heading">IP Address Finder</h1>
            
            {/* Search Form */}
            <div className="search-container">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        value={searchIP}
                        onChange={handleInputChange}
                        placeholder="Enter IP address to search (e.g., 8.8.8.8)"
                        className={`search-input ${error ? 'input-error' : ''}`}
                    />
                    <button type="submit" className="search-button" disabled={isLoading || error}>
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>
            
            {/* Saved Searches */}
            <div className="saved-searches">
                <h3>Saved Searches</h3>
                {savedSearches.length === 0 ? (
                    <p>No saved searches yet</p>
                ) : (
                    <ul className="saved-list">
                        {savedSearches.map((search) => (
                            <li key={search.ip} className="saved-item">
                                <div>
                                    <strong>{search.ip}</strong>
                                    <p>{search.location}</p>
                                    <small>{new Date(search.timestamp).toLocaleString()}</small>
                                </div>
                                <div className="saved-actions">
                                    <button 
                                        onClick={() => {
                                            setSearchIP(search.ip);
                                            fetchIPDetails(search.ip);
                                        }}
                                        className="btn-search-again"
                                    >
                                        Search Again
                                    </button>
                                    <button 
                                        onClick={() => removeSavedSearch(search.ip)}
                                        className="btn-remove"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="App">
                <div className="left">
                    <h4>IP Address Details:</h4>
                    <h1 id="ip">{ipDetails.ip || 'Loading...'}</h1>
                    
                    {ipDetails.city && (
                        <>
                            <h4>Approximate location: </h4>
                            <p>{ipDetails.city}, {ipDetails.region}, {ipDetails.country_name}.</p>
                        </>
                    )}

                    {ipDetails.org && (
                        <>
                            <h4>Internet Service Provider(ISP):</h4>
                            <p>{ipDetails.org}</p>
                        </>
                    )}

                    {ipDetails.timezone && (
                        <>
                            <h4>Timezone:</h4>
                            <p>{ipDetails.timezone}</p>
                        </>
                    )}

                    {ipDetails.currency && (
                        <>
                            <h4>Currency:</h4>
                            <p>{ipDetails.currency}</p>
                        </>
                    )}
                    
                    {ipDetails.ip && (
                        <button 
                            onClick={saveSearch} 
                            className="save-button"
                            title="Save this IP to your saved searches"
                        >
                            Save This IP
                        </button>
                    )}
                </div>
                
                <div className="map-container">
                    <MapComponent lat={lat} lon={lon} />
                </div>
            </div>
        </div>
    );
}

export default App;