import { cn } from "@/lib/utils"
import { Loader2, CheckCircle2, MapPin, User } from "lucide-react"

type Status = 'searching' | 'found' | 'arrived' | 'completed'

interface Props {
    status: Status
    providerName?: string
    eta?: string
    message?: string
    onBook?: () => void
    paymentMethod?: string
    price?: number
}

export function RequestStatusCard({ status, providerName, eta, message, onBook, paymentMethod, price }: Props) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 w-full shadow-sm">
            {status === 'searching' && (
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-30"></div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Finding a Helper...</h3>
                    <p className="text-gray-700 text-sm mt-1 font-medium">{message || "Checking nearby professionals for you."}</p>

                    {onBook && (
                        <button
                            onClick={onBook}
                            className="mt-4 w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md"
                        >
                            Book First Available
                        </button>
                    )}
                </div>
            )}

            {(status === 'found' || status === 'arrived') && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[10px] text-green-700 font-black uppercase tracking-widest mb-1">Order Confirmed</p>
                            <h3 className="font-bold text-lg text-blue-700 flex items-center gap-2 leading-tight">
                                {status === 'found' ? 'On the way' : 'Arriving at your location soon'}
                            </h3>
                        </div>
                        <div className="flex flex-col items-end">
                            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest mb-1">Arriving In</p>
                            <div className="px-3 py-1 bg-black text-white rounded-lg font-bold text-sm tabular-nums">
                                {eta}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 border-t pt-4 border-gray-100">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm font-bold text-gray-400">
                            {providerName ? providerName[0] : 'P'}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 leading-tight">{providerName}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-700 mt-1 font-medium">
                                <MapPin className="w-3 h-3" />
                                <span>{status === 'found' ? 'Traveling to you' : 'Arriving at destination'}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-700 uppercase font-bold tracking-wider">Payment</p>
                            <p className="font-bold text-sm text-gray-900 uppercase">{paymentMethod || 'UPI'}</p>
                            {price && <p className="text-xs text-blue-600 font-bold">₹{price}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
