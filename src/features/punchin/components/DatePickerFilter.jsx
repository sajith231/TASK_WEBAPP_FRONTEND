import React from 'react'
import DatePicker from 'react-multi-date-picker'

const DatePickerFilter = ({ value, setCalendarDates }) => {
    return (
        <div >
            <DatePicker
                range
                value={value}
                onChange={(e) => {
                    setCalendarDates([
                        e[1]?.format("YYYY-MM-DD"),
                        e[0]?.format("YYYY-MM-DD")
                    ])
                }}
            />
        </div>
    )
}

export default DatePickerFilter