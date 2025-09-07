import React from 'react';

const PropertyFilter = ({ selectedProperty, onPropertyChange }) => {
  const properties = ['All Properties', 'Property A', 'Property B', 'Property C'];

  return (
    <div className="property-filter">
      <label htmlFor="property-select">Filter by Property: </label>
      <select
        id="property-select"
        value={selectedProperty}
        onChange={(e) => onPropertyChange(e.target.value)}
        className="property-select"
      >
        {properties.map(property => (
          <option key={property} value={property === 'All Properties' ? 'all' : property}>
            {property}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PropertyFilter;