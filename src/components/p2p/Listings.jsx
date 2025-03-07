import React from 'react';
import ListingItem from './ListingItem';

const Listings = ({ listings, buttonType, onItemClick, loading, error }) => {
    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center text-red-500 p-4 text-center">
                <div>
                    <i className="fas fa-exclamation-circle text-3xl mb-2" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!listings || listings.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500 p-4 text-center">
                <div>
                    <i className="fas fa-search text-3xl mb-2" />
                    <p>Объявления не найдены</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto">
            <div className="divide-y divide-gray-800">
                {listings.map((listing) => (
                    <ListingItem
                        key={listing.id}
                        listing={listing}
                        buttonType={buttonType}
                        onClick={() => onItemClick(listing.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Listings;
