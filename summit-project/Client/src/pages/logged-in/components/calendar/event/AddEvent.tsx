import { memo, ReactNode, useCallback, useRef } from "react";
import './AddEvent.css';
import { axiosClient } from "../../../../../axios";
import Utils from "../../../../../utils/Utils";

interface Event {
    date: number; // day of the month
    title: string;
    id?: string;
}

interface EventProps {
    setEvents: (events: Event[]) => void;
    date: string
    setShowAddEvent: (showAddEvent: boolean) => void;
}

function AddEvent({ date, setShowAddEvent , setEvents }: EventProps): ReactNode{
    const title = useRef<string>('');
    const saveEvent = useCallback(async ()=>{
        if(title.current.length == 0){
            Utils.customAlert('Calendar','Event subject cannot be empty.','info','OK');
        }else{
            try {
                const response = await axiosClient.put('/api/calendar/',{
                    date,
                    title: title.current,
                });
                if(response){
                    Utils.customAlert('Calendar','Event saved successfully.','success','OK')
                    setEvents([]);
                    setShowAddEvent(false);
                }
            } catch (error) {
                console.error(error);
            }
        }
        
    },[date, setEvents, setShowAddEvent]);


    const handleTitleChange = useCallback<(event: React.ChangeEvent<HTMLTextAreaElement>)=> void>((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        title.current = event.target.value;
    }, []);

    return(
        <div className='event-container'>
            <h1>{date}</h1>
            <div className='event-box'>
                <div className='event-row'>
                    <textarea className='input' placeholder='Subject...' maxLength={158} onChange={handleTitleChange} required></textarea>
                </div>
                <div className="event-row">
                    <div className="save-btn" onClick={saveEvent}><span>save</span></div>
                </div>
            </div>
        </div>
    );
}

export default memo(AddEvent);