'use client';

import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { formatDistance, formatDeliveryTime } from '../utils/location';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon, 
  TruckIcon, 
  ClockIcon,
  MapPinIcon, 
  ChevronLeftIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface CheckoutProps {
  restaurant?: any;
  cartItems?: any[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  cityName?: string;
  onComplete: () => void;
}

export default function Checkout({ restaurant, cartItems, subtotal, deliveryFee, tax, cityName, onComplete }: CheckoutProps) {
  const [step, setStep] = useState<'delivery' | 'payment'>('delivery');
  
  const deliveryFormik = useFormik({
    initialValues: {
      address: '',
      city: cityName || '',
      zipCode: '',
      instructions: ''
    },
    validationSchema: Yup.object({
      address: Yup.string().required('Address is required'),
      city: Yup.string().required('City is required'),
      zipCode: Yup.string().required('ZIP code is required')
    }),
    onSubmit: () => {
      setStep('payment');
    }
  });
  
  const paymentFormik = useFormik({
    initialValues: {
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    },
    validationSchema: Yup.object({
      cardName: Yup.string().required('Name on card is required'),
      cardNumber: Yup.string()
        .required('Card number is required')
        .matches(/^\d{16}$/, 'Card number must be 16 digits'),
      expiryDate: Yup.string()
        .required('Expiry date is required')
        .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format'),
      cvv: Yup.string()
        .required('CVV is required')
        .matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits')
    }),
    onSubmit: () => {
      // Save delivery details to localStorage before completing order
      try {
        const deliveryDetails = {
          address: deliveryFormik.values.address,
          city: deliveryFormik.values.city,
          zipCode: deliveryFormik.values.zipCode,
          instructions: deliveryFormik.values.instructions
        };
        localStorage.setItem('deliveryDetails', JSON.stringify(deliveryDetails));
      } catch (error) {
        console.error('Error saving delivery details to localStorage:', error);
      }
      
      onComplete();
    }
  });

  const inputClasses = "w-full px-4 py-3 rounded-xl border bg-white/50 shadow-sm focus:outline-none transition-all duration-200 dark:bg-gray-800/50";
  const labelClasses = "block text-sm font-medium mb-1.5";
  
  return (
    <div>
      {/* Order Summary */}
      <div 
        className="p-5 rounded-xl mb-6"
        style={{ background: 'rgba(0,0,0,0.02)' }}
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
            <span>Delivery Fee</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">₹{deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
            <span>Taxes</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center font-semibold border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            <span>Total</span>
            <span 
              className="text-xl"
              style={{ color: '#FF6B6B' }}
            >
              ₹{(subtotal + deliveryFee + tax).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Delivery Info */}
      {restaurant && restaurant.distance && restaurant.deliveryTime && (
        <div 
          className="p-5 rounded-xl mb-6"
          style={{ background: 'linear-gradient(to right, rgba(78, 205, 196, 0.05), rgba(78, 205, 196, 0.1))' }}
        >
          <div className="flex items-start mb-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5"
              style={{ 
                background: 'rgba(78, 205, 196, 0.2)',
                border: '1px solid rgba(78, 205, 196, 0.3)' 
              }}
            >
              <MapPinIcon className="h-4 w-4" style={{ color: '#4ECDC4' }} />
            </div>
            <div>
              <div className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Delivery Distance
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Restaurant is {formatDistance(restaurant.distance)} away from your location
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5"
              style={{ 
                background: 'rgba(78, 205, 196, 0.2)',
                border: '1px solid rgba(78, 205, 196, 0.3)' 
              }}
            >
              <ClockIcon className="h-4 w-4" style={{ color: '#4ECDC4' }} />
            </div>
            <div>
              <div className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Estimated Delivery Time
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Your order will arrive in approximately {formatDeliveryTime(restaurant.deliveryTime)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Steps Indicator */}
      <div className="flex mb-6">
        <div 
          className={`flex-1 h-1 rounded-l-full transition-colors ${
            step === 'delivery' ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E]' : 'bg-gray-200 dark:bg-gray-700'
          }`} 
        />
        <div 
          className={`flex-1 h-1 rounded-r-full transition-colors ${
            step === 'payment' ? 'bg-gradient-to-r from-[#FF8E8E] to-[#FF6B6B]' : 'bg-gray-200 dark:bg-gray-700'
          }`} 
        />
      </div>
      
      {/* Step Title */}
      <div className="mb-6">
        {step === 'delivery' ? (
          <div className="flex items-center">
            <TruckIcon 
              className="w-6 h-6 mr-2" 
              style={{ color: '#FF6B6B' }} 
            />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Delivery Details
            </h3>
          </div>
        ) : (
          <div className="flex items-center">
            <button 
              onClick={() => setStep('delivery')} 
              className="flex items-center mr-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <CreditCardIcon 
              className="w-6 h-6 mr-2" 
              style={{ color: '#FF6B6B' }} 
            />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Payment Information
            </h3>
          </div>
        )}
      </div>
      
      {/* Delivery Form */}
      <motion.div
        initial={false}
        animate={{ x: step === 'delivery' ? 0 : -20, opacity: step === 'delivery' ? 1 : 0 }}
        className={step === 'delivery' ? 'block' : 'hidden'}
      >
        <form onSubmit={deliveryFormik.handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="address" className={labelClasses}>
              Delivery Address
            </label>
            <input
              id="address"
              type="text"
              placeholder="Enter your full address"
              className={`${inputClasses} ${
                deliveryFormik.touched.address && deliveryFormik.errors.address 
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                  : 'border-gray-200 focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20'
              }`}
              {...deliveryFormik.getFieldProps('address')}
            />
            {deliveryFormik.touched.address && deliveryFormik.errors.address ? (
              <div className="text-red-500 text-sm mt-1.5 ml-1">{deliveryFormik.errors.address}</div>
            ) : null}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className={labelClasses}>
                City
              </label>
              <input
                id="city"
                type="text"
                placeholder="City"
                className={`${inputClasses} ${
                  deliveryFormik.touched.city && deliveryFormik.errors.city 
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20'
                }`}
                {...deliveryFormik.getFieldProps('city')}
              />
              {deliveryFormik.touched.city && deliveryFormik.errors.city ? (
                <div className="text-red-500 text-sm mt-1.5 ml-1">{deliveryFormik.errors.city}</div>
              ) : null}
            </div>
            
            <div>
              <label htmlFor="zipCode" className={labelClasses}>
                ZIP Code
              </label>
              <input
                id="zipCode"
                type="text"
                placeholder="ZIP / Postal Code"
                className={`${inputClasses} ${
                  deliveryFormik.touched.zipCode && deliveryFormik.errors.zipCode 
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20'
                }`}
                {...deliveryFormik.getFieldProps('zipCode')}
              />
              {deliveryFormik.touched.zipCode && deliveryFormik.errors.zipCode ? (
                <div className="text-red-500 text-sm mt-1.5 ml-1">{deliveryFormik.errors.zipCode}</div>
              ) : null}
            </div>
          </div>
          
          <div>
            <label htmlFor="instructions" className={labelClasses}>
              Delivery Instructions (Optional)
            </label>
            <textarea
              id="instructions"
              rows={3}
              placeholder="Any specific instructions for delivery (gate codes, landmarks, etc.)"
              className={`${inputClasses} border-gray-200 focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20`}
              {...deliveryFormik.getFieldProps('instructions')}
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)',
              boxShadow: '0 4px 12px rgba(255, 107, 107, 0.25)'
            }}
          >
            <TruckIcon className="w-5 h-5 mr-2" />
            Continue to Payment
          </button>
        </form>
      </motion.div>
      
      {/* Payment Form */}
      <motion.div
        initial={false}
        animate={{ x: step === 'payment' ? 0 : 20, opacity: step === 'payment' ? 1 : 0 }}
        className={step === 'payment' ? 'block' : 'hidden'}
      >
        <form onSubmit={paymentFormik.handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="cardName" className={labelClasses}>
              Name on Card
            </label>
            <input
              id="cardName"
              type="text"
              placeholder="Full name as displayed on card"
              className={`${inputClasses} ${
                paymentFormik.touched.cardName && paymentFormik.errors.cardName 
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                  : 'border-gray-200 focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20'
              }`}
              {...paymentFormik.getFieldProps('cardName')}
            />
            {paymentFormik.touched.cardName && paymentFormik.errors.cardName ? (
              <div className="text-red-500 text-sm mt-1.5 ml-1">{paymentFormik.errors.cardName}</div>
            ) : null}
          </div>
          
          <div>
            <label htmlFor="cardNumber" className={labelClasses}>
              Card Number
            </label>
            <div className="relative">
              <input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                className={`${inputClasses} ${
                  paymentFormik.touched.cardNumber && paymentFormik.errors.cardNumber 
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20'
                }`}
                {...paymentFormik.getFieldProps('cardNumber')}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <div className="w-7 h-5 rounded bg-gray-600 dark:bg-gray-700"></div>
                <div className="w-7 h-5 rounded bg-blue-600"></div>
              </div>
            </div>
            {paymentFormik.touched.cardNumber && paymentFormik.errors.cardNumber ? (
              <div className="text-red-500 text-sm mt-1.5 ml-1">{paymentFormik.errors.cardNumber}</div>
            ) : null}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryDate" className={labelClasses}>
                Expiry Date
              </label>
              <input
                id="expiryDate"
                type="text"
                placeholder="MM/YY"
                className={`${inputClasses} ${
                  paymentFormik.touched.expiryDate && paymentFormik.errors.expiryDate 
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20'
                }`}
                {...paymentFormik.getFieldProps('expiryDate')}
              />
              {paymentFormik.touched.expiryDate && paymentFormik.errors.expiryDate ? (
                <div className="text-red-500 text-sm mt-1.5 ml-1">{paymentFormik.errors.expiryDate}</div>
              ) : null}
            </div>
            
            <div>
              <label htmlFor="cvv" className={labelClasses}>
                CVV
              </label>
              <input
                id="cvv"
                type="text"
                placeholder="123"
                className={`${inputClasses} ${
                  paymentFormik.touched.cvv && paymentFormik.errors.cvv 
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20'
                }`}
                {...paymentFormik.getFieldProps('cvv')}
              />
              {paymentFormik.touched.cvv && paymentFormik.errors.cvv ? (
                <div className="text-red-500 text-sm mt-1.5 ml-1">{paymentFormik.errors.cvv}</div>
              ) : null}
            </div>
          </div>
          
          <div 
            className="p-4 rounded-xl flex items-start text-sm"
            style={{ 
              background: 'rgba(78, 205, 196, 0.05)', 
              border: '1px solid rgba(78, 205, 196, 0.2)'
            }}
          >
            <ShieldCheckIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" style={{ color: '#4ECDC4' }} />
            <div className="text-gray-700 dark:text-gray-300">
              Your payment information is securely processed. We do not store your card details. For testing, you can use (any dummy data): Card number: 4242424242424242, Expiry: Any future date, CVV: Any 3 digits.
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)',
              boxShadow: '0 4px 12px rgba(255, 107, 107, 0.25)'
            }}
          >
            Place Your Order
          </button>
        </form>
      </motion.div>
    </div>
  );
} 