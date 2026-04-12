'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Dashboard error boundary:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-6 rounded-2xl border border-red-500/40 bg-red-950/20 text-sm max-w-lg">
            <h3 className="text-red-400 font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground">
              {this.state.error?.message ?? 'Unexpected error'}
            </p>
          </div>
        )
      )
    }
    return this.props.children
  }
}
