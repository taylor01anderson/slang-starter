import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Mint from './pages/Mint';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import { Web3Provider } from './context/Web3Context';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="App min-h-screen">
          <Navbar />
          <main className="pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mint" element={<Mint />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
