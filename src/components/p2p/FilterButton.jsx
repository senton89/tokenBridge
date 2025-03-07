import React, { useState } from 'react';

// Компонент для одной кнопки фильтра / поля ввода
const FilterButton = ({ title, value, placeholder, hasChevron, onChange }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
                onClick={() => title === "Крипта" ? setIsDropdownOpen(!isDropdownOpen) : onChange?.(value)}
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
    
        </div>
    );
};

export default FilterButton;
