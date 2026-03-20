"use client";

import { useState, useRef } from 'react';
import { POI, PointStatus } from '@/lib/supabase';
import styles from './POIStatusCard.module.css';
import { Shield, AlertTriangle, CheckCircle, Clock, MapPin, Send, AlertCircle, Camera, X } from 'lucide-react';
import { processImageForUpload } from '@/lib/imageUtils';
import { formatRelativeTime } from '@/lib/dateUtils';

interface Props {
  poi: POI;
  onStatusChange: (status: PointStatus, reason: string, image?: Blob) => Promise<void>;
}

export default function POIStatusCard({ poi, onStatusChange }: Props) {
  const [selectedStatus, setSelectedStatus] = useState<PointStatus | null>(null);
  const [reason, setReason] = useState('');
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const processed = await processImageForUpload(file);
      setPhoto(processed);
      setPreview(URL.createObjectURL(processed));
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Erro ao processar imagem. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (selectedStatus) {
      setIsProcessing(true);
      await onStatusChange(selectedStatus, reason, photo || undefined);
      setSelectedStatus(null);
      setReason('');
      setPhoto(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setIsProcessing(false);
    }
  };

  const getIcon = () => {
    switch (poi.type) {
      case 'prf':
      case 'pre':
        return <Shield color="var(--accent-color)" size={24} />;
      case 'receita':
        return <CheckCircle color="var(--status-livre)" size={24} />;
      case 'pedagio':
        return <MapPin color="#fff" size={24} />;
      default:
        return <AlertTriangle color="#fff" size={24} />;
    }
  };

  return (
    <div className={styles.card} suppressHydrationWarning>
      <div className={styles.header}>
        <div className={styles.iconBox}>
          {getIcon()}
        </div>
        <div className={styles.info}>
          <div className={styles.topRow}>
            <span className={styles.typeLabel}>{poi.type.toUpperCase()}</span>
            <span className={styles.timeLabel}><Clock size={10} /> {formatRelativeTime(poi.lastUpdate)}</span>
          </div>
          <h3 className={styles.name}>{poi.name}</h3>
        </div>
      </div>

      <div className={styles.alertContext}>
        <AlertCircle size={12} color="var(--status-sujo)" />
        <span>Reportar sentido **SAINDO DE FOZ** (Cascavel)</span>
      </div>

        <div className={styles.statusGrid} role="group" aria-label="Selecione o novo status">
          <button 
            className={`${styles.statusBtn} ${selectedStatus === 'livre' ? styles.activeLivre : ''}`}
            onClick={() => setSelectedStatus('livre')}
            aria-label="Marcar como Livre"
          >
            LIVRE
          </button>
          <button 
            className={`${styles.statusBtn} ${selectedStatus === 'atencao' ? styles.activeAtencao : ''}`}
            onClick={() => setSelectedStatus('atencao')}
            aria-label="Marcar como Atenção"
          >
            ATENÇÃO
          </button>
          <button 
            className={`${styles.statusBtn} ${selectedStatus === 'sujo' ? styles.activeSujo : ''}`}
            onClick={() => setSelectedStatus('sujo')}
            aria-label="Marcar como Sujo"
          >
            SUJO
          </button>
        </div>

      {selectedStatus && (
        <div className={styles.reasonSection}>
          <textarea 
            placeholder="O que você viu? (ex: Viatura com giroflex ligado...)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={styles.reasonInput}
          />
          
          <div className={styles.photoActions}>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <button 
              className={`${styles.cameraBtn} ${photo ? styles.cameraBtnActive : ''}`}
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Camera size={20} />
            </button>
            <button 
              className={styles.saveBtn} 
              onClick={handleSave} 
              disabled={isProcessing}
              style={{ flex: 1 }}
            >
              {isProcessing ? 'PROCESSANDO...' : (
                <>
                  <Send size={14} />
                  SALVAR ATUALIZAÇÃO
                </>
              )}
            </button>
          </div>

          {preview && (
            <div className={styles.previewContainer}>
              <img src={preview} alt="Preview" className={styles.preview} />
              <button 
                className={styles.removePhoto}
                onClick={() => {
                  setPhoto(null);
                  URL.revokeObjectURL(preview);
                  setPreview(null);
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
