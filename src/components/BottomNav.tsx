import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';
import { Home, Map as MapIcon, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
        <Home size={24} />
        <span>Início</span>
      </Link>
      <Link href="/map" className={`${styles.navItem} ${pathname === '/map' ? styles.active : ''}`}>
        <MapIcon size={24} />
        <span>Mapa</span>
      </Link>
      <Link href="/profile" className={`${styles.navItem} ${pathname === '/profile' ? styles.active : ''}`}>
        <User size={24} />
        <span>Perfil</span>
      </Link>
    </nav>
  );
}
