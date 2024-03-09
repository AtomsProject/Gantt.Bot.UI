import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import * as WorkTypeRepository from "../localDb/WorkTypeRepository.ts";
import InputNumberField from "./InputNumberField.tsx";
import {FaRegTrashCan} from "react-icons/fa6";
import {Resource, ResourceWorkTypeAssignment} from "../model/Resources.ts";

interface ResourceWorkTypeAssignmentProps {
    setResource: React.Dispatch<React.SetStateAction<Resource | undefined>>
    resource: Resource | undefined;
}

const ResourceWorkTypeAssignments: React.FC<ResourceWorkTypeAssignmentProps> = ({setResource, resource}) => {
    const workTypesQuery = useQuery({
        queryKey: ['workTypes'],
        queryFn: WorkTypeRepository.getAllWorkTypes,
    });

    const [newWorkTypeAssignment, setNewWorkTypeAssignment] = useState<ResourceWorkTypeAssignment>({
        workTypeId: '',
        familiarScore: 0,
        preferenceFactor: 0,
    });

    const handleChangeWorkType = (workTypeId: string, name: string, value: number) => {
        setResource(prevResource => {
            if (!prevResource) {
                // Handle the case where prevResource is undefined
                // You might initialize it here, or decide to do nothing
                console.error("Resource is undefined.");
                return prevResource; // Simply return undefined or a new initialized Resource object
            }

            // Ensure we're spreading all existing fields of prevResource to maintain its structure
            return {
                ...prevResource,
                workTypeAssignments: prevResource.workTypeAssignments.map((assignment) =>
                    assignment.workTypeId === workTypeId ? {...assignment, [name]: value,} : assignment
                ),
            };
        });
    };

    const handelRemoveWorkTypeAssignment = (workTypeId: string) => {
        setResource(prevResource => {
            if (!prevResource) {
                console.error("Resource is undefined.");
                return prevResource; // Or handle this case as needed
            }

            return {
                ...prevResource,
                workTypeAssignments: prevResource.workTypeAssignments.filter(assignment => assignment.workTypeId !== workTypeId),
            };
        });
    };

    const handleAddWorkTypeAssignment = () => {
        if (!resource) {
            console.error('Resource is undefined');
            return;
        }

        setResource({
            ...resource,
            workTypeAssignments: [...resource.workTypeAssignments, newWorkTypeAssignment],
        });

        setNewWorkTypeAssignment({
            workTypeId: '',
            familiarScore: 0,
            preferenceFactor: 0,
        });
    };

    return (
        <div className='grid grid-cols-[2fr_1fr_1fr_auto] gap-1 gap-y-2.5 border-gray-600'>
            <label className='col-span-4 block text-xl uppercase font-bold text-gray-700 dark:text-gray-200'>Work Type
                Assignments</label>
            {resource?.workTypeAssignments.map((assignment) => (
                <React.Fragment key={assignment.workTypeId}>
                    <div className='group relative border-b border-gray-600 truncate'>{assignment.workTypeId}</div>
                    <InputNumberField
                        value={assignment.familiarScore}
                        name={`familiarScore-new`}
                        displayName='Performance'
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={(_, value) => {
                            if (!value) return;
                            handleChangeWorkType(assignment.workTypeId, 'familiarScore', value);
                        }}/>

                    <InputNumberField
                        value={assignment.preferenceFactor}
                        name={`preferenceFactor-new`}
                        displayName='Preference'
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={(_, value) => {
                            if (!value) return;
                            handleChangeWorkType(assignment.workTypeId, 'preferenceFactor', value);
                        }}/>
                    <button className='text-xs text-red-500' aria-label="Delete"
                            onClick={(event) => {
                                event.preventDefault();
                                if (window.confirm('Are you sure you want to delete this work item Type?')) {
                                    handelRemoveWorkTypeAssignment(assignment.workTypeId);
                                } else {
                                    console.log('User cancelled deletion');
                                }
                            }}><FaRegTrashCan/>
                    </button>
                </React.Fragment>
            ))}

            <div className='col-span-4 border-gray-600 border-t-2  uppercase mt-2 mb-1'>
                New Work Type Assignment
            </div>

            <div className=' group relative'>
                <select
                    value={newWorkTypeAssignment.workTypeId}
                    id={`workType-new`}
                    name={`workType-new`}
                    aria-label={`Select Type for new Work Item Assignment`}
                    className='bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 peer'
                    onChange={event => {
                        const {value} = event.target;
                        setNewWorkTypeAssignment({
                            ...newWorkTypeAssignment,
                            ['workTypeId']: value,
                        });
                    }}
                >
                    <option value="">Select Work Type</option>
                    {workTypesQuery.data?.filter(workType => !resource?.workTypeAssignments?.find(a => a.workTypeId === workType.name))
                        .map(workType => (
                            <option key={workType.id} value={workType.name}>{workType.name}</option>
                        ))}
                </select>
                <label htmlFor={`workType-new`}
                       className='input-label-sm duration-300 peer-focus:text-blue-600'>Work
                    Type</label>
            </div>
            <InputNumberField
                value={newWorkTypeAssignment.familiarScore}
                name={`familiarScore-new`}
                displayName='Performance'
                min={0}
                max={1}
                step={0.1}
                onChange={(_, value) => {
                    if (!value) return;
                    setNewWorkTypeAssignment({
                        ...newWorkTypeAssignment,
                        ['familiarScore']: value,
                    });
                }}/>

            <InputNumberField
                value={newWorkTypeAssignment.preferenceFactor}
                name={`preferenceFactor-new`}
                displayName='Preference'
                min={0} max={1}
                step={0.1}
                onChange={(_, value) => {
                    if (!value) return;
                    setNewWorkTypeAssignment({
                        ...newWorkTypeAssignment,
                        ['preferenceFactor']: value,
                    });
                }}/>

            <button type="button"
                    disabled={!newWorkTypeAssignment.workTypeId}
                    className='col-span-4 btn-default btn-full btn'
                    onClick={handleAddWorkTypeAssignment}>
                Add Work Type Assignment
            </button>

        </div>
    );
}

export default ResourceWorkTypeAssignments;