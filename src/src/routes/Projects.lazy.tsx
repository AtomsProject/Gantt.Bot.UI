import React, {useEffect, useState} from 'react';
import {createLazyFileRoute, Outlet} from '@tanstack/react-router';
import * as ProjectRepository from '../localDb/ProjectRepository.ts'
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {v4 as uuidV4} from 'uuid';
import {FaRegTrashCan} from "react-icons/fa6";
import {ProjectContext} from "../components/ProjectSelectionContext.tsx";
import {getTaskObjectStore} from "../localDb/TaskRepository.ts";
import {getAllResources} from "../localDb/ResourceRepository.ts";

export const Route = createLazyFileRoute('/Projects')({
    component: Index,
})

function Index() {

    const projectContext = React.useContext(ProjectContext);
    const [copySuccess, setCopySuccess] = useState<boolean | null>(false);

    useEffect(() => {
        setCopySuccess(null);
    }, [projectContext.editingProjectId]);

    const rawTaskQuery = useQuery({
        queryKey: ['project', projectContext.editingProjectId, 'tasks', 'raw'],
        enabled: !!projectContext.editingProjectId,
        queryFn: () => getTaskObjectStore(projectContext.editingProjectId ?? ''),
        refetchOnWindowFocus: true
    });

    const projectsQuery = useQuery({
        queryKey: ['projects'],
        queryFn: ProjectRepository.getAllProjects,
        refetchOnWindowFocus: true
    });
    
    const currentProject = useQuery({
        queryKey: ['project', projectContext.editingProjectId],
        queryFn: () => ProjectRepository.getProjectById(projectContext.editingProjectId ?? ''),
        enabled: !!projectContext.editingProjectId,
        refetchOnWindowFocus: true
    });

    const resourcesQuery = useQuery({
        queryKey: ['project', projectContext.editingProjectId, 'resources'],
        enabled: !!projectContext.editingProjectId,
        queryFn: () => getAllResources(projectContext.editingProjectId ?? ''),
        refetchOnWindowFocus: true
    });

    const queryClient = useQueryClient();

    const addProjectMutation = useMutation({
        mutationFn: ProjectRepository.addProject,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['projects']});
        },
    });

    const removeProjectMutation = useMutation({
        mutationFn: ProjectRepository.deleteProject,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['projects']});
            await queryClient.invalidateQueries({queryKey: ['tasks']});
        },
    });

    function handleAddResource(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // Validate the input
        const input = document.getElementById('new_project_name') as HTMLInputElement;
        if (!input.value) {
            alert('Please enter a resource name');
            return;
        } else {
            addProjectMutation.mutate({
                srcProjectId: projectContext?.editingProjectId ?? undefined,
                resource: {
                    id: uuidV4(),
                    name: input.value,
                }
            });
            input.value = '';
        }
    }

    const projectData = {
        tasks: rawTaskQuery.data?.tasks,
        resources: resourcesQuery.data,
        ready: !!rawTaskQuery.data && !!resourcesQuery.data
    };

    const projectList = () => (
        <ul className='pr-3 pl-3 divide-y divide-gray-200 dark:divide-gray-600 space-y-2'>
            {projectsQuery.data?.map((project) => (
                <li className='pt-2' key={project.id}>
                    <div className='flex justify-between'>
                        <div>{project.name}</div>
                        <button className='text-xs text-red-500' aria-label="Delete" onClick={(event) => {
                            event.preventDefault();
                            if (window.confirm('Are you sure you want to delete this project Type?')) {
                                removeProjectMutation.mutate(project.id);
                            } else {
                                console.log('User cancelled deletion');
                            }
                        }}><FaRegTrashCan/></button>
                    </div>
                </li>
            ))}
            {!projectsQuery.isError && <li className='pt-3'>
                <form className='flex flex-col' onSubmit={handleAddResource}>
                    <div className="relative z-0 w-full mb-5 group">
                        <input type="text" name="new_project_name" id="new_project_name"
                               className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                               placeholder=" " required/>
                        <label htmlFor="new_project_name"
                               className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Name
                            of project Type</label>
                    </div>

                    <button type="submit"
                            className="w-full px-3 py-2 pt-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        {projectContext?.editingProjectId ? `Clone "${currentProject?.data?.name}" project` : "Add Project"}
                    </button>

                    {projectData.ready &&
                        <button
                            className='btn btn-blue-outline mt-3 text-sm'
                            onClick={(e) => {
                                e.preventDefault();
                                navigator.clipboard.writeText(JSON.stringify(projectData, null, 2))
                                    .then(() => {
                                        setCopySuccess(true);
                                    }, () => {
                                        setCopySuccess(false);
                                    });

                            }}
                        >Copy to Clipboard</button>}
                    {copySuccess && <div
                        className='text-green-600 ml-3 mt-3'>{copySuccess ? "Copied to clipboard" : "Error copying to clipboard"}</div>}
                </form>
            </li>}
        </ul>
    );

    return (
        <div className="flex flex-row min-h-screen nav-body-padding">
            <div className="w-72 md:w-80 bg-white dark:bg-gray-800 fixed pb-20 md:pb-16 h-full">
                <div className='h-full overflow-y-auto pb-8'>

                    {/* Sidebar content goes here */}
                    <div
                        className='pt-1 pb-1 pr-3 pl-3 flex justify-between items-center text-center border-b-2 border-gray-600 bg-white dark:bg-gray-900'>
                        <h2 className='text-lg lg:text-xl'>Projects</h2>
                    </div>
                    {projectsQuery.isLoading
                        ? <span className='p-3 text-xl'>Loading...</span>
                        : projectList()}
                </div>
            </div>
            <div className="ml-72 md:ml-80 p-3 text-xs">
                {rawTaskQuery.data && <pre>{JSON.stringify(projectData, null, 2)}</pre>}
            </div>
        </div>
    );
}