import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nombre, codigo, categoria, precio, stock } = body;

    const updateData: Record<string, any> = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (codigo !== undefined) updateData.codigo = codigo;
    if (categoria !== undefined) updateData.categoria = categoria;
    if (precio !== undefined) updateData.precio = Number(precio);
    if (stock !== undefined) updateData.stock = Number(stock);

    const docRef = doc(db, 'productos', id);
    await updateDoc(docRef, updateData);

    return NextResponse.json({ message: 'Producto actualizado exitosamente' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al actualizar producto', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteDoc(doc(db, 'productos', id));
    return NextResponse.json({ message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al eliminar producto', error: error.message }, { status: 500 });
  }
}

