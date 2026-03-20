import { useState, useEffect } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [driverCount, setDriverCount] = useState(1240);

  useEffect(() => {
    // Simulated live pulse - small fluctuations
    const interval = setInterval(() => {
      setDriverCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={styles.header} suppressHydrationWarning>
      <div className="container" suppressHydrationWarning>
        <div className={styles.content} suppressHydrationWarning>
          <h1 className={styles.title}>OLHEIRO</h1>
          <div className={styles.live} suppressHydrationWarning>
            <span className={styles.dot}>•</span> 
            <span className={styles.liveText}>AO VIVO: </span>
            <span className={styles.count}>{driverCount.toLocaleString('pt-BR')}</span>
            <span className={styles.subtitle}> PROTEGIDOS</span>
          </div>
        </div>
      </div>
    </header>
  );
}
