import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';

export interface ProductoTienda {
  id: string;
  nombre: string;
  categoria: 'uniformes' | 'calzado' | 'accesorios' | 'entrenamiento';
  precio: number;
  precioOriginal?: number;
  imagen: string;
  descripcion: string;
  tallas: string[];
  stock: number;
  destacado?: boolean;
}

export interface ItemCarrito {
  producto: ProductoTienda;
  tallaSeleccionada: string;
  cantidad: number;
}

@Component({
  selector: 'app-tienda-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  templateUrl: './tienda-mobile.component.html',
  styleUrl: './tienda-mobile.component.scss'
})
export class TiendaMobileComponent {
  auth = inject(AuthService);

  isRefreshing = signal<boolean>(false);
  categoriaActiva = signal<string>('todos');
  productoSeleccionado = signal<ProductoTienda | null>(null);
  tallaElegida = signal<string>('');
  mostrarCarrito = signal<boolean>(false);
  pagoExitoso = signal<boolean>(false);
  orderNumber = Math.floor(100000 + Math.random() * 900000);

  recargarTienda(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 600);
  }

  carrito = signal<ItemCarrito[]>([]);

  productos = signal<ProductoTienda[]>([
    {
      id: 'p1',
      nombre: 'Camiseta Oficial Titular 2026',
      categoria: 'uniformes',
      precio: 145000,
      precioOriginal: 165000,
      imagen: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&auto=format&fit=crop&q=80',
      descripcion: 'Tejido transpirable de alta tecnología Dri-FIT con escudo termosellado y detalles en verde esmeralda y blanco.',
      tallas: ['6', '8', '10', '12', '14', 'S', 'M', 'L', 'XL'],
      stock: 42,
      destacado: true
    },
    {
      id: 'p2',
      nombre: 'Uniforme de Presentación & Concentración',
      categoria: 'uniformes',
      precio: 210000,
      precioOriginal: 240000,
      imagen: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
      descripcion: 'Chaqueta impermeable ligera y jogger con bolsillos termosellados. Ideal para viajes oficiales del plantel.',
      tallas: ['10', '12', '14', 'S', 'M', 'L'],
      stock: 18,
      destacado: true
    },
    {
      id: 'p3',
      nombre: 'Guayos Profesionales Césped Sintético',
      categoria: 'calzado',
      precio: 290000,
      precioOriginal: 330000,
      imagen: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&auto=format&fit=crop&q=80',
      descripcion: 'Suela multitaco diseñada para máxima tracción y giros rápidos en canchas sintéticas de alto impacto.',
      tallas: ['35', '36', '37', '38', '39', '40', '41', '42'],
      stock: 15
    },
    {
      id: 'p4',
      nombre: 'Espinilleras Anatómicas Pro con Portaespinilleras',
      categoria: 'accesorios',
      precio: 48000,
      imagen: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
      descripcion: 'Carcasa reforzada de polímero ultraligero con espuma EVA de alto confort para absorción de impactos.',
      tallas: ['S', 'M', 'L'],
      stock: 35
    },
    {
      id: 'p5',
      nombre: 'Balón Oficial de Competición #5 FIFA Quality',
      categoria: 'entrenamiento',
      precio: 125000,
      precioOriginal: 140000,
      imagen: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=600&auto=format&fit=crop&q=80',
      descripcion: 'Construcción termosellada sin costuras para un vuelo preciso y nula absorción de agua en lluvia.',
      tallas: [],
      stock: 28,
      destacado: true
    },
    {
      id: 'p6',
      nombre: 'Tula Deportiva con Compartimiento de Calzado',
      categoria: 'accesorios',
      precio: 55000,
      imagen: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      descripcion: 'Morral compacto con ventilación para guayos y bolsillo interior para celular y documentos personales.',
      tallas: [],
      stock: 50
    }
  ]);

  productosFiltrados = computed(() => {
    const cat = this.categoriaActiva();
    if (cat === 'todos') return this.productos();
    return this.productos().filter(p => p.categoria === cat);
  });

  totalItemsCarrito = computed(() => {
    return this.carrito().reduce((acc, item) => acc + item.cantidad, 0);
  });

  subtotalCarrito = computed(() => {
    return this.carrito().reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  });

  verDetalle(prod: ProductoTienda) {
    this.productoSeleccionado.set(prod);
    this.tallaElegida.set(prod.tallas.length > 0 ? prod.tallas[0] : '');
  }

  abrirModalRapido(prod: ProductoTienda, event: Event) {
    event.stopPropagation();
    this.verDetalle(prod);
  }

  cerrarDetalle() {
    this.productoSeleccionado.set(null);
  }

  abrirCarrito() {
    this.mostrarCarrito.set(true);
  }

  agregarAlCarrito() {
    const prod = this.productoSeleccionado();
    if (!prod) return;

    const talla = this.tallaElegida();
    const items = [...this.carrito()];
    const index = items.findIndex(i => i.producto.id === prod.id && i.tallaSeleccionada === talla);

    if (index > -1) {
      items[index].cantidad += 1;
    } else {
      items.push({
        producto: prod,
        tallaSeleccionada: talla,
        cantidad: 1
      });
    }

    this.carrito.set(items);
    this.cerrarDetalle();
    this.mostrarCarrito.set(true);
  }

  cambiarCantidad(item: ItemCarrito, delta: number) {
    let items = [...this.carrito()];
    const index = items.findIndex(i => i.producto.id === item.producto.id && i.tallaSeleccionada === item.tallaSeleccionada);
    if (index > -1) {
      items[index].cantidad += delta;
      if (items[index].cantidad <= 0) {
        items.splice(index, 1);
      }
    }
    this.carrito.set(items);
  }

  procederPago() {
    this.mostrarCarrito.set(false);
    this.pagoExitoso.set(true);
    this.carrito.set([]);
  }

  cerrarExito() {
    this.pagoExitoso.set(false);
  }
}
