import React from 'react';
import InputDateField from "./InputDateField.tsx";
import {v4 as uuidV4} from 'uuid';
import {FaRegTrashCan} from "react-icons/fa6";

interface ResourceUnavailablePeriodProps {
    setResource: React.Dispatch<React.SetStateAction<Resource | undefined>>
    resource: Resource | undefined;
}

const ResourceUnavailablePeriod: React.FC<ResourceUnavailablePeriodProps> = ({setResource, resource}) => {
    const handleAddUnavailablePeriod = () => {
        const newPeriod: UnavailablePeriod = {
            id: uuidV4(),
            startDate: new Date(),
            endDate: new Date()
        }

        setResource(prevResource => {
            if (!prevResource) {
                console.error("Resource is undefined.");
                return prevResource;
            }

            return {
                ...prevResource,
                unavailablePeriods: [...prevResource.unavailablePeriods, newPeriod],
            };
        });
    };


    const handleChangeUnavailablePeriod = (indexToChange: number, name: string, value: Date | undefined) => {
        if(value === undefined) {
            console.error("Value is undefined.");
            return;
        }

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
                unavailablePeriods: prevResource.unavailablePeriods.map((assignment, index) =>
                    index === indexToChange ? {...assignment, [name]: value,} : assignment
                ),
            };
        });
    };


    const handelRemoveUnavailablePeriod = (indexToRemove: number) => {
        setResource(prevResource => {
            if (!prevResource) {
                console.error("Resource is undefined.");
                return prevResource; // Or handle this case as needed
            }

            const filteredUnavailablePeriods = prevResource.unavailablePeriods.filter((_, index) => index !== indexToRemove);

            return {
                ...prevResource,
                unavailablePeriods: filteredUnavailablePeriods,
            };
        });
    };

    return (
        <div className='grid grid-cols-[1fr_1fr_auto] gap-1 gap-y-2.5 border-gray-600'>
            <label className='col-span-3 block text-xl uppercase font-bold text-gray-700 dark:text-gray-200'>
                Unavailable Dates</label>
            {
                resource?.unavailablePeriods?.map((period, index) => (
                    <React.Fragment key={period.id}>
                        <InputDateField
                            name="startDate"
                            value={period.startDate}
                            onChange={(name, value) => {
                                handleChangeUnavailablePeriod(index, name, value)
                            }}
                            displayName='Start'
                            max={period.endDate}
                            required/>
                        <InputDateField
                            name="endDate"
                            value={period.endDate}
                            onChange={(name, value) => {
                                handleChangeUnavailablePeriod(index, name, value)
                            }}
                            displayName='End'
                            min={period.startDate}
                            required/>
                        <button className='text-xs text-red-500' aria-label="Delete" onClick={(event) => {
                            event.preventDefault();
                            if (window.confirm('Are you sure you want to delete this period?')) {
                                handelRemoveUnavailablePeriod(index)
                            } else {
                                console.log('User cancelled deletion');
                            }
                        }}><FaRegTrashCan/>
                        </button>
                    </React.Fragment>
                ))
            }

            <button type="button"
                    className='col-span-3 btn-default btn-full btn'
                    onClick={handleAddUnavailablePeriod}>
                Add new Period
            </button>
        </div>
    );
}

export default ResourceUnavailablePeriod;