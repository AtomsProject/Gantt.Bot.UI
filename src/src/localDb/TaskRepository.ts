import {TaskItem, TaskItemIsParent, TaskItemNames} from "../model/Tasks.ts";
import {setTaskOrdinal} from "./setTaskOrdinal.ts";

// TODO: This group of functions needs unit tests.
interface taskObjectStore {
    projectId: string;
    tasks: TaskItem[];
    version: number;
}

export function getLocalStorageKeyForTask(projectId: string): string {
    return `ganttbot_projects_${projectId}_tasks`;
}

export function getTaskObjectStore(projectId: string): taskObjectStore {
    // TODO: Consider if we should have a caching layer here...
    const tasks = localStorage.getItem(getLocalStorageKeyForTask(projectId));

    if (!tasks) {
        return {
            projectId: projectId,
            tasks: [],
            version: 1
        }
    }
    return JSON.parse(tasks);
}

function setTaskObjectStore(objectStore: taskObjectStore): void {
    objectStore.version++;
    console.log("Setting task object store", objectStore.projectId, objectStore.version, objectStore.tasks.length)
    localStorage.setItem(getLocalStorageKeyForTask(objectStore.projectId), JSON.stringify(objectStore));
}

export function loadTasks(projectId: string, tasks: TaskItem[]): void {
    const objectStore = getTaskObjectStore(projectId);
    objectStore.tasks = tasks;
    setTaskObjectStore(objectStore);
}

export function getRootTaskIds(projectId: string): string[] {
    const objStore = getTaskObjectStore(projectId)

    return objStore.tasks
        .filter(task => !task.parentTaskId)
        .sort((a, b) => a.siblingOrdinal - b.siblingOrdinal)
        .map(task => task.id);
}

export function getTaskIdsByParentId(projectId: string, parentId: string): string[] {
    // TODO: This is not efficient, we should have a map of parents that we pull one time.
    const objStore = getTaskObjectStore(projectId)
    return objStore.tasks
        .filter(task => task.parentTaskId === parentId)
        .sort((a, b) => a.siblingOrdinal - b.siblingOrdinal)
        .map(task => task.id);
}

export function getTaskById(projectId: string, id: string): TaskItemIsParent | undefined {
    const objStore = getTaskObjectStore(projectId);
    // If we had a caching layer, we could have this in a set for O(1) lookup
    const task = objStore.tasks.find(task => task.id === id);
    if (!task) {
        return undefined;
    }

    // Check if we have any children, if so we need to not we are a parent.
    const isParent = objStore.tasks.some(t => t.parentTaskId === id);
    if (isParent) {
        // We are going to remove the items that are not allow or needed on the parent task.
        // Being lazy probably should look at a cleaner way to do this.
        // Same with milestones, they really do have a different set of properties.
        return {
            ...task,
            duration: undefined,
            workTypeId: undefined,
            individualPriorities: undefined,
            isParent,
            isLimitedProperties: true
        };
    }

    return {...task, isParent, isLimitedProperties: task.isMilestone};
}

export function GetAllTasks(projectId?: string | null): Promise<TaskItemNames[]> {
    return new Promise((resolve, reject) => {
        try {
            if (!projectId) {
                resolve([]);
                return;
            }
            
            const objStore = getTaskObjectStore(projectId);
            resolve(objStore.tasks);
            return;
            
        } catch (error) {
            reject(error);
        }
    });
}


