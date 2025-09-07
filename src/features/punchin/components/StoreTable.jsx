import React, { useEffect, useMemo, useState } from 'react'
import '../styles/StoreTable.scss'
import { GoSearch } from 'react-icons/go';
import { useSelector } from 'react-redux';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getFilteredRowModel
} from '@tanstack/react-table';
import { PunchAPI } from '../services/punchService';

const StatusCell = ({ initialStatus, row, onStatusUpdate }) => {
    const [status, setStatus] = useState(initialStatus);
    const [isUpdating, setIsUpdating] = useState(false);


    const handleChangeStatus = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        setIsUpdating(true);
        
        try {
            // Call API to update status
            await PunchAPI.updateStatus({"shop_id":row.original.firm_code,"status": newStatus});
            onStatusUpdate?.(row.original.id, newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert to previous status on error
            setStatus(initialStatus);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="status-cell-container">
            <select
                value={status}
                onChange={handleChangeStatus}
                disabled={isUpdating}
                className={`status-select ${status.replace(/\s+/g, '-').toLowerCase()}`}
            >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
            </select>
            {isUpdating && <span className="status-updating-indicator">Updating...</span>}
        </div>
    );
};

const StoreTable = () => {
    const [globalFilter, setGlobalFilter] = useState('')
    const [storesData, setStoresData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const userRole = useSelector((state) => state.auth?.user?.role)

    useEffect(() => {
        const fetchTableData = async () => {
            try {
                setLoading(true)
                const response = await PunchAPI.LocationTable()
                
                if (response?.data) {
                    setStoresData(response.data)
                } else {
                    console.warn("No data received from API")
                    setError("No data available")
                }
            } catch (error) {
                console.error('Failed to fetch table data', error)
                setError(error.message || "Failed to load data")
            } finally {
                setLoading(false)
            }
        }
        fetchTableData()
    }, [])

    const handleStatusUpdate = (id, newStatus) => {
        // Update local state to reflect the change immediately
        setStoresData(prev => prev.map(store => 
            store.id === id ? {...store, status: newStatus} : store
        ))
    }

    const userColumns = useMemo(() => [
        {
            header: "Store",
            accessorKey: "storeName"
        },
        {
            header: "Address",
            accessorKey: "storeLocation"
        },
        {
            header: "Last Captured",
            accessorKey: "lastCapturedTime",
            cell: ({ getValue }) => {
                const value = getValue()
                return value ? new Date(value).toLocaleString() : 'N/A'
            }
        },
        {
            header: "View Location",
            cell: ({ row }) => {
                const { latitude, longitude } = row.original
                if (!latitude || !longitude) return 'N/A'
                
                const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
                return (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                        View on Map
                    </a>
                )
            }
        },
        {
            header: " Status",
            cell: ({ row }) => {
                const { status } = row.original
                return (
                    <span className={`status-badge ${status?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`}>
                        {status || 'N/A'}
                    </span>
                )
            }
        }
    ], [])

    const adminColumns = useMemo(() => [
        {
            header: "Store",
            accessorKey: "storeName"
        },
        {
            header: "Address",
            accessorKey: "storeLocation"
        },
        {
            header: "Last Captured",
            accessorKey: "lastCapturedTime",
            cell: ({ getValue }) => {
                const value = getValue()
                return value ? new Date(value).toLocaleString() : 'N/A'
            }
        },
        {
            header: "Updated By",
            accessorKey: "taskDoneBy",
            cell: ({ getValue }) => getValue() || 'N/A'
        },
        {
            header: "View Location",
            cell: ({ row }) => {
                const { latitude, longitude } = row.original
                if (!latitude || !longitude) return 'N/A'
                
                const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
                return (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                        View on Map
                    </a>
                )
            }
        },
        {
            header: "Approval Status",
            accessorKey: "status",
            cell: ({ row }) => (
                <StatusCell 
                    initialStatus={row.original.status} 
                    row={row}
                    onStatusUpdate={handleStatusUpdate}
                />
            )
        },
    ], [handleStatusUpdate])

    const table = useReactTable({
        data: storesData,  // Use the raw data directly
        columns: userRole === "Admin" ? adminColumns : userColumns,
        state: {
            globalFilter: globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(), // Let react-table handle filtering
        initialState: {
            pagination: { pageSize: 10 }
        }
    })

    if (loading) {
        return <div className="loading">Loading store data...</div>
    }

    if (error) {
        return <div className="error">Error: {error}</div>
    }

    return (
        <div className='table_section'>
            {/* Search Section */}
            <div className="search_section">
                <GoSearch className="search_icon" />
                <input
                    type="text"
                    placeholder="Search by store name or location..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="search_input"
                />
            </div>

            {/* Results count */}
            {/* <div className="results_count">
                Showing {table.getFilteredRowModel().rows.length} results
            </div> */}

            {/* Table Container */}
            <div className="table_container">
                <table>
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            data-label={cell.column.columnDef.header}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={userRole === "Admin" ? 6 : 5} className="no-data">
                                    No stores found matching your search criteria
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination controls */}
            {table.getPageCount() > 1 && (
                <div className="pagination_controls">
                    <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        Previous
                    </button>
                    <span>
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                    <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Next
                    </button>
                    <select 
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                    >
                        {[5, 10, 20].map((size) => (
                            <option key={size} value={size}>
                                Show {size}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    )
}

export default StoreTable