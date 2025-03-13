export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  location: {
    lat: number;
    lng: number;
  };
  priceRange: string;
}

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'Burger Palace',
    image: '/images/restaurants/burger.jpg',
    cuisine: 'American',
    rating: 4.5,
    location: { lat: 28.6139, lng: 77.2090 }, // Delhi
    priceRange: '$$',
  },
  {
    id: '2',
    name: 'Pizza Express',
    image: '/images/restaurants/pizza.jpg',
    cuisine: 'Italian',
    rating: 4.3,
    location: { lat: 28.6129, lng: 77.2295 }, // Central Delhi
    priceRange: '$$',
  },
  {
    id: '3',
    name: 'Sushi Master',
    image: '/images/restaurants/sushi.jpg',
    cuisine: 'Japanese',
    rating: 4.7,
    location: { lat: 28.6304, lng: 77.2177 }, // New Delhi
    priceRange: '$$$',
  },
  {
    id: '4',
    name: 'Curry House',
    image: '/images/restaurants/curry.jpg',
    cuisine: 'Indian',
    rating: 4.4,
    location: { lat: 28.5355, lng: 77.2410 }, // South Delhi
    priceRange: '$$',
  },
]; 