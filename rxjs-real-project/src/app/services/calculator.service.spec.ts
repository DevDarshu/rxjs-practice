import { TestBed } from '@angular/core/testing';
import { CalculatorService } from './calculator.service';

describe('CalculatorService', () => {
    let service: CalculatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CalculatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add two numbers correctly', () => {
        const result = service.add(2, 3);
        expect(result).toBe(5);
    });

    it('should subtract two numbers correctly', () => {
        const result = service.subtract(5, 3);
        expect(result).toBe(2);
    });
});
