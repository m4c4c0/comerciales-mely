import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, 'productos'));
    const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { nombre, codigo, categoria, precio, stock, usuario } = data;

    if (!nombre || !codigo || stock === undefined || precio === undefined) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }

    const docRef = await addDoc(collection(db, 'productos'), {
      nombre,
      codigo,
      categoria: categoria || 'General',
      precio: Number(precio),
      stock: Number(stock),
      fechaCreacion: serverTimestamp(),
    });

    await addDoc(collection(db, 'movimientos'), {
      productoId: docRef.id,
      nombreProducto: nombre,
      tipo: 'Entrada Inicial',
      cantidad: Number(stock),
      usuario: usuario || 'Sistema',
      fecha: new Date().toISOString(),
    });

    return NextResponse.json({ id: docRef.id, message: 'Producto registrado' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al guardar producto' }, { status: 500 });
  }
}
