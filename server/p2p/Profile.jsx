import React from 'react';

const Profile = () => {
    return (
        <div className="max-w-md mx-auto p-4">
            <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4">
                    <img
                        alt="Profile icon with a wasp"
                        className="rounded-full"
                        height="96"
                        src="https://storage.googleapis.com/a1aa/image/vTb00t-ANLcyoUH4cCNqgCo_cAgyEhut5X2CTrg3iLQ.jpg"
                        width="96"
                    />
                </div>
                <h2 className="text-lg font-bold">Lonely Wasp</h2>
                <p className="text-gray-400 text-sm">
                    Это анонимное имя используется для всех ваших операций на P2P Маркете.
                </p>
            </div>
            {/* Stats Section */}
            <div className="flex justify-center items-center bg-gray-800 p-4 rounded-lg mb-4">
                <div className="text-center">
                    <p className="text-xl font-bold">1</p>
                    <p className="text-gray-400 text-sm">Количество сделок</p>
                </div>
            </div>
            {/* Settings Section */}
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <i className="fas fa-wallet text-blue-500 text-xl mr-4"></i>
                        <p className="text-md">Настройки оплаты</p>
                    </div>
                    <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
            </div>
            {/* Ads Section */}
            <div className="mb-4 bg-gray-800 p-4 rounded-lg">
                <h3 className="text-blue-500 text-lg mb-4">Ваши объявления</h3>
                <div className="flex items-center text-blue-500 ml-2">
                    <i className="fas fa-plus-circle text-md mr-2"></i>
                    <p className="text-md">Создать объявление</p>
                </div>
            </div>
            {/* Tabs Section */}
            <div className="flex flex-col bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between mb-4">
                    <div className="text-center w-1/2">
                        <p className="text-lg text-blue-500 border-b-2 border-blue-500 pb-2">
                            Покупка
                        </p>
                    </div>
                    <div className="text-center w-1/2">
                        <p className="text-lg text-gray-400">Продажа</p>
                    </div>
                </div>
                <div className="text-center text-gray-400 mt-12 mb-14">
                    <p>Здесь появятся ваши объявления</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;