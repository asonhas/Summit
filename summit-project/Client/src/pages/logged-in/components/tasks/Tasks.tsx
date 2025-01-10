import { memo, ReactNode, useCallback, useEffect, useState } from "react";
import CreateTask from "./create-task/CreateTask";
import { taskType } from "../../../../types/Types";
import { axiosClient } from "../../../../axios";
import refreshIcon from '../../../../assets/refresh-icon.png';
import deleteIcon from '../../../../assets/close-task.png';
import { useUser } from "../../../../contexts/User-Context";
import Utils from "../../../../utils/Utils";
import axios from "axios";
import EditTask from "./edit-task/EditTask";
import './Tasks.css';

interface taskProps {
    setCustomComponent: (component: ReactNode | null) => void;
}

function Tasks({ setCustomComponent }: taskProps): ReactNode {
    const { user } = useUser();
    const [showCreateTask, setShowCreateTask] = useState<boolean>(false);
    const [tasksArr, setTasksArr] = useState<Array<taskType>>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axiosClient.get('/api/tasks/');
                if (response?.data?.tasks) {
                    setTasksArr(response.data.tasks);
                }
            } catch (error) {
                if(axios.isAxiosError(error) && error.response?.status === 401){
                    return;
                }
            }
        };
        if(tasksArr.length == 0){
            fetchTasks(); 
        }

        const deleteIcons = document.querySelectorAll('.delete-task') as NodeListOf<Element>;
        deleteIcons.forEach((deleteIcon) => {
            deleteIcon.addEventListener('mouseenter', function() {
                const parentDiv = deleteIcon.parentElement as HTMLElement | null; // Ensure the parent is an HTMLElement or null
                if (parentDiv) {
                    const spanElements = Array.from(parentDiv.querySelectorAll('span'));
                    spanElements.forEach((spanElement)=> {
                        spanElement.style.textDecoration = 'line-through';
                        spanElement.style.color = 'red';
                    });
                }
            });
        
            deleteIcon.addEventListener('mouseleave', function() {
                const parentDiv = deleteIcon.parentElement as HTMLElement | null;
                if (parentDiv) {
                    const spanElements = Array.from(parentDiv.querySelectorAll('span'));
                    spanElements.forEach((spanElement)=> {
                        spanElement.style.textDecoration = '';
                        spanElement.style.color = 'black';
                    });
                }
            });
        });

    }, [tasksArr.length, user?.userName]);

    const handleCreateTaskClick = useCallback(() => {
        setShowCreateTask(true);
    }, []);

    const handleRefresh = useCallback(()=>{
        setTasksArr([]);
    },[]);

    const handleDeleteTask = useCallback(async (event: React.MouseEvent<HTMLImageElement>)=>{
        if(user && user.permissions == 'administrator'){
            const parentElement = event.currentTarget.parentElement as HTMLDivElement;
            const spanElements = Array.from(parentElement.querySelectorAll('span'));
            const taskID = spanElements[0].innerText;
            if(typeof taskID == 'string' && taskID.length > 0){
                Utils.customAlert2Fa().then(async (result)=>{
                    if (result.isConfirmed) {
                        try {
                            const response = await axiosClient.delete(`/api/tasks/delete/`,{
                                data: {taskToDelete: taskID, tokentoVerify: result.value },
                            });
                            if (response && response.status === 200){
                                Utils.customAlert('Delete task',`task ${taskID} is successfuly deleted`,'success','OK');
                                setTasksArr([]);
                            }
                        } catch (error) {
                            if(axios.isAxiosError(error)){
                                if (error.response && error.response.status === 401) {
                                    return Utils.customAlert('Delete task','Token verification failed.','error','OK');        
                                } 
                                if (error.response && error.response.status === 400) {
                                    return Utils.customAlert('Delete task','Missing required fields.','error','OK');        
                                }
                            }
                            Utils.customAlert('Delete task','Something went wrong, try again later.','error','OK');
                        }
                    }
                })
            }
        }else{
            Utils.customAlert('Delete task','You do not have the necessary permissions to delete this task. Please contact your team administrator','info','OK');
        }
        
    },[user]);

    const handleEditTask = useCallback((event: React.MouseEvent<HTMLDivElement>)=>{
        const row = (event.target as HTMLElement).parentElement;
        if(row){
            const taskId = row.querySelector('span') as HTMLSpanElement;
            setCustomComponent(<EditTask taskId={taskId.innerText} />);
        }
        
    },[setCustomComponent]);
    return (
        <div className='tasks-container'>
            <div className='create-task'>
                <h1 onClick={handleCreateTaskClick}>+ Create new task</h1>
            </div>
            {showCreateTask &&
                <div className='new-task-background'>
                    <div className='new-task-div'>
                        <div className='close-window-container'>
                            <div className='close-window-title'>Create new task</div>
                            <div className='close-window' onClick={() => setShowCreateTask(false)}>X</div>
                        </div>
                        <div className='create-task-content'>
                            <CreateTask setShowCreateTask={setShowCreateTask} setTasksArr={setTasksArr}/>
                        </div>
                    </div>
                </div>
            }
            <h2>All tasks:</h2>
            <div className='tasks-table-container'>
                <div className='tasks-table'>
                    <div className='tasks-header'>
                        <span>Task ID</span>
                        <span>Title</span>
                        <span>Description</span>
                        <span>Priority</span>
                        <span>Status</span>
                        <span>Assigned To</span>
                        <span>Due Date</span>
                        <img src={refreshIcon} className='refresh' onClick={handleRefresh} />
                    </div>
                    {tasksArr.map((task, index) => ( 
                        <div className="task-row" key={index} onDoubleClick={handleEditTask}> 
                            <span>{task.taskId}</span>
                            <span>{task.title}</span>
                            <span>{task.description}</span>
                            <span>{task.priority}</span>
                            <span>{task.status}</span>
                            <span>{task.assignedTo}</span>
                            <span>{task.duedate}</span>
                            <img src={deleteIcon} className="delete-task" onClick={handleDeleteTask} onDoubleClick={undefined}/> 
                        </div> 
                    ))}
                </div>
            </div>
        </div>
    );
}
export default memo(Tasks);
