import React, { useState } from 'react'
import '../styles/LocationRecords.scss'
import { AiOutlinePlus } from 'react-icons/ai'
import BaseModal from '../../../components/ui/Modal/BaseModal';
import PunchIn from './PunchIn';
import StoreTable from '../components/StoreTable';
import { div } from 'framer-motion/client';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PunchinRecords = () => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const navigate = useNavigate();
    const userRole = useSelector((state) => state.auth?.user?.role)


    return (
        <div className="all-body">
            <div className='location_capture'>
                <div className="header_section">
                    <div className="header-tit">
                        <div className="header_title">Manage Store Locations</div>
                        <div className="header_sub">Track and manage your store locations </div>

                    </div>
                    {userRole !== "Admin" &&
                        (<div className="add_new_button" onClick={() => {
                            navigate("/punch-in/capture")
                        }}>
                            <AiOutlinePlus className='icon' />
                            <span className='add-loc-label'>Add Location</span>
                        </div>)
                    }
                </div>
                <div className="">
                    <StoreTable />
                </div>
            </div>
        </div>

    )
}

export default PunchinRecords