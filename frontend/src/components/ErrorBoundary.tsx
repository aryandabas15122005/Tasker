import React from 'react';

interface State {
  error: Error | null;
  info: React.ErrorInfo | null;
}

interface Props {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] caught:', error, info);
    this.setState({ info });
  }

  handleReset = () => {
    this.setState({ error: null, info: null });
  };

  handleHardReset = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      /* ignore */
    }
    window.location.assign('/login');
  };

  render() {
    if (!this.state.error) return this.props.children;

    const { error, info } = this.state;
    return (
      <div
        style={{
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#fff',
          color: '#1a2e2a',
          overflowY: 'auto'
        }}
      >
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#d64545' }}>
            Something went wrong while rendering this page.
          </h1>
          <p style={{ color: '#5f7a73', marginBottom: '1.5rem' }}>
            This is shown instead of a blank screen so you can see the underlying error.
            Try the reset buttons below, or share the error text for support.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.6rem 1rem',
                border: '1.5px solid #0f766e',
                background: '#0f766e',
                color: '#fff',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Try again
            </button>
            <button
              onClick={this.handleHardReset}
              style={{
                padding: '0.6rem 1rem',
                border: '1.5px solid #d5ddd9',
                background: '#fff',
                color: '#1a2e2a',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Clear session and go to login
            </button>
          </div>

          <details open style={{ background: '#f0f4f3', padding: '1rem', borderRadius: '8px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Error details</summary>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '0.8rem',
                marginTop: '0.75rem'
              }}
            >
              {String(error?.name || 'Error')}: {String(error?.message || error)}
              {'\n\n'}
              {error?.stack || ''}
              {info?.componentStack ? `\n\nComponent stack:${info.componentStack}` : ''}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
