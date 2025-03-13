'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';

interface RestaurantCardProps {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  location: {
    lat: number;
    lng: number;
  };
}

export default function RestaurantCard({
  id,
  name,
  image,
  cuisine,
  rating,
  priceRange,
  location,
}: RestaurantCardProps) {
  return (
    <Link href={`/restaurants/${id}`} className="block">
      <div className="card card-hover group">
        <div className="relative h-48 w-full overflow-hidden rounded-xl">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white">{name}</h3>
            <p className="text-sm text-white/90">{cuisine}</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span className="font-medium">{rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{priceRange}</span>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
          <span className="text-primary">View Details →</span>
        </div>
      </div>
    </Link>
  );
} 