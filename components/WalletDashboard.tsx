'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Wallet, TrendingUp, DollarSign } from 'lucide-react'

interface WalletDashboardProps {
    providerId: string
    onClose: () => void
}

export function WalletDashboard({ providerId, onClose }: WalletDashboardProps) {
    const [earnings, setEarnings] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEarnings = async () => {
            const { data } = await supabase
                .from('requests')
                .select('id') // Just counting for now, ideally we have a price column
                .eq('provider_id', providerId)
                .eq('status', 'completed')

            if (data) {

                setEarnings(data.length * 350)
            }
            setLoading(false)
        }

        fetchEarnings()
    }, [providerId])

    return (
        <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-black text-white p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/50 hover:text-white"
                    >
                        ✕
                    </button>
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <Wallet className="w-5 h-5" />
                        <span className="text-sm font-medium">Total Balance</span>
                    </div>
                    <h2 className="text-4xl font-bold">₹{loading ? '...' : earnings}</h2>
                    <p className="text-xs text-white/60 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +12% from last week
                    </p>
                </div>

                <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm">Recent Transactions</h3>
                    <div className="space-y-3">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-full text-green-700">
                                        <DollarSign className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">Job Payment</p>
                                        <p className="text-xs text-gray-400">Today, 2:30 PM</p>
                                    </div>
                                </div>
                                <span className="font-bold text-green-600">+₹350</span>
                            </div>
                        ))}
                    </div>

                    <button className="w-full bg-black text-white font-bold py-3 rounded-xl mt-6">
                        Withdraw Funds
                    </button>
                </div>
            </div>
        </div>
    )
}
