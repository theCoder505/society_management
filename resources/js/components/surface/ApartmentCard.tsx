import React from 'react';
import { Link } from '@inertiajs/react';

// Define the shape of an apartment object expected by this component.
export interface Apartment {
  id: number;
  title: string;
  description: string;
  rent: string;
  image: string;
}

/**
 * ApartmentCard – a simple presentational component that displays
 * an apartment's image, title, short description, rent price, and a
 * CTA button linking to a detail page (placeholder for now).
 */
export default function ApartmentCard({ apartment }: { apartment: Apartment }) {
  const { id, title, description, rent, image } = apartment;

  return (
    <div className="apartment-card rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 transition-colors duration-200">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {description}
        </p>
        <p className="text-base font-medium text-primary mb-3">{rent}</p>
        <Link
          href={`/apartments/${id}`}
          className="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
