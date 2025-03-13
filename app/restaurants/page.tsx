'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { MOCK_RESTAURANTS, Restaurant } from '../data/restaurants';
import { calculateDistance, formatDistance, calculateDeliveryTime, formatDeliveryTime } from '../utils/location';

// Dynamically import Leaflet components with ssr: false
const LocationPicker = dynamic(() => import('../components/LocationPicker'), { ssr: false });

// Dynamically import the RestaurantMap component with ssr: false
const RestaurantMap = dynamic(() => import('../components/RestaurantMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full animate-spin mx-auto mb-3" style={{ 
          border: '4px solid rgba(78, 205, 196, 0.2)',
          borderTopColor: '#4ECDC4'
        }}></div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading map...</p>
      </div>
    </div>
  )
});

// Extended Restaurant interface with UI-specific properties
interface RestaurantWithDistance extends Restaurant {
  distance: number;
  isServicable: boolean;
}

// Maximum delivery distance in kilometers
const MAX_DELIVERY_DISTANCE = 100;

// All Leaflet-related code and marker functions are moved to be loaded client-side only
const createMarkerIcons = () => {
  // This will only run on the client
  if (typeof window !== 'undefined') {
    // Import Leaflet dynamically
    const L = require('leaflet');
    
    const userMarkerIcon = L.divIcon({
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
    
    const serviceableMarkerIcon = L.divIcon({
      className: "custom-icon",
      html: `<div style="background-color: white; width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 3px solid #4ECDC4;">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#4ECDC4" stroke-width="2">
               <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
             </svg>
           </div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
    
    const unserviceableMarkerIcon = L.divIcon({
      className: "custom-icon",
      html: `<div style="background-color: white; width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 3px solid #d3d3d3; opacity: 0.7;">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" stroke-width="2">
               <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
             </svg>
           </div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
    
    return { userMarkerIcon, serviceableMarkerIcon, unserviceableMarkerIcon };
  }
  
  return { userMarkerIcon: null, serviceableMarkerIcon: null, unserviceableMarkerIcon: null };
};

export default function RestaurantsPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 }); // Delhi
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [serviceableCount, setServiceableCount] = useState(0);

  useEffect(() => {
    // Attempt to get user's geolocation
    if (typeof window !== 'undefined' && navigator.geolocation) {
      const timeoutId = setTimeout(() => {
        setIsLoadingLocation(false);
        setLocationError('Location request timed out. Using default location.');
        sortRestaurantsByDistance({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi if timeout
      }, 10000); // 10 second timeout

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setIsLoadingLocation(false);
          sortRestaurantsByDistance(location);
        },
        (error) => {
          clearTimeout(timeoutId);
          setIsLoadingLocation(false);
          console.error('Geolocation error:', error);
          let errorMsg;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Location access denied. Using default location.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location information unavailable. Using default location.';
              break;
            case error.TIMEOUT:
              errorMsg = 'Location request timed out. Using default location.';
              break;
            default:
              errorMsg = 'Unknown location error. Using default location.';
          }
          setLocationError(errorMsg);
          sortRestaurantsByDistance({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
        }
      );
    } else {
      setIsLoadingLocation(false);
      setLocationError('Geolocation is not supported by this browser. Using default location.');
      sortRestaurantsByDistance({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
    }
  }, []);

  const sortRestaurantsByDistance = (userLoc: { lat: number; lng: number }) => {
    const sortedRestaurants = [...MOCK_RESTAURANTS].map(restaurant => {
      const distance = calculateDistance(userLoc, restaurant.location);
      const isServicable = distance <= MAX_DELIVERY_DISTANCE;
      return {
        ...restaurant,
        distance,
        isServicable
      };
    }).sort((a, b) => a.distance - b.distance);

    const serviceableCount = sortedRestaurants.filter(r => r.isServicable).length;
    setServiceableCount(serviceableCount);
    setRestaurants(sortedRestaurants);
  };

  // Update restaurants whenever user location changes
  useEffect(() => {
    if (userLocation) {
      sortRestaurantsByDistance(userLocation);
    }
  }, [userLocation]);

  const onLocationSelect = (location: { lat: number; lng: number }) => {
    setUserLocation(location);
    // Store the manually selected location in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('userSelectedLocation', JSON.stringify(location));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 inline-block bg-clip-text text-transparent" 
            style={{ 
              backgroundImage: 'linear-gradient(to right, #FF6B6B, #FF8E8E, #4ECDC4)'
            }}>
            Discover Restaurants
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find and order from the best local restaurants delivered right to your door
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left sidebar with location picker */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="rounded-2xl overflow-hidden shadow-md bg-white dark:bg-gray-800" style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700" style={{ background: 'linear-gradient(to right, rgba(78, 205, 196, 0.05), rgba(78, 205, 196, 0.1))' }}>
                  <h2 className="text-xl font-bold">Your Location</h2>
                </div>
                <div className="p-6">
                  {locationError && (
                    <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                      <p className="text-sm" style={{ color: '#FF6B6B' }}>{locationError}</p>
                    </div>
                  )}
                  
                  <div className="mb-4 flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ 
                      background: 'linear-gradient(to right, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.2))',
                      border: '1px solid rgba(78, 205, 196, 0.3)' 
                    }}>
                      <MapPinIcon className="h-5 w-5" style={{ color: '#4ECDC4' }} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Current Location</p>
                      <p className="font-semibold">
                        {isLoadingLocation ? 'Detecting your location...' : 'Delhi, India'}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Select your location on the map or allow automatic detection for better delivery estimates.
                  </p>
                  
                  <div className="h-[300px] rounded-xl overflow-hidden shadow-sm mb-4" style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                    <LocationPicker userLocation={userLocation} onLocationSelect={onLocationSelect} />
                  </div>
                </div>
              </div>
              
              <div className="rounded-2xl overflow-hidden shadow-md bg-white dark:bg-gray-800" style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700" style={{ background: 'linear-gradient(to right, rgba(255, 107, 107, 0.05), rgba(255, 107, 107, 0.1))' }}>
                  <h2 className="text-xl font-bold">Delivery Information</h2>
                </div>
                <div className="p-6">
                  <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {serviceableCount > 0 
                        ? `${serviceableCount} of ${restaurants.length} restaurants deliver to your location.`
                        : 'No restaurants deliver to your current location. Try selecting a different location.'}
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full mr-3 flex items-center justify-center" style={{ 
                      background: 'linear-gradient(to right, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.2))',
                      border: '1px solid rgba(78, 205, 196, 0.3)' 
                    }}>
                      <ClockIcon className="h-5 w-5" style={{ color: '#4ECDC4' }} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Maximum Delivery Range</p>
                      <p className="font-semibold">{MAX_DELIVERY_DISTANCE} kilometers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Available Restaurants
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {restaurants.length} restaurants
              </div>
            </div>
            
            {serviceableCount === 0 && restaurants.length > 0 && (
              <div className="mb-6 p-4 rounded-xl shadow-md" style={{ background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                <p className="text-base font-medium" style={{ color: '#FF6B6B' }}>No restaurants available for delivery to your location</p>
                <p className="text-sm mt-1" style={{ color: '#FF6B6B' }}>
                  All restaurants are outside our {MAX_DELIVERY_DISTANCE}km delivery zone. Please try selecting a different location.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {restaurants.map((restaurant) => (
                <Link 
                  key={restaurant.id} 
                  href={`/restaurants/${restaurant.id}`}
                  className={`block rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 ${
                    !restaurant.isServicable ? 'opacity-70' : ''
                  }`}
                  style={{ border: '1px solid rgba(0,0,0,0.05)' }}
                >
                  <div className="relative h-48">
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    
                    {/* Tag for unserviceable restaurants */}
                    {!restaurant.isServicable && (
                      <div className="absolute top-4 right-4 py-1 px-3 rounded-full text-white text-xs font-medium" style={{ background: 'rgba(255, 107, 107, 0.9)' }}>
                        Unserviceable
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h3 className="text-xl font-bold mb-1">{restaurant.name}</h3>
                      <div className="flex items-center space-x-2 text-sm">
                        <span>{restaurant.cuisine}</span>
                        <span>•</span>
                        <span>{restaurant.priceRange}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <StarIcon className="h-5 w-5 mr-1 text-yellow-400" />
                        <span className="font-medium">{restaurant.rating}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDistance(restaurant.distance)} away
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="inline-flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" style={{ color: restaurant.isServicable ? '#4ECDC4' : '#9CA3AF' }} />
                          <span style={{ color: restaurant.isServicable ? 'inherit' : '#9CA3AF' }}>
                            {formatDeliveryTime(calculateDeliveryTime(restaurant.distance))}
                          </span>
                        </span>
                      </div>
                      
                      <div 
                        className="py-1 px-3 rounded-full text-xs font-medium"
                        style={{ 
                          background: restaurant.isServicable 
                            ? 'linear-gradient(to right, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.2))' 
                            : 'rgba(0,0,0,0.05)',
                          color: restaurant.isServicable ? '#4ECDC4' : '#9CA3AF',
                          border: restaurant.isServicable 
                            ? '1px solid rgba(78, 205, 196, 0.3)' 
                            : '1px solid rgba(0,0,0,0.1)'
                        }}
                      >
                        {restaurant.isServicable ? 'Delivers to you' : 'Out of range'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        {/* Full width map at the bottom */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Restaurants Near You</h2>
          </div>
          <div className="h-[500px] w-full">
            {typeof window !== 'undefined' && (
              <RestaurantMap userLocation={userLocation} restaurants={restaurants} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 