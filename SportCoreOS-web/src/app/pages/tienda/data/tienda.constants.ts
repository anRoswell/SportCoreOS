import { TiendaCategoriaProducto } from '../../../core/enums/domain.enums';

export interface CategoriaFiltroOption {
  id: TiendaCategoriaProducto;
  label: string;
}

export const TIENDA_CATEGORIAS_OPTIONS: CategoriaFiltroOption[] = [
  { id: TiendaCategoriaProducto.TODAS, label: 'Todos los Artículos' },
  { id: TiendaCategoriaProducto.UNIFORME_OFICIAL, label: 'Uniformes Oficiales' },
  { id: TiendaCategoriaProducto.ENTRENAMIENTO, label: 'Ropa Entrenamiento' },
  { id: TiendaCategoriaProducto.BALONES, label: 'Balones & Balonería' },
  { id: TiendaCategoriaProducto.ACCESORIOS, label: 'Accesorios' },
];

export function formatCategoriaTienda(cat: string | null | undefined): string {
  switch (cat) {
    case TiendaCategoriaProducto.UNIFORME_OFICIAL:
      return 'Uniforme Oficial';
    case TiendaCategoriaProducto.ENTRENAMIENTO:
      return 'Entrenamiento';
    case TiendaCategoriaProducto.BALONES:
      return 'Balones';
    case TiendaCategoriaProducto.ACCESORIOS:
      return 'Accesorios';
    default:
      return cat || 'General';
  }
}

export function formatCurrencyCOP(val: any): string {
  if (val === null || val === undefined || val === '') return '$ 0';
  const num = Number(val);
  if (isNaN(num)) return '$ 0';
  return '$ ' + Math.round(num).toLocaleString('es-CO');
}
