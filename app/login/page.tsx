'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { cn } from '@/lib/utils'
import { supabase, isConfigured } from '@/lib/supabase/client'
import { ArrowLeft, Mail, Loader2, AlertTriangle } from 'lucide-react'

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const serviceId = searchParams.get('service')
    const [role, setRole] = useState<'customer' | 'provider'>('customer')
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)

    // ... (removed Google/Phone handlers for brevity)

    const handleMagicLink = async () => {
        if (!email) {
            alert('Please enter your email first')
            return
        }

        setIsLoading(true)
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard/${role}&role=${role}`,
                },
            })
            if (error) throw error
            alert('Magic link sent! Check your email.')
        } catch (e: unknown) {
            const error = e as Error
            console.error('Login error:', error)
            if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                alert("Connection Error: check your Supabase keys in .env.local!")
            } else {
                alert(error.message)
            }
        }
        setIsLoading(false)
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) return

        setIsLoading(true)
        try {
            if (isSignUp) {
                // Sign Up
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { role }, // Save role in metadata
                        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard/${role}&role=${role}`,
                    },
                })
                if (error) throw error
                alert('Sign up successful! Check your email to confirm.')
            } else {
                // Sign In
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                // Redirect happens automatically or we can force it
                router.push(`/dashboard/${role}`)
            }
        } catch (e: unknown) {
            const error = e as Error
            console.error('Auth error:', error)
            if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                alert("Connection Error: check your Supabase keys in .env.local!")
            } else {
                alert(error.message)
            }
        }
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-white p-8 pb-0 text-center relative">
                    {!isConfigured && (
                        <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-lg flex flex-col items-center justify-center gap-2 text-red-600 text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Missing Supabase Keys</span>
                            </div>
                            <button
                                onClick={() => {
                                    if (role === 'customer') router.push('/dashboard/customer?demo=true')
                                    else router.push('/dashboard/provider?demo=true')
                                }}
                                className="mt-1 bg-red-100 px-3 py-1 rounded text-red-700 hover:bg-red-200 underline"
                            >
                                Bypass (Demo Mode)
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => router.push('/')}
                        className="absolute left-6 top-8 text-gray-400 hover:text-black"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    {/* Logo Removed */}
                    <h1 className="text-2xl font-bold mb-2">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-500">
                        {isSignUp ? 'Get started as a ' : 'Sign in to '} {role}
                    </p>
                </div>

                {/* Role Toggle */}
                <div className="p-8 pt-6">
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                        <button
                            onClick={() => setRole('customer')}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                                role === 'customer' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Customer
                        </button>
                        <button
                            onClick={() => setRole('provider')}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                                role === 'provider' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Provider
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Email/Password Form */}
                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                    Email Address
                                </label>
                                <div className="flex items-center border border-gray-300 rounded-xl bg-white px-3 focus-within:ring-2 focus-within:ring-black">
                                    <Mail className="w-5 h-5 text-gray-400 mr-2" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="w-full p-3 bg-transparent border-none focus:outline-none text-black placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                    Password
                                </label>
                                <div className="flex items-center border border-gray-300 rounded-xl bg-white px-3 focus-within:ring-2 focus-within:ring-black">
                                    <span className="text-gray-400 mr-2">🔒</span>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full p-3 bg-transparent border-none focus:outline-none text-black placeholder:text-gray-400"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-black/20"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    isSignUp ? "Create Account" : "Sign In"
                                )}
                            </button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-200"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-400 font-medium">Or</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleMagicLink}
                                disabled={isLoading}
                                className="w-full py-4 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Sign in with Magic Link"
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-black font-bold hover:underline"
                            >
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
            <LoginContent />
        </Suspense>
    )
}
