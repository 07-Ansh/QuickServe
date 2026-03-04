'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User, Phone, Save } from 'lucide-react'

interface ProfileEditorProps {
    userId: string
    role: 'customer' | 'provider'
    onClose: () => void
}

export function ProfileEditor({ userId, role, onClose }: ProfileEditorProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        bio: '',
        service_type: ''
    })

    useEffect(() => {
        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (data) {
                setFormData({
                    full_name: data.full_name || '',
                    phone_number: data.phone_number || '',
                    bio: data.bio || '',
                    service_type: data.service_type || ''
                })
            } else {

                setFormData({
                    full_name: role === 'customer' ? 'Demo Customer' : 'Rajesh Kumar',
                    phone_number: '+91 98765 43210',
                    bio: role === 'provider' ? 'Experienced professional with 5 years of service.' : '',
                    service_type: role === 'provider' ? 'plumbing' : ''
                })
            }
        }
        fetchProfile()
    }, [userId, role])

    const handleSave = async () => {
        setLoading(true)


        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                role: role,
                ...formData,
                updated_at: new Date().toISOString()
            })

        setLoading(false)

        if (error) {
            console.error(error)
            alert("Failed to save profile (Demo mode restricted?)")
        } else {
            alert("Profile updated!")
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-lg">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black">✕</button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.phone_number}
                                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                            />
                        </div>
                    </div>

                    {role === 'provider' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service Type</label>
                                <select
                                    value={formData.service_type}
                                    onChange={e => setFormData({ ...formData, service_type: e.target.value })}
                                    className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-black outline-none bg-white"
                                >
                                    <option value="">Select a Service...</option>
                                    <option value="plumbing">Plumbing</option>
                                    <option value="electrical">Electrical</option>
                                    <option value="cleaning">Cleaning</option>
                                    <option value="repair">General Repair</option>
                                    <option value="carpentry">Carpentry</option>
                                    <option value="moving">Moving & Layout</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio / Experience</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-black outline-none h-24 resize-none"
                                />
                            </div>
                        </>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    )
}
