import React from 'react';
import { Link } from 'react-router-dom';

const cities = [
  'Houston', 'Katy', 'Sugar Land', 'Pearland', 'Cypress', 'Spring',
  'Humble', 'Missouri City', 'Pasadena', 'The Woodlands', 'League City',
  'Baytown', 'Friendswood', 'Channelview', 'Richmond', 'Rosenberg',
  'Tomball', 'Alvin', 'Deer Park', 'La Porte'
];

const ServiceAreasPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-12">
      <h1 className="text-4xl text-gold font-bold text-center mb-10">Cities We Serve</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {cities.map((city) => (
          <div
            key={city}
            className="bg-gray-800 rounded-xl border border-gold p-6 shadow-lg hover:scale-105 transition-transform"
          >
            <h2 className="text-2xl font-semibold text-gold mb-2">
              Junk Removal in {city}
            </h2>
            <p className="text-gray-300 mb-4">
              Need junk removed in {city}? Junk Buddies offers fast, affordable, and reliable junk removal service in your area — no hidden fees, just honest work and upfront pricing.
            </p>
            <Link
              to={`/service-areas/${city.toLowerCase().replace(/ /g, '-')}`}
              className="text-gold font-semibold hover:underline"
            >
              Learn more about {city}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceAreasPage;
