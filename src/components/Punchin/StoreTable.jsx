import React, { useState } from 'react'
import './StoreTable.scss'
import { GoSearch } from 'react-icons/go';
import StoreCard from './StoreCard';

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


            {/* Mobile View Card */}
            <div className="mobile_cards">
                {filteredStores.length === 0 && (
                    <div className="empty_state">No matching stores found.</div>
                )}
                {filteredStores.map((s, idx) => {
                    const times = ['08:05 AM 12 2 2023', '09:30 AM', '11:15 AM', '01:50 PM', '03:10 PM', '05:45 PM'];
                    const captureTime = times[idx % times.length];
                    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name} ${s.city}`)}`;
                    return (
                        <StoreCard
                            key={s.id}
                            name={s.name}
                            captureTime={captureTime}
                            area={s.city}
                            map={mapLink}
                        />
                    );
                })}
            </div>

        </div>
    )
}

export default StoreTable