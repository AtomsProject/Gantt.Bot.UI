import {TaskItem} from "./Tasks.ts";

export type SchedulingTask = {
  task: TaskItem;
  isRootTask: boolean;
  projectName: string;
  duration: number;
  index: number;
  isParentTask: boolean;
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  dueBefore: number | null;
  startAfter: number | null;
  slack: number;
  durationResourceAdjusted: number;
  ranking: number;
  assignedResourceId: string | null;
  userPriority: number | null;
};

export type SimulationResult = {
  tasks: SchedulingTask[];
  projectSchedule: string;
  milestoneSchedule: string;
  resourceSchedule: string;
  resourceProjectSchedule: string;
  taskMap: string;
  taskMapDepth: string;
  table: string;
};