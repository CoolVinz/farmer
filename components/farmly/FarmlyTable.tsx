'use client'

import React from 'react';

interface TableColumn {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface FarmlyTableProps {
  columns: TableColumn[];
  data: any[];
  className?: string;
}

export const FarmlyTable: React.FC<FarmlyTableProps> = ({ 
  columns, 
  data, 
  className = '' 
}) => {
  return (
    <div className={`farmly-card ${className}`}>
      <table className="farmly-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[var(--border-color)]">
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render 
                    ? column.render(row[column.key], row)
                    : row[column.key] || '–'
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface StatusBadgeProps {
  status: string;
  variant?: 'healthy' | 'sick' | 'critical' | 'active' | 'completed' | 'pending';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'active' }) => {
  return (
    <span className={`status-badge status-${variant}`}>
      {status}
    </span>
  );
};

interface ActionButtonProps {
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ onClick, href, children }) => {
  if (href) {
    return (
      <a href={href} className="action-button">
        {children}
      </a>
    );
  }
  
  return (
    <button onClick={onClick} className="action-button">
      {children}
    </button>
  );
};