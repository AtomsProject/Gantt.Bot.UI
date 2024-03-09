import {setTaskOrdinal, taskOrdinal} from "../src/localDb/setTaskOrdinal";

const scenario = [
    {siblingOrdinal: 10, parentTaskId: null, id: '1'},
    {siblingOrdinal: 10, parentTaskId: '1', id: '11'},
    {siblingOrdinal: 10, parentTaskId: '12', id: '111'},
    {siblingOrdinal: 20, parentTaskId: '1', id: '12'},
    {siblingOrdinal: 30, parentTaskId: '1', id: '13'},
    {siblingOrdinal: 20, parentTaskId: null, id: '2'},
    {siblingOrdinal: 30, parentTaskId: null, id: '3'},
];

function deepCopyTest(t: taskOrdinal[]): taskOrdinal[] {
    return JSON.parse(JSON.stringify(t));
}

test('setTaskOrdinal - add to root', () => {
    const task = {siblingOrdinal: 0, parentTaskId: null, id: '4'};
    const relatedTask = null;
    const placement = 'child';
    const tasks = deepCopyTest(scenario);
    const result = setTaskOrdinal(task, relatedTask, placement, tasks);
    expect(task).toEqual({siblingOrdinal: 40, parentTaskId: null, id: '4'});
    expect(result).toEqual([
        {siblingOrdinal: 10, parentTaskId: null, id: '1'},
        {siblingOrdinal: 10, parentTaskId: '1', id: '11'},
        {siblingOrdinal: 10, parentTaskId: '12', id: '111'},
        {siblingOrdinal: 20, parentTaskId: '1', id: '12'},
        {siblingOrdinal: 30, parentTaskId: '1', id: '13'},
        {siblingOrdinal: 20, parentTaskId: null, id: '2'},
        {siblingOrdinal: 30, parentTaskId: null, id: '3'}
    ]);
});

test('setTaskOrdinal - add to root before', () => {
    const task = {siblingOrdinal: 0, parentTaskId: null, id: '4'};
    const relatedTask = null;
    const placement = 'before';
    const tasks = deepCopyTest(scenario);
    const result = setTaskOrdinal(task, relatedTask, placement, tasks);
    expect(task).toEqual({siblingOrdinal: 5, parentTaskId: null, id: '4'});
    expect(result).toEqual([
        {siblingOrdinal: 10, parentTaskId: null, id: '1'},
        {siblingOrdinal: 10, parentTaskId: '1', id: '11'},
        {siblingOrdinal: 10, parentTaskId: '12', id: '111'},
        {siblingOrdinal: 20, parentTaskId: '1', id: '12'},
        {siblingOrdinal: 30, parentTaskId: '1', id: '13'},
        {siblingOrdinal: 20, parentTaskId: null, id: '2'},
        {siblingOrdinal: 30, parentTaskId: null, id: '3'}
    ]);
});

test('setTaskOrdinal - add to root after', () => {
    const task = {siblingOrdinal: 0, parentTaskId: null, id: '4'};
    const placement = 'after';
    const tasks = deepCopyTest(scenario);
    const relatedTask = tasks[0];
    const result = setTaskOrdinal(task, relatedTask, placement, tasks);
    expect(task).toEqual({siblingOrdinal: 14, parentTaskId: null, id: '4'});
    expect(result).toEqual([
        {siblingOrdinal: 10, parentTaskId: null, id: '1'},
        {siblingOrdinal: 10, parentTaskId: '1', id: '11'},
        {siblingOrdinal: 10, parentTaskId: '12', id: '111'},
        {siblingOrdinal: 20, parentTaskId: '1', id: '12'},
        {siblingOrdinal: 30, parentTaskId: '1', id: '13'},
        {siblingOrdinal: 20, parentTaskId: null, id: '2'},
        {siblingOrdinal: 30, parentTaskId: null, id: '3'}
    ]);
});

test('setTaskOrdinal - after fuzz', () => {
    // put a task after each of the task in the scenario
    // then make sure the the new tasks ordinal is grater than the one it was placed after
    // Also find the task that we should have been placed before, if any, and make sure the new tasks ordinal is less than that
    const tasksToRun = deepCopyTest(scenario);
    tasksToRun.forEach((_, i) => {
        const tasks = deepCopyTest(scenario); // Fresh copy for each iteration
        const relatedTask = tasks[i];
        // Look for siblings of the related task, who's ordinal is greater than the related task
        // then sort them by ordinal, and then find the first one that is greater than the related task
        const expectedBefore = tasks
            .filter(t => t.parentTaskId === relatedTask.parentTaskId && t.siblingOrdinal > relatedTask.siblingOrdinal)
            .sort((a, b) => a.siblingOrdinal - b.siblingOrdinal).find(() => true);
        
        const task = {siblingOrdinal: 0, parentTaskId: null, id: '4'};
        const placement = 'after';
        
        console.log('tasks', i, task, relatedTask, expectedBefore, tasks)
        
        setTaskOrdinal(task, relatedTask, placement, tasks);
        expect(task.parentTaskId).toBe(relatedTask.parentTaskId);
        expect(task.siblingOrdinal).toBeGreaterThan(relatedTask.siblingOrdinal);
        if (expectedBefore) {
            expect(task.siblingOrdinal).toBeLessThan(expectedBefore.siblingOrdinal);
        }
    });
});

test('setTaskOrdinal - before fuzz', () => {
    // put a task before each of the task in the scenario
    // then make sure the the new tasks ordinal is less than the one it was placed before
    // Also find the task that we should have been placed after, if any, and make sure the new tasks ordinal is greater than that
    const tasksToRun = deepCopyTest(scenario);
    tasksToRun.forEach((_, i) => {
        const tasks = deepCopyTest(scenario); // Fresh copy for each iteration
        const relatedTask = tasks[i];
        // Look for siblings of the related task, who's ordinal is less than the related task
        // then sort them dec by ordinal, and then find the first one that is less than the related task
        const expectedAfter = tasks
            .filter(t => t.parentTaskId === relatedTask.parentTaskId && t.siblingOrdinal < relatedTask.siblingOrdinal)
            .sort((a, b) => b.siblingOrdinal - a.siblingOrdinal).find(() => true);
        
        const task = {siblingOrdinal: 0, parentTaskId: null, id: '4'};
        const placement = 'before';
        
        console.log('tasks', i, task, relatedTask, expectedAfter, tasks)
        
        setTaskOrdinal(task, relatedTask, placement, tasks);
        expect(task.parentTaskId).toBe(relatedTask.parentTaskId);
        expect(task.siblingOrdinal).toBeLessThan(relatedTask.siblingOrdinal);
        if (expectedAfter) {
            expect(task.siblingOrdinal).toBeGreaterThan(expectedAfter.siblingOrdinal);
        }
    });
});