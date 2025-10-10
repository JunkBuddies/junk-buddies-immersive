import React from 'react'; import { useNavigate } from 'react-router-dom'; import { FaFacebookSquare, FaInstagram, FaTiktok } from 'react-icons/fa'; import { useCart } from '../context/CartContext'; import { calculatePrice } from '../utils/pricing';

function ConfirmationPage() { const navigate = useNavigate(); const { cart } = useCart(); const { finalPrice: total, totalVolume: volume } = calculatePrice(cart);

const maxVolume = 450; const fillPercent = Math.min((volume / maxVolume) * 100, 100); const tierLabel = volume <= 112.5 ? '1/4 Load' : volume <= 225   ? '1/2 Load' : volume <= 337.5 ? '3/4 Load' : 'Full Load';

return ( <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center px-4 text-center"> <h1 className="text-4xl text-gold font-bold mb-4">Thank You!</h1> <p className="text-lg max-w-md mb-4"> Your junk removal booking has been confirmed. A confirmation email has been sent to your inbox. </p>

<div className="w-full max-w-sm bg-gray-900 p-4 rounded-xl mb-6">
    <p className="text-gold text-lg font-semibold">Order Summary</p>
    <p>Items: {cart.length}</p>
    <p>Total: ${total.toFixed(2)}</p>
    <p>Volume: {volume.toFixed(1)} pts</p>
    <p>Load Tier: {tierLabel}</p>
    <div className="w-full bg-gray-700 h-4 rounded overflow-hidden mt-2">
      <div
        className="bg-gold h-4 transition-all"
        style={{ width: `${fillPercent}%` }}
      />
    </div>
    <p className="text-yellow-400 text-xs mt-1">
      Truck is {Math.round(fillPercent)}% full
    </p>
  </div>

  {/* Social Media Icons */}
  <div className="flex gap-6 mb-8">
    <a
      href="https://facebook.com/JunkBuddies.info"
      target="_blank"
      rel="noopener noreferrer"
      className="button-glow-always rounded-full p-3 transition"
    >
      <FaFacebookSquare size={32} />
    </a>
    <a
      href="https://instagram.com/JunkBuddies.info"
      target="_blank"
      rel="noopener noreferrer"
      className="button-glow-always rounded-full p-3 transition"
    >
      <FaInstagram size={32} />
    </a>
    <a
      href="https://tiktok.com/@JunkBuddies.info"
      target="_blank"
      rel="noopener noreferrer"
      className="button-glow-always rounded-full p-3 transition"
    >
      <FaTiktok size={32} />
    </a>
  </div>

  <button
    className="button-glow w-full max-w-xs"
    onClick={() => navigate('/')}
  >
    Back to Home
  </button>
</div>

); }

export default ConfirmationPage;

