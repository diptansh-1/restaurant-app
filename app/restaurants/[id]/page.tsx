'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon, MapPinIcon, ClockIcon, ShoppingBagIcon, StarIcon } from '@heroicons/react/24/outline';
import { Coordinates, calculateDistance, calculateDeliveryTime, formatDistance, formatDeliveryTime } from '../../utils/location';

// Mock data for restaurants
const MOCK_RESTAURANTS = [
  {
    id: '1',
    name: 'Burger Palace',
    image: '/images/restaurants/burger.jpg',
    cuisine: 'American',
    rating: 4.5,
    location: { lat: 28.6139, lng: 77.2090 }, // Delhi
    priceRange: '₹',
    description: 'Gourmet burgers made with premium ingredients. Our patties are 100% grass-fed beef, and we offer vegetarian options.',
    menu: [
      { id: 'm1', name: 'Classic Burger', price: 199, description: 'Beef patty with lettuce, tomato, onion, and our special sauce' },
      { id: 'm2', name: 'Cheese Burger', price: 299, description: 'Classic burger with American cheese' },
      { id: 'm3', name: 'Bacon Burger', price: 499, description: 'Classic burger with crispy bacon and cheese' },
      { id: 'm4', name: 'Veggie Burger', price: 399, description: 'Plant-based patty with all the fixings' },
    ]
  },
  {
    id: '2',
    name: 'Pizza Express',
    image: '/images/restaurants/pizza.jpg',
    cuisine: 'Italian',
    rating: 4.3,
    location: { lat: 28.6129, lng: 77.2295 }, // Central Delhi
    priceRange: '₹',
    description: 'Authentic Italian pizzas baked in a wood-fired oven. We use imported Italian ingredients for the perfect taste.',
    menu: [
      { id: 'm1', name: 'Margherita', price: 199, description: 'Tomato sauce, mozzarella, and basil' },
      { id: 'm2', name: 'Pepperoni', price: 295, description: 'Tomato sauce, mozzarella, and pepperoni' },
      { id: 'm3', name: 'Vegetarian', price: 119, description: 'Tomato sauce, mozzarella, and mixed vegetables' },
      { id: 'm4', name: 'Hawaiian', price: 129, description: 'Tomato sauce, mozzarella, ham, and pineapple' },
    ]
  },
  {
    id: '3',
    name: 'Sushi Master',
    image: '/images/restaurants/sushi.jpg',
    cuisine: 'Japanese',
    rating: 4.7,
    location: { lat: 28.6304, lng: 77.2177 }, // New Delhi
    priceRange: '₹',
    description: 'Premium sushi prepared by master chefs. We use only the freshest fish, delivered daily.',
    menu: [
      { id: 'm1', name: 'California Roll (6 pcs)', price: 799, description: 'Crab, avocado, cucumber, and tobiko' },
      { id: 'm2', name: 'Salmon Nigiri (2 pcs)', price: 599, description: 'Fresh salmon on rice' },
      { id: 'm3', name: 'Tuna Roll (6 pcs)', price: 899, description: 'Tuna, cucumber, and spicy mayo' },
      { id: 'm4', name: 'Veggie Roll (6 pcs)', price: 699, description: 'Avocado, cucumber, and carrot' },
    ]
  },
  {
    id: '4',
    name: 'Curry House',
    image: '/images/restaurants/curry.jpg',
    cuisine: 'Indian',
    rating: 4.4,
    location: { lat: 28.5355, lng: 77.2410 }, // South Delhi
    priceRange: '₹',
    description: 'Authentic Indian curries and dishes. Our chefs use traditional spices and cooking methods.',
    menu: [
      { id: 'm1', name: 'Chicken Tikka Masala', price: 499, description: 'Tender chicken in a rich, creamy tomato sauce' },
      { id: 'm2', name: 'Vegetable Biryani', price: 199, description: 'Fragrant basmati rice with mixed vegetables' },
      { id: 'm3', name: 'Lamb Rogan Josh', price: 149, description: 'Tender lamb in a spiced onion and tomato gravy' },
      { id: 'm4', name: 'Paneer Butter Masala', price: 119, description: 'Cottage cheese cubes in a creamy tomato sauce' },
    ]
  },
];

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Maximum delivery distance in kilometers
const MAX_DELIVERY_DISTANCE = 100;

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;

  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  useEffect(() => {
    // Get restaurant data
    const restaurantData = MOCK_RESTAURANTS.find(r => r.id === id);
    setRestaurant(restaurantData);
    
    // First check if there's a stored user location
    try {
      const storedLocation = localStorage.getItem('userSelectedLocation');
      if (storedLocation) {
        const parsedLocation = JSON.parse(storedLocation);
        setUserLocation(parsedLocation);
        return; // Exit early if we found a stored location
      }
    } catch (error) {
      console.error('Error retrieving stored location:', error);
    }
    
    // If no stored location, get user location from browser
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const userLoc = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          };
          setUserLocation(userLoc);
          // Store the browser location in localStorage
          localStorage.setItem('userSelectedLocation', JSON.stringify(userLoc));
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use a default location if user location is not available
          const defaultLocation = { lat: 28.6139, lng: 77.2090 };
          setUserLocation(defaultLocation);
          // Store the default location in localStorage
          localStorage.setItem('userSelectedLocation', JSON.stringify(defaultLocation));
        }
      );
    } else {
      // Use a default location if geolocation is not supported
      const defaultLocation = { lat: 28.6139, lng: 77.2090 };
      setUserLocation(defaultLocation);
      // Store the default location in localStorage
      localStorage.setItem('userSelectedLocation', JSON.stringify(defaultLocation));
    }
  }, [id]);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 rounded-full animate-spin flex-shrink-0" style={{ 
          border: '4px solid rgba(255, 107, 107, 0.1)',
          borderTopColor: '#FF6B6B'
        }}></div>
        <p className="ml-4 text-lg text-gray-600">Loading restaurant details...</p>
      </div>
    );
  }

  const distance = userLocation ? calculateDistance(userLocation, restaurant.location) : null;
  const deliveryTime = distance ? calculateDeliveryTime(distance) : null;
  const isServicable = distance ? distance <= MAX_DELIVERY_DISTANCE : false;

  const addToCart = (menuItem: any) => {
    const existingItem = cart.find(item => item.id === menuItem.id);
    
    if (existingItem) {
      const updatedCart = cart.map(item =>
        item.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
      // Save to localStorage
      saveCartToLocalStorage(updatedCart);
    } else {
      const updatedCart = [...cart, {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }];
      setCart(updatedCart);
      // Save to localStorage
      saveCartToLocalStorage(updatedCart);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existingItem = cart.find(item => item.id === itemId);
    
    if (existingItem && existingItem.quantity > 1) {
      const updatedCart = cart.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      setCart(updatedCart);
      // Save to localStorage
      saveCartToLocalStorage(updatedCart);
    } else {
      const updatedCart = cart.filter(item => item.id !== itemId);
      setCart(updatedCart);
      // Save to localStorage
      saveCartToLocalStorage(updatedCart);
    }
  };

  // Helper function to save cart to localStorage
  const saveCartToLocalStorage = (cartData: OrderItem[]) => {
    try {
      localStorage.setItem(`cart-${id}`, JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/restaurants" 
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors group"
          style={{ color: '#FF6B6B' }}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Restaurants</span>
        </Link>
        
        <div className="relative h-80 w-full mb-8 rounded-2xl overflow-hidden shadow-xl">
          <Image
            src={restaurant.image}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"
          />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{restaurant.name}</h1>
                <div className="flex items-center text-white/90 space-x-3">
                  <span>{restaurant.cuisine}</span>
                  <span>•</span>
                  <span>{restaurant.priceRange}</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                    <span>{restaurant.rating}</span>
                  </div>
                </div>
              </div>
              {!isServicable && (
                <div 
                  className="py-2 px-4 rounded-full text-white font-medium flex items-center bg-red-500/80 backdrop-blur-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Outside Delivery Zone
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div 
              className="p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-md mb-8"
              style={{ border: '1px solid rgba(0,0,0,0.05)' }}
            >
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                {restaurant.description}
              </p>
              
              {distance && deliveryTime && (
                <div className="mt-4 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(to right, rgba(78, 205, 196, 0.05), rgba(255, 107, 107, 0.05))' }}>
                  <div className="flex flex-wrap">
                    <div className="w-full sm:w-1/2 p-4 flex items-center border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
                        style={{ 
                          background: 'linear-gradient(to right, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.2))',
                          border: '1px solid rgba(78, 205, 196, 0.3)' 
                        }}
                      >
                        <MapPinIcon className="h-6 w-6" style={{ color: '#4ECDC4' }} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Distance</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{formatDistance(distance)} away</p>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-1/2 p-4 flex items-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
                        style={{ 
                          background: isServicable 
                            ? 'linear-gradient(to right, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.2))' 
                            : 'linear-gradient(to right, rgba(255, 107, 107, 0.1), rgba(255, 107, 107, 0.2))',
                          border: isServicable
                            ? '1px solid rgba(78, 205, 196, 0.3)'
                            : '1px solid rgba(255, 107, 107, 0.3)'
                        }}
                      >
                        <ClockIcon className="h-6 w-6" style={{ color: isServicable ? '#4ECDC4' : '#FF6B6B' }} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Time</p>
                        {isServicable ? (
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{formatDeliveryTime(deliveryTime)}</p>
                        ) : (
                          <p className="font-semibold" style={{ color: '#FF6B6B' }}>Unserviceable</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!isServicable && (
                    <div 
                      className="p-4 border-t border-gray-200 dark:border-gray-700"
                      style={{ background: 'linear-gradient(to right, rgba(255, 107, 107, 0.05), rgba(255, 107, 107, 0.1))' }}
                    >
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#FF6B6B' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p style={{ color: '#FF6B6B' }}>
                          This restaurant is outside our delivery zone ({formatDistance(distance)}). Please choose a restaurant within {MAX_DELIVERY_DISTANCE} km of your location or select a different delivery address.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center mb-6">
                <h2 className="text-2xl font-bold">Menu</h2>
                <div className="ml-3 h-px bg-gray-200 dark:bg-gray-700 flex-grow"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {restaurant && restaurant.menu && restaurant.menu.map((item: any) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center p-4 rounded-xl transition-all duration-200 hover:shadow-md"
                    style={{ 
                      background: 'white', 
                      border: '1px solid rgba(0,0,0,0.05)',
                    }}
                  >
                    <div className="flex-grow pr-4">
                      <h3 className="font-medium text-lg text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                      <p 
                        className="font-medium mt-2"
                        style={{ color: '#FF6B6B' }}
                      >
                        ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <button 
                      onClick={() => addToCart(item)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                        isServicable 
                          ? 'hover:shadow-md active:scale-95' 
                          : 'cursor-not-allowed'
                      }`}
                      style={{ 
                        background: isServicable 
                          ? 'linear-gradient(to right, #FF6B6B, #FF8E8E)' 
                          : '#E5E7EB',
                        color: isServicable ? 'white' : '#9CA3AF',
                      }}
                      disabled={!isServicable}
                    >
                      <ShoppingBagIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div 
              className="rounded-2xl overflow-hidden sticky top-8 shadow-lg"
              style={{ border: '1px solid rgba(0,0,0,0.05)' }}
            >
              <div 
                className="py-5 px-6 border-b border-gray-100 dark:border-gray-800"
                style={{ background: 'linear-gradient(to right, rgba(255, 107, 107, 0.05), rgba(255, 107, 107, 0.1))' }}
              >
                <h2 className="text-xl font-bold">Your Order</h2>
              </div>
              
              <div className="p-6 bg-white dark:bg-gray-800">
                {!isServicable && (
                  <div 
                    className="rounded-xl mb-6 overflow-hidden"
                    style={{ border: '1px solid rgba(255, 107, 107, 0.3)' }}
                  >
                    <div 
                      className="p-3 text-white font-medium"
                      style={{ background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)' }}
                    >
                      Delivery Unavailable
                    </div>
                    <div 
                      className="p-4 text-sm"
                      style={{ 
                        background: 'linear-gradient(to right, rgba(255, 107, 107, 0.05), rgba(255, 107, 107, 0.1))',
                        color: '#FF6B6B' 
                      }}
                    >
                      <p>This restaurant is too far from your location. Please choose a restaurant within {MAX_DELIVERY_DISTANCE} km of your location.</p>
                    </div>
                  </div>
                )}
                
                {cart.length === 0 ? (
                  <div className="py-12 text-center">
                    <div 
                      className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                      style={{ background: 'rgba(0,0,0,0.03)' }}
                    >
                      <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Your cart is empty. {isServicable ? 'Add items from the menu.' : 'Please select a different restaurant.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                            ₹{item.price.toFixed(2)} x {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div 
                      className="p-4 rounded-xl mb-6"
                      style={{ background: 'rgba(0,0,0,0.02)' }}
                    >
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total</span>
                        <span style={{ color: '#FF6B6B' }}>₹{calculateTotal()}</span>
                      </div>
                    </div>
                    
                    {orderPlaced ? (
                      <div 
                        className="p-4 rounded-xl text-center"
                        style={{ 
                          background: 'linear-gradient(to right, rgba(0, 184, 148, 0.1), rgba(0, 184, 148, 0.2))',
                          color: '#00B894',
                          border: '1px solid rgba(0, 184, 148, 0.3)' 
                        }}
                      >
                        <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium text-lg">Your order has been placed!</p>
                        <p className="text-sm mt-1 opacity-90">
                          Estimated delivery time: {deliveryTime ? formatDeliveryTime(deliveryTime) : 'Calculating...'}
                        </p>
                      </div>
                    ) : (
                      <Link
                        href={`/restaurants/${id}/order`}
                        className="block w-full py-3 rounded-xl font-medium text-white text-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                          background: isServicable ? 'linear-gradient(to right, #FF6B6B, #FF8E8E)' : '#ccc',
                          boxShadow: isServicable ? '0 4px 12px rgba(255, 107, 107, 0.25)' : 'none',
                          opacity: isServicable ? 1 : 0.5,
                          pointerEvents: isServicable ? 'auto' : 'none'
                        }}
                      >
                        <span className="flex items-center justify-center">
                          <ShoppingBagIcon className="h-5 w-5 mr-2" />
                          Proceed to Checkout
                        </span>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {cart.length > 0 && isServicable && (
          <div className="lg:hidden fixed bottom-8 left-1/2 transform -translate-x-1/2">
            <Link
              href={`/restaurants/${id}/order`}
              className="inline-block py-4 px-10 rounded-full text-white font-medium text-lg transition-all duration-200 flex items-center"
              style={{ 
                background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)',
                boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)'
              }}
            >
              <ShoppingBagIcon className="h-6 w-6 mr-2" />
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 