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

export function addWorkType(workType: WorkType): Promise<WorkType> {
    return new Promise((resolve, reject) => {
        try {
            const workTypes = getAllWorkTypes();
            const updatedWorkTypes = [...(workTypes.filter(w => w.id !== workType.id)), workType];
            localStorage.setItem(getLocalStorageKey('workTypes'), JSON.stringify(updatedWorkTypes));
            resolve(workType);
        } catch (error) {
            reject(error);
        }
    });
}

export function addWorkTypes(workTypesToAdd: WorkType[]): Promise<WorkType[]> {
    return new Promise((resolve, reject) => {
        try {
            const workTypes = getAllWorkTypes();
            const updatedWorkTypes = [...workTypes];
            workTypesToAdd.forEach(workTypeToAdd => {
                const index = updatedWorkTypes.findIndex(w => w.id === workTypeToAdd.id);
                if (index !== -1) {
                    updatedWorkTypes[index] = workTypeToAdd;
                } else {
                    updatedWorkTypes.push(workTypeToAdd);
                }
            });
            localStorage.setItem(getLocalStorageKey('workTypes'), JSON.stringify(updatedWorkTypes));
            resolve(updatedWorkTypes);
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