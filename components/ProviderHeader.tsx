'use client'


import { Wallet, History, Wrench } from 'lucide-react'
import Link from 'next/link'

interface ProviderHeaderProps {

    isOnline: boolean
    onToggleOnline: () => void
    onOpenHistory: () => void
    onOpenWallet: () => void
}

export function ProviderHeader({ isOnline, onToggleOnline, onOpenHistory, onOpenWallet }: ProviderHeaderProps) {

    return (
        <div className="bg-white text-gray-900 px-6 py-4 sticky top-0 z-50 border-b border-gray-100">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <Link href="/" className="font-bold text-lg md:text-xl tracking-tight flex items-center gap-2 text-white">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white text-black rounded-xl flex items-center justify-center">
                            <Wrench className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <span className="hidden sm:inline">QuickServe</span>
                        <span className="text-white/60 font-medium text-sm hidden sm:inline ml-2">Provider</span>
                    </Link>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3">
                    <button
                        onClick={onOpenWallet}
                        className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors hover:text-gray-900"
                        title="Wallet"
                    >
                        <Wallet className="w-5 h-5" />
                    </button>

                    <button
                        onClick={onOpenHistory}
                        className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors hover:text-gray-900"
                        title="History"
                    >
                        <History className="w-5 h-5" />
                    </button>

                    <button
                        onClick={onToggleOnline}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isOnline
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                            }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </button>
                </div>
            </div>
        </div>
    )
}
