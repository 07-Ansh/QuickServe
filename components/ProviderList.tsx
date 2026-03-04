import { Star, MapPin, BadgeCheck, Clock } from "lucide-react"

interface Provider {
    id: string
    name: string
    rating: number
    price: number
    distance: string
    image?: string
}

interface Props {
    providers: Provider[]
    onSelect: (providerId: string) => void
    onClose: () => void
}

export function ProviderList({ providers, onSelect, onClose }: Props) {
    return (
        <div className="absolute inset-x-0 bottom-0 z-[1100] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Available Professionals</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-900">Close</button>
            </div>

            <div className="space-y-4">
                {providers.map((provider) => (
                    <div key={provider.id} className="border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-black transition-colors shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex-shrink-0 overflow-hidden">

                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xl font-bold text-gray-500">
                                {provider.name[0]}
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-1">
                                    {provider.name}
                                    <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-100" />
                                </h3>
                                <span className="font-bold text-lg text-gray-900">₹{provider.price}</span>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1 text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded font-medium">
                                    <Star className="w-3 h-3 fill-yellow-600" /> {provider.rating}
                                </span>
                                <span className="flex items-center gap-1 font-medium">
                                    <MapPin className="w-3 h-3" /> {provider.distance}
                                </span>
                                <span className="flex items-center gap-1 font-medium">
                                    <Clock className="w-3 h-3" /> {Math.max(2, Math.round(parseFloat(provider.distance) * 2.5))} mins
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => onSelect(provider.id)}
                            className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                        >
                            Book
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
