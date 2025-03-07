import FilterButton from "./FilterButton";

// Компонент для панели фильтров
const FiltersBar = () => {
    return (
        <div className="flex justify-between px-4 py-2 text-xs text-gray-400">
            <div className="flex space-x-2 w-full">
                <FilterButton title="Оплата" value="Все" hasChevron={true} />
                <FilterButton title="Валюта" value="RUB" hasChevron={true} />
                <FilterButton title="Крипта" value="USDT" hasChevron={true} />
                <FilterButton title="Сумма" placeholder="10.00 RUB" />
            </div>
        </div>
    );
};

export default FiltersBar;