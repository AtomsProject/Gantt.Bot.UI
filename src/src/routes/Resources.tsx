import React from 'react';
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {createFileRoute, Link, Outlet, useNavigate} from '@tanstack/react-router';
import * as ResourceRepository from '../localDb/ResourceRepository';
import {v4 as uuidV4} from 'uuid';
import {inactiveLinkClass, activeLinkClasses} from '../AppNavBar';
import {ProjectContext} from "../components/ProjectSelectionContext.tsx";
import {Resource} from "../model/Resources.ts";

export const Route = createFileRoute('/Resources')({
    component: Resources,
})

function Resources() {
    const {editingProjectId} = React.useContext(ProjectContext);
    const resourcesQuery = useQuery({
        queryKey: ['project', editingProjectId, 'resources'],
        enabled: !!editingProjectId,
        queryFn: () => ResourceRepository.getAllResources(editingProjectId ?? ''),
        refetchOnWindowFocus: true
    });
    const queryClient = useQueryClient();
    const navigate = useNavigate()

    const addResource = useMutation({
        mutationFn: (d: Resource) => ResourceRepository.addResource(editingProjectId ?? '', d),
        onSuccess: async (newResource) => {
            await queryClient.invalidateQueries({queryKey:  ['project', editingProjectId, 'resources']});
            await navigate({to: "/Resources/$id", params: {id: newResource.id}});
        },
    });

    function handleAddResource(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // Validate the input
        const input = document.getElementById('new_resource_name') as HTMLInputElement;
        if (!input.value) {
            alert('Please enter a resource name');
            return;
        } else {
            addResource.mutate({
                id: uuidV4(), // generate a random UUID
                name: input.value,
                workTypeAssignments: [], // replace with actual workTypeAssignments
                startDate: new Date(), // replace with actual startDate
                unavailablePeriods: [], // replace with actual unavailablePeriods
            });
            // Clear out the input form
            input.value = '';
        }
    }

    const resourcesList = () => (
        <>
            <ul className='pr-3 pl-3 divide-y divide-gray-200 dark:divide-gray-600 space-y-2'>
                {resourcesQuery.data?.map((resource) => (
                    <li className='pt-2' key={resource.id}>
                        <Link
                            to="/Resources/$id"
                            params={{
                                id: resource.id,
                            }}
                            activeProps={{className: activeLinkClasses}}
                            inactiveProps={{className: inactiveLinkClass}}
                            className="flex justify-between items-start">
                            {resource.name}
                        </Link>
                    </li>
                ))}
                {!resourcesQuery.isError && <li className='pt-3'>
                    <form className='flex flex-col' onSubmit={handleAddResource}>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="new_resource_name" id="new_resource_name"
                                   className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                   placeholder=" " required/>
                            <label htmlFor="new_resource_name"
                                   className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Resource
                                Name</label>
                        </div>

                        <button type="submit"
                                className="w-full px-3 py-2 pt-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add
                            Resource
                        </button>
                    </form>
                </li>}
            </ul>
        </>
    );

    return (
        <div className="flex flex-row min-h-screen nav-body-padding">
            <div className="w-44 md:w-52 bg-white dark:bg-gray-800 fixed pb-20 md:pb-16 h-full">
                <div className='h-full overflow-y-auto pb-8'>

                    {/* Sidebar content goes here */}
                    <div
                        className='pt-1 pb-2 pr-3 pl-3 flex justify-between items-center text-center border-b-2 border-gray-600 bg-white dark:bg-gray-900'>
                        <h2 className='text-lg lg:text-xl'>Resources</h2>
                    </div>
                    {resourcesQuery.isLoading
                        ? <span className='p-3 text-xl'>Loading...</span>
                        : resourcesList()}
                </div>
            </div>
            <div className="ml-44 md:w-52 flex-1 flex justify-center items-start p-3">
                <Outlet/>
            </div>
        </div>
    )
}

export default Resources;