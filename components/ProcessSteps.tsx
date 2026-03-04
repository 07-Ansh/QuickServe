'use client'

import { MapPin, Zap, UserCheck } from 'lucide-react'

const STEPS = [
    {
        icon: MapPin,
        title: "1. Request",
        description: "Tell us what you need. We instantly create a 3km geofence around you.",
    },
    {
        icon: Zap,
        title: "2. Auto-Match",
        description: "Our engine locates and locks the nearest available pro in milliseconds.",
    },
    {
        icon: UserCheck,
        title: "3. Arrive",
        description: "Track your helper in real-time. Delivery within 15 minutes.",
    },
]

export function ProcessSteps() {
    return (
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
            {STEPS.map((step, index) => {
                const Icon = step.icon
                return (
                    <div key={index} className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-2">
                            <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">{step.title}</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            {step.description}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}
