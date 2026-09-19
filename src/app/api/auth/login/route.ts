import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      return NextResponse.json({ 
        message: 'Error: Faltan variables en .env.local o no se ha reiniciado el servidor' 
      }, { status: 500 });
    }

    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const cleanPass = password ? String(password).trim() : '';

    const usersRef = collection(db, 'usuarios');
    const q = query(usersRef, where('email', '==', cleanEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ 
        message: `No se encontró el correo: "${cleanEmail}"` 
      }, { status: 401 });
    }

    const docUser = querySnapshot.docs[0];
    const data = docUser.data();

    if (String(data.password).trim() !== cleanPass) {
      return NextResponse.json({ 
        message: 'Contraseña incorrecta' 
      }, { status: 401 });
    }

    return NextResponse.json({
      token: `token-${docUser.id}`,
      user: {
        id: docUser.id,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ 
      message: `Error de Firestore: ${error.message}` 
    }, { status: 500 });
  }
}