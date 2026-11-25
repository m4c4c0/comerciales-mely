import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, query, orderBy, limit } from 'firebase/firestore';

export async function GET() {
  try {
    let movements: any[] = [];
    try {
      const q = query(collection(db, 'movimientos'), orderBy('fecha', 'desc'), limit(50));
      const snap = await getDocs(q);
      movements = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
      const snap = await getDocs(collection(db, 'movimientos'));
      movements = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
    }
    return NextResponse.json(movements);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al obtener movimientos', error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productoId, tipo, cantidad, motivo, usuario } = body;

    const numCantidad = Number(cantidad);
    if (!productoId || !tipo || !numCantidad || numCantidad <= 0) {
      return NextResponse.json(
        { message: 'Producto, tipo y cantidad válida (mayor a 0) son requeridos' },
        { status: 400 }
      );
    }

    // Obtener producto actual
    const prodRef = doc(db, 'productos', productoId);
    const prodSnap = await getDoc(prodRef);

    if (!prodSnap.exists()) {
      return NextResponse.json({ message: 'El producto seleccionado no existe' }, { status: 404 });
    }

    const prodData = prodSnap.data();
    const currentStock = Number(prodData.stock) || 0;
    let newStock = currentStock;

    if (tipo === 'Entrada') {
      newStock = currentStock + numCantidad;
    } else if (tipo === 'Salida' || tipo === 'Venta' || tipo === 'Ajuste') {
      if (numCantidad > currentStock) {
        return NextResponse.json(
          { message: `No hay suficiente stock. Disponible: ${currentStock}, Solicitado: ${numCantidad}` },
          { status: 400 }
        );
      }
      newStock = currentStock - numCantidad;
    } else {
      return NextResponse.json({ message: 'Tipo de movimiento no válido' }, { status: 400 });
    }

    // 1. Actualizar stock del producto
    await updateDoc(prodRef, { stock: newStock });

    // 2. Registrar movimiento en la colección
    const movRef = await addDoc(collection(db, 'movimientos'), {
      productoId,
      nombreProducto: prodData.nombre,
      codigoProducto: prodData.codigo,
      tipo,
      cantidad: numCantidad,
      stockAnterior: currentStock,
      stockResultante: newStock,
      motivo: motivo || (tipo === 'Entrada' ? 'Reabastecimiento' : 'Salida de almacén'),
      usuario: usuario || 'Sistema',
      fecha: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Movimiento registrado y stock actualizado con éxito',
      id: movRef.id,
      nuevoStock: newStock,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al registrar movimiento', error: error.message }, { status: 500 });
  }
}
