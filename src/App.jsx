// App.js

import { useEffect, useState } from 'react';
import Axios from 'axios';
import MapComponent from './components/map';
import './App.css';

function App() {

    // Setting up the initial state variables
    const [ipDetails, setIpDetails] = useState([]);
    const [lat, setLat] = useState(22.5726);
    const [lon, setLon] = useState(88.3832);
    const [searchIP, setSearchIP] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Function to fetch IP details
    const fetchIPDetails = async (ipAddress = '') => {
        setIsLoading(true);
        setError('');
        try {
            const url = ipAddress ? `https://ipapi.co/${ipAddress}/json/` : 'https://ipapi.co/json/';
            const response = await Axios.get(url);
            setIpDetails(response.data);
            setLat(response.data.latitude);
            setLon(response.data.longitude);
        } catch (err) {
            setError('Invalid IP address or unable to fetch details');
            console.error('Error fetching IP details:', err);
        } finally {
            setIsLoading(false);
        }
    };

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

    // Handle input change
    const handleInputChange = (e) => {
        setSearchIP(e.target.value);
        setError(''); // Clear error when user types
    };

    return (
        <div className="app-wrapper">
            <h1 className="heading">IP Address Finder</h1>
            
            {/* Search Form */}
            <div className="search-container">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        value={searchIP}
                        onChange={handleInputChange}
                        placeholder="Enter IP address to search (e.g., 8.8.8.8)"
                        className="search-input"
                    />
                    <button type="submit" className="search-button" disabled={isLoading}>
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
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
                </div>
                
                <div className="map-container">
                    <MapComponent lat={lat} lon={lon} />
                </div>
            </div>
        </div>
    );
}

export default App;