export class GPSEntry {
    VehicleID: number;
    VehicleDate: Date;
    CalculationDateTime: Date;
    StopOrder: number;
    StopType: number;
    ObjectType: string;
    ActualID: number;
    StopTime: Date;
    StopCompleted: boolean;
    TravelTimeToThisStop: number;
    StopAddressID: number;
    RealETA: Date;
    NoShow: number;
    Longitude: number;
    Latitude: number;
    PriorLoadTime: number;
    PriorActualID: number;
    PriorActualStopType: string;
    PriorStopAddressID: number;
    TravelDistanceToThisStop: number;
}