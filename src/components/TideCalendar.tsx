import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { isWithinHours } from '@/utils/dateUtils';
import { format, parseISO } from 'date-fns';

const localizer = momentLocalizer(moment);

interface TideEvent {
  start: Date;
  end: Date;
  title: string;
  isNearSunriseOrSunset: boolean;
  allDay: boolean;
  resource: {
    sunrise: string | null;
    sunset: string | null;
  };
}

interface Tide {
  t: string;
  v: string;
  type: string;
  sunrise?: string;
  sunset?: string;
  moonrise?: string;
  moonset?: string;
  moonPhase?: string;
  moonIllumination?: number;
}

interface TideCalendarProps {
  tideData: Tide[];
}

const TideCalendar: React.FC<TideCalendarProps> = ({ tideData }) => {
    console.log('Received Tide Data:', tideData);

    const events = tideData.map(tide => {
        try {
            const tideDate = parseISO(tide.t);
            
            if (isNaN(tideDate.getTime())) {
                console.warn('Invalid date from tide data:', tide.t);
                return null;
            }

            const tideTime = format(tideDate, 'hh:mm a');
            const isNearSunriseOrSunset = tide.type === 'L' && (
                (tide.sunrise && isWithinHours(tideTime, tide.sunrise, 2)) ||
                (tide.sunset && isWithinHours(tideTime, tide.sunset, 2))
            );

            if (!isNearSunriseOrSunset) {
                return null;
            }

            const isNearSunrise = tide.sunrise && isWithinHours(tideTime, tide.sunrise, 2);
            const timeOfDay = isNearSunrise ? 'Sunrise' : 'Sunset';
            const relevantTime = isNearSunrise ? tide.sunrise : tide.sunset;

            return {
                start: tideDate,
                end: tideDate,
                title: `${timeOfDay}: ${relevantTime}\nLow Tide: ${format(tideDate, 'hh:mm a')}`,
                isNearSunriseOrSunset: true,
                allDay: false,
                resource: {
                    sunrise: tide.sunrise || null,
                    sunset: tide.sunset || null
                }
            };
        } catch (error) {
            console.error('Error processing tide data:', error, tide);
            return null;
        }
    }).filter(Boolean) as TideEvent[];

    console.log('Processed Calendar Events:', events);

    const eventStyleGetter = (event: TideEvent) => {
        return {
            style: {
                backgroundColor: '#ea384c',
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '0.5rem',
                whiteSpace: 'pre-line'
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
                tooltipAccessor={(event: TideEvent) => {
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