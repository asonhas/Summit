import { memo, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import './EditTask.css';
import { axiosClient } from "../../../../../axios";
import Input from "../../input-component/Input";
import CustomDatePicker from "../create-task/components/CustomDatePicker";
import { priorityValues, statusValues, taskDataType } from "../../../../../types/Types";
import Button from "../../button-component/Button";
import Utils from "../../../../../utils/Utils";
import axios from "axios";

interface editTaskProps {
    taskId: string;
}
function EditTask({taskId}: editTaskProps): ReactNode{
    const [ teams, setTeams ] = useState<Array<string>>([]);
    const [taskData, setTaskData] = useState<taskDataType>({
        title: '',
        description: '',
        duedate: '',
        priority: '',
        statusUpdate: [],
        assignedTo: '',
        status: '',
    });
    const update = useRef<string>("");
    const fetchData = useRef<boolean>(true);
    useEffect(()=>{
        axiosClient.post('/api/teams/list-teams')
        .then((result)=>{
            setTeams(result.data.teams);
        });
    },[]);
    useEffect(()=>{
        const fetchTask = async ()=>{
            if((taskId && typeof taskId == 'string') ){
                try {
                    const result = await axiosClient.post(`/api/tasks/${taskId}`)
                    if(result){
                        setTaskData({
                            title: result.data.filteredTaskFields.title,
                            description: result.data.filteredTaskFields.description,
                            duedate: result.data.filteredTaskFields.duedate,
                            priority: result.data.filteredTaskFields.priority,
                            statusUpdate: result.data.filteredTaskFields.statusUpdate,
                            assignedTo: result.data.filteredTaskFields.assignedTo,
                            status: result.data.filteredTaskFields.status,
                        });
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        };
        if(fetchData.current){
            fetchTask();
            fetchData.current = false;
        }

    },[taskData.statusUpdate.length, taskId]);

    const setChoosedDate = useCallback((value: string)=>{
        setTaskData((prevData) => ({
            ...prevData,
            duedate: value,
        }));
    },[]);
    const handlePriorityChange = useCallback<(event: React.ChangeEvent<HTMLSelectElement>)=> void>((event: React.ChangeEvent<HTMLSelectElement>) => {
        setTaskData((prevData) => ({
            ...prevData,
            priority: event.target.value as priorityValues,
        }));
    },[]);
    const handleStatusChange = useCallback<(event: React.ChangeEvent<HTMLSelectElement>)=> void>((event: React.ChangeEvent<HTMLSelectElement>) => {
        setTaskData((prevData) => ({
            ...prevData,
            status: event.target.value as statusValues,
        }));
    },[]);


    const handleAddUpdate = useCallback(async ()=>{
        try {
            const response = await axiosClient.put('/api/tasks/statusUpdate',{
                taskId,
                update: update.current,
            });
            if(response){
                Utils.customAlert('Update status','Update saved successfully','success','OK');
                fetchData.current = true;
                update.current = '';
                const updateElement = document.getElementById('update-textarea') as HTMLTextAreaElement;
                updateElement.value = update.current;
                if(taskData.statusUpdate.length == 0){
                    setTaskData((prevData) => ({
                        ...prevData,
                        statusUpdate: [{
                            timestamp: '',
                            update: '',
                            username: '',
                        }],
                    }));
                }else{
                    setTaskData((prevData) => ({
                        ...prevData,
                        statusUpdate: [],
                    }));
                }
                
            }
        } catch (error) {
            if(axios.isAxiosError(error)){
                if (error.response && error.response.status === 400){
                    return Utils.customAlert('Edit task','Missing required data.','error','OK'); 
                }
            }
        }
    },[taskData.statusUpdate.length, taskId]);

    const handleChangeUpdate = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        update.current = event.target.value;
        event.target.value = update.current;
    },[]);

    const handleChangeTitle = useCallback((event: React.ChangeEvent<HTMLInputElement>)=>{
        setTaskData((prevData) => ({
            ...prevData,
            title: event.target.value,
        }));
    },[]);
    const handleChangeDescription = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>)=>{
        setTaskData((prevData) => ({
            ...prevData,
            description: event.target.value,
        }));
    },[]);

    const handleAssignedToChange = useCallback<(event: React.ChangeEvent<HTMLSelectElement>)=> void>((event: React.ChangeEvent<HTMLSelectElement>)=>{
        setTaskData((prevData) => ({
            ...prevData,
            assignedTo: event.target.value,
        }));
    },[]);

    const handleUpdateTask = useCallback(async()=>{
        try {
            const response = await axiosClient.post(`/api/tasks/update/${taskId}`,{
                title: taskData.title,
                description: taskData.description,
                duedate: taskData.duedate,
                priority: taskData.priority,
                status: taskData.status,
                assignedTo: taskData.assignedTo,
            });
            if(response.status == 200){
                return Utils.customAlert('Edit task',`Task ${taskId}  updated successfully`,'success','OK');
            }
        } catch (error) {
            console.error(error);
            return Utils.customAlert('Edit task','Missing required data.','error','OK'); 
        }
    },[taskData.assignedTo, taskData.description, taskData.duedate, taskData.priority, taskData.status, taskData.title, taskId]);
    
    

    return(
        <div className='edit-task-container'>
            <div className='task-id'><h2>Task: {taskId}</h2></div>
            <div className='task-content'>
                <div className="first-child">
                    <div className="row">
                        <h2 style={{marginRight: '38px'}} >Task title:</h2>
                        <Input type="text" width="500px" value={taskData.title} onChange={handleChangeTitle}/>
                    </div>
                    <div className="row">
                        <h2>Description:</h2>
                        <textarea className='textarea-input' value={taskData.description || ''} onChange={handleChangeDescription}></textarea>
                    </div>
                    <div className="row">
                        <h2>Assigned to:</h2>
                        <select 
                            className='task-priority'
                            value={taskData.assignedTo}
                            onChange={handleAssignedToChange}>
                            <option value="Choose a team">Choose a team</option>
                            {teams.map((team, index)=>(
                                <option key={index} value={team}>{team}</option>
                            ))}
                        </select>
                    </div>
                    <div className="row">
                        <h2 style={{marginRight: '10px'}}>Due date:</h2>
                        <CustomDatePicker value={taskData.duedate} setChoosedDate={setChoosedDate} width="500px" />
                    </div>
                    <div className="row">
                        <h2 style={{marginRight: '57px'}}>Priority:</h2>
                        <select 
                            className='task-priority'
                            value={taskData.priority}
                            onChange={handlePriorityChange}>
                            <option value='Low'>Low</option>
                            <option value='Medium'>Medium</option>
                            <option value='High'>High</option>
                        </select>
                    </div>
                    <div className="row">
                        <h2 style={{marginRight: '68px'}}>Status:</h2>
                        <select 
                            className='task-priority'
                            value={taskData.status}
                            onChange={handleStatusChange}>
                            <option value='open'>Open</option>
                            <option value='in progress'>In progress</option>
                            <option value='complete'>complete</option>
                        </select>
                    </div>
                    <div className="row">
                        <Button onClick={handleUpdateTask} width="800px">Update task</Button>
                    </div>
                </div>
                <div className="last-child">
                    <div className="row first">
                        {taskData.statusUpdate.map((update, index)=>(
                            <div key={index} className='updates-container' style={{}}>
                                <div className='update-header' key={index}>
                                    <h2>{`${update.username}`}</h2>
                                    <h2>{`${Utils.formatDate(update.timestamp)}`}</h2>
                                </div>
                                <p style={{  }}> {update.update} </p>
                            </div>
                        ))}
                    </div>
                    <div className="row last">
                        <textarea id='update-textarea' className='textarea-input' onChange={handleChangeUpdate} placeholder="Update.."></textarea>
                        <Button width="150px" marginLeft="10px" onClick={handleAddUpdate}>Save update</Button>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default memo(EditTask);