export function moveTask(data: moveTaskData): Promise<moveResult[]> {
    return new Promise((resolve, reject) => {
        try {
            if (!data.projectId) {
                resolve([]);
                return;
            }

            const objectStore = getTaskObjectStore(data.projectId);
            const task = objectStore.tasks.find(task => task.id === data.taskId);
            if (!task) {
                console.warn("Task not found", data.taskId);
                resolve([]);
                return;
            }

            let originalParent = task.parentTaskId;

            // find the sibling tasks, and then our index in the sibling tasks
            const siblingTasks = objectStore.tasks
                .filter(t => t.parentTaskId === task.parentTaskId)
                .sort((a, b) => a.siblingOrdinal - b.siblingOrdinal);
            const index = siblingTasks.findIndex(t => t.id === task.id);

            switch (data.direction) {
                case 'up':
                    if (index === 0) {
                        // Can't move up, we are already at the top
                        resolve([{parentTaskId: task.parentTaskId}]);
                        return;
                    }
                    // Swap the ordinal of the task with the task above it
                    const tempUp = siblingTasks[index].siblingOrdinal;
                    siblingTasks[index].siblingOrdinal = siblingTasks[index - 1].siblingOrdinal;
                    siblingTasks[index - 1].siblingOrdinal = tempUp;
                    break;
                case 'down':
                    if (index === siblingTasks.length - 1) {
                        // Can't move down, we are already at the bottom
                        resolve([{parentTaskId: task.parentTaskId}]);
                        return;
                    }
                    // Swap the ordinal of the task with the task below it
                    const tempDown = siblingTasks[index].siblingOrdinal;
                    siblingTasks[index].siblingOrdinal = siblingTasks[index + 1].siblingOrdinal;
                    siblingTasks[index + 1].siblingOrdinal = tempDown;
                    break;
                case 'out-down':
                case 'out-up':
                    if (!task.parentTaskId) {
                        // Can't move out-up, we are already at the root
                        resolve([{parentTaskId: task.parentTaskId}]);
                        return;
                    }

                    // find our parent's sibling tasks, and our index of our parent.
                    const outParentTask = objectStore.tasks.find(t => t.id === task.parentTaskId);
                    if (!outParentTask) {
                        resolve([{parentTaskId: task.parentTaskId}]);
                        return;
                    }

                    setTaskOrdinal(task, outParentTask, data.direction === 'out-down' ? 'after' : 'before', objectStore.tasks);
                    break;
                case 'in-up':
                    if (index === 0) {
                        // Can't move up, we are already at the top
                        resolve([{parentTaskId: task.parentTaskId}]);
                        return;
                    }

                    const targetParent = siblingTasks[index - 1];
                    // find the highest ordinal of the target parent's children, using reduce
                    const highestOrdinal = objectStore.tasks
                        .filter(t => t.parentTaskId === targetParent.id)
                        .reduce((max, t) => Math.max(max, t.siblingOrdinal), 0);

                    // Move the task to the end of the target parent's children
                    task.parentTaskId = targetParent.id;
                    task.siblingOrdinal = highestOrdinal + 10;

                    // Direct return so we as we want to invalidate the original parent task id
                    setTaskObjectStore(objectStore);
            }

            setTaskObjectStore(objectStore);

            // If we moved the task to a different parent, we need to return both the original parent and the new parent
            if (originalParent !== task.parentTaskId) {
                resolve([{parentTaskId: originalParent}, {parentTaskId: task.parentTaskId}]);
            } else {
                resolve([{parentTaskId: task.parentTaskId}]);
            }
            return;
        } catch (error) {
            reject(error);
        }
    });
}

export function addTask(data: AddTasksData): Promise<TaskItem> {
    // My apologies, this is a bit complex, there is likely a way to simplify this, but don't have the time to find it.
    return new Promise((resolve, reject) => {
            if (!data.projectId) {
                reject(new Error('Parent task not found'));
                return;
            }

            console.log('adding task', data);
            const {placement, task, relatedTaskId} = data;

            try {
                // Get all tasks is a de-serialized JSON object, so we don't need to clone it, for now.
                const objectStore = getTaskObjectStore(data.projectId);

                //Guard that data.task.id is not already in the task store
                if (objectStore.tasks.find(task => task.id === data.task.id)) {
                    reject(new Error('Task already exists'));
                    return;
                }

                const relatedTask = relatedTaskId
                    // If we don't find the related task, we will return null, meaning we'll add to the root.
                    ? objectStore.tasks.find(task => task.id === relatedTaskId) ?? null
                    : null;

                setTaskOrdinal(task, relatedTask, placement ?? 'child', objectStore.tasks);

                objectStore.tasks.push(data.task);
                setTaskObjectStore(objectStore);
                resolve(data.task);
            } catch
                (error) {
                reject(error);
            }
        }
    );
}

