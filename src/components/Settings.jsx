// src/components/Settings.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Settings({ isOpen, onClose }) {
    const navigate = useNavigate();

    // Handle navigation to policy pages
    const handleNavigateToPolicy = (policyType) => {
        navigate(`/policy/${policyType}`);
    };

    // Handle navigation to support
    const handleNavigateToSupport = () => {
        navigate('/support');
    };

    // If the settings modal is not open, don't render anything
    // if (!isOpen) return null;

    return (
        <div className="mt-10 inset-0 bg-opacity-10 z-50 flex justify-center items-center">
            <div className="bg-gray-800 rounded-lg w-11/12 max-w-md p-4 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Настройки</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white focus:outline-none"
                    >
                        <i className="fas fa-times text-xl" onClick={() => navigate("/")}></i>
                    </button>
                </div>

                <div className="divide-y divide-gray-700">

                    <div
                        className="py-3 flex justify-between items-center cursor-pointer hover:bg-gray-700 px-2 rounded"
                        onClick={() => handleNavigateToPolicy('privacy')}
                    >
                        <div className="flex items-center">
                            <i className="fas fa-user-shield text-blue-400 mr-3"></i>
                            <span className="text-white">Политика конфиденциальности</span>
                        </div>
                        <i className="fas fa-chevron-right text-gray-400"></i>
                    </div>

                    {/* Support */}
                    <div
                        className="py-3 flex justify-between items-center cursor-pointer hover:bg-gray-700 px-2 rounded"
                        onClick={handleNavigateToSupport}
                    >
                        <div className="flex items-center">
                            <i className="fas fa-headset text-blue-400 mr-3"></i>
                            <span className="text-white">Поддержка</span>
                        </div>
                        <i className="fas fa-chevron-right text-gray-400"></i>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Settings;