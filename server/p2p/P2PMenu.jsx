import React from 'react';
import { useNavigate } from 'react-router-dom';

const P2PMenu = () => {
    const navigate = useNavigate();
    return (
        <div className="max-w-md mx-auto p-4">
            {/* Main Content */}
            <div className="text-center mb-6">
                <img src="./p2p.png" alt="p2p market logo" className="w-48 mx-auto mb-6 mt-12" />
                <h2 className="text-lg font-bold">P2P Маркет</h2>
                <p className="text-gray-400">Обменивайте активы напрямую у других пользователей</p>
            </div>
            {/* Buttons */}
            <div className="flex justify-center space-x-4 mb-6 text-md">
                <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2.5 rounded-xl w-full">
                    <i className="fas fa-arrow-down mr-2" />
                    Купить
                </button>
                <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2.5 rounded-xl w-full">
                    <i className="fas fa-arrow-up mr-2" />
                    Продать
                </button>
            </div>
            {/* Options */}
            <div className="space-y-4">
                <div className="flex flex-col bg-gray-800 p-4 rounded-2xl">
                    <button className="flex items-center" onClick={() => navigate('/profile')}>
                            <i className="fas fa-user text-blue-500 text-2xl mr-4"/>
                            <div>
                                <p className="font-bold text-left">Мои объявления</p>
                                <p className="text-gray-400">Настройки объявлений и платежей</p>
                            </div>
                    </button>
                    <div className="border-b border-gray-600 opacity-50 ml-10 mt-2 mr-1"/>
                    <button onClick={() => navigate('/announcement')}>
                    <div className="bg-gray-800 rounded-2xl pt-3">
                        <div className="flex items-center">
                            <i className="fas fa-plus-circle text-blue-500 text-2xl mr-4"/>
                            <p className="font-bold text-blue-500">Создать объявление</p>
                        </div>
                    </div>
                    </button>
                </div>
                <div className="flex flex-col bg-gray-800 p-4 rounded-2xl mt-6">
                    <div className="flex justify-between mb-4">
                        <p className="font-bold text-blue-500">Мои сделки</p>
                    </div>
                    <div className="w-full border-b border-gray-600 opacity-50 mb-24" />
                    <p className="text-gray-400 text-center mb-24">Здесь появятся ваши сделки</p>
                </div>
            </div>
        </div>
    );
};

export default P2PMenu;