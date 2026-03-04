'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Calendar, MapPin, Clock, CheckCircle } from 'lucide-react'
import { SERVICES } from '@/constants/services'

interface RequestHistoryProps {
    userId: string
    role: 'customer' | 'provider'
    onClose: () => void
}

export function RequestHistory({ userId, role, onClose }: RequestHistoryProps) {
    const [requests, setRequests] = useState<Record<string, any>[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            const query = supabase
                .from('requests')
                .select('*')
                .eq(role === 'customer' ? 'customer_id' : 'provider_id', userId)
                .in('status', ['completed', 'cancelled'])
                .order('created_at', { ascending: false })

            const { data } = await query

            if (data) {
                setRequests(data)
            }
            setLoading(false)
        }

        fetchHistory()
    }, [userId, role])

    return (
        <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-white w-full md:max-w-md h-[80vh] md:h-auto md:max-h-[80vh] rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-bold text-xl">Past Bookings</h2>
                    <button
                        onClick={onClose}
                        className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Loading history...</div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 flex flex-col items-center gap-2">
                            <Calendar className="w-10 h-10 opacity-20" />
                            <p>No past bookings found.</p>
                        </div>
                    ) : (
                        requests.map((req) => {
                            const service = SERVICES.find(s => s.id === req.service_id)
                            const date = new Date(req.created_at).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                            })

                            return (
                                <div key={req.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-full ${service?.color || 'bg-gray-200'}`}>
                                                {/* Icon placeholder if needed */}
                                                <div className="w-4 h-4 bg-black/10 rounded-full" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{service?.name || req.service_id}</h3>
                                                <span className="text-xs text-gray-500">{date}</span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${req.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 pl-1">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> New Delhi
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {req.status === 'completed' && (
                                            <span className="ml-auto flex items-center gap-1 text-green-600 font-bold">
                                                <CheckCircle className="w-3 h-3" /> ₹350
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
