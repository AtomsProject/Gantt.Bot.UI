import React from 'react';

// Define props interface
interface TabDelimitedTableProps {
    data: string;
}

const TabDelimitedTable: React.FC<TabDelimitedTableProps> = ({data}) => {
    // Split data into rows and then cells
    const rows = data.trim().split('\n').map(row => row.split('\t'));

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full leading-normal table">
                <thead>
                <tr>
                    {rows[0].map((header, index) => (
                        <th key={index}
                            className="pr-2 border-b-2 border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider text-left">
                            {header}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {rows.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="pr-2 border-b border-gray-200 text-xs">
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TabDelimitedTable;
