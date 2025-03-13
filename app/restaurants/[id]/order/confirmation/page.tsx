'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { CheckCircleIcon, MapPinIcon, ClockIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { Coordinates, calculateDistance, calculateDeliveryTime, formatDistance, formatDeliveryTime } from '../../../../utils/location';
import { MOCK_RESTAURANTS } from '../../../../data/restaurants';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderData {
  orderNumber: number;
  restaurant: any;
  orderDate: Date;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: string;
  deliveryAddress: string;
  city: string;
  zipCode: string;
}

export default function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<number | null>(null);
  
  useEffect(() => {
    // Try to get order data from localStorage
    const getOrderData = () => {
      try {
        // First check for saved order data from the order page
        const savedOrderData = localStorage.getItem(`orderData-${id}`);
        if (savedOrderData) {
          console.log('Found saved order data:', savedOrderData);
          const parsedOrderData = JSON.parse(savedOrderData);
          
          // Get delivery details from localStorage
          const deliveryDetails = localStorage.getItem('deliveryDetails');
          const parsedDeliveryDetails = deliveryDetails ? JSON.parse(deliveryDetails) : null;
          
          // Create complete order data
          const order: OrderData = {
            orderNumber: parsedOrderData.orderNumber || Math.floor(10000 + Math.random() * 90000),
            restaurant: parsedOrderData.restaurant,
            orderDate: new Date(parsedOrderData.orderDate) || new Date(),
            items: parsedOrderData.items || [],
            subtotal: parsedOrderData.subtotal || 0,
            deliveryFee: parsedOrderData.deliveryFee || 30,
            tax: parsedOrderData.tax || 0,
            total: parsedOrderData.total || 0,
            paymentMethod: parsedOrderData.paymentMethod || 'Credit Card',
            deliveryAddress: parsedDeliveryDetails?.address || '123 Main St',
            city: parsedDeliveryDetails?.city || 'Delhi',
            zipCode: parsedDeliveryDetails?.zipCode || '110001'
          };
          
          // Save complete order to localStorage for reference
          localStorage.setItem('lastOrder', JSON.stringify(order));
          
          return order;
        }
        
        // Fall back to the old method if no saved order data is found
        // Find restaurant info
        const restaurant = MOCK_RESTAURANTS.find(r => r.id === id);
        
        // Get delivery details from localStorage
        const deliveryDetails = localStorage.getItem('deliveryDetails');
        const parsedDeliveryDetails = deliveryDetails ? JSON.parse(deliveryDetails) : null;
        
        // Get cart items with better error handling
        let cartItems = [];
        try {
          const storedCart = localStorage.getItem(`cart-${id}`);
          if (storedCart) {
            cartItems = JSON.parse(storedCart);
            console.log('Retrieved cart items:', cartItems);
          } else {
            console.log('No cart items found in localStorage');
          }
        } catch (error) {
          console.error('Error parsing cart items:', error);
        }
        
        // Calculate financials with explicit type conversion
        const subtotal = cartItems && cartItems.length > 0 
          ? cartItems.reduce((sum: number, item: OrderItem) => {
              // Ensure price and quantity are treated as numbers
              const itemPrice = Number(item.price);
              const itemQuantity = Number(item.quantity);
              console.log(`Item: ${item.name}, Price: ${itemPrice}, Quantity: ${itemQuantity}`);
              return sum + (itemPrice * itemQuantity);
            }, 0)
          : 0;
        
        console.log('Calculated subtotal:', subtotal);
        
        // Get stored location for distance calculation
        const storedLocation = localStorage.getItem('userSelectedLocation');
        const userLoc = storedLocation ? JSON.parse(storedLocation) : null;
        
        if (restaurant && userLoc) {
          const dist = calculateDistance(
            { lat: userLoc.lat, lng: userLoc.lng },
            restaurant.location
          );
          
          // Calculate delivery fee based on distance
          const deliveryFee = Math.max(30, dist * 5);
          const tax = subtotal * 0.05;
          
          console.log('Financials:', { subtotal, deliveryFee, tax, total: subtotal + deliveryFee + tax });
          
          // Generate a random order number
          const orderNumber = Math.floor(10000 + Math.random() * 90000);
          
          // Create order data object
          const order: OrderData = {
            orderNumber,
            restaurant,
            orderDate: new Date(),
            items: cartItems,
            subtotal,
            deliveryFee,
            tax,
            total: subtotal + deliveryFee + tax,
            paymentMethod: 'Credit Card',
            deliveryAddress: parsedDeliveryDetails?.address || '123 Main St',
            city: parsedDeliveryDetails?.city || 'Delhi',
            zipCode: parsedDeliveryDetails?.zipCode || '110001'
          };
          
          // Save order to localStorage for reference
          localStorage.setItem('lastOrder', JSON.stringify(order));
          
          return order;
        }
        
        return null;
      } catch (error) {
        console.error('Error generating order data:', error);
        return null;
      }
    };
    
    // Try to get existing order data first
    const existingOrderData = localStorage.getItem('lastOrder');
    if (existingOrderData) {
      try {
        const parsedOrder = JSON.parse(existingOrderData);
        // Make sure the order is for the current restaurant
        if (parsedOrder.restaurant.id === id) {
          
          setOrderData(parsedOrder);
        } else {
          // Generate new order data if restaurant IDs don't match
          setOrderData(getOrderData());
        }
      } catch (error) {
        console.error('Error parsing order data:', error);
        setOrderData(getOrderData());
      }
    } else {
      // Generate new order data if none exists
      setOrderData(getOrderData());
    }
    
    // Get user location from localStorage or browser
    try {
      const storedLocation = localStorage.getItem('userSelectedLocation');
      if (storedLocation) {
        const parsedLocation = JSON.parse(storedLocation);
        setUserLocation(parsedLocation);
        return;
      }
    } catch (error) {
      console.error('Error retrieving stored location:', error);
    }
    
    // Get user location from browser if not in localStorage
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
          // Use a default location in Delhi
          const defaultLocation = { lat: 28.6139, lng: 77.2090 };
          setUserLocation(defaultLocation);
          localStorage.setItem('userSelectedLocation', JSON.stringify(defaultLocation));
        }
      );
    } else {
      // Use a default location in Delhi
      const defaultLocation = { lat: 28.6139, lng: 77.2090 };
      setUserLocation(defaultLocation);
      localStorage.setItem('userSelectedLocation', JSON.stringify(defaultLocation));
    }
  }, [id]);
  
  useEffect(() => {
    // Calculate distance and delivery time when both user location and restaurant are available
    if (userLocation && orderData && orderData.restaurant) {
      const distanceValue = calculateDistance(userLocation, orderData.restaurant.location);
      setDistance(distanceValue);
      setDeliveryTime(calculateDeliveryTime(distanceValue));
    }
  }, [userLocation, orderData]);
  
  if (!orderData) {
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
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden mb-8" style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="p-6" style={{ background: 'linear-gradient(to right, rgba(78, 205, 196, 0.05), rgba(78, 205, 196, 0.1))' }}>
              <div className="flex items-center justify-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
                  style={{ 
                    background: 'linear-gradient(to right, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.2))',
                    border: '1px solid rgba(78, 205, 196, 0.3)' 
                  }}
                >
                  <CheckCircleIcon className="h-8 w-8" style={{ color: '#4ECDC4' }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: '#4ECDC4' }}>Your Order is Confirmed!</h1>
                  <p className="text-gray-700 dark:text-gray-300">
                    Order #{orderData.orderNumber} has been placed successfully
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                  <Image
                    src={orderData.restaurant.image}
                    alt={orderData.restaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-medium text-lg">{orderData.restaurant.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {orderData.restaurant.cuisine} • {orderData.restaurant.priceRange}
                  </p>
                </div>
              </div>
              
              {distance && deliveryTime && (
                <div className="rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(0,0,0,0.02)' }}>
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                        style={{ 
                          background: 'linear-gradient(to right, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.2))',
                          border: '1px solid rgba(78, 205, 196, 0.3)' 
                        }}
                      >
                        <MapPinIcon className="h-5 w-5" style={{ color: '#4ECDC4' }} />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Restaurant is {formatDistance(distance)} away</span>
                    </div>
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                        style={{ 
                          background: 'linear-gradient(to right, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.2))',
                          border: '1px solid rgba(78, 205, 196, 0.3)' 
                        }}
                      >
                        <ClockIcon className="h-5 w-5" style={{ color: '#4ECDC4' }} />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        It will take {formatDeliveryTime(deliveryTime)} to deliver your order
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-3">Order Details</h3>
                <div className="space-y-3 mb-4">
                  {orderData.items.map((item: OrderItem) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium" style={{ color: '#FF6B6B' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{orderData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery Fee</span>
                    <span>₹{orderData.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax</span>
                    <span>₹{orderData.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span style={{ color: '#FF6B6B' }}>₹{orderData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl mb-6" style={{ background: 'rgba(0,0,0,0.02)' }}>
                <h3 className="font-medium text-lg mb-2">Delivery Information</h3>
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Address:</span> {orderData.deliveryAddress}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">City:</span> {orderData.city}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">ZIP Code:</span> {orderData.zipCode}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Estimated Delivery:</span> {deliveryTime ? formatDeliveryTime(deliveryTime) : 'Calculating...'}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Payment Method:</span> {orderData.paymentMethod}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-center">
                <Link 
                  href="/restaurants"
                  className="px-6 py-3 rounded-xl font-medium text-white flex items-center transition-all duration-200"
                  style={{ 
                    background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)',
                    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.25)'
                  }}
                >
                  <ShoppingBagIcon className="h-5 w-5 mr-2" />
                  Order From More Restaurants
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 