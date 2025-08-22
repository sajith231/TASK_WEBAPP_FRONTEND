import React from 'react'
import { FaTrash, FaSyncAlt } from 'react-icons/fa'
import './StoreCard.scss'
const StoreCard = ({ name, status = "Active", area, captureTime, map, onDelete = () => { }, onRefresh = () => { } }) => {
    return (
        <div className='store_card'>
            <div className="store_card_header">
                <h2>{name}</h2>
                <span className='status'>{status}</span>
            </div>


            <p className="store_address">{area}</p>

            <hr className='hr' />

            <div className="store_footer">
                <div className="footer_content">
                    <p className="last_captured">
                        Last Captured: {captureTime}
                    </p>
                    <a href="#" className="map_link">View on Map</a>

                </div>
                <div className="actions">
                    <button onClick={onDelete}><FaTrash /></button>
                    <button onClick={onRefresh}><FaSyncAlt /></button>
                </div>
            </div>

        </div>
    )
}

export default StoreCard