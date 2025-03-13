'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Restaurant } from '../data/restaurants';

interface RestaurantWithDistance extends Restaurant {
  distance: number;
  isServicable: boolean;
}

interface RestaurantMapProps {
  userLocation: { lat: number; lng: number };
  restaurants: RestaurantWithDistance[];
}

// Helper component to update map center
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  
  return null;
}

// Create custom marker icons
function createUserMarkerIcon() {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: white; width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 3px solid #FF6B6B;">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#FF6B6B" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
             <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
           </svg>
         </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

function createServiceableMarkerIcon() {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: white; width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 3px solid #4ECDC4;">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#4ECDC4" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
           </svg>
         </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

function createUnserviceableMarkerIcon() {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: white; width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 3px solid #d3d3d3; opacity: 0.7;">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
           </svg>
         </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

export default function RestaurantMap({ userLocation, restaurants }: RestaurantMapProps) {
  return (
    <MapContainer 
      center={[userLocation.lat, userLocation.lng]} 
      zoom={12} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User marker */}
      <Marker 
        position={[userLocation.lat, userLocation.lng]}
        icon={createUserMarkerIcon()}
      >
        <Popup>
          <div className="font-medium">Your Location</div>
        </Popup>
      </Marker>
      
      {/* Restaurant markers */}
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[restaurant.location.lat, restaurant.location.lng]}
          icon={restaurant.isServicable 
            ? createServiceableMarkerIcon()
            : createUnserviceableMarkerIcon()}
        >
          <Popup>
            <div>
              <div className="font-medium mb-1">{restaurant.name}</div>
              <div className="text-sm text-gray-600">{restaurant.cuisine} • {restaurant.priceRange}</div>
              <div className="text-sm mt-1">
                <span className="font-medium">{restaurant.distance.toFixed(1)} km</span> from you
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Update map center when user location changes */}
      <MapController center={[userLocation.lat, userLocation.lng]} />
    </MapContainer>
  );
} 