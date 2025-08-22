import React, { useState } from 'react'
import './StoreTable.scss'
import { GoSearch } from 'react-icons/go';

const StoresData = [
    { id: 1, name: "Downtown Store", city: "New York" },
    { id: 2, name: "West Side Market", city: "Chicago" },
    { id: 3, name: "Central Plaza", city: "Los Angeles" },
    { id: 4, name: "Lakeside Outlet", city: "Seattle" },
];
const StoreTable = () => {
    const [search, setSearch] = useState('')

    const filteredStores = StoresData.filter((store) => {
        return store.name.toLowerCase().includes(search.toLowerCase())
    })

    return (
        <div className='table_container'>
            <div className="search_section">
                <GoSearch className="search_icon" />
                <input
                    type="text"
                    placeholder="Search stores..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search_input"
                />
            </div>




        </div>
    )
}

export default StoreTable