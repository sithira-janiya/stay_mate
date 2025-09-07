import React, { useState, useEffect, useCallback } from 'react';
import SummaryCards from '../components/property/SummaryCards.jsx';
import PropertyForm from '../components/property/PropertyForm.jsx';
import PropertyList from '../components/property/PropertyList.jsx';
import '../css/PropertyManagement.css';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({ totalProperties: 0, totalOccupants: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000/api';

  // Fetch properties with useCallback
  const fetchProperties = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterType !== 'All') params.append('filter', filterType);
      
      const response = await fetch(`${API_BASE_URL}/properties?${params}`);
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  }, [searchTerm, filterType]); // Dependencies for fetchProperties

  // Fetch statistics with useCallback
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []); // No dependencies for fetchStats

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProperties(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [searchTerm, filterType, fetchProperties, fetchStats]); // Include all dependencies

  const handleAddProperty = async (propertyData) => {
    if (window.confirm('Are you sure you want to add this property?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/properties`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(propertyData),
        });

        if (response.ok) {
          await fetchProperties();
          await fetchStats();
          setShowForm(false);
          alert('Property added successfully!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error('Error adding property:', error);
        alert('Error adding property. Please try again.');
      }
    }
  };

  const handleEditProperty = async (id, propertyData) => {
    if (window.confirm('Are you sure you want to save these changes?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(propertyData),
        });

        if (response.ok) {
          await fetchProperties();
          await fetchStats();
          setEditingProperty(null);
          alert('Property updated successfully!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error('Error updating property:', error);
        alert('Error updating property. Please try again.');
      }
    }
  };

  const handleDeleteProperty = async (id) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchProperties();
          await fetchStats();
          alert('Property deleted successfully!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Error deleting property. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="property-management">
      <div className="property-header">
        <div className="header-content">
          <h1 className="page-title">Properties</h1>
          <p className="page-subtitle">Manage all your properties in one place.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="add-property-btn"
        >
          <span className="btn-icon">+</span>
          Add Property
        </button>
      </div>

      <SummaryCards stats={stats} />

      <div className="controls-section">
        <div className="search-container">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Types</option>
          <option value="Girls Hostel">Girls Hostel</option>
          <option value="Boys Hostel">Boys Hostel</option>
        </select>
      </div>

    <PropertyList
        properties={properties}
        onEdit={setEditingProperty}
        onDelete={handleDeleteProperty}
      />

      {showForm && (
        <PropertyForm
          onSubmit={handleAddProperty}
          onCancel={() => setShowForm(false)}
          title="Add New Property"
        />
      )}

      {editingProperty && (
        <PropertyForm
          property={editingProperty}
          onSubmit={(data) => handleEditProperty(editingProperty._id, data)}
          onCancel={() => setEditingProperty(null)}
          title="Edit Property"
          isEdit={true}
        />
      )}
    </div>
  );
};

export default PropertyManagement;
