import { Wrench, Zap, Droplets, Paintbrush, Hammer, Truck } from 'lucide-react'

export const SERVICES = [
    {
        id: 'plumbing',
        name: 'Plumbing',
        icon: Droplets,
        description: 'Leak repairs, pipe fitting, and installation.',
        color: 'bg-blue-100 text-primary',
        base_price: 350,
    },
    {
        id: 'electrical',
        name: 'Electrical',
        icon: Zap,
        description: 'Wiring, switch repair, and appliance installation.',
        color: 'bg-yellow-100 text-yellow-600',
        base_price: 400,
    },
    {
        id: 'cleaning',
        name: 'Cleaning',
        icon: Paintbrush,
        description: 'Deep cleaning, dusting, and sanitization.',
        color: 'bg-green-100 text-green-600',
        base_price: 250,
    },
    {
        id: 'repair',
        name: 'General Repair',
        icon: Wrench,
        description: 'Furniture assembly and general fixes.',
        color: 'bg-gray-100 text-gray-600',
        base_price: 300,
    },
    {
        id: 'carpentry',
        name: 'Carpentry',
        icon: Hammer,
        description: 'Woodwork, furniture repair, and custom builds.',
        color: 'bg-orange-100 text-orange-600',
        base_price: 450,
    },
    {
        id: 'moving',
        name: 'Moving & Layout',
        icon: Truck,
        description: 'Heavy lifting and furniture rearrangement.',
        color: 'bg-purple-100 text-purple-600',
        base_price: 500,
    },
]
