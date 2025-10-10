// File: src/pages/SelectionPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

function SelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-black text-white min-h-screen flex flex-col justify-center items-center px-4">
      <h1 className="text-4xl text-gold font-bold mb-10 text-center">
        What Are You Getting Rid Of?
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        {/* Load Size Option */}
        <div className="flex flex-col items-center text-center">
          <div
            onClick={() => navigate('/load-size')}
            className="item-card-button text-2xl flex items-center justify-center"
          >
            Load Size
          </div>
          <p className="text-sm text-gray-300 mt-3 max-w-xs">
            Choose <span className="text-gold font-semibold">‘Load Size’</span> for piles or large cleanouts.
          </p>
        </div>

        {/* Itemized Option */}
        <div className="flex flex-col items-center text-center">
          <div
            onClick={() => navigate('/itemized')}
            className="item-card-button text-2xl flex items-center justify-center"
          >
            Itemized
          </div>
          <p className="text-sm text-gray-300 mt-3 max-w-xs">
            Choose <span className="text-gold font-semibold">‘Itemized’</span> for specific furniture or appliances.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SelectionPage;
