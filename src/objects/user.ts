import { Queue } from "queue-typescript";

export interface Coordinate {
    x: number;
    y: number;
}
export interface Mark {
    focus: Coordinate;
    coordinate: Coordinate;
}

export class User {
    constructor(
        userId: number, focus: Coordinate, coordinate: Coordinate, rgb: any, marks: any
    ) {
        this.userId = userId;
        this.focus = focus;
        this.coordinate = coordinate;
        this.rgb = rgb;
        this.marks = marks;
    }
    userId: number;
    focus: Coordinate;
    coordinate: Coordinate;
    rgb: any;
    marks: Queue<Mark>;
}