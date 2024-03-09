import React, {useEffect, useState} from 'react';
import {CreateEmptyTask} from "../model/Tasks.ts";
import {
    TrashIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowLeftIcon,
    ArrowRightIcon, ArrowsUpDownIcon, UsersIcon, ChevronUpIcon
} from '@heroicons/react/16/solid';
import InputTextField from "./InputTestField.tsx";
import InputNumberField from "./InputNumberField.tsx";
import InputCheckboxField from "./InputCheckboxField.tsx";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import * as WorkTypeRepository from "../localDb/WorkTypeRepository.ts";
import {getAllResources} from "../localDb/ResourceRepository.ts";
import InputDateField from "./InputDateField.tsx";
import {TaskContext} from "./TaskContext.tsx";
import * as TaskRepository from "../localDb/TaskRepository.ts";
import {ProjectContext} from "./ProjectSelectionContext.tsx";
import {BookmarkIcon} from "@heroicons/react/24/outline";
import TaskDependencyForm from "./TaskDependencyForm.tsx";

interface TaskDetailProps {
    taskId: string;
    isExpanded: boolean;
    setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>
}

const TaskDetail = React.memo(({taskId, isExpanded, setIsExpanded}: TaskDetailProps) => {
        const {editingTaskId, setEditingTaskId} = React.useContext(TaskContext);
        const [isFormDirty, setIsFormDirty] = useState(false);
        const queryClient = useQueryClient();
        const {editingProjectId} = React.useContext(ProjectContext);
        const isEditing = taskId === editingTaskId;
        const setIsEditing = (state: boolean) => {
            setEditingTaskId(state ? taskId : null);
        }

        const [newResourceAssignment, setNewResourceAssignment] = useState<string | undefined>();

        const workTypesQuery = useQuery({
            queryKey: ['workTypes'],
            queryFn: WorkTypeRepository.getAllWorkTypes,
            staleTime: 60000, // 10 minutes in milliseconds
        });

        const resourcesQuery = useQuery({
            queryKey: ['project', editingProjectId, 'resources'],
            enabled: !!editingProjectId,
            queryFn: ()=> getAllResources(editingProjectId ?? ''),
            staleTime: 60000, // 10 minutes in milliseconds
        });

        const taskQuery = useQuery({
            queryKey: ['project', editingProjectId, 'tasks', taskId],
            enabled: !!editingProjectId,
            queryFn: () => TaskRepository.getTaskById(editingProjectId ?? '', taskId),
            staleTime: 60000,
        });

        const deleteTaskMutation = useMutation({
            mutationFn: TaskRepository.deleteTask,
            onSuccess: async () => {
                await queryClient.invalidateQueries({queryKey: ['project', editingProjectId, 'tasks']});
            },
        });

        const updateTaskMutation = useMutation({
            mutationFn: TaskRepository.updateTask,
            onSuccess: async () => {
                await queryClient.invalidateQueries({queryKey: ['project', editingProjectId, 'tasks', taskId]});
                setIsFormDirty(false);
                setIsEditing(false);
            },
        });

        const moveTaskMutation = useMutation({
            mutationFn: TaskRepository.moveTask,
            onSuccess: async (m) => {
                for (const mTasks of m) {
                    console.log("Invalidating", mTasks)
                    await queryClient.invalidateQueries({queryKey: ['project', editingProjectId, 'tasks', 'children', mTasks.parentTaskId ?? 'root']});
                }
            }
        });

        const addRootTaskMutation = useMutation({
            mutationFn: TaskRepository.addTask,
            onSuccess: async (task) => {
                await queryClient.invalidateQueries({queryKey: ['project', editingProjectId, 'tasks']});
                setEditingTaskId(task.id);
            },
        });

        const [editedTask, setEditedTask] = useState(taskQuery.data);

        useEffect(() => {
            if (taskQuery.data) {
                setIsFormDirty(false);
                setEditedTask(taskQuery.data);
            }
        }, [taskQuery.data]);

        const handleInputChange = (name: string, value: string | number | boolean | Date | undefined) => {
            if (!editedTask) return;

            setEditedTask({
                ...editedTask,
                [name]: value,
            });

            setIsFormDirty(true);
        };

        const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!editedTask) return;
            console.log("Submitting edited task", editedTask)
            // Call your update function here with editedTask as argument
            updateTaskMutation.mutate({task: editedTask, projectId: editingProjectId});
        };

        const durationForm = () => {
            if (!editedTask) return <></>;
            if (editedTask.isLimitedProperties) return (
                <div className='text-sm text-gray-300'>Duration: <span className='text-xs text-gray-500'>Disable on Milestones</span>
                </div>
            );

            const handleDurationChange = (name: string, value: number | undefined) => {

                const duration = editedTask.duration || {
                    optimistic: 0,
                    mostLikely: 0,
                    pessimistic: 0,
                };

                setEditedTask({
                    ...editedTask,
                    duration: {
                        ...duration,
                        [name]: value || 0,
                    },
                });

                setIsFormDirty(true);
            };

            return (
                <div>
                    <div className='text-sm text-gray-300'>Duration Estimate</div>
                    <div className='flex pt-1'>
                        <InputNumberField
                            name="pessimistic"
                            value={editedTask.duration?.pessimistic}
                            displayName="Pessimistic"
                            min={editedTask.duration?.mostLikely || 1}
                            onChange={handleDurationChange}/>
                        <InputNumberField
                            name="mostLikely"
                            value={editedTask.duration?.mostLikely}
                            displayName="Most Likely"
                            min={editedTask.duration?.optimistic || 1}
                            max={editedTask.duration?.pessimistic || 1}
                            onChange={handleDurationChange}/>
                        <InputNumberField
                            name="optimistic"
                            value={editedTask.duration?.optimistic}
                            displayName="Optimistic"
                            min={1}
                            max={editedTask.duration?.mostLikely || 1}
                            onChange={handleDurationChange}
                        />
                    </div>
                </div>)
        }

        // TODO: should have a dedicated view for isLimitedProperties.

        if (isEditing && editedTask) return (
            <div className='ml-2 task-col-span p-3 mt-2 mr-5 mb-2 rounded bg-gray-700'>
                <form onSubmit={handleSubmit}>
                    <div className='space-y-4 md:space-y-0 md:grid md:grid-cols-2 xl:grid-cols-3 gap-3'>
                        {/* COL 1 */}
                        <InputTextField
                            name="taskName"
                            value={editedTask.name}
                            displayName="Task Name"
                            onChange={(_, value) => handleInputChange("name", value)}
                            required
                        />
                        {/* COL 2 */}
                        {/* Work Type */}
                        {editedTask.isLimitedProperties
                            ? <div></div>
                            : <div className='relative group'>
                                <select
                                    value={editedTask.workTypeId}
                                    id={`workType-${editedTask.id}`}
                                    name={`workType-${editedTask.id}`}
                                    aria-label={`Select Type for new Work Item Assignment`}
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 peer'
                                    onChange={event => {
                                        event.preventDefault();
                                        const {value} = event.target;
                                        handleInputChange('workTypeId', value);
                                    }}
                                >
                                    <option value="">Select Work Type</option>
                                    {workTypesQuery.data?.map(workType => (
                                        <option key={workType.id} value={workType.name}>{workType.name}</option>
                                    ))}
                                </select>
                                <label htmlFor={`workType-${editedTask.id}`}
                                       className='input-label-sm duration-300 peer-focus:text-blue-600'>Work
                                    Type</label>
                            </div>}

                        {/* COL 1 */}
                        <InputNumberField
                            name="priority"
                            value={editedTask.priority}
                            displayName="Priority (higher #'s will be scheduled first)"
                            min={1}
                            onChange={handleInputChange}
                        />

                        {/* COL 2 */}
                        {editedTask.isLimitedProperties
                            ? <div></div>
                            : <InputNumberField
                                name="requiredFamiliarScore"
                                value={editedTask.requiredFamiliarScore}
                                displayName="Minimum Familiar Score"
                                min={0}
                                max={1}
                                step={0.1}
                                onChange={handleInputChange}
                            />}

                        {/* COL 1 */}
                        <InputDateField
                            name={`startAfter`}
                            value={editedTask.startAfter}
                            displayName="Start After"
                            max={editedTask.dueBefore}
                            onChange={(_, value) => handleInputChange("startAfter", value)}
                        />

                        {/* COL 2 */}
                        <InputDateField
                            name={`dueBefore`}
                            value={editedTask.dueBefore}
                            displayName="Due Before"
                            min={editedTask.startAfter}
                            onChange={(_, value) => handleInputChange("dueBefore", value)}
                        />

                        {/* COL 1 */}
                        <div className='space-y-3 md:space-y-3'>
                            <div>
                                {editedTask.isLimitedProperties
                                    ? <></>
                                    : <InputCheckboxField
                                        name="supersedeActiveTask"
                                        checked={editedTask.supersedeActiveTask}
                                        displayName="Supersede Active Tasks"
                                        onChange={handleInputChange}
                                    />}

                                <InputCheckboxField
                                    name="allowParallelScheduling"
                                    checked={editedTask.allowParallelScheduling}
                                    displayName="Schedule independely of other sibling tasks"
                                    onChange={handleInputChange}
                                />
                                <InputCheckboxField
                                    name="isMilestone"
                                    checked={editedTask.isMilestone}
                                    displayName="Milestone"
                                    onChange={handleInputChange}
                                />
                            </div>

                            {durationForm()}
                        </div>

                        {/* COL 2 */}
                        {editedTask.isLimitedProperties
                            ? <div></div>
                            : <div className='space-y-4 md:space-y-3'>

                                <div>
                                    <div className='text-gray-400 uppercase mt-2 mb-1'>
                                        Resource Assignments
                                    </div>
                                    <div className='grid grid-cols-[2fr_1fr_auto] gap-2'>
                                        {editedTask.individualPriorities?.map((assignment, i) => (
                                            <React.Fragment key={i}>
                                                <div>{resourcesQuery.data?.find(r => r.id === assignment.resourceId)?.name ?? 'Unknown'}</div>
                                                <InputNumberField
                                                    value={assignment.priority}
                                                    name={`priority-${assignment.resourceId}`}
                                                    displayName='Priority'
                                                    min={0}
                                                    max={1}
                                                    step={0.1}
                                                    onChange={(_, value) => {
                                                        if (!value) return;
                                                        setEditedTask({
                                                            ...editedTask,
                                                            individualPriorities: editedTask.individualPriorities?.map(a => a.resourceId === assignment.resourceId ? {
                                                                ...a,
                                                                priority: value,
                                                            } : a),
                                                        });
                                                        setIsFormDirty(true);
                                                    }}
                                                />
                                                <button className='pt-2 w-5 h-5 text-xs text-red-600' aria-label="Delete"
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            setEditedTask({
                                                                ...editedTask,
                                                                individualPriorities: editedTask.individualPriorities?.filter(a => a.resourceId !== assignment.resourceId),
                                                            });
                                                            setIsFormDirty(true);

                                                        }}><TrashIcon/></button>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div className='flex'>
                                        <div className='flex-1 mt-2 group relative'>
                                            <select
                                                value={newResourceAssignment}
                                                id={`workType-new`}
                                                name={`workType-new`}
                                                aria-label={`Select Type for new Work Item Assignment`}
                                                className='bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 peer'
                                                onChange={event => {
                                                    const {value} = event.target;
                                                    setNewResourceAssignment(value);
                                                    setIsFormDirty(true);
                                                }}
                                            >
                                                <option value="">Select Resource</option>
                                                {resourcesQuery.data?.filter(resource => !editedTask?.individualPriorities?.find(a => a.resourceId === resource.id)).map(resource => (
                                                    <option key={resource.id} value={resource.id}>{resource.name}</option>
                                                ))}
                                            </select>
                                            <label htmlFor={`workType-new`}
                                                   className='input-label-sm duration-300 peer-focus:text-blue-600'>Resource</label>
                                        </div>
                                        <button
                                            disabled={!newResourceAssignment}
                                            onClick={event => {
                                                event.preventDefault();

                                                if (newResourceAssignment === undefined) return;

                                                setEditedTask({
                                                    ...editedTask,
                                                    individualPriorities: [
                                                        ...editedTask.individualPriorities || [],
                                                        {
                                                            resourceId: newResourceAssignment,
                                                            priority: 1,
                                                        }
                                                    ],
                                                });

                                                setNewResourceAssignment(undefined);
                                            }}
                                            className='ont-normal rounded-lg text-sm px-2 py-0.5 me-0.5 ms-2 btn-blue-outline mt-2'>Add
                                        </button>
                                    </div>
                                </div>
                            </div>}
                        {/* COL 2 END */}
                        <TaskDependencyForm editedTask={editedTask} projectId={editingProjectId} addTaskDependency={t=>{
                            setEditedTask({
                                ...editedTask,
                                dependencies: [...(editedTask.dependencies?.filter(d=>d!==t) || []), t]
                            });
                            setIsFormDirty(true);
                        
                        }} removeTaskDependency={t=>{
                            setEditedTask({
                                ...editedTask,
                                dependencies: editedTask.dependencies?.filter(d=>d!==t)
                            });
                            setIsFormDirty(true);
                        }}/>
                    </div>


                    {/*  ACTION BUTTONS */}
                    <div
                        className='mt-3 pt-3 w-full border-t border-gray-400 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3'>
                        <div className='flex justify-start space-x-3'>
                            <div className='pl-2 text-gray-500 border-l text-sm border-gray-600'>Danger</div>
                            <button className='btn btn-danger' onClick={e => {
                                e.preventDefault();
                                if (!editedTask) return;
                                deleteTaskMutation.mutate({
                                    taskId: taskId,
                                    deleteChildren: true,
                                    projectId: editingProjectId
                                });
                            }}>Delete Task and Children
                            </button>
                            <button className='btn btn-danger' onClick={e => {
                                e.preventDefault();
                                if (!editedTask) return;
                                deleteTaskMutation.mutate({
                                    taskId: taskId,
                                    deleteChildren: false,
                                    projectId: editingProjectId
                                });
                            }}>Delete Task Only
                            </button>
                        </div>
                        <div className='flex justify-end space-x-3'>
                            <button className='btn btn-default' onClick={e => {
                                e.preventDefault();
                                addRootTaskMutation.mutate({
                                    projectId: editingProjectId,
                                    relatedTaskId: taskId,
                                    placement: 'child',
                                    task: CreateEmptyTask()
                                });
                            }}>Add Subtask
                            </button>
                            <button className='btn btn-default' onClick={e => {
                                e.preventDefault();
                                setIsEditing(false);
                                setEditedTask(taskQuery.data);
                                setIsFormDirty(false)
                            }}>Cancel
                            </button>
                            <button disabled={!isFormDirty} className='btn btn-submit' type="submit">Save</button>
                        </div>
                    </div>
                </form>
            </div>
        )

        let durationDisplay = '';

        if (editedTask?.duration !== undefined) {
            durationDisplay = `${editedTask.duration.optimistic} - ${editedTask.duration.mostLikely} - ${editedTask.duration.pessimistic}`;
        }

        const taskIcon = editedTask?.isMilestone ? <BookmarkIcon className='w-4 mr-0.5 text-amber-600'/> : null;
        const parallelIcon = editedTask?.allowParallelScheduling ?
            <ArrowsUpDownIcon className='w-4 mr-0.5 text-amber-600'/> : null;

        const assignmentIcon = (editedTask?.isMilestone === false && (editedTask?.individualPriorities?.length ?? 0) > 0) ?
            <UsersIcon className='w-4 mr-0.5 text-amber-600'/> : null;
        return (
            <>
                <div className='flex items-center'>
                    {taskQuery.data?.isParent ?
                        <button
                            onClick={e => {
                                e.preventDefault();
                                setIsExpanded(!isExpanded);
                            }}
                            className={`w-4 duration-150 transform ${isExpanded ? 'rotate-180' : 'rotate-90'}`}>
                            <ChevronUpIcon/>
                        </button> : <div className='w-4'></div>}
                    {taskIcon}{parallelIcon}{assignmentIcon}{editedTask?.name}</div>
                <div className=' text-center space-x-1 px-2'>
                    <button title='Add new task as a child of this Task' className='h-4 w-4 text-gray-400' onClick={e => {
                        e.preventDefault();
                        setIsExpanded(true);
                        addRootTaskMutation.mutate({
                            projectId: editingProjectId,
                            relatedTaskId: taskId,
                            placement: 'child',
                            task: CreateEmptyTask()
                        });
                    }}>➕
                    </button>
                    <button title='move out and down' aria-label='move out and down' className='h-4 w-4 text-gray-400'
                            onClick={e => {
                                e.preventDefault();
                                setIsExpanded(true);
                                moveTaskMutation.mutate({
                                    taskId: taskId,
                                    direction: 'out-down',
                                    projectId: editingProjectId
                                })
                            }}><ArrowLeftIcon/></button>
                    <button title='move up' aria-label='move up' className='h-4 w-4 text-gray-400' onClick={e => {
                        e.preventDefault();
                        moveTaskMutation.mutate({taskId: taskId, direction: 'up', projectId: editingProjectId})
                    }}><ArrowUpIcon/></button>
                    <button title='move down' aria-label='move down' className='h-4 w-4 text-gray-400' onClick={e => {
                        e.preventDefault();
                        moveTaskMutation.mutate({taskId: taskId, direction: 'down', projectId: editingProjectId})
                    }}><ArrowDownIcon/></button>
                    <button title='move in, will become the last child of the task directly preseding this one'
                            aria-label='move in and up' className='h-4 w-4 text-gray-400' onClick={e => {
                        e.preventDefault();
                        moveTaskMutation.mutate({taskId: taskId, direction: 'in-up', projectId: editingProjectId})
                    }}><ArrowRightIcon/></button>
                    <button title='Edit' aria-label='edit task' className='h-4 w-4 text-gray-400' onClick={e => {
                        e.preventDefault();
                        setIsEditing(true);
                    }}>✏️
                    </button>
                    {isFormDirty && <span title='Has unsaved changes' aria-label='Has unsaved changes'>🔴</span>}
                </div>
                <div>{taskQuery.data?.isParent === false && !taskQuery.data?.duration &&
                    <span title='No Duration' aria-label='No Duration'>⚠️</span>} {durationDisplay}</div>
                <div className='hidden sm:block'>{taskQuery.data?.isParent === false && !taskQuery.data?.workTypeId &&
                    <span title='No Work Type' aria-label='No Work Type'>⚠️</span>} {editedTask?.workTypeId}</div>
                <div>{editedTask?.priority}️</div>
                <div className='hidden md:block'>{editedTask?.startAfter?.toLocaleDateString()}</div>
            </>
        );
    })
;

export default TaskDetail;