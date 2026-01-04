import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CalculatorService {

    constructor() { }

    add(a: number, b: number): number {
        return a + b;
    }

    subtract(a: number, b: number): number {
        return a - b;
    }
}
