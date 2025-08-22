import React, { useState } from 'react'
import './LocationCapture.scss'
import { AiOutlinePlus } from 'react-icons/ai'
import BaseModal from '../../components/Modal/BaseModal';
import PunchIn from './PunchIn';
import StoreTable from '../../components/Punchin/StoreTable';

const LocationCapture = () => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);



    return (
        <div className='location_capture'>
            <div className="header_section">
                <div className="header_title">Store Locations</div>
                <div className="add_new_button" onClick={() => {
                    setIsConfirmOpen(!isConfirmOpen)
                }}>
                    <AiOutlinePlus className='icon' />
                </div>
            </div>
            <div className="table_section">
                <StoreTable />
            </div>


            <BaseModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
                <PunchIn />
                {/* <h2>Are you sure?</h2>
                <button onClick={() => { }}>Yes</button>
                <button onClick={() => setIsConfirmOpen(false)}>Cancel</button> */}
            </BaseModal>
        </div>

    )
}

export default LocationCapture