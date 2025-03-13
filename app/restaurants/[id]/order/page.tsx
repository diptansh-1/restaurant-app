'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPinIcon, ClockIcon, ShoppingBagIcon, ArrowLeftIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Checkout from '@/app/components/Checkout';
import { MOCK_RESTAURANTS, Restaurant } from '@/app/data/restaurants';
import { calculateDistance, calculateDeliveryTime, formatDistance, formatDeliveryTime } from '@/app/utils/location';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;
  
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<number | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [cityName, setCityName] = useState<string>('');

  // Load cart items from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(`cart-${id}`);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, [id]);

  // Get city name based on coordinates
  const getCityFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      
      // Extract city from response
      const city = data.address?.city || 
                  data.address?.town || 
                  data.address?.village || 
                  data.address?.county || 
                  'Unknown location';
      
      setCityName(city);
      return city;
    } catch (error) {
      console.error('Error fetching location name:', error);
      setCityName('Delhi');
      return 'Delhi';
    }
  };

  useEffect(() => {
    const foundRestaurant = MOCK_RESTAURANTS.find((r: Restaurant) => r.id === id);
    setRestaurant(foundRestaurant || null);

    // First check if there's a stored user location
    try {
      const storedLocation = localStorage.getItem('userSelectedLocation');
      if (storedLocation) {
        const parsedLocation = JSON.parse(storedLocation);
        setUserLocation(parsedLocation);
        getCityFromCoordinates(parsedLocation.lat, parsedLocation.lng);
        return; // Exit early if we found a stored location
      }
    } catch (error) {
      console.error('Error retrieving stored location:', error);
    }

    // Get user's location if no stored location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userLoc);
          getCityFromCoordinates(userLoc.lat, userLoc.lng);
          // Store the browser location in localStorage
          localStorage.setItem('userSelectedLocation', JSON.stringify(userLoc));
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use a default location in Delhi if geolocation fails
          const defaultLocation = { lat: 28.6139, lng: 77.2090 };
          setUserLocation(defaultLocation);
          setCityName('Delhi');
          // Store the default location in localStorage
          localStorage.setItem('userSelectedLocation', JSON.stringify(defaultLocation));
        }
      );
    } else {
      // Use a default location in Delhi if geolocation is not supported
      const defaultLocation = { lat: 28.6139, lng: 77.2090 };
      setUserLocation(defaultLocation);
      setCityName('Delhi');
      // Store the default location in localStorage
      localStorage.setItem('userSelectedLocation', JSON.stringify(defaultLocation));
    }
  }, [id]);

  useEffect(() => {
    if (restaurant && userLocation) {
      const distance = calculateDistance({
        lat: userLocation.lat,
        lng: userLocation.lng
      }, restaurant.location);
      setDistance(distance);
      setDeliveryTime(calculateDeliveryTime(distance));
    }
  }, [restaurant, userLocation]);

  const subtotal = cartItems.length > 0 
    ? cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) 
    : 0;

  const handleOrderComplete = () => {
    setOrderComplete(true);
    
    // Save order data to localStorage before clearing the cart
    try {
      // Create complete order data
      const orderData = {
        restaurant,
        items: cartItems,
        subtotal,
        deliveryFee: distance ? Math.max(30, distance * 5) : 30,
        tax: subtotal * 0.05,
        total: subtotal + (distance ? Math.max(30, distance * 5) : 30) + (subtotal * 0.05),
        orderNumber: Math.floor(10000 + Math.random() * 90000),
        orderDate: new Date(),
        paymentMethod: 'Credit Card'
      };
      
      // Save the order data in localStorage
      localStorage.setItem(`orderData-${id}`, JSON.stringify(orderData));
      console.log('Saved order data to localStorage:', orderData);
      
      // Then clear the cart after saving the order data
      localStorage.removeItem(`cart-${id}`);
    } catch (error) {
      console.error('Error saving order data to localStorage:', error);
    }
    
    setTimeout(() => {
      router.push(`/restaurants/${id}/order/confirmation`);
    }, 2000);
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 rounded-full animate-spin flex-shrink-0" style={{ 
          border: '4px solid rgba(255, 107, 107, 0.1)',
          borderTopColor: '#FF6B6B'
        }}></div>
        <p className="ml-4 text-lg text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-8">
          <Link 
            href={`/restaurants/${id}`} 
            className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors group"
            style={{ color: '#FF6B6B' }}
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Restaurant</span>
          </Link>
          
          <div className="text-center py-20">
            <div 
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
              style={{ background: 'rgba(255, 107, 107, 0.1)' }}
            >
              <ShoppingBagIcon className="h-10 w-10" style={{ color: '#FF6B6B' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some delicious items from the menu to place an order</p>
            <Link
              href={`/restaurants/${id}`}
              className="inline-block py-3 px-8 rounded-xl font-medium text-white text-center transition-all duration-200"
              style={{ 
                background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)',
                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.25)'
              }}
            >
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950"
      >
        <div className="text-center px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1
            }}
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
            style={{ 
              background: 'linear-gradient(to right, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.2))',
              border: '1px solid rgba(78, 205, 196, 0.3)'
            }}
          >
            <svg className="w-12 h-12" style={{ color: '#4ECDC4' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <motion.h2 
            className="text-2xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Processing Your Order
          </motion.h2>
          <motion.p 
            className="text-gray-600 dark:text-gray-400 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Please wait while we redirect you to the confirmation page...
          </motion.p>
          <motion.div
            className="w-16 h-16 rounded-full mx-auto"
            style={{ 
              border: '3px solid rgba(78, 205, 196, 0.3)',
              borderTopColor: '#4ECDC4'
            }}
            animate={{ rotate: 360 }}
            transition={{ 
              repeat: Infinity,
              duration: 1,
              ease: "linear"
            }}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Order Summary */}
          <div className="lg:col-span-1">
            <Link 
              href={`/restaurants/${id}`} 
              className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors group"
              style={{ color: '#FF6B6B' }}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Restaurant</span>
            </Link>
            
            <div className="rounded-2xl overflow-hidden shadow-md bg-white dark:bg-gray-800 mb-6" style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
              <div 
                className="p-6 border-b border-gray-100 dark:border-gray-700"
                style={{ background: 'linear-gradient(to right, rgba(255, 107, 107, 0.05), rgba(255, 107, 107, 0.1))' }}
              >
                <div className="flex items-center">
                  <Image 
                    src={restaurant.image} 
                    alt={restaurant.name} 
                    width={60} 
                    height={60} 
                    className="rounded-lg shadow-sm mr-4"
                  />
                  <div>
                    <h2 className="text-xl font-bold">{restaurant.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{restaurant.cuisine}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="flex-1">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium" style={{ color: '#FF6B6B' }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                    <span>₹{(distance ? Math.max(30, distance * 5) : 30).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span>₹{(subtotal * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span>Total</span>
                    <span style={{ color: '#FF6B6B' }}>
                      ₹{(subtotal + (distance ? Math.max(30, distance * 5) : 30) + (subtotal * 0.05)).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {distance && deliveryTime && (
                  <div className="mt-6 rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <div className="flex items-center mb-2">
                      <MapPinIcon className="h-5 w-5 mr-2" style={{ color: '#4ECDC4' }} />
                      <span className="text-sm">{formatDistance(distance)} away</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" style={{ color: '#4ECDC4' }} />
                      <span className="text-sm">Estimated delivery: {formatDeliveryTime(deliveryTime)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Side - Checkout Form */}
          <div className="lg:col-span-2">
            <Checkout 
              restaurant={restaurant} 
              cartItems={cartItems} 
              subtotal={subtotal} 
              deliveryFee={distance ? Math.max(30, distance * 5) : 30} 
              tax={subtotal * 0.05} 
              onComplete={handleOrderComplete}
              cityName={cityName}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 