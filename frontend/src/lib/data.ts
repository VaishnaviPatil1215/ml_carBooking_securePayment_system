import type { Car } from './types';

export const cars: Car[] = [
  {
    id: 'car_1',
    name: 'City Cruiser',
    type: 'Sedan',
    seats: 5,
    transmission: 'Automatic',
    pricePerKm: 0.5,
    imageId: 'sedan',
  },
  {
    id: 'car_2',
    name: 'Trail Explorer',
    type: 'SUV',
    seats: 7,
    transmission: 'Automatic',
    pricePerKm: 0.7,
    imageId: 'suv',
  },
  {
    id: 'car_3',
    name: 'Executive Ride',
    type: 'Luxury',
    seats: 4,
    transmission: 'Automatic',
    pricePerKm: 1.2,
    imageId: 'luxury',
  },
  {
    id: 'car_4',
    name: 'Group Voyager',
    type: 'Van',
    seats: 8,
    transmission: 'Manual',
    pricePerKm: 0.9,
    imageId: 'van',
  },
  {
    id: 'car_5',
    name: 'Eco Mover',
    type: 'Compact',
    seats: 4,
    transmission: 'Automatic',
    pricePerKm: 0.4,
    imageId: 'compact',
  },
];
