'use client'

import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, useMapEvents, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { cn } from '@/lib/utils'

// Fix Leaflet marker icon issue
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

type Props = {
    className?: string
    center?: [number, number]
    markers?: Array<{ id: string; position: [number, number]; title: string; icon?: string }>
    onLocationSelect?: (lat: number, lng: number) => void
    onMarkerClick?: (id: string) => void
    route?: [number, number][]
}

function MapComponent({ className, center = [28.6139, 77.2090], markers = [], onLocationSelect, onMarkerClick, route }: Props) {
    return (
        <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            doubleClickZoom={false}
            className={cn("w-full h-full rounded-xl z-0", className)}
            zoomControl={false} // Disable default to add custom position
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Controls */}
            <ZoomControl position="bottomright" />
            <LocateButton />
            <MapEvents onLocationSelect={onLocationSelect} />

            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    position={marker.position}
                    icon={icon}
                    eventHandlers={{
                        click: () => onMarkerClick?.(marker.id)
                    }}
                >
                    <Popup>{marker.title}</Popup>
                </Marker>
            ))}

            {route && route.length > 1 && (
                <Polyline
                    positions={route}
                    color="blue"
                    weight={4}
                    opacity={0.7}
                    dashArray="10, 10"
                />
            )}

            <RecenterMap center={center} route={route} />
        </MapContainer>
    )
}

function MapEvents({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
    useMapEvents({
        dblclick(e) {
            console.log("Double clicked", e.latlng)
            if (onLocationSelect) {
                onLocationSelect(e.latlng.lat, e.latlng.lng)
            }
        },
    })
    return null
}

function LocateButton() {
    const map = useMap()

    const handleLocate = () => {
        map.locate().on("locationfound", function (e) {
            map.flyTo(e.latlng, map.getZoom())
        })
    }

    return (
        <div className="leaflet-bottom leaflet-right mb-24 mr-2.5">
            <div className="leaflet-control leaflet-bar">
                <button
                    onClick={handleLocate}
                    className="bg-white p-2 hover:bg-gray-100 flex items-center justify-center w-[30px] h-[30px]"
                    title="Locate Me"
                >
                    📍
                </button>
            </div>
        </div>
    )
}

function RecenterMap({ center, route }: { center: [number, number], route?: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (route && route.length > 1) {
            // Fit bounds to the route with some padding
            map.fitBounds(route, { padding: [50, 50] });
        } else {
            // Default center behavior
            map.setView(center);
        }
    }, [center, map, route]);
    return null;
}

export default MapComponent
