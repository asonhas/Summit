import { memo, ReactNode, useCallback, useEffect, useState } from "react";
import CreateTask from "./create-task/CreateTask";
import { taskType } from "../../../../types/Types";
import { axiosClient } from "../../../../axios";
import './Tasks.css';
import { useUser } from "../../../../contexts/User-Context";

function Tasks(): ReactNode {
    const { user } = useUser();
    const [showCreateTask, setShowCreateTask] = useState<boolean>(false);
    const [tasksArr, setTasksArr] = useState<Array<taskType>>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axiosClient.post('/api/tasks/',{
                    username:  user?.userName,
                });
                if (response?.data?.tasks) {
                    setTasksArr(response.data.tasks);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchTasks();

    }, [user?.userName]);

    const handleCreateTaskClick = useCallback(() => {
        setShowCreateTask(true);
    }, []);

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
                            <CreateTask setShowCreateTask={setShowCreateTask} />
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
                        <span>Assigned To</span>
                        <span>Due Date</span>
                    </div>
                    {tasksArr.map((task, index) => (
                        <div className="task-row" key={index}>
                            <span>{task.taskId}</span>
                            <span>{task.title}</span>
                            <span>{task.description}</span>
                            <span>{task.priority}</span>
                            <span>{task.assignedTo}</span>
                            <span>{task.duedate}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default memo(Tasks);
