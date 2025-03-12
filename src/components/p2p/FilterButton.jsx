import React, { useState } from 'react';

// Компонент для одной кнопки фильтра / поля ввода
const FilterButton = ({
                          title,
                          value,
                          placeholder,
                          hasChevron,
                          onChange,
                          options = []
                      }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleOptionSelect = (option) => {
        onChange?.(option);
        setIsDropdownOpen(false);
    };
    // Если задан placeholder – выводим кнопку с полем ввода
    if (placeholder) {
        return (
            <button className="bg-gray-800 text-gray-400 px-3 py-1 rounded w-1/4 flex flex-col">
                {title}
                <div>
                    <input
                        className="bg-gray-800 text-white rounded text-sm w-20 font-bold"
                        type="text"
                        placeholder={placeholder}
                        value={value || ''}
                        onChange={(e) => onChange?.(e.target.value)}
                    />
                </div>
            </button>
        );
    }

    return (
        <div className="relative w-1/4">
            <button
                className="bg-gray-800 text-white pl-3 py-1 rounded flex flex-row text-left w-full"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <div className="flex flex-col text-gray-400 pr-6">
                    {title}
                    <span className="font-bold text-white text-sm max-w-12 truncate">{value}</span>
                </div>
                <div className="flex flex-col pr-2">
                    {hasChevron ? (
                        <>
                            <i className="fas fa-chevron-up ml-2 mt-2"></i>
                            <i className="fas fa-chevron-down ml-2"></i>
                        </>
                    ) : (
                        <i className="fas fa-chevron-down ml-2 mt-4"></i>
                    )}
                </div>
            </button>

            {isDropdownOpen && options.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-gray-800 rounded-md shadow-lg">
                    <ul className="py-1">
                        {options.map((option, index) => (
                            <li
                                key={index}
                                className="px-3 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer"
                                onClick={() => handleOptionSelect(option)}
                            >
                                {typeof option === 'object' ? option.name || option.symbol : option}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FilterButton;
