import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Restaurants | Food Delivery',
  description: 'Find and order from restaurants near you',
};

export default function RestaurantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
} 