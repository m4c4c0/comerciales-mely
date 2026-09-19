import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { nombre, email, password, rol } = await request.json();

    if (!nombre || !email || !password || !rol) {
      return NextResponse.json(
        { message: 'Todos los campos (nombre, correo, contraseña y rol) son obligatorios' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPass = String(password).trim();

    if (cleanPass.length < 4) {
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 4 caracteres' },
        { status: 400 }
      );
    }

    const validRoles = ['Administrador', 'Empleado', 'Facturador'];
    if (!validRoles.includes(rol)) {
      return NextResponse.json(
        { message: 'Rol no válido. Debe ser Administrador, Empleado o Facturador' },
        { status: 400 }
      );
    }

    // Verificar si el correo ya existe
    const usersRef = collection(db, 'usuarios');
    const q = query(usersRef, where('email', '==', cleanEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json(
        { message: 'Ya existe un usuario registrado con este correo' },
        { status: 400 }
      );
    }

    const docRef = await addDoc(usersRef, {
      nombre: String(nombre).trim(),
      email: cleanEmail,
      password: cleanPass,
      rol,
      fechaCreacion: serverTimestamp(),
    });

    return NextResponse.json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: docRef.id,
        nombre: String(nombre).trim(),
        email: cleanEmail,
        rol,
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error al registrar usuario', error: error.message },
      { status: 500 }
    );
  }
}
