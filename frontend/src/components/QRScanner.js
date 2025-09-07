import React, { useState } from 'react';
import { QrScanner } from 'react-qr-scanner'; // Correct import

const QRScanner = ({ onScan }) => {
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  const handleScan = (result) => {
    if (result) {
      setScanResult(result);
      setError('');
      
      if (onScan) {
        onScan(result);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError('Failed to access camera. Please check permissions.');
  };

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
    setScanResult('');
    setError('');
  };

  return (
    <div className="qr-scanner">
      {cameraActive ? (
        <>
          <QrScanner
            onDecode={handleScan}
            onError={handleError}
            constraints={{ facingMode: 'environment' }}
            containerStyle={{ 
              width: '100%', 
              maxWidth: '300px', 
              marginBottom: '15px',
              borderRadius: '10px',
              overflow: 'hidden'
            }}
          />
          <button className="btn btn-secondary" onClick={toggleCamera}>
            Stop Camera
          </button>
        </>
      ) : (
        <button className="btn btn-primary" onClick={toggleCamera}>
          Start Camera Scanner
        </button>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {scanResult && (
        <div className="scan-result">
          <p>Scanned: <strong>{scanResult}</strong></p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;