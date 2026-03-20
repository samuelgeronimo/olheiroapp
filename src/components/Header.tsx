import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.content}>
          <h1 className={styles.title}>OLHEIRO</h1>
          <div className={styles.live}>
            <span className={styles.dot}>•</span> 
            <span className={styles.liveText}>STATUS AO VIVO</span>
          </div>
        </div>
      </div>
    </header>
  );
}
