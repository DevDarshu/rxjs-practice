import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Observable, of, timer } from 'rxjs';
import { switchMap, mergeMap, concatMap, exhaustMap, tap, map, scan, delay } from 'rxjs/operators';

@Component({
    selector: 'app-race-conditions',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container">
      <h2>Flattening Operators Race</h2>
      <p>Click the buttons rapidly to see how different operators handle concurrent requests.</p>
      
      <div class="controls">
        <button (click)="trigger('switchMap')">switchMap (Latest Only)</button>
        <button (click)="trigger('mergeMap')">mergeMap (Parallel)</button>
        <button (click)="trigger('concatMap')">concatMap (Sequential)</button>
        <button (click)="trigger('exhaustMap')">exhaustMap (Ignore New)</button>
      </div>

      <div class="logs">
        <div *ngFor="let log of logs" [class]="log.type">
          {{ log.message }}
        </div>
      </div>
    </div>
  `,
    styles: [`
    .container { padding: 20px; }
    .controls button { margin: 5px; padding: 10px; cursor: pointer; }
    .logs { margin-top: 20px; border: 1px solid #ccc; padding: 10px; height: 300px; overflow-y: auto; background: #f9f9f9; }
    .start { color: blue; }
    .complete { color: green; font-weight: bold; }
    .cancel { color: red; }
  `]
})
export class RaceConditionsComponent {
    private trigger$ = new Subject<{ type: string, id: number }>();
    private requestId = 0;

    constructor() { }

    // Let's implement this differently to be clearer
    logs: any[] = [];

    // Strategies
    switchMapSubject = new Subject<number>();
    mergeMapSubject = new Subject<number>();
    concatMapSubject = new Subject<number>();
    exhaustMapSubject = new Subject<number>();

    ngOnInit() {
        // 1. switchMap: Cancels previous inner observable
        this.switchMapSubject.pipe(
            switchMap(id => this.fakeApiCall(id, 'switchMap'))
        ).subscribe(res => this.addLog(res));

        // 2. mergeMap: Runs everything in parallel
        this.mergeMapSubject.pipe(
            mergeMap(id => this.fakeApiCall(id, 'mergeMap'))
        ).subscribe(res => this.addLog(res));

        // 3. concatMap: Queues requests, runs sequentially
        this.concatMapSubject.pipe(
            concatMap(id => this.fakeApiCall(id, 'concatMap'))
        ).subscribe(res => this.addLog(res));

        // 4. exhaustMap: Ignores new requests while one is active
        this.exhaustMapSubject.pipe(
            exhaustMap(id => this.fakeApiCall(id, 'exhaustMap'))
        ).subscribe(res => this.addLog(res));
    }

    trigger(strategy: string) {
        this.requestId++;
        const id = this.requestId;
        this.addLog({ message: `[${strategy}] #${id} STARTED`, type: 'start' });

        switch (strategy) {
            case 'switchMap': this.switchMapSubject.next(id); break;
            case 'mergeMap': this.mergeMapSubject.next(id); break;
            case 'concatMap': this.concatMapSubject.next(id); break;
            case 'exhaustMap': this.exhaustMapSubject.next(id); break;
        }
    }

    fakeApiCall(id: number, strategy: string) {
        const duration = Math.floor(Math.random() * 1000) + 1000; // 1-2 seconds
        return timer(duration).pipe(
            map(() => ({ message: `[${strategy}] #${id} COMPLETED (${duration}ms)`, type: 'complete' })),
            // Detect cancellation (only works if we subscribe/unsubscribe, which switchMap does)
            // We can use finalize to see if it was cancelled or completed? 
            // Ideally we want to see "Cancelled" for switchMap.
        );
    }

    addLog(log: any) {
        this.logs.unshift(log); // Add to top
    }
}
