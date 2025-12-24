import React, { useState } from 'react';
import { createPost, fetchZonePosts, fetchAllPosts } from '../../api/api';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import styles from './styles.module.css';

const PostCreateModal = ({ isOpen, onClose, selectedZone, zonesList, onPostCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const activeZoneId = selectedZone ? (selectedZone.zone_id || selectedZone.id) : '';
      setZoneId(activeZoneId || '');
    } else {
      // Modal kapandığında formu temizle
      setTitle('');
      setContent('');
      setPhotoUrl('');
      setZoneId('');
    }
  }, [isOpen, selectedZone]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Dosya boyutu çok büyük! Lütfen 5MB'dan küçük bir resim seçin.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let zoneToSend = null;
      if (zoneId && zoneId !== "") {
        const parsed = parseInt(zoneId, 10);
        if (!isNaN(parsed)) {
          zoneToSend = parsed;
        }
      }

      await createPost({
        title,
        content,
        zone_id: zoneToSend,
        visibility: 'public',
        photoUrl: photoUrl || null
      });

      setTitle('');
      setContent('');
      setPhotoUrl('');
      setZoneId('');
      onClose();

      // Post listesini yenile
      const currentViewId = selectedZone ? (selectedZone.zone_id || selectedZone.id) : null;
      const updated = currentViewId ? await fetchZonePosts(currentViewId) : await fetchAllPosts();
      onPostCreated?.(updated);

      toast.success('Paylaşım oluşturuldu.');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Paylaşım oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  const zoneOptions = zonesList.map((zone) => {
    const zId = zone.properties?.zone_id || zone.properties?.id || zone.id;
    const zName = zone.properties?.name || zone.name || "Bilinmeyen Bölge";
    if (!zId) return null;
    return { value: zId, label: `📍 ${zName}` };
  }).filter(Boolean);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✨ Yeni Paylaşım Oluştur" maxWidth="700px" className={styles.postCreateModal}>
      <form onSubmit={handleSubmit} className={styles.postForm}>
        <div className={styles.formSection}>
          <label className={styles.sectionLabel}>
            <span className={styles.labelIcon}>📝</span>
            Başlık
          </label>
          <Input
            type="text"
            placeholder="Paylaşımınız için bir başlık girin..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={styles.titleInput}
          />
        </div>

        <div className={styles.formSection}>
          <label className={styles.sectionLabel}>
            <span className={styles.labelIcon}>💬</span>
            İçerik
          </label>
          <Textarea
            placeholder="Paylaşmak istediğiniz içeriği buraya yazın..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            className={styles.contentTextarea}
          />
        </div>

        <div className={styles.formSection}>
          <label className={styles.sectionLabel}>
            <span className={styles.labelIcon}>📷</span>
            Fotoğraf (Opsiyonel)
          </label>
          <div className={styles.fileUploadSection}>
            <label className={styles.fileUploadLabel}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              <span className={styles.fileUploadButton}>
                {photoUrl ? '🔄 Fotoğraf Değiştir' : '📤 Fotoğraf Seç (Max 5MB)'}
              </span>
            </label>
            {photoUrl && (
              <div className={styles.previewSection}>
                <div className={styles.previewHeader}>
                  <span className={styles.previewText}>✅ Fotoğraf Önizleme</span>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className={styles.removeImageButton}
                  >
                    ✕ Kaldır
                  </button>
                </div>
                <div className={styles.previewImageContainer}>
                  <img src={photoUrl} alt="Önizleme" className={styles.previewImage} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.formSection}>
          <label className={styles.sectionLabel}>
            <span className={styles.labelIcon}>📍</span>
            Konum
          </label>
          <Select
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            options={[{ value: '', label: '🌐 Genel (Konumsuz)' }, ...zoneOptions]}
            className={styles.locationSelect}
          />
        </div>

        <div className={styles.modalActions}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className={styles.cancelButton}>
            İptal
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className={styles.submitButton}>
            {loading ? '⏳ Paylaşılıyor...' : '✨ Paylaş'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PostCreateModal;





