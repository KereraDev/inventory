'use client';
import { useState } from 'react';
import styles from './login.module.css';
import { useRouter } from 'next/navigation';

export default function Login() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/');
  };
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--background)"
    }}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.h2}>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className={styles.input}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className={styles.input}
        />
        <br />
        <button type="submit" className={styles.button}>Iniciar sesión</button>
      </form>
    </div>
  );
}