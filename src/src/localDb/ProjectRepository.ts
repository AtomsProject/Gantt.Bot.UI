import {cloneProjectTasks} from "./TaskRepository.ts";
import {cloneProjectResources} from "./ResourceRepository.ts";

export function getLocalStorageKey(key: string): string {
    return `ganttbot_${key}`;
}

export function getAllProjects(): Project[] {
    const projects = localStorage.getItem(getLocalStorageKey('projects'));
    return projects ? JSON.parse(projects).map((resource: Project) => ({
        ...resource
    })) : [];
}

export function getProjectById(id: string): Project | undefined {
    const projects: Project[] = getAllProjects();
    return projects.find(resource => resource.id === id);
}

export async function addProject(data: AddProjectData): Promise<Project> {
    try {
        const projects = getAllProjects();
        const updatedProjects = [...projects, data.resource];
        localStorage.setItem(getLocalStorageKey('projects'), JSON.stringify(updatedProjects));

        if(data.srcProjectId){
           await cloneProjectTasks(data.srcProjectId, data.resource.id);
           await cloneProjectResources(data.srcProjectId, data.resource.id);
        }

        return data.resource;
    } catch (error) {
        throw error;
    }
}

type AddProjectData = {
    resource: Project;
    srcProjectId: string | undefined;
};

export function deleteProject(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const resources = getAllProjects();
            const updatedWorkTypes = resources.filter(resource => resource.id !== id);
            localStorage.setItem(getLocalStorageKey('projects'), JSON.stringify(updatedWorkTypes));
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}