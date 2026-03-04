import { CheckCircle2, PartyPopper } from "lucide-react"

export function BookingConfirmedOverlay() {
    return (
        <div className="absolute inset-0 z-[2000] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-2xl scale-in-center animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <CheckCircle2 className="w-14 h-14 text-green-600 animate-bounce" />
                    <div className="absolute inset-0 border-8 border-green-50 rounded-full animate-ping opacity-20"></div>
                </div>

                <h2 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h2>
                <p className="text-gray-600 mb-8 font-medium">Your professional is on their way to your location.</p>

                <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 py-3 rounded-2xl font-bold">
                    <PartyPopper className="w-5 h-5" /> Happy Helping!
                </div>
            </div>
        </div>
    )
}
