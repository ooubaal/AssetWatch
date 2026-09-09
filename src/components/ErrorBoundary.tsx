import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2.5rem 1.5rem',
          maxWidth: '560px',
          margin: '2rem auto',
          background: 'var(--bg-secondary, #1e293b)',
          border: '1px solid var(--border, rgba(255,255,255,0.1))',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          color: 'var(--text-primary, #ffffff)'
        }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: '50%',
            marginBottom: '1rem',
            color: '#ef4444'
          }}>
            <AlertTriangle size={36} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
            {this.props.fallbackTitle || 'เกิดข้อผิดพลาดในการแสดงผล'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
            {this.state.error?.message || 'ระบบพบปัญหาชั่วคราวในการประมวลผลข้อมูลหน้านี้'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem' }}
            >
              ลองใหม่อีกครั้ง
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={this.handleReset}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem' }}
            >
              <RefreshCw size={15} /> รีโหลดหน้าเว็บ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
