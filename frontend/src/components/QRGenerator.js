import React from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Use named import

const QRGenerator = ({ qrData, size = 200 }) => {
  try {
    const parsedData = JSON.parse(qrData);
    return (
      <div className="qr-generator">
        <QRCodeSVG // Use QRCodeSVG instead of QRCode
          value={qrData}
          size={size}
          level="H"
          includeMargin={true}
        />
        <div className="qr-info">
          <p>Tenant: {parsedData.tenantId}</p>
          <p>Property: {parsedData.property}</p>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="qr-error">
        <p>Invalid QR code data</p>
      </div>
    );
  }
};

export default QRGenerator;