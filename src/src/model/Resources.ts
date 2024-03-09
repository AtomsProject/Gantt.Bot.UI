export interface Resource {
    id: string;
    name: string;
    workTypeAssignments: ResourceWorkTypeAssignment[];
    startDate: Date;
    endDate?: Date;
    unavailablePeriods: UnavailablePeriod[];
}

export interface UnavailablePeriod {
    id: string; // UUID for each assignment, used to identify the assignment in the UI
    startDate: Date;
    endDate: Date;
    reason?: string;
}

export interface ResourceWorkTypeAssignment {
    /*
    a given work type can only be assigned to a resource once,
    so this is also our unique identifier for this assignment on the resource.
     */
    workTypeId: string;
    familiarScore: number;
    preferenceFactor: number;
}
