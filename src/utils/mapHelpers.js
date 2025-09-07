// src/utils/mapHelpers.js
import L from "leaflet";

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

    return map;
}



export function setViewAndMarker(map, markerRef, lat, lng, zoom = 19) {
    const latLng = [parseFloat(lat), parseFloat(lng)];
    map.setView(latLng, zoom);
    if (markerRef.current) {
        markerRef.current.setLatLng(latLng);
    } else {
        markerRef.current = L.marker(latLng).addTo(map);
    }
    return markerRef.current;
}

export function addAccuracyCircle(map, lat, lng, accuracy) {
    // if (!accuracy) return null;
    const latLng = [parseFloat(lat), parseFloat(lng)];
    return L.circle(latLng, {
        radius: accuracy > 20 ? 10 : accuracy ,
        color: "#0004ffff",
        fillColor: "transparent",
        fillOpacity: 0,
        weight: 2,
        dashArray: "5, 5",
    }).addTo(map);
}
