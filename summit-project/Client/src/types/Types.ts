export type taskType = {
    taskId: string,
    title: string,
    description: string,
    assignedTo: string,
    duedate: string,
    priority: string,
    status: string,
};

export type userData ={
    email: string,
    firstName: string,
    lastName: string,
    userName: string,
    permissions: string,
    token: string
};

export type teamType = {
    teamId?: string,
    teamName: string,
    teamTitle: string,
    usersInTeam?: Array<string>,
};

export type priorityValues =  'Low' | 'Medium' | 'High';
export type statusValues = 'Open' | 'In progress' | 'Complete'
export type activeComponentValues = 'Home' | 'Tasks' | 'Teams' | 'Calendar' | 'Chat' | 'Users';



export type statusArrayType = {
    username: string,
    update: string,
    timestamp: string,
};

export type taskDataType = {
    title: string,
    description: string,
    duedate: string,
    priority?: priorityValues | '',
    statusUpdate: statusArrayType[],
    assignedTo?: string,
    status?: string,
}

export type teamInfoType = {
    teamId: string;
    teamName: string;
    teamDescription: string;
    teamMembers: string;
};

export type side = 'left' | 'right';

export type userCredentials = {
    username: string;
    password: string;
    otp?: string;
};
