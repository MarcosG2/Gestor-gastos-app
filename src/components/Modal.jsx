import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function Modal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isDanger = false,
    requireInput = false,
    expectedWord = ""
}) {
    const [inputValue, setInputValue] = useState('')


    if (!isOpen) return null

    const isConfirmDisabled = requireInput && inputValue !== expectedWord

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">

            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">

                <div className={`p-6 flex items-start gap-4 ${isDanger ? 'bg-red-50' : 'bg-indigo-50'}`}>
                    <div className={`p-3 rounded-2xl ${isDanger ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-xl font-bold ${isDanger ? 'text-red-900' : 'text-indigo-900'}`}>
                            {title}
                        </h3>
                        <p className={`mt-2 text-sm ${isDanger ? 'text-red-700' : 'text-indigo-700'}`}>
                            {message}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>


                {requireInput && (
                    <div className="p-6 bg-white border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Escribe <span className="font-bold text-red-600">"{expectedWord}"</span> para confirmar:
                        </label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={expectedWord}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all text-center font-bold tracking-widest uppercase"
                            autoFocus
                        />
                    </div>
                )}


                <div className="p-6 bg-gray-50 flex gap-3 justify-end border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm()
                            setInputValue('') 
                        }}
                        disabled={isConfirmDisabled}
                        className={`px-5 py-2.5 font-bold text-white rounded-xl transition-all shadow-md ${isDanger
                            ? 'bg-red-600 hover:bg-red-700 shadow-red-200 disabled:bg-red-300'
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 disabled:bg-indigo-300'
                            } disabled:cursor-not-allowed`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}