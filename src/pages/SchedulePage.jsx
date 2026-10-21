import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import emailjs from 'emailjs-com';
import { useCart } from '../context/CartContext';
import { calculatePrice } from '../utils/pricing';
import { FaChevronDown } from 'react-icons/fa';
import { db } from '../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const generatePresetDates = () => {
  const presets = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : i === 2 ? 'Day After' : date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateFormatted = date.toLocaleDateString('en-US', {
      weekday: i < 3 ? 'long' : undefined,
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
    const isoDate = date.toISOString().split('T')[0];
    presets.push({ label, dateFormatted, value: isoDate });
  }
  return presets;
};

const presetDates = generatePresetDates();

function SchedulePage() {
  const { cart, setCart } = useCart();
  const { finalPrice } = calculatePrice(cart);

  const cartSummary = Object.values(
    cart.reduce((groups, item, index) => {
      const key = item.name || `Item-${index}`;
      const qty = Math.max(1, Number(item.qty || 1));

      if (!groups[key]) {
        groups[key] = {
          key,
          name: item.name || "Item",
          qty: 0,
          price: 0,
          indexes: [],
        };
      }

      groups[key].qty += qty;
      groups[key].price += Number(item.price || 0);
      groups[key].indexes.push(index);
      return groups;
    }, {})
  );

  const removeCartItem = (summaryItem) => {
    const indexes = new Set(summaryItem.indexes);
    setCart((prev) => prev.filter((_, index) => !indexes.has(index)));
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
city: '',
state: '',
zip: '',
    date: '',
    time: '',
    customDateFormatted: ''
  });

  const navigate = useNavigate();

  const resumeMirrorToAddMore = () => {
    let sessionId = localStorage.getItem("jb_chat_session");
    if (!sessionId) {
      sessionId = "sess_" + Math.random().toString(36).slice(2);
      localStorage.setItem("jb_chat_session", sessionId);
    }

    localStorage.setItem("jb_mirror_resume_" + sessionId, "more");
    navigate("/");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (name === 'date' && !presetDates.some(d => d.value === value)) {
      const [year, month, day] = value.split('-');
      const d = new Date(+year, month - 1, +day);
      const formatted = d.toLocaleDateString('en-US', {
        weekday: 'long', month: '2-digit', day: '2-digit', year: 'numeric'
      });
      updated.customDateFormatted = formatted;
    }

    setFormData(updated);
  };
