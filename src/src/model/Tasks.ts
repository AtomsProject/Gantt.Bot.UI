
import {v4 as uuidV4} from 'uuid';
export interface TaskItem {
    id: string;
    name: string;
    duration?: Duration;
    dependencies?: string[];
    priority?: number;
    // Task should start on or after midnight on this date.
    startAfter?: Date;
    // Task is due on or before on this date.
    dueBefore?: Date;
    
    parentTaskId: string | null;
    siblingOrdinal : number;
    
    // Milestone task are task that show up on the roadmap.
    isMilestone: boolean;
    // Allows for task-specific assignment of resources, enabling nuanced resource allocation decisions.
    // If not specified the task will be assigned to resources based solely on the work type and skill level.
    individualPriorities?: IndividualPriority[];
    // Links a task to a specific type of work, facilitating matching tasks with resources skilled or preferred in that work type.
    workTypeId?: string;
    // Indicates the minimum level of familiarity of a given work type a resource must have to be assigned to this task, ensuring task-resource compatibility.
    requiredFamiliarScore: number;
    // Indicates that this task should supersede any active task the resource is working on, allowing for task-specific prioritization of resources.
    supersedeActiveTask: boolean;
    // Indicates that this task is not inherently dependent on its sibling tasks, allowing for parallel scheduling.
    // Any explicit dependencies will still be respected.
    allowParallelScheduling: boolean;
}

export interface TaskItemNames extends TaskItem {
    id: string;
    name: string;
}

export interface TaskItemIsParent extends TaskItem {
    isParent: boolean;
    
    // Indicates this should have the limited properties of a parent or milestone task.
    isLimitedProperties: boolean;
}

export function CreateEmptyTask():TaskItem{
    return {
        id: uuidV4(),
        name: 'New Task',
        parentTaskId: null,
        siblingOrdinal: 0,
        isMilestone: false,
        requiredFamiliarScore: 0,
        supersedeActiveTask: false,
        allowParallelScheduling: false
    }
}

export interface Duration {
    optimistic: number;
    mostLikely: number;
    pessimistic: number;
}

// Specify priorities for an individual on a given task, say I want person X to work on this, but if they are working on other higher priority work, we could assign this to someone else
export interface IndividualPriority {
    resourceId: string;
    priority: number;
}