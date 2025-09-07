import React, { useState } from 'react';
import axios from 'axios';
import '../../css/RoomDashboard.css';

const RoomManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomName: '',
    capacity: 1,
    roomType: 'single',
    facilities: '',
    baseRent: '',
    roomPic: '',
    propertyId: ''
  });
const handleAddRoom = async (e) => {
  e.preventDefault();
  try {
    await axios.post('/api/rooms', {
      ...formData,
      facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f)
    });
    setShowAddModal(false);
    setFormData({
      roomNumber: '',
      roomName: '',       // ← COMMA ADDED
      capacity: 1,        // ← COMMA ADDED
      roomType: 'single', // ← COMMA ADDED
      facilities: '',     // ← COMMA ADDED
      baseRent: '',       // ← COMMA ADDED
      roomPic: '',        // ← COMMA ADDED
      propertyId: ''      // ← No comma on last item
    });
  } catch (error) {
    console.error('Error adding room:', error);
    alert('Failed to add room: ' + (error.response?.data?.message || error.message));
  }
};

const handleEditRoom = async (e) => {
  e.preventDefault();
  try {
    await axios.put('/api/rooms/${editingRoom._id}', {
      ...formData,
      facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f)
    });
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      roomName: '',       // ← COMMA ADDED
      capacity: 1,        // ← COMMA ADDED
      roomType: 'single', // ← COMMA ADDED
      facilities: '',     // ← COMMA ADDED
      baseRent: '',       // ← COMMA ADDED
      roomPic: '',        // ← COMMA ADDED
      propertyId: ''      // ← No comma on last item
    });
  } catch (error) {
    console.error('Error updating room:', error);
    alert('Failed to update room: ' + (error.response?.data?.message || error.message));
  }
};

  return (
    <div className="room-management">
      <div className="management-header">
        <h2>Room Management</h2>
        <button 
          className="add-room-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Add New Room
        </button>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Room</h3>
            <form onSubmit={handleAddRoom}>
              <div className="form-group">
                <label>Room Number *</label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Room Name</label>
                <input
                  type="text"
                  value={formData.roomName}
                  onChange={(e) => setFormData({...formData, roomName: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Capacity *</label>
                <select
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  required
                >
                  <option value={1}>Single (1 person)</option>
                  <option value={2}>Double (2 people)</option>
                  <option value={3}>Triple (3 people)</option>
                  <option value={4}>Quad (4 people)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Room Type *</label>
                <select
                  value={formData.roomType}
                  onChange={(e) => setFormData({...formData, roomType: e.target.value})}
                  required
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="shared">Shared</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Base Rent ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.baseRent}
                  onChange={(e) => setFormData({...formData, baseRent: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Facilities (comma separated)</label>
                <input
                  type="text"
                  value={formData.facilities}
                  onChange={(e) => setFormData({...formData, facilities: e.target.value})}
                  placeholder="WiFi, AC, TV, etc."
                />
              </div>
              
              <div className="form-group">
                <label>Room Image URL</label>
                <input
                  type="url"
                  value={formData.roomPic}
                  onChange={(e) => setFormData({...formData, roomPic: e.target.value})}
                  placeholder="https://example.com/room-image.jpg"
                />
              </div>
              
              <div className="form-group">
                <label>Property ID *</label>
                <input
                  type="text"
                  value={formData.propertyId}
                  onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                  placeholder="Property ID"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit">Add Room</button>
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;