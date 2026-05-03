import React, { useState, useRef } from 'react';
import Button from '../Button/Button';
import useApi from '../../services/api';
import './UploadVideoModal.css';

const UploadVideoModal = ({ onClose, onUploadSuccess }) => {
    const { loading, error, createVideo } = useApi();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    
    const [videoPreview, setVideoPreview] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    const videoInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoFile(file);
            setVideoPreview(file.name);
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    // Procesa la subida del video y la miniatura al servidor
    const handleUpload = async () => {
        // Validamos que los campos obligatorios estén llenos
        if (!title || !videoFile || !thumbnailFile) {
            alert('Por favor completa los campos obligatorios (Título, Video, Miniatura).');
            return;
        }

        try {
            // Usamos FormData para enviar archivos binarios al backend
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('video', videoFile); // El archivo de video
            formData.append('thumbnail', thumbnailFile); // El archivo de imagen

            const res = await createVideo(formData);
            
            // Si la respuesta es exitosa, notificamos al padre y cerramos el modal
            if (res && res.video) {
                onUploadSuccess();
                onClose();
            }
        } catch (err) {
            console.error("Error al subir video:", err);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content upload-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
                <h2>Subir Video</h2>
                
                {error && <div className="modal-error">{error}</div>}

                <div className="modal-body upload-modal-body">
                    <div className="form-group">
                        <label>Título *</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej. Mi primer directo..."
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Agrega una descripción a tu video..."
                            rows="3"
                        />
                    </div>

                    <div className="file-upload-sections">
                        <div className="file-section">
                            <label>Archivo de Video *</label>
                            <div className="upload-box" onClick={() => videoInputRef.current.click()}>
                                <i className="fa-solid fa-video"></i>
                                <span>{videoPreview ? videoPreview : 'Seleccionar Video (.mp4, .mkv)'}</span>
                            </div>
                            <input 
                                type="file" 
                                accept="video/mp4,video/x-matroska,video/webm" 
                                ref={videoInputRef} 
                                onChange={handleVideoChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className="file-section">
                            <label>Miniatura *</label>
                            <div className="upload-box" onClick={() => thumbnailInputRef.current.click()}>
                                {thumbnailPreview ? (
                                    <img src={thumbnailPreview} alt="Miniatura" className="thumb-preview-img" />
                                ) : (
                                    <>
                                        <i className="fa-solid fa-image"></i>
                                        <span>Seleccionar Imagen (.jpg, .png)</span>
                                    </>
                                )}
                            </div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={thumbnailInputRef} 
                                onChange={handleThumbnailChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <div onClick={onClose} className="cancel-btn">Cancelar</div>
                    <Button onClick={handleUpload} disabled={loading}>
                        {loading ? 'Subiendo...' : 'Publicar Video'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UploadVideoModal;
