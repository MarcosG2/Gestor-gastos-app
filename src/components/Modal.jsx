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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-ink/40 animate-fade-in">

            <div className="bg-paper dark:bg-paper rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up dark:border dark:border-line">

                <div className={`p-6 flex items-start gap-4 ${isDanger ? 'bg-red-50 dark:bg-red-950/40' : 'bg-band/10 dark:bg-band/30'}`}>
                    <div className={`p-3 rounded-2xl ${isDanger ? 'bg-red-100 text-red-600' : 'bg-band/15 text-link'}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-xl font-bold ${isDanger ? 'text-red-900' : 'text-ink'}`}>
                            {title}
                        </h3>
                        <p className={`mt-2 text-sm ${isDanger ? 'text-red-700' : 'text-link'}`}>
                            {message}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted hover:text-muted transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>


                {requireInput && (
                    <div className="p-6 bg-paper border-t border-line">
                        <label className="block text-sm font-medium text-ink mb-2">
                            Escribe <span className="font-bold text-red-600">"{expectedWord}"</span> para confirmar:
                        </label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={expectedWord}
                            className="w-full px-4 py-3 border-2 border-line rounded-xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all text-center font-bold tracking-widest uppercase"
                            autoFocus
                        />
                    </div>
                )}


                <div className="p-6 bg-paper flex gap-3 justify-end border-t border-line">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-muted font-medium hover:bg-line rounded-xl transition-colors"
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
                            : 'bg-band hover:bg-band shadow-none disabled:opacity-50'
                            } disabled:cursor-not-allowed`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}