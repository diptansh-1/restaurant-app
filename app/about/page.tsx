'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors group"
          style={{ color: '#FF6B6B' }}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </Link>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">About Us</h1>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Founded in 2024, we're on a mission to revolutionize food delivery in India. 
                We connect hungry customers with the best local restaurants, making it easier 
                than ever to enjoy delicious meals from the comfort of your home.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-300">
                We believe everyone deserves access to great food. Our platform helps 
                restaurants reach more customers while providing a seamless ordering 
                experience for food lovers everywhere.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Quality: We partner with the best restaurants to ensure exceptional food
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Convenience: Making food ordering simple and hassle-free
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Innovation: Constantly improving our platform and services
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Community: Supporting local restaurants and food culture
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Join Our Team</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We're always looking for talented individuals to join our team. 
                If you're passionate about food and technology, we'd love to hear from you.
              </p>
              <Link 
                href="/contact" 
                className="inline-block px-6 py-3 rounded-xl text-white font-medium transition-all duration-200"
                style={{ 
                  background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)',
                  boxShadow: '0 4px 12px rgba(255, 107, 107, 0.25)'
                }}
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 