export function deleteTask(data: deleteTaskData): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            if (!data.projectId) {
                resolve();
                return;
            }

            // Right now, Get all tasks is a de-serialized JSON object, so we don't need to clone it.
            const objectStore = getTaskObjectStore(data.projectId);

            if (data.deleteChildren) {
                // TODO: Should remove orphaned tasks
                // We will remove one layer of child tasks, but not their children or children's children or...
                objectStore.tasks = objectStore.tasks.filter(task => task.id !== data.taskId && task.parentTaskId !== data.taskId);
            } else {
                // Move all child tasks to the index position of the during task in the parent task's child items
                // Now add the child tasks to the parent task at the same index
                const taskIndex = objectStore.tasks.findIndex(task => task.id === data.taskId);
                if (!taskIndex) {
                    // Not found, nothing to do.
                    resolve();
                    return;
                }
                const task = objectStore.tasks[taskIndex];
                const childTasks = objectStore.tasks
                    .filter(task => task.parentTaskId === data.taskId)
                    .sort((a, b) => a.siblingOrdinal - b.siblingOrdinal);

                const siblingTasks = objectStore.tasks
                    .filter(t => t.id === task.parentTaskId)
                    .sort((a, b) => a.siblingOrdinal - b.siblingOrdinal)

                const index = siblingTasks.findIndex(t => t.id === data.taskId);

                // Get the siblings that are before us, then figure out what the highest ordinal is of this group.
                // Set the order of our child tasks, starting at the highest ordinal + 1,
                // then continue with the incrementing ordinal for the rest of the sibling tasks that has come after us.
                // Then create a new joined array of the before siblings, the child tasks, and the after siblings. 

                // check if index is 0, if so, we don't need to do anything
                const beforeSiblings = index === 0 ? [] : siblingTasks.slice(0, index);

                // check if index is the last item, if so, we don't need to do anything
                const afterSiblings = index === siblingTasks.length ? [] : siblingTasks.slice(index + 1);

                const highestOrdinal = beforeSiblings.length > 0 ? beforeSiblings[beforeSiblings.length - 1].siblingOrdinal : 0;

                let ordinalIncrement = 1;

                for (const childTask of childTasks) {
                    childTask.siblingOrdinal = highestOrdinal + (ordinalIncrement++ * 10);
                    childTask.parentTaskId = task.parentTaskId;
                }
                for (const afterSibling of afterSiblings) {
                    afterSibling.siblingOrdinal = highestOrdinal + (ordinalIncrement++ * 10);
                }

                // Now we can remove the task from the master list
                objectStore.tasks.splice(taskIndex, 1);
            }

            setTaskObjectStore(objectStore);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

export function updateTask(data: updateTaskData): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            if (!data.projectId) {
                resolve();
                return;
            }
            console.info('Updating task', data.task.id)
            const objectStore = getTaskObjectStore(data.projectId);
            const existTask = objectStore.tasks.find(task => task.id === data.task.id);

            if (!existTask) {
                reject(new Error('Task not found'));
                return;
            }

            // Check that they are not changing the parent task id, or ordinal.  That requires a different function.
            if (existTask.parentTaskId !== data.task.parentTaskId || existTask.siblingOrdinal !== data.task.siblingOrdinal) {
                reject(new Error('Parent task or sibling ordinal cannot be changed directly'));
                return;
            }

            objectStore.tasks = objectStore.tasks.map(task => task.id === data.task.id ? data.task : task);
            setTaskObjectStore(objectStore);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

export function cloneProjectTasks(srcProjectId: string, dstProjectId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const existingTasks = getTaskObjectStore(srcProjectId);
            existingTasks.projectId = dstProjectId;
            setTaskObjectStore(existingTasks);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

type deleteTaskData = {
    // If projectId is not specified, no tasks will be deleted
    projectId: string | null;
    taskId: string;

    // If false, child tasks will be moved to take the place of the deleted task
    deleteChildren: boolean;
}

type projectTaskData = {
    projectId: string | null;
}

type moveResult = {
    parentTaskId: string | null
}

type moveTaskData = {
    projectId: string | null
    taskId: string
    direction: 'up' | 'down' | 'out-down' | 'out-up' | 'in-up'
}

type AddTasksData = {
    projectId: string | null
    relatedTaskId: string | null
    placement: 'before' | 'after' | 'child' | undefined
    task: TaskItem
};

type updateTaskData = {
    projectId: string | null
    task: TaskItem
}
