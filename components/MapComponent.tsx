'use client'

import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, useMapEvents, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { cn } from '@/lib/utils'


const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const providerIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: black; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><circle cx="12" cy="12" r="10"></circle><path d="M16 12l-4-4-4 4M12 8v8"></path></svg>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
})

const providerIdleIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #333; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
})

const getIcon = (type?: string) => {
    switch (type) {
        case 'provider': return providerIcon;
        case 'provider-idle': return providerIdleIcon;
        default: return defaultIcon;
    }
}

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


            <ZoomControl position="bottomright" />
            <LocateButton />
            <MapEvents onLocationSelect={onLocationSelect} />

            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    position={marker.position}
                    icon={getIcon(marker.icon)}
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

            map.fitBounds(route, { padding: [50, 50] });
        } else {

            map.setView(center);
        }
    }, [center, map, route]);
    return null;
}

export default MapComponent
