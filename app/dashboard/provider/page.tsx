'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock, ArrowRight } from 'lucide-react'
import { supabase, isConfigured } from '@/lib/supabase/client'
import { SERVICES } from '@/constants/services'
import { calculateDistance, formatDistance, calculateETA, getTimeAgo } from '@/lib/distance'
import { RequestHistory } from '@/components/RequestHistory'



import { WalletDashboard } from '@/components/WalletDashboard'
import { ProviderHeader } from '@/components/ProviderHeader'
import { ProfileEditor } from '@/components/ProfileEditor'
import MapComponent from '@/components/MapView'
import { ProviderSignupForm } from '@/components/ProviderSignupForm'
import Link from 'next/link'

export default function ProviderDashboard() {
    const [requests, setRequests] = useState<any[]>([])
    const [showHistory, setShowHistory] = useState(false)
    const [showWallet, setShowWallet] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [isOnline, setIsOnline] = useState(false)
    const [serviceType, setServiceType] = useState<string | null>(null)
    const [providerLocation, setProviderLocation] = useState<[number, number] | null>(null)
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
    const [isOnboarded, setIsOnboarded] = useState(false)
    const [loading, setLoading] = useState(true)

    // Initial Load
    useEffect(() => {
        const checkUser = async () => {
            try {
                let user = null;
                if (isConfigured) {
                    const { data, error: authError } = await supabase.auth.getUser();
                    user = data?.user;
                }
                const isDemo = !user && window.location.search.includes('demo=true')
                const userId = user?.id || (isDemo ? 'demo-provider-456' : null)

                // Local Storage Hydration (Immediate)
                if (typeof window !== 'undefined') {
                    const cachedOnline = localStorage.getItem('provider_is_online')
                    if (cachedOnline) setIsOnline(cachedOnline === 'true')

                    const cachedType = localStorage.getItem('provider_service_type')
                    if (cachedType) {
                        setServiceType(cachedType)
                        setIsOnboarded(true)
                    }
                }

                if (userId) {
                    let profileData = null;
                    if (isConfigured) {
                        // Fetch Profile details
                        const { data, error: profileError } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', userId)
                            .single()
                        profileData = data;
                    }

                    if (profileData) {
                        setIsOnline(profileData.is_online || false) // Server state wins if available
                        localStorage.setItem('provider_is_online', String(profileData.is_online || false))

                        setServiceType(profileData.service_type)
                        if (profileData.service_type) localStorage.setItem('provider_service_type', profileData.service_type)

                        setIsOnboarded(!!profileData.service_type)
                    } else if (!isDemo) {
                        // Start Signup Flow
                        setIsOnboarded(false)
                    } else {
                        // Demo defaults
                        if (!localStorage.getItem('provider_service_type')) {
                            setServiceType('plumbing')
                            setIsOnboarded(true)
                        }
                    }
                }
                setCurrentUser({ id: userId, isDemo })
                setLoading(false)
            } catch (err) {
                console.error("Error in checkUser:", err);
                setLoading(false);
            }
        }
        checkUser()

        // Get Location
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => setProviderLocation([position.coords.latitude, position.coords.longitude]),
                (err) => console.error(err),
                { enableHighAccuracy: true }
            )
        }
    }, [])

    // Fetch Requests Loop
    useEffect(() => {
        if (!currentUser || !isOnboarded) return

        const fetchRequests = async () => {
            // STOP FETCHING IF OFFLINE
            if (!isOnline) {
                setRequests([])
                return
            }

            let data = null;
            if (isConfigured) {
                let query = supabase
                    .from('requests')
                    .select(`*, service:services!service_id(*)`)
                    .in('status', ['searching', 'found', 'arrived', 'in_progress'])
                    .order('created_at', { ascending: false })

                if (serviceType) query = query.eq('service_id', serviceType)
                const res = await query;
                data = res.data;
            }

            // Demo Simulation
            if (currentUser.isDemo || (data && data.length === 0) || !isConfigured) {

                // GENERATE 2-3 RANDOM ORDERS
                const now = new Date()
                const baseLocation = providerLocation || [28.6139, 77.2090]

                const allDemoRequests = [
                    {
                        id: 'demo-req-1', service_id: 'plumbing', status: 'searching',
                        lat: baseLocation[0] + (Math.random() * 0.01 - 0.005),
                        lng: baseLocation[1] + (Math.random() * 0.01 - 0.005),
                        address: '123 Green Park, Main Market', notes: 'Urgent: Kitchen sink leaking badly.', created_at: new Date(now.getTime() - Math.random() * 100000).toISOString(),
                        service: { name: 'Plumbing', base_price: 350 }
                    },
                    {
                        id: 'demo-req-2', service_id: 'electrical', status: 'searching',
                        lat: baseLocation[0] + (Math.random() * 0.01 - 0.005),
                        lng: baseLocation[1] + (Math.random() * 0.01 - 0.005),
                        address: '456 Sector 15, Tower B', notes: 'Power socket not working.', created_at: new Date(now.getTime() - Math.random() * 100000).toISOString(),
                        service: { name: 'Electrical', base_price: 400 }
                    },
                    {
                        id: 'demo-req-3', service_id: 'cleaning', status: 'searching',
                        lat: baseLocation[0] + (Math.random() * 0.01 - 0.005),
                        lng: baseLocation[1] + (Math.random() * 0.01 - 0.005),
                        address: '789 Hauz Khas Village', notes: 'Full house cleaning required.', created_at: new Date(now.getTime() - Math.random() * 100000).toISOString(),
                        service: { name: 'Cleaning', base_price: 500 }
                    },
                    {
                        id: 'demo-req-4', service_id: 'repair', status: 'searching',
                        lat: baseLocation[0] + (Math.random() * 0.01 - 0.005),
                        lng: baseLocation[1] + (Math.random() * 0.01 - 0.005),
                        address: 'Plot 21, Mehrauli Road', notes: 'Door lock broken.', created_at: new Date(now.getTime() - Math.random() * 100000).toISOString(),
                        service: { name: 'General Repair', base_price: 300 }
                    },
                    {
                        id: 'demo-req-5', service_id: 'plumbing', status: 'searching',
                        lat: baseLocation[0] + (Math.random() * 0.01 - 0.005),
                        lng: baseLocation[1] + (Math.random() * 0.01 - 0.005),
                        address: 'B-Block, Vasant Vihar', notes: 'Bathroom pipe burst.', created_at: new Date(now.getTime() - Math.random() * 100000).toISOString(),
                        service: { name: 'Plumbing', base_price: 450 }
                    }
                ]

                // Filter by service if set, else show random mix
                let filtered = serviceType
                    ? allDemoRequests.filter(r => r.service_id === serviceType)
                    : allDemoRequests

                // Shuffle and pick 2-3
                filtered = filtered.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 2) // 2 or 3

                setRequests(filtered)
            } else if (data) {
                setRequests(data)
            }
        }

        fetchRequests()

        if (!currentUser.isDemo && isOnline) {
            const channel = supabase.channel('public:requests')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'requests' }, fetchRequests)
                .subscribe()
            return () => { supabase.removeChannel(channel) }
        }
    }, [currentUser, isOnboarded, serviceType, providerLocation, isOnline])

    const handleUpdateStatus = async (request: any, newStatus: string) => {
        if (!currentUser) return

        // In-App Navigation is now handled by the MapComponent highlighting the route.
        // We removed the auto-redirect to Google Maps.

        const updateData: any = { status: newStatus }
        if (newStatus === 'found') updateData.provider_id = currentUser.id

        if (currentUser.isDemo) {
            setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: newStatus } : r))
            return
        }

        await supabase.from('requests').update(updateData).eq('id', request.id)
    }

    const handleToggleOnline = async () => {
        const newStatus = !isOnline
        setIsOnline(newStatus)
        localStorage.setItem('provider_is_online', String(newStatus))

        if (currentUser && !currentUser.isDemo) {
            await supabase
                .from('profiles')
                .update({ is_online: newStatus, updated_at: new Date().toISOString() })
                .eq('id', currentUser.id)
        }
    }

    // Calculate Active Route
    const activeRequest = requests.find(r => ['found', 'arrived', 'in_progress'].includes(r.status))
    const route = (activeRequest && providerLocation && activeRequest.lat && activeRequest.lng)
        ? [providerLocation, [activeRequest.lat, activeRequest.lng]] as [number, number][]
        : undefined

    if (loading) return <div className="flex items-center justify-center h-screen bg-gray-50">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
            <ProviderHeader
                isOnline={isOnline}
                onToggleOnline={handleToggleOnline}
                onOpenHistory={() => setShowHistory(true)}
                onOpenWallet={() => setShowWallet(true)}
            />

            <div className="flex-1 flex overflow-hidden relative">
                {/* LEFT: Map */}
                <div className="w-2/3 h-full relative">
                    <MapComponent
                        center={providerLocation || [28.6139, 77.2090]}
                        markers={[
                            { id: 'me', position: providerLocation || [28.6139, 77.2090], title: 'You', icon: 'provider' },
                            ...requests.map(r => ({
                                id: r.id,
                                position: [r.lat, r.lng] as [number, number],
                                title: r.service?.name || 'Request',
                                icon: 'customer'
                            }))
                        ]}
                        route={route}
                        onMarkerClick={setSelectedRequestId}
                    />

                    {/* Map Overlays */}
                </div>

                {/* RIGHT: Sidebar */}
                <div className="w-1/3 p-4 pl-2 overflow-y-auto bg-gray-50 border-l border-gray-100/50">
                    <div className="space-y-4 max-w-md mx-auto h-full flex flex-col">
                        {!isOnboarded ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full overflow-hidden">
                                <ProviderSignupForm
                                    userId={currentUser?.id}
                                    onComplete={() => window.location.reload()}
                                />
                            </div>
                        ) : (
                            <>
                                {/* Main Status Card */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 w-full shadow-sm flex-1 flex flex-col relative overflow-hidden min-h-[400px]">
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                                        <div>
                                            <h2 className="font-bold text-xl text-gray-900 tracking-tight">
                                                {isOnline ? (requests.length > 0 ? 'Incoming Jobs' : 'Finding Work...') : 'You are Offline'}
                                            </h2>
                                            <p className="text-xs text-gray-400 font-medium mt-1">
                                                {isOnline ? (requests.length > 0 ? 'Action required' : 'Scanning your area') : 'Go online to receive jobs'}
                                            </p>
                                        </div>
                                        {isOnline && requests.length > 0 && (
                                            <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                                                {requests.length} New
                                            </span>
                                        )}
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 overflow-y-auto -mx-2 px-2 custom-scrollbar">
                                        {requests.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                                {isOnline ? (
                                                    <>
                                                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 relative">
                                                            <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-30"></div>
                                                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                        </div>
                                                        <h3 className="text-gray-900 font-bold mb-2">Scanning for requests...</h3>
                                                        <p className="text-gray-500 text-sm max-w-[200px]">We'll notify you when a customer nearby needs help.</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-3xl shadow-inner">
                                                            😴
                                                        </div>
                                                        <h3 className="text-gray-900 font-bold mb-2">You are currently Offline</h3>
                                                        <p className="text-gray-500 text-sm max-w-[200px] mx-auto">Toggle the status button above to go online and start earning.</p>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-4 pb-4">
                                                {requests.filter(req => {
                                                    // If there's ANY active job, only show THAT job
                                                    if (activeRequest) {
                                                        return req.id === activeRequest.id
                                                    }
                                                    // Otherwise show all "searching" jobs
                                                    return req.status === 'searching'
                                                }).map(req => {
                                                    const distance = (providerLocation && req.lat && req.lng)
                                                        ? calculateDistance(providerLocation[0], providerLocation[1], req.lat, req.lng)
                                                        : 0

                                                    return (
                                                        <div
                                                            key={req.id}
                                                            onClick={() => setSelectedRequestId(req.id)}
                                                            className={`bg-white p-4 rounded-xl border transition-all hover:shadow-md ${selectedRequestId === req.id ? 'border-black ring-1 ring-black shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">{req.service?.name}</span>
                                                                <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs">₹{req.service?.base_price || 350}</span>
                                                            </div>
                                                            <h3 className="font-bold text-gray-900 truncate mb-1">{req.address}</h3>
                                                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {formatDistance(distance)}</span>
                                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {getTimeAgo(req.created_at)}</span>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="mt-2 flex gap-2">
                                                                {req.status === 'searching' && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(req, 'found') }}
                                                                        className="w-full bg-black text-white py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm"
                                                                    >
                                                                        Accept Interest
                                                                    </button>
                                                                )}
                                                                {req.status === 'found' && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleUpdateStatus(req, 'arrived')
                                                                        }}
                                                                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 text-sm hover:bg-blue-700 shadow-sm"
                                                                    >
                                                                        Mark Arrived
                                                                    </button>
                                                                )}
                                                                {req.status === 'arrived' && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleUpdateStatus(req, 'in_progress')
                                                                        }}
                                                                        className="w-full bg-yellow-500 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 text-sm hover:bg-yellow-600 shadow-sm"
                                                                    >
                                                                        Start Job
                                                                    </button>
                                                                )}
                                                                {req.status === 'in_progress' && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleUpdateStatus(req, 'completed')
                                                                        }}
                                                                        className="w-full bg-green-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 text-sm hover:bg-green-700 shadow-sm"
                                                                    >
                                                                        Complete Job
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Quick Actions */}
                                <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
                                    <button
                                        onClick={() => setShowHistory(true)}
                                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all text-sm font-bold text-gray-700 flex items-center justify-center gap-2 group"
                                    >
                                        <span className="group-hover:scale-110 transition-transform">📜</span> View History
                                    </button>
                                    <button
                                        onClick={() => setShowWallet(true)}
                                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all text-sm font-bold text-gray-700 flex items-center justify-center gap-2 group"
                                    >
                                        <span className="group-hover:scale-110 transition-transform">💰</span> View Wallet
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals & Overlays */}
            {showWallet && currentUser && <WalletDashboard providerId={currentUser.id} onClose={() => setShowWallet(false)} />}
            {showHistory && currentUser && <RequestHistory userId={currentUser.id} role="provider" onClose={() => setShowHistory(false)} />}
        </div>
    )
}
