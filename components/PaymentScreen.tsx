import { useState } from "react"
import { CreditCard, Banknote, Smartphone, ShieldCheck, ArrowLeft, Loader2, Check } from "lucide-react"

interface Provider {
    id: string
    name: string
    rating: number
    price: number
}

interface Props {
    provider: Provider
    onConfirm: (method: string) => void
    onBack: () => void
}

export function PaymentScreen({ provider, onConfirm, onBack }: Props) {
    const [method, setMethod] = useState("upi")
    const [isBooking, setIsBooking] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const methods = [
        { id: "upi", name: "UPI (PhonePe/Google Pay)", icon: Smartphone, description: "Fast & Secure" },
        { id: "cash", name: "Cash on Delivery", icon: Banknote, description: "Pay after service" },
        { id: "bank", name: "Net Banking", icon: CreditCard, description: "All major banks" },
    ]

    return (
        <div className="absolute inset-x-0 bottom-0 z-[1200] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] p-6 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

            <button onClick={onBack} className="flex items-center gap-1 text-gray-500 mb-4 hover:text-black">
                <ArrowLeft className="w-4 h-4" /> Back to Providers
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Booking</h2>
            <p className="text-gray-600 mb-6">Review your selection and select payment</p>

            
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center justify-between border border-gray-100">
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Professional</p>
                    <h3 className="font-bold text-lg text-gray-900">{provider.name}</h3>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Price/Hr</p>
                    <p className="font-bold text-2xl text-black">₹{provider.price}</p>
                </div>
            </div>

            
            <div className="space-y-3 mb-8">
                <p className="text-sm font-bold text-gray-900 uppercase ml-1">Payment Method</p>
                {methods.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMethod(m.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${method === m.id
                            ? "border-black bg-gray-50 shadow-sm"
                            : "border-gray-100 hover:border-gray-300"
                            }`}
                    >
                        <div className={`p-2 rounded-lg ${method === m.id ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}>
                            <m.icon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-gray-900">{m.name}</p>
                            <p className="text-xs text-gray-500">{m.description}</p>
                        </div>
                        {method === m.id && (
                            <div className="ml-auto w-6 h-6 bg-black rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2 mb-6 text-gray-500 text-xs justify-center bg-blue-50 py-2 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Secure checkout with InstantHelp Guarantee
            </div>

            <button
                onClick={async () => {
                    setIsBooking(true)

                    await new Promise(r => setTimeout(r, 1500))
                    setIsBooking(false)
                    setIsSuccess(true)
                    await new Promise(r => setTimeout(r, 800))
                    onConfirm(method)
                }}
                disabled={isBooking || isSuccess}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-2 ${isSuccess
                    ? "bg-green-600 text-white"
                    : isBooking
                        ? "bg-gray-800 text-gray-200 cursor-not-allowed"
                        : "bg-black text-white hover:scale-[1.02] active:scale-[0.98]"
                    }`}
            >
                {isBooking ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> Finalizing Booking...</>
                ) : isSuccess ? (
                    <><Check className="w-6 h-6 animate-in zoom-in-50" /> Booking Confirmed!</>
                ) : (
                    "Confirm & Book Professional"
                )}
            </button>
        </div>
    )
}
