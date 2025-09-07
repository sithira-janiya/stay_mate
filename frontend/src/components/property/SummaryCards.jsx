import React from 'react';

const SummaryCards  = ({ stats }) => {
  return (
    <div className="summary-cards">
      <div className="summary-card">
        <div className="card-content">
          <p className="card-label">Total No. of Properties</p>
          <h2 className="card-number">{stats?.totalProperties ?? 0}</h2>
        </div>
      </div>
      <div className="summary-card">
        <div className="card-content">
          <p className="card-label">Total No. of Occupants Overall</p>
          <h2 className="card-number">{stats?.totalOccupants ?? 0}</h2>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards ;