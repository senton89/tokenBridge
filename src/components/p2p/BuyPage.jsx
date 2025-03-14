import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { p2pApi } from '../../services/api';
const BuyPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get listing from location state or use default values
  const [listing, setListing] = useState(location.state?.listing || null);
  const [amount, setAmount] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!location.state?.listing);
  const [showDetails, setShowDetails] = useState(false);

  // Calculate crypto amount when fiat amount changes
  useEffect(() => {
    const fetchListingDetails = async () => {
      if (!location.state?.listing) {
        setFetchLoading(true);
        try {
          const response = await p2pApi.getAdDetails(id);
          if (response && response.data) {
            setListing(response.data);
          } else {
            setError("Не удалось загрузить данные объявления");
            setTimeout(() => navigate('/p2p/buy'), 3000);
          }
        } catch (err) {
          console.error('Error fetching listing details:', err);
          setError("Произошла ошибка при загрузке данных объявления");
          setTimeout(() => navigate('/p2p/buy'), 3000);
        } finally {
          setFetchLoading(false);
        }
      }
    };

    fetchListingDetails();
  }, [id, location.state, navigate]);

  useEffect(() => {
    if (amount && !isNaN(amount) && listing?.price) {
      const calculatedCrypto = parseFloat(amount) / listing.price;
      setCryptoAmount(calculatedCrypto.toFixed(8));
    } else {
      setCryptoAmount('');
    }
  }, [amount, listing?.price]);

  // Handle amount input change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    setError('');
  };

  // Handle buy button click
  const handleBuy = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Пожалуйста, введите сумму');
      return;
    }

    const numAmount = parseFloat(amount);

    // Validate against limits
    if (listing.minAmount && numAmount < listing.minAmount) {
      setError(`Минимальная сумма: ${listing.minAmount} ${listing.currency}`);
      return;
    }

    if (listing.maxAmount && numAmount > listing.maxAmount) {
      setError(`Максимальная сумма: ${listing.maxAmount} ${listing.currency}`);
      return;
    }

    // Proceed with the purchase
    setLoading(true);

    try {
      // Create deal through API
      const dealData = {
        adId: listing.id,
        amount: numAmount / listing.price, // Crypto amount
        totalPrice: numAmount,
        paymentMethod: listing.paymentMethods[0]
      };

      const response = await p2pApi.createDeal(dealData);

      if (response && response.data && response.data.id) {
        navigate(`/p2p/transaction/${response.data.id}`, {
          state: {
            listing: listing,
            amount: numAmount / listing.price,
            total: numAmount,
            dealId: response.data.id
          }
        });
      } else {
        setError("Не удалось создать сделку. Попробуйте позже.");
        setLoading(false);
      }
    } catch (err) {
      console.error('Error creating deal:', err);
      setError(err.response?.data?.message || "Произошла ошибка при создании сделки");
      setLoading(false);
    }
  };

  // Handle "Buy All" button click
  const handleBuyAll = () => {
    if (listing.maxAmount) {
      setAmount(listing.maxAmount.toString());
    } else if (listing.available && listing.price) {
      const maxPossible = (listing.available * listing.price).toFixed(2);
      setAmount(maxPossible);
    }
  };

  // Handle back button click
  const handleBack = () => {
    navigate(-1);
  };

  if (fetchLoading) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
    );
  }

  if (!listing) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
          <p className="text-red-400 mb-4">{error || "Объявление не найдено"}</p>
          <button
              onClick={() => navigate('/p2p/buy')}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Вернуться к списку объявлений
          </button>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-900 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
              onClick={handleBack}
              className="text-gray-400 hover:text-white"
          >
            <i className="fas fa-arrow-left text-xl" />
          </button>
          <h2 className="text-xl font-bold">Покупка {listing.crypto}</h2>
          <div className="w-8" /> {/* For centering the title */}
        </div>

        {/* Main Content */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          {/* User Info */}
          <div className="flex items-center mb-4">
            <div>
              <p className="text-sm text-gray-400">Вы отправляете</p>
              <p className="font-medium">{listing.user.name}</p>
            </div>
          </div>

          {/* Amount Input - Borderless */}
          <div className="mb-4">
            <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="text-5xl font-bold bg-transparent border-none outline-none w-full focus:outline-none"
            />
            <span className="text-3xl text-gray-500 ml-2">{listing.currency}</span>
            <p className="text-gray-400 text-sm mt-2">
              Цена за 1 {listing.crypto} ≈ {listing.price} {listing.currency}
            </p>
            <button className="text-blue-500 mt-2" onClick={handleBuyAll}>
              Купить все
            </button>

            {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Метод оплаты</span>
            <span className="text-blue-500">{listing.paymentMethods[0]}</span>
          </div>

          <div className="border-b border-gray-700 mb-3" />

          {/* Limits */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Лимиты</span>
            <span className="text-gray-400">
            {listing.minAmount} ~ {listing.maxAmount} {listing.currency}
          </span>
          </div>

          <div className="border-b border-gray-700 mb-3" />

          {/* Details Toggle */}
          <button
              className="flex justify-between items-center w-full text-left"
              onClick={() => setShowDetails(!showDetails)}
          >
            <span>Детали объявления</span>
            <i className={`fas fa-chevron-${showDetails ? 'down' : 'right'}`} />
          </button>

          {showDetails && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-gray-400">Доступно:</div>
                  <div>{listing.available} {listing.crypto}</div>

                  <div className="text-gray-400">Способы оплаты:</div>
                  <div>{listing.paymentMethods.join(', ')}</div>

                  <div className="text-gray-400">Сделок:</div>
                  <div>{listing.user.deals}</div>

                  {listing.user.rating && (
                      <>
                        <div className="text-gray-400">Рейтинг:</div>
                        <div>{listing.user.rating}%</div>
                      </>
                  )}
                </div>
              </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <p className="text-gray-400 text-sm mb-1">Инструкция от {listing.user.name}</p>
          <p>{listing.instructions || 'Инструкции не указаны'}</p>
        </div>

        {/* Warning */}
        <div className="flex items-start text-yellow-500 text-sm mb-6">
          <i className="fas fa-exclamation-triangle mt-1 mr-2" />
          <p>
            Только мошенники предлагают общение и проведение сделок вне P2P Маркета
          </p>
        </div>

        {/* Buy Button */}
        <button
            onClick={handleBuy}
            disabled={loading}
            className={`w-full py-3 rounded-xl text-center font-medium ${
                amount && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 text-gray-400'
            }`}
        >
          {loading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Обработка...
              </div>
          ) : (
              `Купить ${cryptoAmount ? `${cryptoAmount} ${listing.crypto}` : listing.crypto}`
          )}
        </button>
      </div>
  );
};

export default BuyPage;