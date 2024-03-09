import React from 'react';
import {createLazyFileRoute, Link, Outlet} from '@tanstack/react-router';
import * as WorkTypeRepository from '../localDb/WorkTypeRepository.ts'
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {v4 as uuidV4} from 'uuid';
import {FaRegTrashCan} from "react-icons/fa6";

export const Route = createLazyFileRoute('/WorkTypes')({
    component: Index,
})

function Index() {
    const workTypesQuery = useQuery({
        queryKey: ['workTypes'],
        queryFn: WorkTypeRepository.getAllWorkTypes,
        refetchOnWindowFocus: true
    });

    const queryClient = useQueryClient();

    const addWorkTypeMutation = useMutation({
        mutationFn: WorkTypeRepository.addWorkType,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['workTypes']});
        },
    });

    const removeWorkTypeMutation = useMutation({
        mutationFn: WorkTypeRepository.deleteWorkType,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['workTypes']});
        },
    });

    function handleAddResource(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // Validate the input
        const input = document.getElementById('new_work-type_name') as HTMLInputElement;
        if (!input.value) {
            alert('Please enter a resource name');
            return;
        } else {
            addWorkTypeMutation.mutate({
                id: uuidV4(),
                name: input.value,
            });
            input.value = '';
        }
    }

    const workTypeList = () => (
        <ul className='pr-3 pl-3 divide-y divide-gray-200 dark:divide-gray-600 space-y-2'>
            {workTypesQuery.data?.map((workType) => (
                <li className='pt-2' key={workType.id}>
                  <div className='flex justify-between'>
                      <div>{workType.name}</div>
                      <button className='text-xs text-red-500' aria-label="Delete" onClick={(event) => {
                          event.preventDefault();
                          if (window.confirm('Are you sure you want to delete this work item Type?')) {
                              removeWorkTypeMutation.mutate(workType.id);
                          } else {
                              console.log('User cancelled deletion');
                          }
                      }}><FaRegTrashCan/></button>
                  </div>
                </li>
            ))}
            {!workTypesQuery.isError && <li className='pt-3'>
                <form className='flex flex-col' onSubmit={handleAddResource}>
                    <div className="relative z-0 w-full mb-5 group">
                        <input type="text" name="new_work-type_name" id="new_work-type_name"
                               className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                               placeholder=" " required/>
                        <label htmlFor="new_work-type_name"
                               className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Name of Work Item Type</label>
                    </div>

                    <button type="submit"
                            className="w-full px-3 py-2 pt-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add
                        Work Item Type
                    </button>
                </form>
            </li>}
        </ul>
    );

    return (<div className="flex flex-row min-h-screen nav-body-padding">
        <div className="w-72 md:w-80 bg-white dark:bg-gray-800 fixed pb-20 md:pb-16 h-full">
            <div className='h-full overflow-y-auto pb-8'>

                {/* Sidebar content goes here */}
                <div
                    className='pt-1 pb-1 pr-3 pl-3 flex justify-between items-center text-center border-b-2 border-gray-600 bg-white dark:bg-gray-900'>
                    <h2 className='text-lg lg:text-xl'>Work Items Types</h2>
                </div>
                {workTypesQuery.isLoading
                    ? <span className='p-3 text-xl'>Loading...</span>
                    : workTypeList()}
            </div>
        </div>
        <div className="ml-44 md:w-52 flex-1 flex justify-center items-start p-3">
            <Outlet/>
        </div>
    </div>);
}