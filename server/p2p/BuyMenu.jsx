
// Главный компонент меню "Купить"
import FiltersBar from "./FilterBar";
import Listings from "./Listings";

const BuyMenu = () => {
    // Пример данных. В реальном случае они могут приходить с сервера.
    const sampleListings = [
        {
            price: "98,36 RUB",
            userImage: "https://storage.googleapis.com/a1aa/image/60SMiFStzWUil2M6DRdziTbCm1hFDdgW9cRTnvJDAsQ.jpg",
            userName: "Wonderful Penguin",
            deals: "41",
            paymentMethods: "Сбербанк и СБП",
            cryptoAmount: "29,35 USDT",
            range: "2 800–2 887,91 RUB"
        },
        {
            price: "98,9 RUB",
            userImage: "https://storage.googleapis.com/a1aa/image/6HDmMzTpfrDThI4rmdCmsiLOvyDNdY6a__wmw94_WvQ.jpg",
            userName: "Loud Kiwi",
            deals: "352",
            paymentMethods: "ВТБ",
            cryptoAmount: "54,5 USDT",
            range: "5 136–5 136 RUB"
        },
        {
            price: "99 RUB",
            userImage: "https://storage.googleapis.com/a1aa/image/_31hxOOwXV2F4R2UbZux6iIis1a-GrhR9a8jJOTZZ-Y.jpg",
            userName: "Able Penguin",
            deals: "41",
            paymentMethods: "ОТП Банк",
            cryptoAmount: "153,61 USDT",
            range: "15 000–15 000 RUB"
        }
    ];

    return (
        <div className="mx-auto mt-2">
            <FiltersBar />
            <Listings listings={sampleListings} type="Купить" />
        </div>
    );
};

export default BuyMenu;