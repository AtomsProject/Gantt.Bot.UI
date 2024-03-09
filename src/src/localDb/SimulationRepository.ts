import axios from 'axios';
import {getTaskObjectStore} from "./TaskRepository.ts";
import {getAllResources} from "./ResourceRepository.ts";
import {TaskItem} from "../model/Tasks.ts";
import {Resource} from "../model/Resources.ts";
import {GlobalSettings} from "../model/GlobalSettings.ts";
import {getAllWorkTypes} from "./WorkTypeRepository.ts";
import {SimulationResult} from "../model/SchedulingTask.ts";

function getLocalStorageKeyForTaskSimulation(projectId: string): string {
    return `ganttbot_projects_${projectId}_Simulation`;
}

export function clearSimulationResult(projectId: string): void {
    const prefix = getLocalStorageKeyForTaskSimulation(projectId);
    // Remove all keys that start with the prefix
    for (const key in localStorage) {
        if (key.startsWith(prefix)) {
            localStorage.removeItem(key);
        }
    }
}

export async function getSimulationResult(projectId: string, confidence: string): Promise<SimulationResult | null> {
    // Get the version number from local storage
    const storageKeyVersion = getLocalStorageKeyForTaskSimulation(projectId)  + `_${confidence}` + '_version';
    const storageKey = getLocalStorageKeyForTaskSimulation(projectId) + `_${confidence}`;
    
    const cachedVersion = localStorage.getItem(storageKeyVersion);
    const taskObjectStore = getTaskObjectStore(projectId);
    const resources = getAllResources(projectId);

    if (!taskObjectStore || !resources) {
        console.log("Task Object Store or Resources not found");
        return null;
    }
    
    const confidenceNumber = confidence === 'range' ? 90 : Number(confidence);
    
    if(confidenceNumber < 70 || confidenceNumber >= 100) {
        console.log("Confidence level not supported");
        return null;
    }

    // If the version numbers match, return the cached data
    if (!isNaN(Number(cachedVersion)) && Number(cachedVersion) === taskObjectStore.version) {
        const cachedData = localStorage.getItem(storageKey);
        if (cachedData)
            return JSON.parse(cachedData);
    }

    const workTypes = getAllWorkTypes();

    // Create a SimulationRequest object
    const simulationRequest: SimulationRequest = {
        confidenceLevel: confidenceNumber / 100,
        rangeConfidenceLevel:  confidence === 'range' ? 0.7 : null,
        tasks: taskObjectStore.tasks,
        settings: {
            projectStartDate: new Date(Date.now()),
            holidays: [],
            daysInWorkWeek: 5,
            workTypes: workTypes
        },
        resources
    };

    // If the version numbers do not match, call the API to get the new data
    const dataResponse = await axios.post('https://gantt-bot-api.azurewebsites.net/simulation/run', simulationRequest);
    const data = dataResponse.data;

    // Store the new data and the new version number in local storage
    localStorage.setItem(storageKey, JSON.stringify(data));
    localStorage.setItem(storageKeyVersion, taskObjectStore.version.toString())

    // Return the new data
    return data;
}

interface SimulationRequest {
    confidenceLevel: number;
    rangeConfidenceLevel: number | null;
    tasks: TaskItem[];
    settings: GlobalSettings;
    resources: Resource[];
}