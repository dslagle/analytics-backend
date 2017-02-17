export class Run {
    ScheduledRunID: number;
    ActualRunID: number;
    VehicleID: number;
    DriverID: number;
    Name: string;
    Started: boolean;
    Completed: boolean;
    ScheduledStartTime: Date;
    ScheduledEndTime: Date;
    ActualStartTime: Date;
    ActualEndTime: Date;
}