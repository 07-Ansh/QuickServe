'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'


const QUICK_CHIPS = [
    { id: 'plumbing', label: 'Plumbing', emoji: '🚰' },
    { id: 'cleaning', label: 'Cleaning', emoji: '🧹' },
    { id: 'repair', label: 'Repairs', emoji: '🔧' },
    { id: 'electrical', label: 'Electrical', emoji: '⚡' },
]

export function HeroSearch() {
    const router = useRouter()
    const [query, setQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {

            router.push(`/dashboard/customer?search=${encodeURIComponent(query)}&demo=true`)
        }
    }

    const handleChipClick = (serviceId: string) => {
        router.push(`/dashboard/customer?service=${serviceId}&demo=true`)
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What do you need help with?"
                    className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 shadow-sm text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:shadow-md"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-primary text-white px-6 rounded-full font-medium text-sm hover:bg-blue-600 transition-colors"
                >
                    Search
                </button>
            </form>

            <div className="flex flex-wrap justify-center gap-2">
                {QUICK_CHIPS.map((chip) => (
                    <button
                        key={chip.id}
                        onClick={() => handleChipClick(chip.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-primary/50 hover:bg-blue-50/50 hover:text-primary transition-all"
                    >
                        <span>{chip.emoji}</span>
                        {chip.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
