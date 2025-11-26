import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { Observable, forkJoin, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-parallel-requests',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container">
      <h2>Parallel Requests</h2>
      <p>Concepts: <code>forkJoin</code> (wait for all to complete) vs <code>combineLatest</code> (emit when any emits after all have emitted once).</p>

      <button (click)="loadData()">Load Dashboard Data (forkJoin)</button>
      <button (click)="loadDataCombineLatest()">Load Dashboard Data (combineLatest)</button>

      <div *ngIf="data$ | async as data; else loading" class="dashboard">
        <div class="card">
          <h3>Users ({{ data.users.length }})</h3>
          <ul>
            <li *ngFor="let user of data.users">{{ user.name }}</li>
          </ul>
        </div>
        
        <div class="card">
          <h3>Products ({{ data.products.length }})</h3>
          <ul>
            <li *ngFor="let product of data.products">{{ product.name }}</li>
          </ul>
        </div>
      </div>

      <ng-template #loading>
        <p *ngIf="isLoading">Loading all data in parallel...</p>
      </ng-template>
    </div>
  `,
    styles: [`
    .container { padding: 20px; }
    .dashboard { display: flex; gap: 20px; margin-top: 20px; }
    .card { flex: 1; border: 1px solid #ccc; padding: 10px; }
  `]
})
export class ParallelRequestsComponent {
    data$: Observable<{ users: any[], products: any[] }> | undefined;
    isLoading = false;

    constructor(private api: ApiService) { }

    loadData() {
        this.isLoading = true;

        // forkJoin: Waits for both requests to complete, then emits the last values as an array/object.
        // If one fails, everything fails (unless caught).
        this.data$ = forkJoin({
            users: this.api.get<any[]>('users'),
            products: this.api.get<any[]>('products')
        }).pipe(
            map(response => {
                this.isLoading = false;
                return response;
            })
        );
    }
    loadDataCombineLatest() {
        this.isLoading = true;

        // combineLatest: Emits whenever any source emits, but only after all have emitted at least once.
        // With HTTP calls (which complete after one value), this behaves similarly to forkJoin here.
        const users$ = this.api.get<any[]>('users');
        const products$ = this.api.get<any[]>('products');

        this.data$ = combineLatest([users$, products$]).pipe(
            map(([users, products]) => {
                this.isLoading = false;
                return { users, products };
            })
        );
    }
}
