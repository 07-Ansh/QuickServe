'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import MapComponent from '@/components/MapView' // Dynamic import
import { RequestStatusCard } from '@/components/RequestStatusCard'
import { ProviderList } from '@/components/ProviderList'
import { PaymentScreen } from '@/components/PaymentScreen'
import { SERVICES } from '@/constants/services'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { supabase, isConfigured } from '@/lib/supabase/client'

// ... (previous imports)
import { ChatComponent } from '@/components/ChatComponent'
import { ReviewComponent } from '@/components/ReviewComponent'
import { RequestHistory } from '@/components/RequestHistory'
import { ProfileEditor } from '@/components/ProfileEditor'
import { BookingConfirmedOverlay } from '@/components/BookingConfirmedOverlay'
import { MessageSquare, Star, User } from 'lucide-react'

function DashboardContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const serviceId = searchParams.get('service')
    const service = SERVICES.find(s => s.id === serviceId)

    const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'arrived' | 'in_progress' | 'completed'>('idle')
    const [requestId, setRequestId] = useState<string | null>(null)
    const [showChat, setShowChat] = useState(false)
    const [showReview, setShowReview] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const [showProviderList, setShowProviderList] = useState(false)
    const [showPayment, setShowPayment] = useState(false)
    const [showConfirmed, setShowConfirmed] = useState(false)
    const [selectedProvider, setSelectedProvider] = useState<any>(null)
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    const [eta, setEta] = useState<number | null>(null)
    const [nearbyProviders, setNearbyProviders] = useState<any[]>([])

    // Get Real-Time Location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude])
                },
                (error) => console.error('Location error:', error),
                { enableHighAccuracy: true }
            )
        }
    }, [])

    // Generate Simulated Providers near User
    useEffect(() => {
        if (userLocation) {
            const [lat, lng] = userLocation
            const providers = [
                { id: 'p1', position: [lat + 0.002, lng + 0.002], title: 'Available Pro', name: 'Rahul Singh', rating: 4.8, price: 350, distance: '0.8 km' },
                { id: 'p2', position: [lat - 0.003, lng + 0.001], title: 'Available Pro', name: 'Amit Verma', rating: 4.6, price: 300, distance: '1.2 km' },
                { id: 'p3', position: [lat + 0.001, lng - 0.003], title: 'Available Pro', name: 'Suresh Kumar', rating: 4.9, price: 450, distance: '1.5 km' },
            ]
            setNearbyProviders(providers)
        }
    }, [userLocation])

    // 1. Create Request on Mount
    useEffect(() => {
        if (!serviceId) return

        const createRequest = async () => {
            // Get User (Real or Demo)
            let user = null;
            if (isConfigured) {
                const { data } = await supabase.auth.getUser();
                user = data?.user;
            }

            // Check for Demo Mode flag or missing config
            const isDemo = !user && window.location.search.includes('demo=true')
            const userId = user?.id || (isDemo ? 'demo-customer-123' : null)

            setCurrentUser({ id: userId, isDemo })

            if (!userId) {
                // Redirect if not logged in
                window.location.href = '/login'
                return
            }

            setStatus('searching')

            if (isConfigured) {
                const { data, error } = await supabase
                    .from('requests')
                    .insert({
                        service_id: serviceId,
                        customer_id: userId, // REAL or DEMO ID
                        status: 'searching',
                        lat: 28.6139,
                        lng: 77.2090
                    })
                    .select()
                    .single()

                if (error) {
                    if (!isDemo) {
                        console.error('Error creating request:', error)
                    } else {
                        console.warn('Demo Mode: Running offline simulation.', error.message)
                    }
                    // Fallback for Demo Mode to ensure redirect works
                    const fallbackId = 'local-' + Math.random().toString(36).substring(2, 9)
                    console.log('Using fallback Request ID:', fallbackId)
                    setRequestId(fallbackId)
                } else if (data) {
                    console.log('Request created successfully:', data.id)
                    setRequestId(data.id)
                }
            } else {
                console.warn('Supabase not configured: Running offline simulation.')
                const fallbackId = 'local-' + Math.random().toString(36).substring(2, 9)
                console.log('Using fallback Request ID:', fallbackId)
                setRequestId(fallbackId)
            }
        }

        createRequest()
    }, [serviceId])

    // 2. Subscribe to Realtime Updates
    useEffect(() => {
        if (!requestId) return

        const channel = supabase
            .channel(`request-${requestId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'requests',
                    filter: `id=eq.${requestId}`
                },
                (payload) => {
                    const newStatus = payload.new.status
                    if (newStatus) {
                        setStatus(newStatus as any)
                        if (newStatus === 'completed') {
                            setShowReview(true)
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [requestId])

    // 3. Simulation Engine (For Demo or Fallback)
    useEffect(() => {
        if (!requestId) return // Run for EVERYONE to ensure "Always Available"

        const isLocal = requestId.startsWith('local-')

        // Auto-Match after 15s (if user hasn't chosen)
        if (status === 'searching' && !showPayment && !selectedProvider) {
            const timer = setTimeout(async () => {
                if (isLocal) {
                    setStatus('found')
                } else {
                    await supabase.from('requests').update({ status: 'found', provider_id: 'bot-provider' }).eq('id', requestId)
                }
                setEta(540)
            }, isLocal ? 3000 : 10000)
            return () => clearTimeout(timer)
        }

        // Auto-Arrive after 10s (Simulate travel)
        if (status === 'found') {
            const timer = setTimeout(async () => {
                if (isLocal) {
                    setStatus('arrived')
                } else {
                    await supabase.from('requests').update({ status: 'arrived' }).eq('id', requestId)
                }
            }, isLocal ? 5000 : 10000)
            return () => clearTimeout(timer)
        }

    }, [status, requestId, currentUser])

    // ETA Countdown
    useEffect(() => {
        if (!eta || eta <= 0) return
        const timer = setInterval(() => setEta(prev => (prev && prev > 0 ? prev - 1 : 0)), 1000)
        return () => clearInterval(timer)
    }, [eta])

    const formatEta = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}m ${secs}s`
    }

    const handleLocationSelect = async (lat: number, lng: number) => {
        if (!requestId) return

        // 2. Update Supabase
        const { error } = await supabase
            .from('requests')
            .update({ lat, lng })
            .eq('id', requestId)

        if (error) {
            console.error("Failed to update location:", error)
        }
    }

    const handleProviderSelect = (providerId: string) => {
        const provider = nearbyProviders.find(p => p.id === providerId)
        if (provider) {
            setSelectedProvider(provider)
            setShowProviderList(false)
            setShowPayment(true)
        }
    }

    const handleConfirmBooking = async (method: string) => {
        console.log('Confirming booking...', { requestId, selectedProvider, method })
        if (!requestId || !selectedProvider) {
            const errorMsg = `Cannot confirm: ${!requestId ? 'Missing requestId' : 'Missing provider'}`
            console.error(errorMsg, { requestId, selectedProvider })
            alert(errorMsg + ". Please wait a moment and try again.")
            return
        }

        setPaymentMethod(method)
        setShowPayment(false)
        setShowConfirmed(true)

        // Hide success overlay after 2s and redirect
        setTimeout(() => {
            setShowConfirmed(false)
            router.push(`/dashboard/tracking/${requestId}`)
        }, 2000)

        // Finalize in DB
        await supabase.from('requests').update({
            status: 'found',
            provider_id: selectedProvider.id,
            total_amount: selectedProvider.price,
            payment_method: method
        }).eq('id', requestId)

        setStatus('found')
        setEta(540)
    }

    const handleMarkerClick = async (id: string) => {
        handleProviderSelect(id) // Route marker clicks through selection flow
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar Placeholder/gap if needed - assuming globbal layout handles nav, but we need height calc */}

            <div className="flex-1 flex max-h-[calc(100vh-64px)] overflow-hidden">
                {/* LEFT: Map Box */}
                <div className="w-2/3 p-4 pr-2">
                    <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative">
                        {/* Map Header Overlay */}
                        <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2">
                            <Link href="/" className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 text-gray-900">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            {service && (
                                <div className="bg-white px-4 py-2 rounded-full shadow-md font-medium text-sm text-gray-900 border border-gray-200">
                                    Looking for: <span className="text-primary font-bold">{service.name}</span>
                                </div>
                            )}
                        </div>

                        <MapComponent
                            center={userLocation || [28.6139, 77.2090]}
                            markers={[
                                { id: 'user', position: userLocation || [28.6139, 77.2090], title: 'You' },
                                ...nearbyProviders.map(p => ({ ...p, icon: 'provider-idle', title: 'Click to Book' })),
                                ...(status === 'found' || status === 'arrived' ? [{ id: 'provider', position: [28.6200, 77.2100], title: 'Provider' } as any] : [])
                            ]}
                            onLocationSelect={handleLocationSelect}
                            onMarkerClick={handleMarkerClick}
                        />
                    </div>
                </div>

                {/* RIGHT: Controls Sidebar */}
                <div className="w-1/3 p-4 pl-2 overflow-y-auto bg-gray-50 border-l border-gray-100/50">
                    <div className="space-y-4 max-w-md mx-auto">

                        {/* Status / Booking Card */}
                        {status !== 'idle' && (
                            <RequestStatusCard
                                status={status as any}
                                providerName={selectedProvider?.name || "Service Provider"}
                                eta={eta ? formatEta(eta) : "Calculating..."}
                                message={status === 'searching' ? "3 Service Providers Nearby" : undefined}
                                onBook={() => setShowProviderList(true)}
                                paymentMethod={paymentMethod || undefined}
                                price={selectedProvider?.price}
                            />
                        )}



                        {/* Payment (Inline) */}
                        {showPayment && selectedProvider && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-4">
                                <h3 className="font-semibold text-gray-900 mb-4">Confirm Booking</h3>
                                <PaymentScreen
                                    provider={selectedProvider}
                                    onConfirm={handleConfirmBooking}
                                    onBack={() => {
                                        setShowPayment(false)
                                        setShowProviderList(true)
                                    }}
                                />
                            </div>
                        )}

                        {/* History Button (Moved to sidebar) */}
                        <button
                            onClick={() => setShowHistory(true)}
                            className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <span>📜</span> View Request History
                        </button>
                    </div>
                </div>
            </div>


            {/* Overlays that still need to be absolute (Modals) */}

            {/* Confirmation Success Overlay */}
            {showConfirmed && <BookingConfirmedOverlay />}

            {/* Chat Button (Floating over map? Or in sidebar?) -> Let's keep it floating for now but maybe better in sidebar using standard UI */}
            {/* Floating on bottom right of screen might overlap sidebar. Let's position it absolute to the screen safely. */}
            {(status === 'arrived' || status === 'found' || status === 'in_progress') && (
                <button
                    onClick={() => setShowChat(!showChat)}
                    className="fixed bottom-8 right-8 z-[2000] bg-black text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
            )}

            {/* Chat Overlay */}
            {showChat && requestId && currentUser && (
                <div className="fixed bottom-24 right-8 z-[2000] w-80 shadow-2xl rounded-xl animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <ChatComponent
                        requestId={requestId}
                        senderId={currentUser.id}
                        receiverName="Rajesh Kumar"
                    />
                </div>
            )}

            {/* Profile Overlay */}
            {showProfile && currentUser && (
                <ProfileEditor
                    userId={currentUser.id}
                    role="customer"
                    onClose={() => setShowProfile(false)}
                />
            )}

            {/* Review Overlay */}
            {showReview && requestId && currentUser && (
                <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <ReviewComponent
                        requestId={requestId}
                        providerId="provider-id-placeholder"
                        customerId={currentUser.id}
                        onSubmitted={() => {
                            setShowReview(false)
                            setStatus('idle')
                            alert("Service Completed!")
                        }}
                    />
                </div>
            )}

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold">Request History</h3>
                            <button onClick={() => setShowHistory(false)}>×</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <RequestHistory
                                userId={currentUser?.id}
                                role="customer"
                                onClose={() => setShowHistory(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Provider Selection Modal (Popup) */}
            {showProviderList && (
                <div className="fixed inset-0 z-[2000] bg-black/50 flex items-end md:items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Available Service Providers</h3>
                                <p className="text-xs text-gray-500">Select a verified expert to proceed</p>
                            </div>
                            <button
                                onClick={() => setShowProviderList(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0">
                            <ProviderList
                                providers={nearbyProviders}
                                onSelect={handleProviderSelect}
                                onClose={() => setShowProviderList(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default function CustomerDashboard() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <DashboardContent />
        </Suspense>
    )
}
