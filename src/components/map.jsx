// Map.js

import React, { useEffect, useState } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { RiUserLocationFill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// The API key should be stored in an environment variable in production
// For this example, we'll use a placeholder that will be replaced at build time
const API_KEY = import.meta.env.VITE_MAPBOX_API_KEY || '';

const MapComponent = ({ lat, lon }) => {
    const [hasError, setHasError] = useState(false);
    
    // Setting up the initial view state of the map (react-map-gl v8)
    const [viewState, setViewState] = useState({
        latitude: isNaN(lat) ? 0 : lat,
        longitude: isNaN(lon) ? 0 : lon,
        zoom: 14,
        bearing: 0,
        pitch: 0,
    });

    // Reference to track if we've shown an error toast to prevent infinite updates
    const [hasShownErrorToast, setHasShownErrorToast] = useState(false);
    
    // Update view state whenever latitude or longitude props change
    useEffect(() => {
        if (isNaN(lat) || isNaN(lon)) {
            // Set error state without triggering re-renders if already set
            if (!hasError) {
                setHasError(true);
            }
            
            // Only show the toast once for invalid coordinates
            if (!hasShownErrorToast) {
                toast.error('Invalid coordinates received. Please refresh the page.', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setHasShownErrorToast(true);
            }
            return;
        }
        
        // Only update states if they need to change
        if (hasError) {
            setHasError(false);
        }
        
        if (hasShownErrorToast) {
            setHasShownErrorToast(false);
        }
        
        // Update viewState only if coordinates have changed
        if (viewState.latitude !== lat || viewState.longitude !== lon) {
            setViewState((prev) => ({ ...prev, latitude: lat, longitude: lon }));
        }
    }, [lat, lon]);

    return (
        <div className="map">
            {!hasError ? (
                <Map
                    mapboxAccessToken={API_KEY}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    initialViewState={viewState}
                    viewState={viewState}
                    onMove={(evt) => setViewState(evt.viewState)}
                    style={{ width: '100%', height: '100%' }}
                >
                    {!isNaN(lat) && !isNaN(lon) && (
                        <Marker latitude={lat} longitude={lon}>
                            <div className="mark">
                                <RiUserLocationFill size="25px" color="blue" />
                            </div>
                        </Marker>
                    )}
                </Map>
            ) : (
                <div className="map-error" style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <p>Map cannot be displayed due to invalid coordinates. Please refresh the page.</p>
                </div>
            )}
        </div>
    );
};

export default MapComponent;