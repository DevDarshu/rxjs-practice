import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap } from 'rxjs/operators';

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
}

@Component({
    selector: 'app-search-typeahead',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="container">
      <h2>Real-time Search Typeahead</h2>
      <p>Concepts: <code>debounceTime</code>, <code>distinctUntilChanged</code>, <code>switchMap</code></p>

      <input [formControl]="searchControl" placeholder="Search products..." class="search-input" />
      
      <div *ngIf="loading" class="loading">Searching...</div>

      <ul *ngIf="results$ | async as results">
        <li *ngFor="let product of results">
          {{ product.name }} - \${{ product.price }}
        </li>
        <li *ngIf="results.length === 0">No results found.</li>
      </ul>
    </div>
  `,
    styles: [`
    .container { padding: 20px; }
    .search-input { width: 100%; padding: 10px; font-size: 16px; margin-bottom: 10px; }
    .loading { color: #666; font-style: italic; }
    ul { list-style-type: none; padding: 0; }
    li { padding: 10px; border-bottom: 1px solid #eee; }
  `]
})
export class SearchTypeaheadComponent implements OnInit {
    searchControl = new FormControl('');
    results$: Observable<Product[]> | undefined;
    loading = false;

    constructor(private api: ApiService) { }

    ngOnInit() {
        this.results$ = this.searchControl.valueChanges.pipe(
            // 1. Wait for user to stop typing for 300ms
            debounceTime(300),

            // 2. Only emit if the value is different from the last one
            distinctUntilChanged(),

            // 3. Side effect: set loading to true
            tap(() => this.loading = true),

            // 4. Switch to the new Observable (API request), cancelling any previous pending requests
            switchMap(term => {
                if (!term || term.trim() === '') {
                    return of([]); // Return empty array if search term is empty
                }
                // json-server supports full-text search with 'q' parameter
                return this.api.get<Product[]>('products', { q: term }).pipe(
                    catchError(() => of([])) // Handle errors gracefully
                );
            }),

            // 5. Side effect: set loading to false
            tap(() => this.loading = false)
        );
    }
}
