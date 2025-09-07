import React, { useState, useEffect } from 'react';
import AccessTable from '../components/AccessTable';
import CheckInOut from '../components/CheckInOut';
import QRScanner from '../components/QRScanner';
import TenantTable from '../components/TenantTable';
import PropertyFilter from '../components/PropertyFilter';
import QRGenerator from '../components/QRGenerator';

const RoomAccess = () => {
  const [userRole, setUserRole] = useState('tenant');
  const [accessData, setAccessData] = useState([]);
  const [tenantData, setTenantData] = useState([]);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const loadSampleData = () => { 
      const sampleAccessData = [
        { id: 1, tenantId: 'T001', name: 'John Doe', property: 'Property A', date: '2023-06-01', checkIn: '08:30 AM', checkOut: '06:15 PM', duration: '9h 45m', status: 'Present' },
        { id: 2, tenantId: 'T002', name: 'Jane Smith', property: 'Property B', date: '2023-06-01', checkIn: '09:15 AM', checkOut: '05:30 PM', duration: '8h 15m', status: 'Present' },
        { id: 3, tenantId: 'T003', name: 'Bob Johnson', property: 'Property C', date: '2023-06-01', checkIn: '', checkOut: '', duration: '0h', status: 'Absent' },
      ];

      const sampleTenantData = [
        { id: 'T001', name: 'John Doe', room: 'A-101', property: 'Property A', monthlyUsage: '120h', allowedHours: '100h', status: 'Exceeded', contact: 'john@example.com', qrCode: '{"tenantId":"T001","property":"Property A"}' },
        { id: 'T002', name: 'Jane Smith', room: 'B-102', property: 'Property B', monthlyUsage: '85h', allowedHours: '100h', status: 'Within Limit', contact: 'jane@example.com', qrCode: '{"tenantId":"T002","property":"Property B"}' },
        { id: 'T003', name: 'Bob Johnson', room: 'C-103', property: 'Property C', monthlyUsage: '95h', allowedHours: '100h', status: 'Within Limit', contact: 'bob@example.com', qrCode: '{"tenantId":"T003","property":"Property C"}' },
      ];

      setAccessData(sampleAccessData);
      setTenantData(sampleTenantData);
      setCurrentTenant(sampleTenantData[0]);
    };

    loadSampleData();
  }, []);

  const handleCheckIn = async (qrData = null) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (qrData) {
        console.log('QR Check-in:', qrData);
        alert(`Checked in successfully with QR code! Tenant: ${qrData.tenantId}, Property: ${qrData.property}`);
      } else {
        alert('Checked in successfully!');
      }
    } catch (err) {
      setError('Check-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Checked out successfully!');
    } catch (err) {
      setError('Check-out failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (data) => {
    try {
      const qrData = JSON.parse(data);
      if (qrData.tenantId && qrData.property) {
        handleCheckIn(qrData);
      } else {
        setError('Invalid QR code. Please scan a valid tenant QR code.');
      }
    } catch (err) {
      setError('Failed to parse QR code. Please try again.');
    }
  };

  const handlePropertyChange = (property) => {
    setSelectedProperty(property);
  };

  // Filter data based on selected property
  const filteredTenants = selectedProperty === 'all' 
    ? tenantData 
    : tenantData.filter(tenant => tenant.property === selectedProperty);

  const filteredAccessData = selectedProperty === 'all'
    ? accessData
    : accessData.filter(log => log.property === selectedProperty);

  return (
    <div className="container">
      <div className="header">
        <h1>Room Access Control System</h1>
        <p>Logged in as: <strong>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</strong></p>
        {userRole === 'admin' && (
          <PropertyFilter 
            selectedProperty={selectedProperty}
            onPropertyChange={handlePropertyChange}
          />
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {userRole === 'tenant' && (
        <div className="flex-container">
          <div className="flex-item card">
            <h2>Tenant Access Control</h2>
            {currentTenant && (
              <div>
                <p>Welcome, <strong>{currentTenant.name}</strong> (Room {currentTenant.room}, {currentTenant.property})</p>
                
                <div className="qr-container">
                  <h3>Your QR Code</h3>
                  <QRGenerator qrData={currentTenant.qrCode} />
                  <p>Scan this code at the entrance</p>
                </div>
                
                <CheckInOut 
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
                  loading={loading}
                />
                
                {currentTenant.status === 'Exceeded' && (
                  <div className="usage-warning">
                    Warning: You have exceeded your monthly usage limit ({currentTenant.monthlyUsage} / {currentTenant.allowedHours})
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-item card">
            <h2>Your Access History</h2>
            <AccessTable 
              data={filteredAccessData.filter(item => item.tenantId === 'T001')} 
            />
          </div>
        </div>
      )}

      {userRole === 'admin' && (
        <div>
          <div className="card">
            <h2>Admin Dashboard - {selectedProperty === 'all' ? 'All Properties' : selectedProperty}</h2>
            <div className="flex-container">
              <div className="flex-item">
                <h3>QR Scanner</h3>
                <QRScanner onScan={handleQRScan} />
              </div>
              <div className="flex-item">
                <h3>Today's Overview</h3>
                <p>Present: {filteredAccessData.filter(item => item.status === 'Present').length}</p>
                <p>Absent: {filteredAccessData.filter(item => item.status === 'Absent').length}</p>
                <p>Total Tenants: {filteredTenants.length}</p>
                <p>Current Property: {selectedProperty}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2>Tenant Management</h2>
            <TenantTable data={filteredTenants} />
          </div>
          
          <div className="card">
            <h2>Access Logs</h2>
            <AccessTable data={filteredAccessData} />
          </div>
        </div>
      )}

      {userRole === 'supplier' && (
        <div className="card">
          <h2>Meal Supplier Portal</h2>
          <p>Access limited to meal delivery information only.</p>
          <div className="qr-container">
            <h3>Scan Tenant QR Code</h3>
            <QRScanner onScan={handleQRScan} />
            <p>Scan tenant QR codes to confirm meal delivery.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomAccess;
