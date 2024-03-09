import {WorkType} from "../model/WorkTypes.ts";

export function getLocalStorageKey(key: string): string {
    return `ganttbot_${key}`;
}

export function getAllWorkTypes(): WorkType[] {
    const workTypes = localStorage.getItem(getLocalStorageKey('workTypes'));
    return workTypes ? JSON.parse(workTypes).map((resource: WorkType) => ({
        ...resource
    })) : [];
}

export function getWorkTypeById(id: string): WorkType | undefined {
    const workTypes: WorkType[] = getAllWorkTypes();
    return workTypes.find(resource => resource.id === id);
}

export function addWorkType(resource: WorkType): Promise<WorkType> {
    return new Promise((resolve, reject) => {
        try {
            const workTypes = getAllWorkTypes();
            const updatedWorkTypes = [...workTypes, resource];
            localStorage.setItem(getLocalStorageKey('workTypes'), JSON.stringify(updatedWorkTypes));
            resolve(resource);
        } catch (error) {
            reject(error);
        }
    });
}

export function deleteWorkType(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const resources = getAllWorkTypes();
            const updatedWorkTypes = resources.filter(resource => resource.id !== id);
            localStorage.setItem(getLocalStorageKey('workTypes'), JSON.stringify(updatedWorkTypes));
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}