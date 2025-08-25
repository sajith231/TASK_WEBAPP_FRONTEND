import React, { useMemo, useState } from 'react'
import './StoreTable.scss'
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


const StoresData = [
    {
        storeName: "Diner",
        storeLocation: "101 Harbor Street, Anytown",
        lastCapturedTime: "09:30 AM 2024-02-15",
        status: "Pending Verification",
        latitude: 40.7128,
        longitude: -74.0060,
        taskDoneBy: "Admin"
    },
    {
        storeName: "Greenfield Market",
        storeLocation: "202 Greenfield Drive, Anytown",
        lastCapturedTime: "02:10 PM 2024-02-14",
        status: "Rejected",
        latitude: 40.7139,
        longitude: -74.0021,
        taskDoneBy: "User Alice"
    }
]


const StatusCell = ({ initialStatus }) => {
    const [status, setStatus] = useState(initialStatus);

    const handleChange = (e) => {
        setStatus(e.target.value);
        console.log("Updated status:", e.target.value);
    };

    return (
        <select
            value={status}
            onChange={handleChange}
            className={`status-select ${status.replace(/\s+/g, '-').toLowerCase()}`}
        >
            <option value="Pending Verification">Pending Verification</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
        </select>
    );
};



const StoreTable = () => {
    const [search, setSearch] = useState('')
    const [pageSize, setPageSize] = useState(10)
    const [columnFilters, setColumnFilters] = useState([])

    const userRole = useSelector((state) => state.user.user.role)
    console.log("userRole :", userRole)


    const filteredStores = useMemo(() => {
        return StoresData.filter((store) =>
            store.storeName.toLowerCase().includes(search.toLowerCase()) ||
            store.storeLocation.toLowerCase().includes(search.toLowerCase())
        )
    }, [search])



    const userColumns = useMemo(() => [
        {
            header: "Store Name",
            accessorKey: "storeName"
        },
        {
            header: "Store Location",
            accessorKey: "storeLocation"
        },
        {
            header: "Last Captured",
            accessorKey: "lastCapturedTime"
        },
        {
            header: "Location Map",
            cell: ({ row }) => {
                const { latitude, longitude } = row.original;
                const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                return (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                        View on Map
                    </a>
                );
            }
        },
        {
            header: "Status",
            // accessorKey: 'status',
            cell: ({ row }) => {
                const { status } = row.original;
                return (
                    <span className={`status-badge ${status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {status}
                    </span>
                )
            },
            enableColumnFilter: true

        }

    ])

    const adminColumns = useMemo(() => [
        {
            header: "Store Name",
            accessorKey: "storeName"
        },
        {
            header: "Store Location",
            accessorKey: "storeLocation"
        },
        {
            header: "Last Captured",
            accessorKey: "lastCapturedTime"
        },
        {
            header: "Updated By",
            accessorKey: "taskDoneBy"
        },
        {
            header: "Location Map",
            cell: ({ row }) => {
                const { latitude, longitude } = row.original;
                const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                return (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                        View on Map
                    </a>
                );
            }
        },
        {
            header: "Status (Editable)",
            accessorKey: "status",
            cell: ({ row }) => <StatusCell initialStatus={row.original.status} />
        },
    ])


    console.log(userRole)

    const table = useReactTable({
        data: filteredStores,
        columns: userRole === "Admin" ? adminColumns : userColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize }
        },
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel()
    })

    return (
        <div className='table_section'>

            {/* Search Section */}
            <div className="search_section">
                <GoSearch className="search_icon" />
                <input
                    type="text"
                    placeholder="Search by store name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search_input"
                />
            </div>

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
                        <tr>
                            {table.getHeaderGroups()[0].headers.map((header)=>(
                                <th key={header.id}>
                                    

                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        data-label={cell.column.columnDef.header} // 🔹 mobile label
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination_controls">
                <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} >
                    Prev
                </button>
                <span>
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    Next
                </button>
                <select value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))} >
                    {[5, 10, 20].map((size) => (
                        <option key={size} value={size}>
                            Show {size}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export default StoreTable