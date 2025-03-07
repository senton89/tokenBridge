import React from 'react';

const BuyPage = () => {
    return (
        <div className="p-6">
            <div className="rounded-lg">
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                    <div className="flex items-center mb-4">
                        <img
                            alt="User avatar"
                            className="rounded-full mr-2 w-6 h-6"
                            src="https://storage.googleapis.com/a1aa/image/G68vItUvmgTCdS5EZrsYR9QMJY1SYajK5ONyC2WNHtU.jpg"
                        />
                        <span className="text-sm">
              Вы отправляете
              <span className="font-bold">Dashing Shark</span>
            </span>
                    </div>
                    <div className="text-5xl font-bold mb-2">
                        0
                        <span className="text-3xl text-gray-500 mt-3">RUB</span>
                    </div>
                    <div className="text-gray-500 mb-4">
                        Цена за 1 USDT ≈ 98,08 RUB
                    </div>
                    <a className="text-blue-500 mb-16 block" href="#">
                        Купить все
                    </a>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-md">Метод оплаты</span>
                        <span className="text-blue-600">СберБанк</span>
                    </div>
                    <div className="w-full border-b border-gray-600 opacity-50 mb-4"></div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-md">Лимиты</span>
                        <span className="text-gray-500">
              280 023,74 ~ 280 023,74 RUB
            </span>
                    </div>
                    <div className="w-full border-b border-gray-600 opacity-50 mb-4"></div>
                    <div className="text-md mb-2 flex items-center justify-between">
                        Детали объявления
                        <i className="fas fa-chevron-right ml-2 mr-2"></i>
                    </div>
                </div>
                <div className="bg-gray-800 pl-4 p-3 rounded-lg mb-4">
                    <div className="text-gray-500 text-sm">
                        Инструкция от Dashing Shark
                    </div>
                    <div className="text-md">Получатель: Куксенко Д.А</div>
                </div>
                <div className="flex items-center text-yellow-500 text-sm mb-4">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    <span>
            Только мошенники предлагают общение и проведение сделок вне P2P Маркета.
          </span>
                </div>
                <button className="bg-gray-700 text-gray-500 py-3 rounded-lg absolute bottom-3 left-4 right-4">
                    Купить
                </button>
            </div>
        </div>
    );
};

export default BuyPage;