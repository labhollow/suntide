import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { isWithinThreeHours } from '@/utils/dateUtils';
import { format, parseISO } from 'date-fns';

const localizer = momentLocalizer(moment);

const TideCalendar = ({ tideData }) => {
    console.log('Received Tide Data:', tideData);

    const events = tideData.map(tide => {
        try {
            // Parse the date string to a Date object
            const tideDate = parseISO(tide.t);
            
            // Validate the date is valid
            if (isNaN(tideDate.getTime())) {
                console.warn('Invalid date from tide data:', tide.t);
                return null;
            }

            const tideTime = format(tideDate, 'hh:mm a');
            const isNearSunriseOrSunset = tide.type === 'L' && (
                (tide.sunrise && isWithinThreeHours(tideTime, tide.sunrise)) ||
                (tide.sunset && isWithinThreeHours(tideTime, tide.sunset))
            );

            // Only return events for low tides near sunrise/sunset
            if (!isNearSunriseOrSunset) {
                return null;
            }

            // Determine if it's near sunrise or sunset for the title
            const isNearSunrise = tide.sunrise && isWithinThreeHours(tideTime, tide.sunrise);
            const timeOfDay = isNearSunrise ? 'Sunrise' : 'Sunset';
            const relevantTime = isNearSunrise ? tide.sunrise : tide.sunset;

            return {
                start: tideDate,
                end: tideDate,
                title: `Low Tide at ${format(tideDate, 'hh:mm a')} - Near ${timeOfDay} (${relevantTime})`,
                isNearSunriseOrSunset: true,
                allDay: false,
                resource: {
                    sunrise: tide.sunrise,
                    sunset: tide.sunset
                }
            };
        } catch (error) {
            console.error('Error processing tide data:', error, tide);
            return null;
        }
    }).filter(Boolean); // Remove any null entries

    console.log('Processed Calendar Events:', events);

    const eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: '#ea384c',
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return (
        <div className="mt-4">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                eventPropGetter={eventStyleGetter}
                tooltipAccessor={(event) => {
                    if (!event.start) return '';
                    const timeStr = format(event.start, 'hh:mm a');
                    const sunriseStr = event.resource.sunrise ? `Sunrise: ${event.resource.sunrise}` : '';
                    const sunsetStr = event.resource.sunset ? `Sunset: ${event.resource.sunset}` : '';
                    return `${event.title}\n${sunriseStr}\n${sunsetStr}`;
                }}
            />
        </div>
    );
};

export default TideCalendar;