const GEOCODING_API_KEY = 'AIzaSyATgzi3inC_jld8GBJqG9zB8Dusx9qSOkY';
const handleSubmit = async (e) => {
  e.preventDefault();

  const orderNumber = `JB-${Math.floor(100000 + Math.random() * 900000)}`;

  const itemsTextList = cartSummary
    .map((item) => `${item.name} ×${item.qty}: ${item.price.toFixed(2)}`)
    .join('\n');
  const itemsHtmlList = `<ul>${cartSummary
    .map((item) => `<li><strong>${item.name} ×${item.qty}</strong>: ${item.price.toFixed(2)}</li>`)
    .join('')}</ul>`;

  const templateParams = {
    ...formData,
    orderNumber,
    itemsHtml: itemsHtmlList,
    itemsText: itemsTextList,
    customerEmail: formData.email,
    total: `$${finalPrice.toFixed(2)}`
  };

  try {
    // 1. Call Geocoding API to get latitude and longitude
    const fullAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`;

const geocodeResponse = await axios.get(
  `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GEOCODING_API_KEY}`
);


    const location = geocodeResponse.data.results[0]?.geometry?.location;
    if (!location) {
      throw new Error('Unable to find location for the given address.');
    }

    const { lat, lng } = location;

    // 2. Write the job data to Firestore with real coordinates
    // 👇 Add this just before saving to Firestore
let timeOfDay = '';
if (formData.time === '7:00 AM – 12:00 PM') timeOfDay = 'Morning';
else if (formData.time === '12:00 PM – 5:00 PM') timeOfDay = 'Afternoon';
else if (formData.time === '5:00 PM – 9:00 PM') timeOfDay = 'Evening';
    await addDoc(collection(db, 'jobs'), {
  ...formData,
  timeOfDay,
  orderNumber,
  items: cart,
  total: finalPrice,
  fullAddress: `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`,
  street: formData.street,
  city: formData.city,
  state: formData.state,
  zip: formData.zip,
  Latitude: lat,
  Longitude: lng,
  createdAt: Timestamp.now()
});


    // 3. Send Email to Customer
    await emailjs.send(
      'JunkBuddies.info',
      'Junk_Buddies_Booking',
      { ...templateParams, items: templateParams.itemsHtml },
      'QCl4Akw_LZ3T8IvUd'
    );

    // 4. Send Email to Admin
    await emailjs.send(
      'JunkBuddies.info',
      'template_57eij3s',
      { ...templateParams, items: templateParams.itemsText, email: templateParams.customerEmail },
      'QCl4Akw_LZ3T8IvUd'
    );

    navigate('/confirmation');
  } catch (error) {
    alert('Error submitting booking: ' + error.message);
  }
};


  return (
    <div className="bg-black text-white min-h-screen p-6">
      <h1 className="text-3xl text-gold font-bold mb-6 text-center">Book Junk Pickup - Pay nothing now</h1>
      <div className="mt-4 mb-6 flex justify-center">
        <div className="compare-badge-silver">No Upfront Payment Required</div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
        <input className="w-full p-3 rounded-xl text-black" type="text" name="name" placeholder="Your Name" required onChange={handleChange} />
        <input className="w-full p-3 rounded-xl text-black" type="email" name="email" placeholder="Your Email" required onChange={handleChange} />
        <input className="w-full p-3 rounded-xl text-black" type="tel" name="phone" placeholder="Your Phone Number" required onChange={handleChange} />
        <div className="flex flex-wrap gap-4">
  <input
    type="text"
    name="street"
    placeholder="Street"
    required
    onChange={handleChange}
    className="flex-1 min-w-[150px] p-3 rounded-xl text-black"
  />
  <input
    type="text"
    name="city"
    placeholder="City"
    required
    onChange={handleChange}
    className="w-[140px] p-3 rounded-xl text-black"
  />
  <select
    name="state"
    required
    onChange={handleChange}
    className="w-[100px] p-3 rounded-xl text-black"
  >
    <option value="">State</option>
    <option value="TX">TX</option>
  </select>
  <input
    type="text"
    name="zip"
    placeholder="ZIP"
    required
    onChange={handleChange}
    className="w-[100px] p-3 rounded-xl text-black"
  />
</div>


        <div className="space-y-3">
          <label className="block font-semibold">Select Date:</label>
          <div className="grid grid-cols-3 gap-4">
            {presetDates.map(({ label, dateFormatted, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, date: value, customDateFormatted: '' })}
                className={`silver-button ${formData.date === value ? 'silver-button-active' : ''} h-[72px] w-full flex flex-col justify-center items-center text-center`}
              >
                <div className="text-base font-bold leading-snug">{label}</div>
                <div className="text-sm">{dateFormatted}</div>
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full p-3 rounded-xl text-transparent caret-transparent appearance-none transition-all duration-200 pr-10 ${
                formData.date && !presetDates.some(d => d.value === formData.date)
                  ? 'bg-[#FFD700] font-bold border-2 border-[#FFD700]'
                  : 'silver-button text-black'
              }`}
            />
            <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black pointer-events-none text-lg" />
            {!formData.date && (
              <span className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 text-center text-sm text-black pointer-events-none">
                Or choose custom date
              </span>
            )}
            {formData.date && !presetDates.some(d => d.value === formData.date) && (
              <span className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 text-center text-black font-bold text-sm pointer-events-none">
                {formData.customDateFormatted}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block mb-2 font-semibold">Select Time Window:</label>
          <div className="grid grid-cols-3 gap-4">
            {[{ label: 'Morning', time: '7:00 AM – 12:00 PM' }, { label: 'Afternoon', time: '12:00 PM – 5:00 PM' }, { label: 'Evening', time: '5:00 PM – 9:00 PM' }].map(({ label, time }) => (
              <button
                key={time}
                type="button"
                onClick={() => setFormData({ ...formData, time })}
                className={`silver-button ${formData.time === time ? 'silver-button-active' : ''} w-full text-center`}
              >
                <div className="text-lg font-bold">{label}</div>
                <div className="text-sm">{time}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 text-white p-4 rounded-xl">
          <h2 className="text-lg font-bold mb-3">Your Cart:</h2>

          {cartSummary.length ? (
            <ul className="mb-3 divide-y divide-white/10">
              {cartSummary.map((item) => (
                <li key={item.key} className="flex items-center gap-3 py-3 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white">
                      {item.name}
                      <span className="ml-2 text-gold">×{item.qty}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-400">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCartItem(item)}
                    className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/65 transition hover:border-gold/60 hover:text-gold active:scale-95"
                    aria-label={"Remove " + item.name + " from cart"}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-3 text-sm text-gray-400">Your cart is empty.</p>
          )}

          <p className="font-bold">Total: ${finalPrice.toFixed(2)}</p>
          <p className="mt-2 italic text-yellow-300">You don't pay until the job is done!</p>
        </div>

        <p className="text-sm text-gray-400 mt-4">
          Curious what your booking will cost in total?{' '}
          <Link to="/blog/how-much-does-junk-removal-cost" className="text-gold underline hover:text-white">
            View our full price transparency promise
          </Link>.
        </p>

        <button
          type="button"
          onClick={resumeMirrorToAddMore}
          className="w-full rounded-xl border border-gold/55 bg-black px-6 py-3 font-bold text-gold transition hover:border-gold hover:bg-gold/10 active:scale-[.99]"
        >
          Add More Items
        </button>

        <button
          type="submit"
          disabled={!cart.length}
          className="jb-polished-gold-button w-full disabled:cursor-not-allowed disabled:opacity-40"
        >
          Schedule Pickup
        </button>
      </form>
    </div>
  );
}

export default SchedulePage;
