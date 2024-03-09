import { WorkType } from './WorkTypes';

export interface Holiday {
    date: Date;
    description?: string;
}

export interface GlobalSettings {
    projectStartDate: Date;
    holidays: Holiday[];
    //startDay: string; // DayOfWeek in C# can be represented as string in TypeScript
    daysInWorkWeek: number;
    workTypes: WorkType[];
}