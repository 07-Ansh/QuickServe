'use client'

import { SERVICES } from '@/constants/services'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function ServiceGrid() {
    const router = useRouter()

    const handleSelect = (serviceId: string) => {
        // Direct Access: Go to dashboard with service pre-selected
        router.push(`/dashboard/customer?service=${serviceId}&demo=true`)
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {SERVICES.map((service) => {
                const Icon = service.icon
                return (
                    <button
                        key={service.id}
                        onClick={() => handleSelect(service.id)}
                        className={cn(
                            "flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 transition-all",
                            "hover:border-primary/50 hover:bg-blue-50/30 active:scale-[0.98] bg-white",
                            "group"
                        )}
                    >
                        <div className={cn("p-4 rounded-full mb-3", service.color)}>
                            <Icon className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">{service.name}</h3>
                        <p className="text-xs text-center text-gray-500 mt-1">{service.description}</p>
                    </button>
                )
            })}
        </div>
    )
}
