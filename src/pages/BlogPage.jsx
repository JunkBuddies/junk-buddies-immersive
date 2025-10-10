// File: src/pages/BlogPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function BlogPage() {
  return (
    <div
      style={{
        backgroundColor: '#2b2b2b',
        backgroundImage: 'linear-gradient(145deg, #2b2b2b 0%, #1f1f1f 100%)',
      }}
      className="text-white min-h-screen px-6 py-10 max-w-5xl mx-auto"
    >
      <h1 className="text-4xl font-bold text-gold mb-4">Junk Buddies Blog</h1>
      <p className="text-lg text-gray-300 mb-10">
        Real advice from local pros. No fluff. No corporate-speak. Just solid info on junk removal in Houston — and how to save time, money, and space.
      </p>
      <div className="mt-12 space-y-4 text-center">
  <Link to="/faq" className="text-gold hover:underline text-lg block">
    📌 Frequently Asked Questions
  </Link>
  <Link to="/" className="text-gold hover:underline text-lg block">
    🏠 Return to Homepage
  </Link>
</div>

      <div className="space-y-10">
        {/* Blog Post 1 */}
        <div className="border border-gold p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
          <Link to="/blog/how-much-does-junk-removal-cost" className="text-2xl text-gold font-bold hover:underline">
            How Much Does Junk Removal Cost in Houston? (2025 Breakdown)
          </Link>
          <p className="text-gray-300 mt-3">
            Most companies hide their prices. We don’t. See what junk removal really costs in Houston — and how to avoid getting ripped off.
          </p>
          <Link
            to="/blog/how-much-does-junk-removal-cost"
            className="inline-block mt-4 text-sm text-gold hover:underline"
          >
            Read More →
          </Link>
        </div>

        {/* Blog Post 2 */}
        <div className="border border-gold p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
          <Link to="/blog/save-money-on-junk-removal" className="text-2xl text-gold font-bold hover:underline">
            💰 10 Easy Ways to Save Money on Junk Removal
          </Link>
          <p className="text-gray-300 mt-3">
            Real-world tips to keep costs down without sacrificing service. Learn how to get more value, avoid hidden fees, and choose the right junk removal strategy.
          </p>
          <Link
            to="/blog/save-money-on-junk-removal"
            className="inline-block mt-4 text-sm text-gold hover:underline"
          >
            Read More →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BlogPage;
