"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function UserInfo() {
  const { data: session, status } = useSession();
  console.log("SESSION:", session);

  if (status === "loading") return <div>Cargando...</div>;

  if (!session) {
    return (
      <div>
        Usuario: No autenticado{" "}
        <button onClick={() => signIn()} aria-label="Iniciar sesión">Login</button>
      </div>
    );
  }

  return (
    <div>
      Usuario: {session.user?.name || session.user?.email}{" "}
      <button onClick={() => signOut()} aria-label="Cerrar sesión">Logout</button>
    </div>
  );
} 