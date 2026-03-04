'use client'

import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface Props {
    requestId: string
    senderId: string // 'customer' or 'provider' uuid
    receiverName: string
}

export function ChatComponent({ requestId, senderId, receiverName }: Props) {
    const [messages, setMessages] = useState<Record<string, any>[]>([])
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (!requestId) return


        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('request_id', requestId)
                .order('created_at', { ascending: true })

            if (data) setMessages(data)
            scrollToBottom()
        }

        fetchMessages()


        const channel = supabase
            .channel(`chat:${requestId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `request_id=eq.${requestId}` },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new])
                    scrollToBottom()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [requestId])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const content = newMessage
        setNewMessage('') // Optimistic clear


        const optimisticMsg = {
            id: Date.now().toString(),
            content,
            sender_id: senderId,
            created_at: new Date().toISOString()
        }
        setMessages((prev) => [...prev, optimisticMsg])
        scrollToBottom()


        const { error } = await supabase
            .from('messages')
            .insert({
                request_id: requestId,
                sender_id: senderId,
                content
            })

        if (error) {
            console.error('Failed to send message:', error)

        }
    }

    return (
        <div className="flex flex-col h-[300px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            
            <div className="bg-gray-50 p-3 border-b flex items-center justify-between">
                <span className="font-bold text-sm text-gray-900">Chat with {receiverName}</span>
                <div className="flex items-center gap-1 text-xs text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                </div>
            </div>

            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {messages.length === 0 && (
                    <div className="text-center text-xs text-gray-600 mt-10 font-medium">
                        Start the conversation regarding your service request.
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.sender_id === senderId
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe
                                ? 'bg-black text-white rounded-br-none'
                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/5"
                />
                <button
                    type="submit"
                    className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    )
}
