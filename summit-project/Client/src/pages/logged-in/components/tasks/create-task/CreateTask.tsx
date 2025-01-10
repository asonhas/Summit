import { memo, ReactNode, useCallback, useEffect, useState } from "react";
import { useUser } from "../../../../../contexts/User-Context";
import CustomDatePicker from "./components/CustomDatePicker";
import { axiosClient } from "../../../../../axios";
import { priorityValues, taskDataType, taskType } from "../../../../../types/Types";
import './reactDatePicker.css';
import Utils from "../../../../../utils/Utils";
import './CreateTask.css';
import Input from "../../input-component/Input";

interface CreateTaskProps {
    setShowCreateTask: (setShowCreateTask: boolean) => void;
    setTasksArr: (setTasksArr: Array<taskType>) => void
}

function CreateTask({ setShowCreateTask, setTasksArr }: CreateTaskProps): ReactNode{
    const { user } = useUser();
    const [ choosedDate, setChoosedDate ] = useState<string>('');
    const [ priority, setPriority] = useState<priorityValues>('Low');
    const [ teams, setTeams ] = useState<Array<string>>([]);
    const [ assignedTo, setAssignedTo ] = useState<string>('Choose a team');

    const [data, setData ] = useState<taskDataType>({
        title: '',
        description: '',
        duedate: '',
        statusUpdate: [],
    });

    useEffect(()=>{
        const all = 'all';
        axiosClient.get(`/api/teams/list-teams/${all}`)
        .then((result)=>{
            setTeams(result.data.teams);
        });
    },[]);

    const validateData = useCallback((): boolean => {
        if (typeof data.title !== 'string' || data.title.trim() === '') {return false;}
        if (typeof data.description !== 'string' || data.description.trim() === '') {return false;}
        if (typeof data.duedate !== 'string' || data.duedate.trim() === '') {return false;}
        if (!['Low', 'Medium', 'High'].includes(priority)) {return false;}
        console.log(assignedTo);
        if (typeof assignedTo !== 'string' || assignedTo.trim() === '' || assignedTo === 'Choose a team') {return false;}
        if (!Array.isArray(data.statusUpdate) || !data.statusUpdate.every(
            (status) =>
                (typeof status.username === 'string' && status.username.length > 0) &&
                (typeof status.update === 'string' && status.update.length > 0)
            )
        ) {return false;}
        return true;
    }, [assignedTo, data.description, data.duedate, data.statusUpdate, data.title, priority]);

    const handleSaveBtnClick = useCallback<()=> void>(async ()=>{
        try {
            if(validateData()){
                const response = await axiosClient.put('/api/tasks/saveTask',{
                    title: data.title,
                    description: data.description,
                    assignedTo: assignedTo,
                    duedate: data.duedate,
                    priority: priority,
                })
                if(response.status == 201){
                    Utils.customAlert('Create Task','The task was saved successfully.','warning','OK');
                    setTasksArr([]);
                    setShowCreateTask(false);
                }
            }else {
                Utils.customAlert('Create Task','Some of the fields are empty. Please note that all fields are required.','warning','OK');
            }
        } catch (error) {
            console.error('Something went wrong:',error);
            Utils.customAlert('Create Task','Something went wrong.','error','OK');
        }
        
    },[assignedTo, data.description, data.duedate, data.title, priority, setShowCreateTask, setTasksArr, validateData]);

    const handleTitleChange = useCallback<(event: React.ChangeEvent<HTMLInputElement>)=> void>((event: React.ChangeEvent<HTMLInputElement>)=>{
        setData((prev)=>({
            ...prev, title: event.target.value
        }));
    },[]);

    const handleDescriptionChange = useCallback<(event: React.ChangeEvent<HTMLTextAreaElement>)=> void>((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setData((prev)=>({
            ...prev, description: event.target.value
        }));
    }, []);

    const handleAssignedToChange = useCallback<(event: React.ChangeEvent<HTMLSelectElement>)=> void>((event: React.ChangeEvent<HTMLSelectElement>)=>{
        setAssignedTo(event.target.value);
    },[]);

    const handleChange = useCallback<(event: React.ChangeEvent<HTMLSelectElement>)=> void>((event: React.ChangeEvent<HTMLSelectElement>) => {
        setPriority(event.target.value as priorityValues);
    },[]);

    useEffect(() => {
        setData((prev)=>({
            ...prev, duedate: choosedDate
        }));
    }, [choosedDate]);
    return(
        <div className='create-task-container'>
            <div className='task-form-row'>
                <h3>creator: <span style={{ marginLeft: "55px" }}>{user?.userName}</span></h3>
            </div>
            <div className='task-form-row'>
                <h3>Task title:</h3>
                <Input type="text" value={data.title} placeholder="title..." onChange={handleTitleChange} width="500px" marginLeft="27px" required focusEfect={true} />
                {/*<input style={{ marginLeft: "27px" }} className='title-input' type='text' placeholder='title...' onChange={handleTitleChange} required />*/}
            </div>
            <div className='task-form-row'>
                <h3 style={{alignSelf: 'flex-start'}}>Description: </h3>
                <textarea className='description-text' placeholder='Description...' onChange={handleDescriptionChange} required></textarea>
            </div>
            <div className='task-form-row'>
                <h3>Assigned to:</h3>
                <div>
                    <select 
                        className='task-assigned-to'
                        value={assignedTo}
                        onChange={handleAssignedToChange}>
                        <option value="Choose a team">Choose a team</option>
                        {teams.map((team, index)=>(
                            <option key={index} value={team}>{team}</option>
                        ))}
                    </select>
                </div>
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