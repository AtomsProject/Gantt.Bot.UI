
export interface taskOrdinal {
    siblingOrdinal: number
    parentTaskId: string | null
    id: string
}

export function setTaskOrdinal(task: taskOrdinal, relatedTask: taskOrdinal | null, placement: 'before' | 'after' | 'child', tasks: taskOrdinal[]): taskOrdinal[] {
    const taskId = task.id;
    if (!relatedTask || placement === 'child') {
        task.parentTaskId = relatedTask?.id ?? null;
        // if no related task, we'll add to the root
        // but also means we can only place at the beginning or end of the root tasks
        if (placement === 'before') {
            // TODO: my gut knows there is a way to to make this more DRY.
            // The only time you should really need 'child' is when there are no other children
            // and those cases are easy to handle, and if there are other children, then we should
            // figure out which of the children to place it before or after, and call into the rest
            // of this code.

            const siblingTasks = tasks
                .filter(t => t.parentTaskId === task.parentTaskId && t.id != taskId)
                .sort((a, b) => a.siblingOrdinal - b.siblingOrdinal)

            // User didn't specify a related task, so we'll just add it to the start
            const relatedTaskOrdinal = siblingTasks[0].siblingOrdinal
            if (relatedTaskOrdinal === 2) {
                task.siblingOrdinal = 1;
            } else if (relatedTaskOrdinal > 2) {
                task.siblingOrdinal = Math.floor(relatedTaskOrdinal / 2);
            } else {
                task.siblingOrdinal = 10;
                let ordinal = 2;
                siblingTasks.forEach(t => t.siblingOrdinal = 10 * ordinal++);
            }
        } else {
            // user was not specific, so we'll add it to the end of the root tasks
            // This is the fallback if we just don't know where to put it.
            task.siblingOrdinal = tasks
                .filter(t => t.parentTaskId === task.parentTaskId && t.id != taskId)
                .reduce((max, t) => Math.max(max, t.siblingOrdinal), 0) + 10;
        }
    } else {
        // If we have a related task, so we can place it.
        task.parentTaskId = relatedTask.parentTaskId;

        const siblingTasks = tasks
            .filter(t => t.parentTaskId === relatedTask.parentTaskId && t.id != taskId)
            .sort((a, b) => a.siblingOrdinal - b.siblingOrdinal)
        let relatedTaskIndex = siblingTasks.findIndex(t => t.id === relatedTask.id);
        console.debug("relatedTaskIndex", relatedTaskIndex, siblingTasks)
        
        if (relatedTaskIndex === 0 && placement === 'before') {
            // We are placing the new task at the start of the list.
            // see if there is a gap between the related task and 0 that we can use
            const relatedTaskOrdinal = siblingTasks[relatedTaskIndex].siblingOrdinal
            if (relatedTaskOrdinal === 2) {
                task.siblingOrdinal = 1;
            } else if (relatedTaskOrdinal > 2) {
                task.siblingOrdinal = Math.floor(relatedTaskOrdinal / 2);
            } else {
                // No gap, fine, we'll just reset all the ordinals
                task.siblingOrdinal = 10;
                let ordinal = 2;
                siblingTasks.forEach(t => t.siblingOrdinal = 10 * ordinal++);
            }
        } else if (relatedTaskIndex === siblingTasks.length - 1 && placement === 'after') {
            // we are placing the new task at the end of the list
            task.siblingOrdinal = siblingTasks[relatedTaskIndex].siblingOrdinal + 10;
        } else {
            if (placement === 'after') {
                // After is the same as before the next sibling, move our related task index to the next sibling
                relatedTaskIndex++;
                // Also know we can do this, because of the if above where check 
                // relatedTaskIndex === siblingTasks.length. NOTE: If line ever changes, then this could brake.
            }
            if (relatedTaskIndex == 0) {
                // If we are before and index was 0, then we should have been caught by the first if statement
                // If we are after the first sibling, we move this to now be before the second sibling...
                // So shouldn't happen, but if it does, we'll just throw an error.
                throw new Error('Related task index is 0, this should not happen');
            } else if (relatedTaskIndex == siblingTasks.length - 1) {
                // If the related task is the last item, then we can take it's ordinal
                // and then update just the related task ordinal by incrementing by 1 
                const relatedTask = siblingTasks[relatedTaskIndex];
                task.siblingOrdinal = relatedTask.siblingOrdinal;
                relatedTask.siblingOrdinal += 10;
            } else {
                let highestOrdinal = siblingTasks[relatedTaskIndex].siblingOrdinal;
                const priorSiblingOrdinal = siblingTasks[relatedTaskIndex - 1].siblingOrdinal;

                // If we have room between the prior sibling and the related task, we'll use that
                const room = highestOrdinal - priorSiblingOrdinal - 1;
                if (room === 1) {
                    // If we have room, we'll just take the related task ordinal
                    task.siblingOrdinal = priorSiblingOrdinal + 1;
                } else if (room > 1) {
                    // we have a gap, so let's try to leave room for other tasks to be added in the future
                    // by splitting the difference between the prior sibling and the related task
                    task.siblingOrdinal = priorSiblingOrdinal + Math.floor(room / 2);
                } else {
                    // Take the ordinal of the related task
                    task.siblingOrdinal = highestOrdinal;

                    let incrementOrdinal = 1;
                    // reset the rest of the sibling tasks ordinal
                    for (const afterSibling of siblingTasks.slice(relatedTaskIndex)) {
                        afterSibling.siblingOrdinal = highestOrdinal + (incrementOrdinal++ * 10);
                    }
                }
            }
        }
    }

    return tasks;
}