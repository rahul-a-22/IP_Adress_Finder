// Map.js

import React, { useEffect, useState } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { RiUserLocationFill } from 'react-icons/ri';

const API_KEY = `pk.eyJ1IjoicGFuZGEyMjEyIiwiYSI6ImNtZWhkM2EwcTA1eTYyaXI0bG11eXdoZWYifQ.397_-QyIXlW0D9GvFSNBoQ`;

const MapComponent = ({ lat, lon }) => {

    // Setting up the initial view state of the map (react-map-gl v8)
    const [viewState, setViewState] = useState({
        latitude: lat,
        longitude: lon,
        zoom: 14,
        bearing: 0,
        pitch: 0,
    });

    // Update view state whenever latitude or longitude props change
    useEffect(() => {
        setViewState((prev) => ({ ...prev, latitude: lat, longitude: lon }));
    }, [lat, lon]);

    return (
        <div className="map">
            <Map
                mapboxAccessToken={API_KEY}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                initialViewState={viewState}
                viewState={viewState}
                onMove={(evt) => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
            >
                <Marker latitude={lat} longitude={lon}>
                    <div className="mark">
                        <RiUserLocationFill size="25px" color="blue" />
                    </div>
                </Marker>
            </Map>
        </div>
    );
};

export default MapComponent;