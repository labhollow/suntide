import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const TideCalendar = ({ tideData }) => {
    console.log('Received Tide Data:', tideData); // Log the tide data received

    const events = tideData.map(tide => {
        // Ensure tide.date is in a valid format
        const tideDate = new Date(tide.date); // Convert tide.date to a Date object
        return {
            start: tideDate,
            end: tideDate,
            title: `${tide.type === 'H' ? '↑' : '↓'} Tide at ${tide.time} - Sunrise: ${tide.sunrise}, Sunset: ${tide.sunset}`,
            allDay: true,
        };
    });

    console.log('Events Array:', events); // Log the events array before rendering

    const eventStyleGetter = (event) => {
        let backgroundColor = event.title.includes('↑') ? 'lightblue' : 'lightcoral'; 
        return {
            style: {
                backgroundColor: backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return (
        <div>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500, margin: '50px' }}
                eventPropGetter={eventStyleGetter}
            />
        </div>
    );
};

export default TideCalendar;
