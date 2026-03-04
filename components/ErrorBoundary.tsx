'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
    errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
        this.setState({ errorInfo })
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 text-red-900 h-screen overflow-auto">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                    <pre className="bg-white p-4 rounded text-sm overflow-x-auto shadow-sm">
                        {this.state.error?.toString()}
                    </pre>
                    <pre className="bg-white p-4 rounded text-xs mt-4 overflow-x-auto shadow-sm text-gray-600">
                        {this.state.errorInfo?.componentStack}
                    </pre>
                </div>
            )
        }

        return this.props.children
    }
}
