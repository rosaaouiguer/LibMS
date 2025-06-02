import React from 'react';

export const Table = ({ 
  columns, 
  data, 
  onRowClick = null,
  actions = null,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  style={column.width ? { width: column.width } : {}}
                >
                  {column.title}
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0)} 
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const UsersTable = ({ users = [], onEdit, onDelete }) => {
  const columns = [
    { key: 'lastName', title: 'Noms' },
    { key: 'firstName', title: 'Prénoms' },
    { key: 'email', title: 'E-mails' },
    { key: 'phone', title: 'Téléphone' },
    { 
      key: 'status', 
      title: 'Statut',
      render: (row) => {
        const statusStyles = {
          'Validé': 'bg-green-100 text-green-600',
          'Actif': 'bg-yellow-100 text-yellow-600',
          'Inactif': 'bg-red-100 text-red-600'
        };
        
        const style = statusStyles[row.status] || 'bg-gray-100 text-gray-600';
        
        return (
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>
            {row.status}
          </span>
        );
      }
    }
  ];

  const renderActions = (user) => (
    <div className="flex justify-end space-x-2">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onEdit && onEdit(user);
        }}
        className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-sm font-medium transition-colors duration-200"
      >
        Suspendre
      </button>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete && onDelete(user);
        }}
        className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm font-medium transition-colors duration-200"
      >
        Supprimer
      </button>
    </div>
  );

  // Sample data to demonstrate the table
  const sampleUsers = users.length > 0 ? users : [
    { id: 1, firstName: 'Afghani', lastName: 'Moh', email: 'moh.afghani@gmail.com', phone: '0552254802', status: 'Validé' },
    { id: 2, firstName: 'Afghani', lastName: 'Moh', email: 'moh.afghani@gmail.com', phone: '0552254802', status: 'Actif' },
    { id: 3, firstName: 'Afghani', lastName: 'Moh', email: 'moh.afghani@gmail.com', phone: '0552254802', status: 'Inactif' },
    { id: 4, firstName: 'Afghani', lastName: 'Moh', email: 'moh.afghani@gmail.com', phone: '0552254802', status: 'Validé' }
  ];

  return (
    <Table 
      columns={columns} 
      data={sampleUsers} 
      actions={renderActions} 
    />
  );
};