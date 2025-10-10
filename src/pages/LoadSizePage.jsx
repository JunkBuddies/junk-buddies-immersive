// File: src/pages/LoadSizePage.jsx

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { calculatePrice } from '../utils/pricing';

const loadSizes = [
  { name: 'Full Load', price: 1000 },
  { name: '3/4 Load', price: 750 },
  { name: '1/2 Load', price: 500 },
  { name: '1/4 Load', price: 250 },
];
 
function LoadSizePage() {
  const { cart, setCart } = useCart();
  const navigate = useNavigate();
  const { finalPrice } = calculatePrice(cart);

  const addToCart = (item) => {
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  return (
    <div className="bg-black text-white min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-4xl text-gold font-bold mb-6 text-center">Select Your Load Size</h1>

      {/* Infographic Image */}
      <div className="w-full flex justify-center mt-4 mb-10">
        <img
          src="/images/load-size-truck-visual.png"
          alt="Box Truck to Pickup Load Comparison"
          className="max-w-5xl w-full rounded-xl shadow-lg border border-gold"
        />
      </div>

      {/* Load Size Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {loadSizes.map((load, idx) => (
          <button
            key={idx}
            className="item-card-button text-center"
            onClick={() => addToCart(load)}
          >
            <div className="item-card-button-text text-xl font-bold mb-2">{load.name}</div>
            <div className="item-card-button-text text-lg">${load.price.toFixed(2)}</div>
          </button>
        ))}
      </div>
<p className="text-sm text-gray-400 mt-4">
  Want to see how your load size compares?{' '}
  <Link to="/blog/how-much-does-junk-removal-cost" className="text-gold underline hover:text-white">
    See full pricing breakdown
  </Link>.
</p>
      {/* Cart Summary */}
      <div className="mt-10 w-full max-w-3xl border-t border-gold pt-6 flex flex-col items-center">
        <p className="text-lg mb-4 font-bold">Total: ${finalPrice.toFixed(2)}</p>
        <ul className="mb-4 w-full max-w-md">
          {cart.map((item, idx) => (
            <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-700 py-2">
              {item.name} - ${item.price.toFixed(2)}
              <button
                onClick={() => removeFromCart(idx)}
                className="text-red-500 text-xs ml-2 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-4 flex-col md:flex-row">
          <button
            className="button-glow"
            onClick={() => navigate('/itemized')}
          >
            Add Itemized Items
          </button>
          <button
            disabled={cart.length === 0}
            className="button-glow disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => navigate('/schedule')}
          >
            Schedule Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoadSizePage;
