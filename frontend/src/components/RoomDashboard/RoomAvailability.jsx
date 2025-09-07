import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../../css/RoomDashboard.css';

const RoomAvailability = () => {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({});
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoomData();
    setupSocketConnection();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, statusFilter, typeFilter]);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      const [roomsResponse, statsResponse] = await Promise.all([
        axios.get('/api/rooms'),
        axios.get('/api/rooms/stats')
      ]);
      setRooms(roomsResponse.data);
      setStats(statsResponse.data);
    } catch (err) {
      setError('Failed to fetch room data');
      console.error('Error fetching room data:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketConnection = () => {
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    
    socket.on('roomUpdated', (updatedRoom) => {
      setRooms(prev => prev.map(room => 
        room._id === updatedRoom._id ? updatedRoom : room
      ));
    });
    
    socket.on('roomDeleted', (roomId) => {
      setRooms(prev => prev.filter(room => room._id !== roomId));
    });
    
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
    
    return () => socket.disconnect();
  };

  const filterRooms = () => {
    let result = rooms;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(room => 
        room.roomNumber.toLowerCase().includes(term) ||
        room.roomName.toLowerCase().includes(term) ||
        room._id.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(room => room.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      result = result.filter(room => room.roomType === typeFilter);
    }

    setFilteredRooms(result);
  };

  if (loading) return <div className="loading">Loading room data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="room-availability">
      <div className="availability-header">
        <h2>Room Availability Overview</h2>
        <div className="stats-grid">
          <div className="stat-card total">
            <h3>Total Rooms</h3>
            <p>{stats.totalRooms || 0}</p>
          </div>
          <div className="stat-card full">
            <h3>Full Rooms</h3>
            <p>{stats.fullRooms || 0}</p>
          </div>
          <div className="stat-card available">
            <h3>Available</h3>
            <p>{stats.availableRooms || 0}</p>
          </div>
          <div className="stat-card vacant">
            <h3>Vacant</h3>
            <p>{stats.vacantRooms || 0}</p>
          </div>
          <div className="stat-card occupants">
            <h3>Total Occupants</h3>
            <p>{stats.totalOccupants || 0}</p>
          </div>
        </div>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by room number, name, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Statuses</option>
          <option value="full">Full</option>
          <option value="available">Available</option>
          <option value="vacant">Vacant</option>
        </select>

        <select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Types</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="shared">Shared</option>
          <option value="suite">Suite</option>
        </select>
      </div>

      <div className="rooms-list">
        {filteredRooms.length === 0 ? (
          <div className="no-rooms">No rooms match your filters</div>
        ) : (
         filteredRooms.map(room => (
  <div key={room._id} className={'room-card ${room.status}'}> 
    <div className="room-image">
      <img 
        src={room.roomPic || '/default-room.jpg'} 
        alt={room.roomName}
        onError={(e) => {
          e.target.src = '/default-room.jpg';
        }}
      />
      {/* FIXED: Backticks */}
      <span className={'status-badge ${room.status}'}>
        {room.status.toUpperCase()}
      </span>
    </div>
    
    <div className="room-info">
      <h3>{room.roomName}</h3>
      <p className="room-number">Room {room.roomNumber}</p>
      <p className="room-type">{room.roomType}</p>
      
      <div className="room-details">
        <p><strong>Capacity:</strong> {room.capacity}</p>
        <p><strong>Occupants:</strong> {room.occupants?.length || 0}</p>
        <p><strong>Available:</strong> {room.capacity - (room.occupants?.length || 0)}</p>
        <p><strong>Rent:</strong> ${room.baseRent}/month</p>
      </div>

      {room.facilities && room.facilities.length > 0 && (
        <div className="facilities">
          <strong>Facilities:</strong>
          <span>{room.facilities.join(', ')}</span>
        </div>
      )}
    </div>
  </div>
))
        )}
      </div>
    </div>
  );
};

export default RoomAvailability;