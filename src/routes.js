import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AnnouncementPage from './components/p2p/AnnouncementPage';
import BuyPage from './components/p2p/BuyPage';
import Profile from './components/p2p/Profile';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/announcement" element={<AnnouncementPage />} />
                <Route path="/buy" element={<BuyPage />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
