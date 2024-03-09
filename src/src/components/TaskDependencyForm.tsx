import React from "react";
import {ProjectContext} from "./ProjectSelectionContext.tsx";
import {useQuery} from "@tanstack/react-query";
import * as TaskRepository from "../localDb/TaskRepository.ts";
import TaskDetail from "./TaskItemLineDetails.tsx";
import InputNumberField from "./InputNumberField.tsx";
import {TrashIcon} from "@heroicons/react/16/solid";
import {TaskItem} from "../model/Tasks.ts";

interface TaskDependencyFormProps {
    editedTask: TaskItem;
    projectId: string | null;
    addTaskDependency: (taskId: string) => void;
    removeTaskDependency: (taskId: string) => void;
}

const TaskDependencyForm: React.FC<TaskDependencyFormProps> = ({editedTask, projectId, removeTaskDependency, addTaskDependency}) => {
    const [selectedTask, setSelectedTask] = React.useState<string | undefined>(undefined);
    const taskQuery = useQuery({
        queryKey: ['project', projectId, 'tasks', 'byName'],
        enabled: !!projectId,
        queryFn: () => TaskRepository.GetAllTasks(projectId),
        staleTime: 60000,
    });

    const taskDependencyName = (taskId: string) => {
        const taskName = taskQuery.data?.find(t => t.id === taskId)?.name;
        return (<React.Fragment key={taskId}>
            <div>{taskName ?? 'Unknown'}</div>
            <button className='pt-2 w-5 h-5 text-xs text-red-600' aria-label="Delete"
                    onClick={(event) => {
                        event.preventDefault();
                        removeTaskDependency(taskId);
                    }}><TrashIcon/></button>
        </React.Fragment>);
    }

    return (
        <div className='space-y-4 md:space-y-3'>

            <div>
                <div className='text-gray-400 uppercase mt-2 mb-1'>
                    Dependencies
                </div>
                {!taskQuery.data
                    ? <div className='text-gray-500'>Loading...</div>
                    : <>
                        <div className='grid grid-cols-[1fr_auto] '>
                            {editedTask.dependencies?.map(taskDependencyName)}
                        </div>
                        <div className='flex'>
                            <div className='flex-1 mt-2 group relative'>
                                <select
                                    value={selectedTask}
                                    id={`workType-new`}
                                    name={`workType-new`}
                                    aria-label={`Select Type for new Work Item Assignment`}
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 peer'
                                    onChange={event => {
                                        const {value} = event.target;
                                        setSelectedTask(value);
                                    }}
                                >
                                    <option value="">Select Task</option>
                                    {taskQuery.data?.filter(tasks => !editedTask?.dependencies?.find(a => a === tasks.id)).map(tasks => (
                                        <option key={tasks.id} value={tasks.id}>{tasks.name}</option>
                                    ))}
                                </select>
                                <label htmlFor={`workType-new`}
                                       className='input-label-sm duration-300 peer-focus:text-blue-600'>Resource</label>
                            </div>
                            <button
                                disabled={!selectedTask}
                                onClick={event => {
                                    event.preventDefault();
                                    if(selectedTask) addTaskDependency(selectedTask);
                                    setSelectedTask(undefined);
                                }}
                                className='ont-normal rounded-lg text-sm px-2 py-0.5 me-0.5 ms-2 btn-blue-outline mt-2'>Add
                            </button>
                        </div>
                    </>}
            </div>

        </div>
    );
}

export default TaskDependencyForm;