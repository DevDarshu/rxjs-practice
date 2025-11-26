import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { Observable, Subject, timer } from 'rxjs';
import { switchMap, retry, takeUntil, tap, share } from 'rxjs/operators';

interface Order {
    id: number;
    userId: number;
    total: number;
    status: string;
}

@Component({
    selector: 'app-polling',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container">
      <h2>Live Orders (Polling)</h2>
      <p>Concepts: <code>timer</code>, <code>switchMap</code>, <code>retry</code>, <code>takeUntil</code></p>
      
      <div class="status">
        Status: <span [class.active]="isPolling">
          {{ isPolling ? 'Polling every 5s...' : 'Stopped' }}
        </span>
        <button (click)="togglePolling()">{{ isPolling ? 'Stop' : 'Start' }}</button>
      </div>

      <div *ngIf="orders$ | async as orders; else loading">
        <div *ngFor="let order of orders" class="card">
          Order #{{ order.id }} - \${{ order.total }} ({{ order.status }})
        </div>
        <p class="timestamp">Last updated: {{ lastUpdated | date:'mediumTime' }}</p>
      </div>

      <ng-template #loading>
        <p>Waiting for data...</p>
      </ng-template>
    </div>
  `,
    styles: [`
    .container { padding: 20px; }
    .status { margin-bottom: 20px; }
    .active { color: green; font-weight: bold; }
    .card { border: 1px solid #ccc; padding: 10px; margin-bottom: 5px; }
    .timestamp { color: #888; font-size: 0.9em; margin-top: 10px; }
  `]
})
export class PollingComponent implements OnInit, OnDestroy {
    orders$: Observable<Order[]> | undefined;
    stopPolling$ = new Subject<void>();
    isPolling = false;
    lastUpdated: Date = new Date();

    constructor(private api: ApiService) { }

    ngOnInit() {
        this.startPolling();
    }

    startPolling() {
        this.isPolling = true;
        this.orders$ = timer(0, 5000).pipe(
            tap(() => console.log('Polling...')),
            switchMap(() => this.api.get<Order[]>('orders')),
            retry(3), // Retry up to 3 times if request fails
            tap(() => this.lastUpdated = new Date()),
            takeUntil(this.stopPolling$)
        );
    }

    stopPolling() {
        this.isPolling = false;
        this.stopPolling$.next();
    }

    togglePolling() {
        if (this.isPolling) {
            this.stopPolling();
        } else {
            this.startPolling();
        }
    }

    ngOnDestroy() {
        this.stopPolling();
    }
}
