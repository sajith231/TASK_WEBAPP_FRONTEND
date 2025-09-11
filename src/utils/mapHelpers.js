// src/utils/mapHelpers.js
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

// Fix for default markers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configure default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// export function initHybridMap(container, { center = [11.618044, 76.081180], zoom = 16 } = {}) {
//     const map = L.map(container, { attributionControl: false, zoomControl: true }).setView(center, zoom);

//     const googleUrl = "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";
//     const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

//     const googleLayer = L.tileLayer(googleUrl, { maxZoom: 23, attribution: "© Google" }).addTo(map);

//     // Test if Google tiles load; if not, fall back to OSM.
//     const test = new Image();
//     test.crossOrigin = "anonymous";
//     test.onload = () => { /* Google works, keep it */ };
//     test.onerror = () => {
//         if (map.hasLayer(googleLayer)) map.removeLayer(googleLayer);
//         L.tileLayer(osmUrl, { maxZoom: 20, attribution: "© OpenStreetMap contributors" }).addTo(map);
//     };
//     test.src = googleUrl.replace("{x}", "1").replace("{y}", "1").replace("{z}", "2");

//     setTimeout(() => {
//         // if no tile layer present, add OSM
//         if (Object.keys(map._layers || {}).length <= 1) {
//             L.tileLayer(osmUrl, { maxZoom: 20, attribution: "© OpenStreetMap contributors" }).addTo(map);
//         }
//     }, 5000);

//     return map;
// }

export function initHybridMap(
    container,
    { center = [11.618044, 76.081180], zoom = 16 } = {}
) {
    const map = L.map(container, {
        attributionControl: false,
        zoomControl: true
    }).setView(center, zoom);

    const google = L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
        maxZoom: 23,
        attribution: "© Google"
    });

    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, // OSM doesn’t go higher than this
        attribution: "© OpenStreetMap contributors"
    });

    let switched = false;
    let googleResponded = false;

    function switchToOSM() {
        if (!switched) {
            console.warn("Switching to OSM fallback...");
            try {
                if (map.hasLayer(google)) {
                    map.removeLayer(google);
                }
            } catch (err) {
                console.error("Error removing Google layer:", err);
            }
            osm.addTo(map);
            switched = true;
        }
    }

    // If Google responds (even one tile), mark as working
    const markGoogleWorking = () => {
        if (!googleResponded) {
            googleResponded = true;
            clearTimeout(fallbackTimeout);
        }
    };

    google.on("tileloadstart", markGoogleWorking);
    google.on("tileload", markGoogleWorking);

    // Fallback: if no Google response after 5s, switch
    const fallbackTimeout = setTimeout(() => {
        if (!googleResponded && !switched) {
            switchToOSM();
        }
    }, 5000);

    // Start with Google
    google.addTo(map);

    // Wait for map to be fully loaded
    map.whenReady(() => {
        console.log('Map is ready for use');
    });

    return map;
}



export function setViewAndMarker(map, markerRef, lat, lng, zoom = 19) {
    const latLng = [parseFloat(lat), parseFloat(lng)];
    map.setView(latLng, zoom);
    
    // Custom marker icon for better visibility
    const customIcon = L.divIcon({
        className: 'custom-location-marker',
        html: `
            <div class="location-marker-pulse" style="
                width: 24px;
                height: 24px;
                background: #3b82f6;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                position: relative;
            ">
                <div style="
                    width: 8px;
                    height: 8px;
                    background: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                "></div>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    
    if (markerRef.current) {
        markerRef.current.setLatLng(latLng);
        markerRef.current.setIcon(customIcon);
    } else {
        markerRef.current = L.marker(latLng, { icon: customIcon }).addTo(map);
    }
    return markerRef.current;
}

export function addAccuracyCircle(map, lat, lng, accuracy) {
    console.log('addAccuracyCircle called with:', { lat, lng, accuracy, map: !!map });
    
    if (!map) {
        console.error('Map is not available');
        return null;
    }
    
    // Ensure we have a valid accuracy value
    const actualAccuracy = accuracy > 0 ? accuracy : 10; // Default to 10m if invalid
    
    const latLng = [parseFloat(lat), parseFloat(lng)];
    const radius = Math.max(Math.min(actualAccuracy, 100), 8); // Min 8m, max 100m
    
    console.log('Creating accuracy circle:', { 
        latLng, 
        radius, 
        originalAccuracy: accuracy,
        adjustedAccuracy: actualAccuracy 
    });
    
    try {
        const circle = L.circle(latLng, {
            radius: radius,
            color: "#ef4444",
            fillColor: "#ef4444", 
            fillOpacity: 0.2,
            weight: 2,
            opacity: 0.8,
            dashArray: "8, 4",
        });
        
        console.log('Circle created, adding to map...');
        circle.addTo(map);
        console.log('Circle successfully added to map');
        
        return circle;
    } catch (error) {
        console.error('Error in addAccuracyCircle:', error);
        return null;
    }
}
