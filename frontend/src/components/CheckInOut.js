import React, { useState, useEffect } from 'react';

const CheckInOut = ({ onCheckIn, onCheckOut, loading }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);

  useEffect(() => {
    const checkedIn = localStorage.getItem('isCheckedIn');
    const time = localStorage.getItem('checkInTime');
    
    if (checkedIn === 'true' && time) {
      setIsCheckedIn(true);
      setCheckInTime(time);
    }
  }, []);

  const handleCheckIn = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    setIsCheckedIn(true);
    setCheckInTime(timeString);
    
    localStorage.setItem('isCheckedIn', 'true');
    localStorage.setItem('checkInTime', timeString);
    
    if (onCheckIn) onCheckIn();
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setCheckInTime(null);
    
    localStorage.removeItem('isCheckedIn');
    localStorage.removeItem('checkInTime');
    
    if (onCheckOut) onCheckOut();
  };

  return (
    <div className="checkinout-container">
      {!isCheckedIn ? (
        <button 
          className="btn btn-success" 
          onClick={handleCheckIn}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Check In'}
        </button>
      ) : (
        <div>
          <p>Checked in at: <strong>{checkInTime}</strong></p>
          <button 
            className="btn btn-danger" 
            onClick={handleCheckOut}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Check Out'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckInOut;