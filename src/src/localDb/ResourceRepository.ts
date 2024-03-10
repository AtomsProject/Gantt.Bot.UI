import { Resource, UnavailablePeriod } from '../model/Resources.ts';
import {getTaskObjectStore} from "./TaskRepository.ts";

export function getLocalStorageKeyForResources(projectId: string): string {
    return `ganttbot_projects_${projectId}_resources`;
}

export function loadResources(projectId: string, resources: Resource[]): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            localStorage.setItem(getLocalStorageKeyForResources(projectId), JSON.stringify(resources));
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

export function getAllResources(projectId: string): Resource[] {
    const resources = localStorage.getItem(getLocalStorageKeyForResources(projectId));
    return resources ? JSON.parse(resources).map((resource: Resource) => ({
        ...resource,
        startDate: new Date(resource.startDate),
        endDate: resource.endDate ? new Date(resource.endDate) : undefined,
        unavailablePeriods: resource.unavailablePeriods.map((period: UnavailablePeriod) => ({
            ...period,
            startDate: new Date(period.startDate),
            endDate: new Date(period.endDate)
        }))
    })) : [];
}

export function getResourceById(projectId: string, id: string): Resource | undefined {
    const resources: Resource[] = getAllResources(projectId);
    return resources.find(resource => resource.id === id);
}

export function addResource(projectId: string, resource: Resource): Promise<Resource> {
    return new Promise((resolve, reject) => {
        try {
            const resources = getAllResources(projectId);
            const updatedResources = [...resources, resource];
            localStorage.setItem(getLocalStorageKeyForResources(projectId), JSON.stringify(updatedResources));
            resolve(resource);
        } catch (error) {
            reject(error);
        }
    });
}

export function deleteResource(projectId: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const resources = getAllResources(projectId);
            const updatedResources = resources.filter(resource => resource.id !== id);
            localStorage.setItem(getLocalStorageKeyForResources(projectId), JSON.stringify(updatedResources));
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

export function updateResource(projectId: string, updatedResource: Resource): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            console.info('Updating resource', updatedResource)

            const resources = getAllResources(projectId);
            
            // Sort the work types in updateResource.workTypeAssignments by workTypeId
            updatedResource.workTypeAssignments.sort((a, b) => a.workTypeId.localeCompare(b.workTypeId));

            const updatedResources = resources.map(resource => resource.id === updatedResource.id ? updatedResource : resource);
            localStorage.setItem(getLocalStorageKeyForResources(projectId), JSON.stringify(updatedResources));
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

export function cloneProjectResources(srcProjectId: string, dstProjectId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const existingTasks = getAllResources(srcProjectId);
            localStorage.setItem(getLocalStorageKeyForResources(dstProjectId), JSON.stringify(existingTasks));
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}


