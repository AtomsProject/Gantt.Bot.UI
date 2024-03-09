import React, {useEffect, useState} from 'react';
import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import * as ResourceRepository from '../localDb/ResourceRepository';
import InputDateField from "../components/InputDateField.tsx";
import InputTestField from "../components/InputTestField.tsx";
import ResourceWorkTypeAssignments from "../components/ResourceWorkTypeAssignments.tsx";
import ResourceUnavailablePeriod from "../components/ResourceUnavailablePeriod.tsx";
import {useBlocker} from '@tanstack/react-router'
import {Resource} from "../model/Resources.ts";
import {ProjectContext} from "../components/ProjectSelectionContext.tsx";

export const Route = createFileRoute('/Resources/$id')({
    component: ResourcesEdit,
})

function ResourcesEdit() {
    const {editingProjectId} = React.useContext(ProjectContext);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const {id} = Route.useParams();
    const resourceQuery = useQuery({
        queryKey: ['project', editingProjectId, 'resource', id],
        enabled: !!editingProjectId,
        queryFn: () => ResourceRepository.getResourceById(editingProjectId ?? '', id),
        refetchOnWindowFocus: false,
    })

    const [resource, setResource] = useState(resourceQuery.data);
    const [formIsDirty, setFormIsDirty] = useState(false);
    const setResourceAndMarkDirty = (action: React.SetStateAction<Resource | undefined>) => {
        setResource(action); // Update the resource state
        setFormIsDirty(true); // Mark as dirty
    };

    useBlocker(
        () => window.confirm('Change have not been save, are you sure you want to leave?'),
        formIsDirty,
    )

    const updateResource = useMutation({
        mutationFn: (r: Resource) => ResourceRepository.updateResource(editingProjectId ?? '', r),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['project', editingProjectId, 'resource', id]});
            setFormIsDirty(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => ResourceRepository.deleteResource(editingProjectId ?? '', id),
        onSuccess: async () => {
            // Invalidate and refetch
            await queryClient.invalidateQueries({queryKey: ['project', editingProjectId, 'resource', id]});
            await navigate({to: "/Resources"});
        },
    });

    useEffect(() => {
        if (resourceQuery.data) {
            setFormIsDirty(false);
            setResource({
                ...resourceQuery.data,
                startDate: new Date(resourceQuery.data.startDate),
                endDate: resourceQuery.data.endDate ? new Date(resourceQuery.data.endDate) : undefined,
            });
        }
    }, [editingProjectId, resourceQuery.data]);

    const handleDateChange = (name: string, value: Date | undefined) => {
        if (!resource) {
            console.error('Resource is undefined');
            return;
        }
        setResourceAndMarkDirty({
            ...resource,
            [name]: value,
        });
    };

    const handleInputChange = (name: string, value: string) => {
        if (!resource) {
            console.error('Resource is undefined');
            return;
        }

        setResourceAndMarkDirty({
            ...resource,
            [name]: value,
        });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (resource) {
            updateResource.mutate(resource);
        } else {
            console.error('Resource is undefined');
        }
    };

    const editForm = () => (
        <div className='grid lg:grid-cols-2 lg:mt-2'>
            <div className="flex max-w-md flex-col gap-4 pt-4 space-y-1">
                <InputTestField
                    name="name"
                    value={resource?.name}
                    displayName="Resource Name"
                    onChange={handleInputChange}
                    required
                />
                <div className="flex gap-x-2">
                    <div className='flex-1'>
                        <InputDateField
                            name="startDate"
                            value={resource?.startDate}
                            displayName="Start Date"
                            onChange={handleDateChange}
                            required/>
                    </div>
                    <div className='flex-1'>
                        <InputDateField
                            name="endDate"
                            value={resource?.endDate}
                            displayName="End Date"
                            onChange={handleDateChange}/>
                    </div>
                </div>
                <ResourceUnavailablePeriod resource={resource} setResource={setResourceAndMarkDirty}/>

            </div>
            <div className='lg:border-l border-gray-600 lg:pl-2 lg:ml-2 mt-3 lg-mt-0'>
                <ResourceWorkTypeAssignments resource={resource} setResource={setResourceAndMarkDirty}/>
            </div>
        </div>
    );

    return (
        <div className='bg-gray-700 rounded-lg min-w-90 mt-8 space-y-3'>
            <form onSubmit={handleSubmit}>
                <div
                    className='flex rounded-t-lg justify-between items-center md:text-2xl font-medium border-gray-500 border-b-2 p-1 ps-3 pe-3 bg-gray-800'>
                    <div className='text-3xl'>Edit Resource</div>
                    <button type="submit"
                            disabled={!formIsDirty}
                            className="btn-submit font-normal rounded-lg text-lg px-5 text-white">Save
                    </button>
                </div>
                <div className='pl-3 pr-3'>
                    {resource && editForm()}
                </div>
            </form>
            <div className='border-gray-500 rounded-b-lg pb-3 bg-gray-800 border-t-2 mt-5 pt-2 pl-3 pr-3 space-y-2'>
                <label className='block text-2xl uppercase font-bold text-gray-700 dark:text-gray-200'>Danger</label>
                <div><span className='font-bold'>Id:</span> {id}</div>
                <button type="button"
                        className="btn-sm btn-danger"
                        onClick={event => {
                            event.preventDefault();
                            if (window.confirm('Are you sure you want to delete this resource?')) {
                                deleteMutation.mutate(id);
                                // Call your delete function here
                            } else {
                                console.log('User cancelled deletion');
                            }
                        }}
                >Delete
                </button>
                Permanently delete this resource from the project.
            </div>
        </div>)
}