// File: src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SelectionPage from './pages/SelectionPage';
import LoadSizePage from './pages/LoadSizePage';
import ItemizedPage from './pages/ItemizedPage';
import SchedulePage from './pages/SchedulePage';
import ConfirmationPage from './pages/ConfirmationPage';
import BlogPage from './pages/BlogPage';
import HowMuchDoesJunkRemovalCost from './pages/blog/HowMuchDoesJunkRemovalCost';
import SaveMoneyOnJunkRemoval from './pages/blog/SaveMoneyOnJunkRemoval';
import FaqPage from './pages/FaqPage';
import ServiceAreasPage from './pages/ServiceAreasPage';
import MattressRemovalPage from "./pages/MattressRemovalPage";
import FurnitureRemovalPage from "./pages/FurnitureRemovalPage";



// Import city-specific pages
import Houston from './pages/cities/Houston';
import Katy from './pages/cities/Katy';
import SugarLand from './pages/cities/Sugar-Land';
import Pearland from './pages/cities/Pearland';
import Cypress from './pages/cities/Cypress';
import Spring from './pages/cities/Spring';
import Humble from './pages/cities/Humble';
import MissouriCity from './pages/cities/Missouri-City';
import Pasadena from './pages/cities/Pasadena';
import TheWoodlands from './pages/cities/The-Woodlands';
import LeagueCity from './pages/cities/League-City';
import Baytown from './pages/cities/Baytown';
import Friendswood from './pages/cities/Friendswood';
import Channelview from './pages/cities/Channelview';
import Richmond from './pages/cities/Richmond';
import Rosenberg from './pages/cities/Rosenberg';
import Tomball from './pages/cities/Tomball';
import Alvin from './pages/cities/Alvin';
import DeerPark from './pages/cities/Deer-Park';
import LaPorte from './pages/cities/La-Porte';

import { CartProvider } from './context/CartContext';

// ⬇️ NEW: global chat widget
import ChatWidget from './components/chat/ChatWidget';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/selection" element={<SelectionPage />} />
          <Route path="/load-size" element={<LoadSizePage />} />
          <Route path="/itemized" element={<ItemizedPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />

          {/* Blog Routes */}
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/how-much-does-junk-removal-cost" element={<HowMuchDoesJunkRemovalCost />} />
          <Route path="/blog/save-money-on-junk-removal" element={<SaveMoneyOnJunkRemoval />} />

          {/* Static Pages */}
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/service-areas" element={<ServiceAreasPage />} />

          {/* Dynamic City Pages */}
          <Route path="/service-areas/houston" element={<Houston />} />
          <Route path="/service-areas/katy" element={<Katy />} />
          <Route path="/service-areas/sugar-land" element={<SugarLand />} />
          <Route path="/service-areas/pearland" element={<Pearland />} />
          <Route path="/service-areas/cypress" element={<Cypress />} />
          <Route path="/service-areas/spring" element={<Spring />} />
          <Route path="/service-areas/humble" element={<Humble />} />
          <Route path="/service-areas/missouri-city" element={<MissouriCity />} />
          <Route path="/service-areas/pasadena" element={<Pasadena />} />
          <Route path="/service-areas/the-woodlands" element={<TheWoodlands />} />
          <Route path="/service-areas/league-city" element={<LeagueCity />} />
          <Route path="/service-areas/baytown" element={<Baytown />} />
          <Route path="/service-areas/friendswood" element={<Friendswood />} />
          <Route path="/service-areas/channelview" element={<Channelview />} />
          <Route path="/service-areas/richmond" element={<Richmond />} />
          <Route path="/service-areas/rosenberg" element={<Rosenberg />} />
          <Route path="/service-areas/tomball" element={<Tomball />} />
          <Route path="/service-areas/alvin" element={<Alvin />} />
          <Route path="/service-areas/deer-park" element={<DeerPark />} />
          <Route path="/service-areas/la-porte" element={<LaPorte />} />
          <Route path="/mattress-removal" element={<MattressRemovalPage />} />
          <Route path="/furniture-removal" element={<FurnitureRemovalPage />} />


        </Routes>

        {/* ⬇️ NEW: mounted once so it overlays all routes */}
        <ChatWidget />
      </Router>
    </CartProvider>
  );
}

export default App;
