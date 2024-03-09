import React from "react";
import {ProjectContext} from "./ProjectSelectionContext.tsx";
import {useQuery} from "@tanstack/react-query";
import * as TaskRepository from "../localDb/TaskRepository.ts";
import TaskDetail from "./TaskItemLineDetails.tsx";

interface TaskItemLineProps {
    taskId: string;
}

const TaskItemLine: React.FC<TaskItemLineProps> = ({taskId}) => {
    const {editingProjectId} = React.useContext(ProjectContext);
    const [isExpanded, setIsExpanded] = React.useState(false);
    const childTaskQuery = useQuery({
        queryKey: ['project', editingProjectId, 'tasks', 'children', taskId, ],
        enabled: !!editingProjectId,
        queryFn: () => TaskRepository.getTaskIdsByParentId(editingProjectId ?? '', taskId),
        staleTime: 30000,
    });
    
    return (
        <div className="task-item" key={taskId}>
            <TaskDetail taskId={taskId} isExpanded={isExpanded} setIsExpanded={setIsExpanded}/>
            {/*<div className='border-b border-gray-600'>*/}
            {isExpanded && childTaskQuery.data?.map(taskId => <TaskItemLine key={taskId} taskId={taskId}/>)}
            {/*</div>*/}
        </div>
    )
}

export default TaskItemLine;