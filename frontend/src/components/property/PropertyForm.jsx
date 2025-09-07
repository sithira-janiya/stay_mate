import React, { useState, useEffect } from 'react';

const PropertyForm = ({ property, onSubmit, onCancel, title, isEdit = false }) => {
  const [formData, setFormData] = useState({
    propertyType: '',
    numberOfRooms: '',
    location: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (property) {
      setFormData({
        propertyType: property.propertyType || '',
        numberOfRooms: property.numberOfRooms?.toString() || '',
        location: property.location || '',
        address: property.address || ''
      });
    }
  }, [property]);

  const validateForm = () => {
    const newErrors = {};

    // Property type validation
    if (!formData.propertyType) {
      newErrors.propertyType = 'Property type is required';
    }

    // Number of rooms validation
    if (!formData.numberOfRooms) {
      newErrors.numberOfRooms = 'Number of rooms is required';
    } else {
      const rooms = parseInt(formData.numberOfRooms);
      if (isNaN(rooms) || rooms <= 0 || rooms > 99 || !Number.isInteger(rooms)) {
        newErrors.numberOfRooms = 'Must be a positive integer between 1 and 99';
      }
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (/\d/.test(formData.location)) {
      newErrors.location = 'Location cannot contain numbers';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for numberOfRooms
    if (name === 'numberOfRooms') {
      // Only allow digits and limit to 2 characters
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 2);
      setFormData({ ...formData, [name]: numericValue });
    } else if (name === 'location') {
      // Remove any numbers from location
      const cleanValue = value.replace(/[0-9]/g, '');
      setFormData({ ...formData, [name]: cleanValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handlePropertyTypeSelect = (type) => {
    setFormData({ ...formData, propertyType: type });
    if (errors.propertyType) {
      setErrors({ ...errors, propertyType: '' });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title-section">
            <div className="modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="modal-title">{title}</h3>
              <p className="modal-subtitle">
                {isEdit ? 'Update the details of your property.' : 'Enter the details for the new property.'}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="property-form">
          <div className="form-row">
            <div className="form-group">
              <label>Property ID</label>
              <div className="property-id-input">
                <input
                  type="text"
                  value={isEdit && property ? property.propertyId : 'PROP-12345'}
                  disabled
                  className="form-input disabled"
                />
                {isEdit && (
                  <svg className="lock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#9CA3AF" strokeWidth="2"/>
                    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="#9CA3AF" strokeWidth="2"/>
                  </svg>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Total Rooms</label>
              <input
                type="text"
                name="numberOfRooms"
                value={formData.numberOfRooms}
                onChange={handleInputChange}
                placeholder="eg. 5"
                className={`form-input ${errors.numberOfRooms ? 'error' : ''}`}
                maxLength="2"
              />
              {errors.numberOfRooms && <span className="error-message">{errors.numberOfRooms}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>{isEdit ? 'Hostel Type' : 'Property Type'}</label>
            <div className="property-type-buttons">
              <button
                type="button"
                onClick={() => handlePropertyTypeSelect('Girls Hostel')}
                className={`type-button ${formData.propertyType === 'Girls Hostel' ? 'active' : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Girls Hostel
              </button>
              <button
                type="button"
                onClick={() => handlePropertyTypeSelect('Boys Hostel')}
                className={`type-button ${formData.propertyType === 'Boys Hostel' ? 'active' : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Boys Hostel
              </button>
            </div>
            {errors.propertyType && <span className="error-message">{errors.propertyType}</span>}
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="eg. Colombo"
              className={`form-input ${errors.location ? 'error' : ''}`}
            />
            {errors.location && <span className="error-message">{errors.location}</span>}
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter the full property address"
              className={`form-input address-input ${errors.address ? 'error' : ''}`}
              rows="3"
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {isEdit ? 'Save Changes' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
