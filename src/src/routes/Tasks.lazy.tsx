import React from 'react';
import {createLazyFileRoute} from '@tanstack/react-router';
import {TaskItem, CreateEmptyTask} from "../model/Tasks.ts";
import {ProjectContext} from "../components/ProjectSelectionContext.tsx";
import * as TaskRepository from "../localDb/TaskRepository.ts";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {TaskContext} from "../components/TaskContext.tsx";
import TaskItemLine from "../components/TaskItemLine.tsx";

export const Route = createLazyFileRoute('/Tasks')({
    component: Index,
})

function Index() {
    const {editingProjectId} = React.useContext(ProjectContext);
    const queryClient = useQueryClient();
    const {setEditingTaskId} = React.useContext(TaskContext);

    const tasksQuery = useQuery({
        queryKey: ['project', editingProjectId, 'tasks', 'children', 'root'],
        enabled: !!editingProjectId,
        queryFn: () => TaskRepository.getRootTaskIds(editingProjectId ?? ''),
        refetchOnWindowFocus: true
    });

    const addRootTaskMutation = useMutation({
        mutationFn: TaskRepository.addTask,
        onSuccess: async (task) => {
            await queryClient.invalidateQueries({queryKey: ['project', editingProjectId, 'tasks']});
            setEditingTaskId(task.id);
        },
    });

    if (!editingProjectId) return <div className='nav-body-padding'>
        <div className='pt-20 text-center text-xl text-gray-600 font-bold'>No Project Selected</div>
    </div>

    return (
        <div className='nav-body-padding '>
            <div
                className="task-col-definition">
                <div className='task-header'>
                    <div className='min-w-48'>Task</div>
                    <div className='min-w-16'></div>
                    <div className='truncate'>Duration</div>
                    <div className='hidden sm:block'>Work Type</div>
                    <div className='truncate '>Priority</div>
                    <div className='hidden md:block'>Start After</div>
                </div>

                {tasksQuery.data?.map(taskId => <TaskItemLine key={taskId} taskId={taskId}/>)}
            </div>
            <div>
                <button className='ml-10 mt-5 btn btn-default'
                        onClick={(e) => {
                            e.preventDefault();
                            addRootTaskMutation.mutate({
                                projectId: editingProjectId,
                                task: CreateEmptyTask(),
                                relatedTaskId: null,
                                placement: 'child'
                            });
                        }}
                >Add Task
                </button>
            </div>
        </div>
    );
}