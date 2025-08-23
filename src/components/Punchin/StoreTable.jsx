import React, { useMemo, useState } from 'react'
import './StoreTable.scss'
import { GoSearch } from 'react-icons/go';
import StoreCard from './StoreCard';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable
} from '@tanstack/react-table';

const StoresData = [
    {
        storeName: "Harbor Diner",
        storeLocation: "101 Harbor Street, Anytown",
        lastCapturedTime: "2024-02-15 09:30 AM",
        status: "Active",
        latitude: 40.7128,
        longitude: -74.0060
    },
    {
        storeName: "Greenfield Market",
        storeLocation: "202 Greenfield Drive, Anytown",
        lastCapturedTime: "2024-02-14 02:10 PM",
        status: "Inactive",
        latitude: 40.7139,
        longitude: -74.0021
    },
    {
        storeName: "Cedar Cafe",
        storeLocation: "303 Cedar Lane, Anytown",
        lastCapturedTime: "2024-02-13 11:45 AM",
        status: "Active",
        latitude: 40.7150,
        longitude: -74.0105
    },
    {
        storeName: "Sunset Grill",
        storeLocation: "404 Sunset Blvd, Anytown",
        lastCapturedTime: "2024-02-12 01:20 PM",
        status: "Inactive",
        latitude: 40.7162,
        longitude: -74.0088
    },
    {
        storeName: "Valley Bistro",
        storeLocation: "505 Valley Road, Anytown",
        lastCapturedTime: "2024-02-11 10:15 AM",
        status: "Active",
        latitude: 40.7175,
        longitude: -74.0033
    },
    {
        storeName: "Pinecrest Deli",
        storeLocation: "606 Pinecrest Ave, Anytown",
        lastCapturedTime: "2024-02-10 03:40 PM",
        status: "Active",
        latitude: 40.7189,
        longitude: -74.0011
    },
    {
        storeName: "Metro Market",
        storeLocation: "707 Metro Plaza, Anytown",
        lastCapturedTime: "2024-02-09 12:00 PM",
        status: "Inactive",
        latitude: 40.7202,
        longitude: -74.0092
    },
    {
        storeName: "Golden Spoon",
        storeLocation: "808 Golden Street, Anytown",
        lastCapturedTime: "2024-02-08 08:25 AM",
        status: "Active",
        latitude: 40.7215,
        longitude: -74.0077
    },
    {
        storeName: "Riverbend Eatery",
        storeLocation: "909 Riverbend Way, Anytown",
        lastCapturedTime: "2024-02-07 04:55 PM",
        status: "Inactive",
        latitude: 40.7228,
        longitude: -74.0044
    },
    {
        storeName: "Oakwood Cafe",
        storeLocation: "1001 Oakwood Drive, Anytown",
        lastCapturedTime: "2024-02-06 07:10 AM",
        status: "Active",
        latitude: 40.7240,
        longitude: -74.0029
    }
];

const defaultColumns = [
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
        header: "",
        id: "blank",
        cell: () => null,
    }

]

const StoreTable = () => {
    const [search, setSearch] = useState('')

    const filteredStores = useMemo(() => {
        return StoresData.filter((store) =>
            store.storeName.toLowerCase().includes(search.toLowerCase()) ||
            store.storeLocation.toLowerCase().includes(search.toLowerCase())

        )
    }, [search])



    const table = useReactTable({
        data: filteredStores,
        columns: defaultColumns,
        getCoreRowModel: getCoreRowModel(),
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
        </div>
    )
}

export default StoreTable