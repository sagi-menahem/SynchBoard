import React from 'react';

interface AuthLoadingOverlayProps {
  isVisible: boolean;
}

export const AuthLoadingOverlay: React.FC<AuthLoadingOverlayProps> = ({ isVisible }) => {
  // Also check sessionStorage for global loading state
  const globalLoading = sessionStorage.getItem('oauth_loading') === 'true';
  const shouldShow = isVisible || globalLoading;
  
  if (!shouldShow) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px',
      }} />
      <p style={{ 
        fontSize: '16px', 
        color: '#666',
        margin: 0, 
      }}>
        Signing you in...
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};