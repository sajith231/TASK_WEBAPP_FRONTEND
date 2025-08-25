import React, { useState } from 'react'
import './LocationRecords.scss'
import { AiOutlinePlus } from 'react-icons/ai'
import BaseModal from '../../components/Modal/BaseModal';
import PunchIn from './PunchIn';
import StoreTable from '../../components/Punchin/StoreTable';
import { div } from 'framer-motion/client';
import { useNavigate } from 'react-router-dom';

const LocationCapture = () => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const navigate = useNavigate();


    return (
        <div className="all-body">
            <div className='location_capture'>
                <div className="header_section">
                    <div className="header_title">Managed Store Locations</div>
                    <div className="add_new_button" onClick={() => {
                        navigate("/punch-in/capture")
                    }}>
                        <AiOutlinePlus className='icon' />
                    </div>
                </div>
                <div className="table_section">
                    <StoreTable />
                </div>


                {/* <BaseModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
                    <PunchIn />
                </BaseModal> */}
            </div>
        </div>

    )
}

export default LocationCapture