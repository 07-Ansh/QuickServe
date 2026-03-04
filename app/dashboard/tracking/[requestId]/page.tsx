'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { MapPin, Clock, Phone, MessageSquare, ArrowLeft, Star, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function TrackingPage() {
    const { requestId } = useParams()
    const router = useRouter()
    const [request, setRequest] = useState<any>(null)
    const [eta, setEta] = useState<number>(300) // Default 5 mins
    const [status, setStatus] = useState<string>('found')


    console.log(status)

    useEffect(() => {
        const fetchRequest = async () => {
            if (!requestId || requestId.toString().startsWith('local-')) {
                console.log('Demo Mode: Using mock request data for tracking')
                return
            }
            const { data, error } = await supabase
                .from('requests')
                .select('*, profiles!provider_id(full_name, rating)')
                .eq('id', requestId)
                .single()

            if (data) {
                setRequest(data)

                setEta(300)
            }
        }
        fetchRequest()
    }, [requestId])


    useEffect(() => {
        const timer = setInterval(() => {
            setEta(prev => {
                if (prev <= 1) {
                    setStatus('arrived')
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const formatEta = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            
            <div className="bg-white p-4 flex items-center gap-4 shadow-sm">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-900" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Track Professional</h1>
            </div>

            <main className="flex-1 p-6 flex flex-col items-center">
                
                <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl mb-6 relative overflow-hidden border border-gray-100">
                    <div className="text-center mb-8">
                        <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Live Arrival Status</p>
                        <div className="flex items-center justify-center gap-3">
                            <Clock className="w-8 h-8 text-black animate-pulse" />
                            <h2 className="text-6xl font-black text-gray-900 tabular-nums tracking-tighter">
                                {formatEta(eta)}
                            </h2>
                        </div>
                        <p className="text-gray-400 font-bold mt-2 text-sm">minutes remaining</p>
                    </div>

                    
                    <div className="relative h-40 w-full bg-blue-50/30 rounded-3xl border-2 border-dashed border-blue-100 flex items-center overflow-hidden">
                        
                        <div className="absolute left-6 z-10 flex flex-col items-center gap-1">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                                <Clock className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold text-blue-400 uppercase">Provider</span>
                        </div>

                        
                        <div className="absolute right-6 z-10 flex flex-col items-center gap-1">
                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white shadow-lg">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">You</span>
                        </div>

                        
                        <div className="absolute left-16 right-16 h-2 bg-blue-100 rounded-full" />

                        
                        <div
                            className="absolute flex flex-col items-center transition-all duration-1000 ease-linear"
                            style={{
                                left: `${((300 - eta) / 300) * 60 + 20}%`,
                                transform: 'translateY(-50%)',
                                top: '50%'
                            }}
                        >
                            <div className="relative">
                                
                                <div className="w-16 h-16 bg-white rounded-2xl border-4 border-blue-600 shadow-xl flex items-center justify-center overflow-hidden animate-bounce">
                                    <span className="text-3xl">🏃‍♂️</span>
                                </div>
                                
                                <div className="absolute -inset-4 bg-blue-400 rounded-full animate-ping opacity-10"></div>
                            </div>
                            <p className="text-[10px] font-black text-blue-700 mt-2 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                COMING TO YOU
                            </p>
                        </div>
                    </div>
                </div>

                
                <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400 border-2 border-white shadow-sm">
                            {request?.profiles?.full_name?.[0] || 'P'}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{request?.profiles?.full_name || 'Professional'}</h3>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="flex items-center gap-1 text-yellow-600 font-bold">
                                    <Star className="w-3 h-3 fill-yellow-600" /> {request?.profiles?.rating || '4.8'}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500 font-medium">Verified Expert</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                <Phone className="w-5 h-5 text-gray-700" />
                            </button>
                            <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                <MessageSquare className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm font-medium">Payment Method</span>
                            <span className="font-bold text-gray-900 uppercase">{request?.payment_method || 'UPI'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm font-medium">Total Amount</span>
                            <span className="text-xl font-black text-gray-900">₹{request?.total_amount || '350'}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-2 text-gray-400 text-sm font-medium">
                    <ShieldCheck className="w-4 h-4 text-blue-500" /> Safe & Secure with InstantHelp
                </div>
            </main>
        </div>
    )
}
