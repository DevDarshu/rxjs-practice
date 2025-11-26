import { Routes } from '@angular/router';
import { BasicCrudComponent } from './features/api-integration/basic-crud/basic-crud.component';
import { SearchTypeaheadComponent } from './features/api-integration/search-typeahead/search-typeahead.component';
import { RaceConditionsComponent } from './features/api-integration/race-conditions/race-conditions.component';
import { PollingComponent } from './features/api-integration/polling/polling.component';
import { CachingComponent } from './features/api-integration/caching/caching.component';
import { ParallelRequestsComponent } from './features/api-integration/parallel-requests/parallel-requests.component';

export const routes: Routes = [
    { path: 'basic-crud', component: BasicCrudComponent },
    { path: 'search', component: SearchTypeaheadComponent },
    { path: 'race-conditions', component: RaceConditionsComponent },
    { path: 'polling', component: PollingComponent },
    { path: 'caching', component: CachingComponent },
    { path: 'parallel', component: ParallelRequestsComponent },
    { path: '', redirectTo: 'basic-crud', pathMatch: 'full' }
];
