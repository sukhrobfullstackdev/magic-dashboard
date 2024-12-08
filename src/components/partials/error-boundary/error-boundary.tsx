'use client';

import { Component, isValidElement, type ReactNode } from 'react';

type FallbackRenderer = (error: Error) => React.ReactNode;

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  prevScope: string;
}

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback: ReactNode | FallbackRenderer;
  scope?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, prevScope: props.scope || 'error-boundary' };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState) {
    if (state.prevScope !== props.scope) {
      return {
        hasError: false,
        error: undefined,
        prevScope: props.scope,
      };
    }

    return state;
  }

  componentDidCatch(error: Error) {
    // You can also log the error to an error reporting service
    console.warn('ErrorBoundary caught an error:', error);
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError || !error) {
      return children;
    }

    if (isValidElement(fallback) || typeof fallback === 'string') {
      return fallback;
    } else if (typeof fallback === 'function') {
      return fallback(error);
    }

    return null;
  }
}
