import { useState } from 'react';
import styles from './RoutePlanner.module.css';
import { MapPin, Navigation } from 'lucide-react';

interface Props {
  onPlan: (destination: string, source: string) => void;
}

export default function RoutePlanner({ onPlan }: Props) {
  const [source, setSource] = useState('FOZ');
  const [destination, setDestination] = useState('curitiba');

  return (
    <div className={styles.planner} suppressHydrationWarning>
      <div className={styles.inputGroup} suppressHydrationWarning>
        <div className={styles.label} suppressHydrationWarning>DE:</div>
        <select 
          value={source} 
          onChange={(e) => {
            const val = e.target.value;
            setSource(val);
            onPlan(destination, val);
          }}
          className={styles.select}
        >
          <option value="FOZ">Foz do Iguaçu / CDE</option>
          <option value="SDG">Salto del Guairá</option>
          <option value="PJC">Pedro Juan Caballero</option>
        </select>
      </div>

      <div className={styles.divider} suppressHydrationWarning></div>

      <div className={styles.inputGroup} suppressHydrationWarning>
        <div className={styles.label} suppressHydrationWarning>PARA:</div>
        <select 
          value={destination} 
          onChange={(e) => {
            const val = e.target.value;
            setDestination(val);
            onPlan(val, source);
          }}
          className={styles.select}
        >
          <option value="curitiba">Curitiba (BR-277)</option>
          <option value="ourinhos">Ourinhos (BR-369)</option>
          <option value="umuarama">Umuarama (PR-486)</option>
          <option value="maringa">Maringá (PR-323)</option>
          <option value="presidente-prudente">Pres. Prudente (BR-267)</option>
          <option value="pato-branco">Pato Branco (BR-163)</option>
          <option value="campo-grande">Campo Grande (BR-163)</option>
          <option value="dourados">Dourados (BR-463)</option>
        </select>
      </div>
    </div>
  );
}
