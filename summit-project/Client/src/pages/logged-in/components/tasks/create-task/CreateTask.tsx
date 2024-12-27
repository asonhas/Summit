import { memo, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "../../../../../contexts/User-Context";
import CustomDatePicker from "./components/CustomDatePicker";
import { axiosClient } from "../../../../../axios";
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { priorityValues, taskDataType } from "../../../../../types/Types";
import './CreateTask.css';
import './reactDatePicker.css';
import Utils from "../../../../../utils/Utils";

interface CreateTaskProps {
    setShowCreateTask: (setShowCreateTask: boolean) => void;
}

function CreateTask({ setShowCreateTask }: CreateTaskProps): ReactNode{
    const { user } = useUser();
    const [ choosedDate, setChoosedDate ] = useState<string>('');
    const [ priority, setPriority] = useState<priorityValues>('Low');

    const customAlert = useCallback(
        (title: string, text: string, icon: SweetAlertIcon, confirmButtonText: string) => {
            
            Swal.fire({ title, text, icon, confirmButtonText });
    },[]);

    const data = useRef<taskDataType>({
        title: '',
        description: '',
        assignedTo: '',
        duedate: '',
    });

    const validateData = useCallback((): boolean => {
        return Object.values(data.current).every((field) => field.trim().length > 0);
    }, []);

    const handleSaveBtnClick = useCallback<()=> void>(async ()=>{
        try {
            if(validateData()){
                const response = await axiosClient.put('/api/tasks/saveTask',{
                    title: data.current.title,
                    description: data.current.description,
                    assignedTo: data.current.assignedTo,
                    duedate: data.current.duedate,
                    priority,
                    username: user?.userName,
                })
                if(response.status == 201){
                    Utils.customAlert('Create Task','The task was saved successfully.','warning','OK');
                    setShowCreateTask(false);
                }
            }else {
                Utils.customAlert('Create Task','Some of the fields are empty. Please note that all fields are required.','warning','OK');
            }
        } catch (error) {
            console.error('Something went wrong:',error);
            customAlert('Create Task','Something went wrong.','error','OK')
        }
        
    },[customAlert, priority, setShowCreateTask, validateData]);

    const handleTitleChange = useCallback<(event: React.ChangeEvent<HTMLInputElement>)=> void>((event: React.ChangeEvent<HTMLInputElement>)=>{
        data.current.title = event.target.value;
    },[]);
    const handleDescriptionChange = useCallback<(event: React.ChangeEvent<HTMLTextAreaElement>)=> void>((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        data.current.description = event.target.value;
    }, []);
    const handleAssignedToChange = useCallback<(event: React.ChangeEvent<HTMLInputElement>)=> void>((event: React.ChangeEvent<HTMLInputElement>)=>{
        data.current.assignedTo = event.target.value;
    },[]);

    const handleChange = useCallback<(event: React.ChangeEvent<HTMLSelectElement>)=> void>((event: React.ChangeEvent<HTMLSelectElement>) => {
        setPriority(event.target.value as priorityValues);
    },[]);

    useEffect(() => {
        data.current.duedate = choosedDate;
    }, [choosedDate]); // This effect will run whenever choosedDate changes.
    return(
        <div className='create-task-container'>
            <div className='task-form-row'>
                <h3>creator: <span style={{ marginLeft: "55px" }}>{user?.userName}</span></h3>
            </div>
            <div className='task-form-row'>
                <h3>Task title:</h3>
                <input style={{ marginLeft: "27px" }} className='title-input' type='text' placeholder='title...' onChange={handleTitleChange} required />
            </div>
            <div className='task-form-row'>
                <h3 style={{alignSelf: 'flex-start'}}>Description: </h3>
                <textarea className='description-text' placeholder='Description...' onChange={handleDescriptionChange} required></textarea>
            </div>
            <div className='task-form-row'>
                <h3>Assigned to:</h3>
                <input className='title-input' type='text' placeholder='Assigned to' onChange={handleAssignedToChange} required />
            </div>
            <div className='task-form-row'>
                <h3>Due date:</h3>
                {<CustomDatePicker setChoosedDate={setChoosedDate} />}
                <h3>Priority:</h3>
                <div>
                    <select 
                        className='task-priority'
                        value={priority}
                        onChange={handleChange}>
                        <option value='Low'>Low</option>
                        <option value='Medium'>Medium</option>
                        <option value='High'>High</option>
                    </select>
                </div>
            </div>
            <div className='controls'>
                <div className='controlBtn' onClick={handleSaveBtnClick}> Save</div>
            </div>
        </div>
    );
}
export default memo(CreateTask);