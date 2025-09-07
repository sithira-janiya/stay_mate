import React from 'react';

const TenantTable = ({ data }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Tenant ID</th>
          <th>Name</th>
          <th>Room</th>
          <th>Monthly Usage</th>
          <th>Allowed Hours</th>
          <th>Status</th>
          <th>Contact</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>{item.room}</td>
            <td>{item.monthlyUsage}</td>
            <td>{item.allowedHours}</td>
            <td>
              <span className={item.status === 'Within Limit' ? 'status-present' : 'status-absent'}>
                {item.status}
              </span>
            </td>
            <td>{item.contact}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TenantTable;