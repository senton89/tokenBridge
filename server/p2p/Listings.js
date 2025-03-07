
// Компонент для списка объявлений; принимает массив данных и тип действия ("Купить" или "Продать")
import ListingItem from "./ListingItem";

const Listings = ({ listings, type }) => {
    return (
        <div className="space-y-4 px-4">
            {listings.map((listing, index) => (
                <ListingItem
                    key={index}
                    price={listing.price}
                    priceLabel="Цена за 1 USDT"
                    buttonLabel={type}
                    userImage={listing.userImage}
                    userName={listing.userName}
                    deals={listing.deals}
                    paymentMethods={listing.paymentMethods}
                    cryptoAmount={listing.cryptoAmount}
                    range={listing.range}
                />
            ))}
        </div>
    );
};

export default Listings;