
// Компонент для одного объявления/листинга
const ListingItem = ({
                         price,
                         priceLabel,
                         buttonLabel,
                         userImage,
                         userName,
                         deals,
                         paymentMethods,
                         cryptoAmount,
                         range
                     }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-2xl font-bold">{price}</p>
                    <p className="text-gray-400">{priceLabel}</p>
                </div>
                <button className="bg-blue-500 text-white px-4 py-1.5 rounded font-bold">{buttonLabel}</button>
            </div>
            <div className="w-full border-b border-gray-600 opacity-50 mt-3"></div>
            <div className="flex items-center space-x-2 mt-3">
                <div className="flex flex-col w-1/2">
                    <p className="font-semibold">
                        <div className="flex items-center space-x-2 pb-2">
                            <img
                                alt={`Profile picture of ${userName}`}
                                className="w-6 h-6 rounded-full mr-2"
                                src={userImage}
                            />
                            {userName}
                        </div>
                    </p>
                    <p className="text-gray-400">Доступно:</p>
                    <p className="text-gray-400">Лимиты:</p>
                    <p className="text-gray-400">Методы оплаты:</p>
                </div>
                <div className="flex flex-col w-1/2">
                    <p className="text-gray-400 pb-2">сделок: {deals}</p>
                    <p className="text-gray-400">{cryptoAmount}</p>
                    <p className="text-gray-400">{range}</p>
                    <p className="text-gray-400">{paymentMethods}</p>
                </div>
            </div>
        </div>
    );
};
export default ListingItem;
