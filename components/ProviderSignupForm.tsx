'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User, Mail, Briefcase, Save } from 'lucide-react'

interface ProviderSignupFormProps {
    userId: string
    onComplete: () => void
}

export function ProviderSignupForm({ userId, onComplete }: ProviderSignupFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        bio: '',
        service_type: ''
    })

    const handleSave = async () => {
        if (!formData.service_type || !formData.full_name) {
            alert("Please fill in your Name and Service Type")
            return
        }

        setLoading(true)


        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                role: 'provider',
                ...formData,
                updated_at: new Date().toISOString()
            })

        setLoading(false)

        if (error) {
            console.error(error)
            alert("Failed to create profile. Please try again.")
        } else {
            onComplete()
        }
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Become a Provider</h2>
                <p className="text-sm text-gray-500 mt-1">Join QuickServe to start earning.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={formData.full_name}
                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Service Category</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <select
                            value={formData.service_type}
                            onChange={e => setFormData({ ...formData, service_type: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none bg-white appearance-none transition-all"
                        >
                            <option value="">Select a Profession...</option>
                            <option value="plumbing">Plumber</option>
                            <option value="electrical">Electrician</option>
                            <option value="cleaning">Cleaner</option>
                            <option value="repair">Repair Specialist</option>
                            <option value="carpentry">Carpenter</option>
                            <option value="moving">Mover</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Experience / Bio</label>
                    <textarea
                        placeholder="Tell customers about your experience..."
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none h-32 resize-none transition-all"
                    />
                </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-70 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                    {loading ? 'Creating Profile...' : <><Save className="w-5 h-5" /> Start Accepting Jobs</>}
                </button>
            </div>
        </div>
    )
}
