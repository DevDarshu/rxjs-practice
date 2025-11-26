import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

interface User {
    id: number;
    name: string;
    email: string;
}

@Component({
    selector: 'app-caching',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container">
      <h2>Caching with shareReplay</h2>
      <p>Concepts: <code>shareReplay(1)</code> to cache the latest value and replay it to new subscribers.</p>

      <div class="controls">
        <button (click)="clearCache()">Clear Cache (Force Refresh)</button>
      </div>

      <div class="row">
        <div class="col">
          <h3>Subscriber 1</h3>
          <button (click)="show1 = !show1">{{ show1 ? 'Hide' : 'Show' }}</button>
          <div *ngIf="show1">
            <ul *ngIf="users$ | async as users">
              <li *ngFor="let user of users">{{ user.name }}</li>
            </ul>
          </div>
        </div>

        <div class="col">
          <h3>Subscriber 2</h3>
          <button (click)="show2 = !show2">{{ show2 ? 'Hide' : 'Show' }}</button>
          <div *ngIf="show2">
            <ul *ngIf="users$ | async as users">
              <li *ngFor="let user of users">{{ user.name }}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <p><em>Check the Network tab. You will see only ONE request even if you toggle both, until you clear cache.</em></p>
    </div>
  `,
    styles: [`
    .container { padding: 20px; }
    .row { display: flex; gap: 20px; margin-top: 20px; }
    .col { flex: 1; border: 1px solid #eee; padding: 10px; }
    button { margin-bottom: 10px; }
  `]
})
export class CachingComponent {
    users$: Observable<User[]> | undefined;
    show1 = false;
    show2 = false;

    constructor(private api: ApiService) {
        this.setupStream();
    }

    setupStream() {
        this.users$ = this.api.get<User[]>('users').pipe(
            tap(() => console.log('HTTP Request made (Users)')),
            shareReplay(1)
        );
    }

    clearCache() {
        // To "clear" the cache, we just re-create the stream.
        // In a real service, you might use a BehaviorSubject or a cache invalidation strategy.
        this.setupStream();
        // Force re-subscription by toggling (simulated)
        this.show1 = false;
        this.show2 = false;
    }
}
