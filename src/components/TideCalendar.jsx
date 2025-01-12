import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const TideCalendar = ({ tideData }) => {
    const events = tideData.map(tide => ({
        start: new Date(tide.date), // Adjust to your tide date format
        end: new Date(tide.date), // Same as start for single-day events
        title: `${tide.type === 'H' ? '↑' : '↓'} Tide at ${tide.time} - Sunrise: ${tide.sunrise}, Sunset: ${tide.sunset}`,
        allDay: true,
    }));

    return (
        <div>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500, margin: '50px' }}
            />
        </div>
    );
};

export default TideCalendar;
