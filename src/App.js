import React, {useEffect} from 'react';
import {Route, Routes, useNavigate} from 'react-router-dom';

import Home from './components/Home';
import Currencies from "./components/Currencies.js";
import CoinList from "./components/CoinList";
import DepositPage from "./components/deposit/DepositPage";
import ExchangePage from "./components/exchange/ExchangePage";
import WithdrawPage from "./components/withdraw/WithdrawPage";
import P2PMenu from "./components/p2p/P2PMenu";
import SettingsPage from "./components/SettingsPage";
import BuyMenu from "./components/p2p/BuyMenu";
import BuyPage from "./components/p2p/BuyPage.jsx";
import SellMenu from "./components/p2p/SellMenu";
import SellPage from "./components/p2p/SellPage.jsx";
import Profile from "./components/p2p/Profile";
import AnnouncementPage from "./components/p2p/AnnouncementPage";
import MyAdsPage from "./components/p2p/MyAdsPage";
import P2PDealsPage from "./components/p2p/P2PDealsPage";
import PaymentMethodsPage from "./components/p2p/PaymentMethodsPage";
import AdDetailsPage from "./components/p2p/AdDetailsPage";
import PaymentMethodSelector from "./components/p2p/PaymentMethodSelector";
import DealDetailsPage from "./components/p2p/DealDetailsPage";
import PaymentConfirmationPage from "./components/p2p/PaymentConfirmationPage";
import TransactionPage from "./components/p2p/TransactionConfirmationPage";

function App() {
    const navigate = useNavigate();

    useEffect(() => {
        // eslint-disable-next-line no-undef
        // const telegramData = Telegram.WebApp.initData;
        // const userData = JSON.parse(decodeURIComponent(telegramData));
        // console.log(userData);
        // const telegramId = userData.user.id; // Получаем telegram_id пользователя
        // console.log('Telegram ID:', telegramId);

        // eslint-disable-next-line no-undef
        Telegram.WebApp.headerColor = '#0a1726';

// eslint-disable-next-line no-undef
        var BackButton = Telegram.WebApp.BackButton;

        if (window.location.pathname !== '/') { // или любая другая проверка текущего пути
            BackButton.show();
            BackButton.onClick(function () {
                navigate(-1);
            });
            // eslint-disable-next-line no-undef
            Telegram.WebApp.onEvent('backButtonClicked', function () {
                navigate(-1);
            });
        }else {
            BackButton.hide();
        }}, [navigate]);

  return (
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/currencies" element={<Currencies/>} />
          <Route path="/coinlist" element={<CoinList/>} />
          <Route path="/deposit" element={<DepositPage/>} />
          <Route path="/exchange" element={<ExchangePage/>} />
          <Route path="/withdraw" element={<WithdrawPage/>} />
          <Route path="/settings" element={<SettingsPage/>} />
          
          {/* P2P маршруты */}
          <Route path="/p2p" element={<P2PMenu/>} />
          <Route path="/p2p/buy" element={<BuyMenu/>} />
          <Route path="/p2p/sell" element={<SellMenu/>} />
          <Route path="/p2p/buy/:id" element={<BuyPage/>} />
          <Route path="/p2p/sell/:id" element={<SellPage/>} />
          <Route path="/p2p/profile" element={<Profile/>} />
          <Route path="/p2p/create-ad" element={<AnnouncementPage/>} />
          <Route path="/p2p/my-ads" element={<MyAdsPage/>} />
            <Route path="/p2p/deals" element={<P2PDealsPage/>} />
            <Route path="/p2p/deals/:id" element={<DealDetailsPage/>} />
            <Route path="/p2p/payment-methods" element={<PaymentMethodsPage/>} />
            <Route path="/p2p/ad/:id" element={<AdDetailsPage/>} />
            <Route path="/p2p/payment-method-select" element={<PaymentMethodSelector/>} />
            <Route path="/p2p/payment-confirmation" element={<PaymentConfirmationPage />} />
            <Route path="/p2p/transaction/:id" element={<TransactionPage/>} />

          {/* Обратная совместимость со старыми маршрутами */}
          {/* <Route path="/buy" element={<BuyMenu/>} />
          <Route path="/buypage" element={<BuyPage/>} />
          <Route path="/sell" element={<SellMenu/>} />
          <Route path="/sellpage" element={<SellPage/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/create-ad" element={<AnnouncementPage/>} />
          <Route path="/my-ads" element={<MyAdsPage/>} /> */}
        </Routes>
  );
}

export default App;