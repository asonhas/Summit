import { memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './Calendar.css';
import { axiosClient } from '../../../../axios';
import AddEvent from './event/AddEvent';

interface Event {
  date: number; // day of the month
  title: string;
  id?: string;
}
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Calendar(): ReactNode{
    // State for current year and month
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed (0 = January)
    const [ showAddEvent, setShowAddEvent ] = useState<boolean>(false);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startDay = firstDayOfMonth.getDay(); // Day of the week (0 = Sunday)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const calendarDays = Array(startDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
    const dayForNewEvent = useRef<string>('1');

    // Sample events (you can fetch these from an API or database)
    const [events, setEvents] = useState<Event[]>([]);
    useEffect(()=>{
        if(events.length == 0){
            try {
                axiosClient.post('/api/calendar/',{
                    currentMonth,
                    currentYear,
                })
                .then((response) => {
                    const events: Array<Event> = [];
                    const Tasks = response.data.filteredUserTasks;
                    const PersonalEvents = response.data.personalEvents;
                    if (Array.isArray(Tasks) && Array.isArray(PersonalEvents)) {
                        Tasks.forEach((task)=> {
                            const date: number = parseInt(task.tasks.duedate.split('/')[0]);
                            const title: string = task.tasks.title;
                            const id: string = task.tasks.taskId;
                            events.push({
                                date,
                                title,
                                id,
                            });
                        });

                        PersonalEvents.forEach((PersonalEvent)=>{
                            const date: number = parseInt(PersonalEvent.date.split('/')[0]);
                            const title: string = PersonalEvent.title;
                            events.push({
                                date,
                                title,
                            });
                        });

                        setEvents(events);
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
    },[currentMonth, currentYear, events.length]);

    const moveToNextMonth = useCallback(() => {
        setCurrentMonth((prev) => {
            const nextMonth = (prev + 1) % 12;
            if (nextMonth === 0) setCurrentYear((year) => year + 1);
            return nextMonth;
        });
    },[]);

    const moveToPreviousMonth = useCallback(() => {
        setCurrentMonth((prev) => {
        const previousMonth = (prev - 1 + 12) % 12;
        if (previousMonth === 11) setCurrentYear((year) => year - 1);
        return previousMonth;
        });
    },[]);

    const getNextMonthAndYear = useCallback(() => {
        const nextMonth = (currentMonth + 1) % 12;
        const nextYear = nextMonth === 0 ? currentYear + 1 : currentYear;
        return { nextMonth, nextYear };
    },[currentMonth, currentYear]);

    const getPreviousMonthAndYear = useCallback(() => {
        const previousMonth = (currentMonth - 1 + 12) % 12;
        const previousYear = previousMonth === 11 ? currentYear - 1 : currentYear;
        return { previousMonth, previousYear };
    },[currentMonth, currentYear]);

    const { nextMonth, nextYear } = useMemo(()=> getNextMonthAndYear(),[getNextMonthAndYear]);
    const { previousMonth, previousYear } = useMemo(()=> getPreviousMonthAndYear(),[getPreviousMonthAndYear]);

    const handleAddEvent = useCallback((date: number)=>{
        let month = '';
        if(currentMonth+1 < 10){
            month = '0'+ String(currentMonth+1);
        }else{
            month = String(currentMonth+1);
        }
        dayForNewEvent.current = String(date+'/'+ month +'/'+currentYear);
        setShowAddEvent(true);
    },[currentMonth, currentYear]);

    return (
        <div className="calendar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 onClick={moveToPreviousMonth}>
                    {`${previousMonth + 1}/${previousYear}`}
                </h3>
                <h2>{`${currentMonth + 1}/${currentYear}`}</h2>
                <h3 onClick={moveToNextMonth}>
                    {`${nextMonth + 1}/${nextYear}`}
                </h3>
            </div>
            <div className="days-of-week">
                {daysOfWeek.map((day) => (
                    <div key={day} className="day-header">
                        {day}
                    </div>
                ))}
            </div>
            <div className="dates">
                {calendarDays.map((date, index) => {
                    const dayEvents = events.filter((event) => event.date === date);
                    return (
                        <div key={index} className={`date ${date ? '' : 'empty'}`} >
                            <div className="date-header">
                                <span className='add-event-btn' onClick={()=> handleAddEvent(date)}>{date ? '+' : undefined}</span>
                                <div className="date-number">{date || ''}</div>
                            </div>
                            <div className="events">
                                {dayEvents.map((event, idx) => (
                                    <div key={`${event.date}-${event.title}-${idx}`} className="event" style={{backgroundColor: event.id ? '' : '#b1ffd6'}}>
                                        {event.id ? `${event.id}: ${event.title}` : `${event.title}`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            {showAddEvent &&
                <div className='add-event-background'>
                    <div className='add-event-div'>
                        <div className='close-window-container'>
                            <div className='close-window-title'>Add Event</div>
                            <div className='close-window' onClick={() => setShowAddEvent(false)}>X</div>
                        </div>
                        <div className='add-event-content'>
                            <AddEvent setEvents={setEvents} date={`${dayForNewEvent.current}`} setShowAddEvent={setShowAddEvent} />
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default memo (Calendar);
