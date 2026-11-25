import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';

// GET: Obtener todos los usuarios (sin contraseñas)
export async function GET() {
  try {
    const snap = await getDocs(collection(db, 'usuarios'));
    const users = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data.nombre || 'Sin nombre',
        email: data.email || 'Sin correo',
        rol: data.rol || 'Empleado',
        fechaCreacion: data.fechaCreacion || null,
      };
    });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al obtener usuarios', error: error.message }, { status: 500 });
  }
}

// POST: Crear usuario desde el panel del Administrador
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, email, password, rol } = body;

    if (!nombre || !email || !password || !rol) {
      return NextResponse.json(
        { message: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPass = String(password).trim();

    // Verificar correo existente
    const usersRef = collection(db, 'usuarios');
    const q = query(usersRef, where('email', '==', cleanEmail));
    const existSnap = await getDocs(q);

    if (!existSnap.empty) {
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

    return NextResponse.json(
      {
        message: 'Usuario registrado exitosamente',
        user: {
          id: docRef.id,
          nombre,
          email: cleanEmail,
          rol,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al registrar usuario', error: error.message }, { status: 500 });
  }
}
