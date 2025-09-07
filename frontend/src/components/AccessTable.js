import React from 'react';

const AccessTable = ({ data }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Tenant ID</th>
          <th>Name</th>
          <th>Date</th>
          <th>Check-In</th>
          <th>Check-Out</th>
          <th>Duration</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.tenantId}</td>
            <td>{item.name}</td>
            <td>{item.date}</td>
            <td>{item.checkIn || '-'}</td>
            <td>{item.checkOut || '-'}</td>
            <td>{item.duration}</td>
            <td>
              <span className={item.status === 'Present' ? 'status-present' : 'status-absent'}>
                {item.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AccessTable;