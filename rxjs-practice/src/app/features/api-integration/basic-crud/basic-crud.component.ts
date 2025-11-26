import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Observable } from 'rxjs';

interface Product {
    id?: number;
    name: string;
    price: number;
    category: string;
}

@Component({
    selector: 'app-basic-crud',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './basic-crud.component.html',
    styles: [`
    .container { padding: 20px; }
    .form-group { margin-bottom: 10px; }
    .card { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; }
    button { margin-right: 5px; }
  `]
})
export class BasicCrudComponent implements OnInit {
    products$: Observable<Product[]> | undefined;
    newProduct: Product = { name: '', price: 0, category: '' };
    editingProduct: Product | null = null;

    constructor(private api: ApiService) { }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts() {
        // Concept: Assigning Observable directly to variable for use with async pipe
        this.products$ = this.api.get<Product[]>('products');
    }

    createProduct() {
        if (!this.newProduct.name) return;

        // Concept: Subscribe to execute the HTTP request
        this.api.post<Product>('products', this.newProduct).subscribe({
            next: (product) => {
                console.log('Created:', product);
                this.newProduct = { name: '', price: 0, category: '' }; // Reset form
                this.loadProducts(); // Refresh list
            },
            error: (err) => console.error('Error creating product:', err)
        });
    }

    startEdit(product: Product) {
        this.editingProduct = { ...product }; // Create a copy
    }

    updateProduct() {
        if (!this.editingProduct || !this.editingProduct.id) return;

        this.api.put<Product>(`products/${this.editingProduct.id}`, this.editingProduct).subscribe({
            next: (product) => {
                console.log('Updated:', product);
                this.editingProduct = null;
                this.loadProducts();
            },
            error: (err) => console.error('Error updating product:', err)
        });
    }

    deleteProduct(id: number) {
        if (!confirm('Are you sure?')) return;

        this.api.delete(`products/${id}`).subscribe({
            next: () => {
                console.log('Deleted product', id);
                this.loadProducts();
            },
            error: (err) => console.error('Error deleting product:', err)
        });
    }

    cancelEdit() {
        this.editingProduct = null;
    }
}
