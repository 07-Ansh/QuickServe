'use client'

import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center animate-pulse"><p className="text-gray-400">Loading Map...</p></div>
})

export default MapComponent
