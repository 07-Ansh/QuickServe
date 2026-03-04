'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface Props {
    requestId: string
    providerId: string
    customerId: string
    onSubmitted?: () => void
}

export function ReviewComponent({ requestId, providerId, customerId, onSubmitted }: Props) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) {
            alert("Please select a rating")
            return
        }

        setIsSubmitting(true)
        const { error } = await supabase
            .from('reviews')
            .insert({
                request_id: requestId,
                provider_id: providerId,
                customer_id: customerId,
                rating,
                comment
            })

        if (error) {
            console.error(error)
            alert("Failed to submit review")
            setIsSubmitting(false)
        } else {
            alert("Thanks for your feedback!")
            if (onSubmitted) onSubmitted()
        }
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-sm w-full mx-auto">
            <h3 className="text-xl font-bold text-center mb-2">Rate your Service</h3>
            <p className="text-gray-500 text-center text-sm mb-6">How was your experience?</p>

            <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                    >
                        <Star
                            className={`w-8 h-8 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                    </button>
                ))}
            </div>

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment (optional)..."
                className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black mb-4 resize-none h-24"
            />

            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </div>
    )
}
