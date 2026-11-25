import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export async function GET() {
  try {
    // 1. Obtener todos los productos para calcular métricas de inventario
    const productsSnapshot = await getDocs(collection(db, 'productos'));
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{
      id: string;
      nombre: string;
      codigo: string;
      categoria?: string;
      precio: number;
      stock: number;
    }>;

    let totalProducts = products.length;
    let totalStockUnits = 0;
    let totalInventoryValue = 0;
    let lowStockCount = 0;
    const categoryMap: Record<string, { count: number; totalStock: number }> = {};
    const lowStockItems: typeof products = [];

    for (const p of products) {
      const stock = Number(p.stock) || 0;
      const precio = Number(p.precio) || 0;
      const cat = p.categoria?.trim() || 'General';

      totalStockUnits += stock;
      totalInventoryValue += stock * precio;

      if (stock <= 5) {
        lowStockCount++;
        lowStockItems.push(p);
      }

      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, totalStock: 0 };
      }
      categoryMap[cat].count += 1;
      categoryMap[cat].totalStock += stock;
    }

    // Ordenar los de bajo stock por menor cantidad
    lowStockItems.sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0));

    // Desglose por categorías
    const categories = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      productsCount: data.count,
      totalStock: data.totalStock,
    }));

    // 2. Obtener movimientos recientes de inventario
    let recentMovements: any[] = [];
    try {
      const movRef = collection(db, 'movimientos');
      const movQuery = query(movRef, orderBy('fecha', 'desc'), limit(5));
      const movSnapshot = await getDocs(movQuery);
      recentMovements = movSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      // En caso de que el índice compuesto o fecha no esté ordenable todavía
      try {
        const simpleSnapshot = await getDocs(collection(db, 'movimientos'));
        recentMovements = simpleSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .slice(-5)
          .reverse();
      } catch {
        recentMovements = [];
      }
    }

    return NextResponse.json({
      totalProducts,
      totalStockUnits,
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      lowStockCount,
      lowStockItems: lowStockItems.slice(0, 6),
      categories,
      recentMovements,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error al calcular estadísticas del dashboard', error: error.message },
      { status: 500 }
    );
  }
}
