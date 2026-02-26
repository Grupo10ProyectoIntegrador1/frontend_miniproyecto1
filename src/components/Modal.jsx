import React from 'react';

const Modal = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'success', // 'warning', 'error', 'success'
    onConfirm,
    confirmText,
    cancelText = 'Cancelar'
}) => {
    if (!isOpen) return null;

    const isWarning = type === 'warning';
    const isError = type === 'error';

    const defaultConfirmText = isWarning ? 'Eliminar' : isError ? 'Cerrar' : 'Aceptar';
    const finalConfirmText = confirmText || defaultConfirmText;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">{message}</p>

                <div className="flex justify-end gap-3">
                    {isWarning && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                        >
                            {cancelText}
                        </button>
                    )}

                    <button
                        onClick={onConfirm || onClose}
                        className={`px-4 py-2 font-medium rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm ${isError || isWarning
                                ? 'bg-[#E53E3E] hover:bg-red-700 text-white focus:ring-red-500' // Using a slightly softer red like the image or standard tailwind red-600
                                : 'bg-[#1D4ED8] hover:bg-blue-800 text-white focus:ring-blue-600' // standard tailwind blue-700
                            }`}
                    >
                        {finalConfirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
