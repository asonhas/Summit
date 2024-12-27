export type taskType = {
    taskId: string,
    title: string,
    description: string,
    assignedTo: string,
    duedate: string,
    priority: string,
};

export type userData ={
    email: string,
    firstName: string,
    lastName: string,
    userName: string,
    permissions: string
};

export type priorityValues =  'Low' | 'Medium' | 'High';

export type taskDataType = {
    title: string,
    description: string,
    assignedTo: string,
    duedate: string,
};
