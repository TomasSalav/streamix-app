import React, { useState, useRef, useEffect } from 'react';
import Button from '../Button/Button';
import useApi from '../../services/api';
import './ProfileModal.css';
import defaultAvatar from '../../assets/default.jpg';

const ProfileModal = ({ user, onClose, onUpdate }) => {
    const { loading, error, updateUser, uploadAvatar } = useApi();
    const [bio, setBio] = useState(user?.bio || '');
    const [previewUrl, setPreviewUrl] = useState(user?.avatar_url || defaultAvatar);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        try {
            // Update bio if changed
            if (bio !== user.bio) {
                const res = await updateUser(user.id, { bio });
                if (!res) throw new Error('Error updating bio');
            }

            // Update avatar if file selected
            const file = fileInputRef.current.files[0];
            if (file) {
                const res = await uploadAvatar(user.id, file);
                if (!res) throw new Error('Error uploading avatar');
            }

            // Refresh user data in parent component
            onUpdate();
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
                <h2>Editar Perfil</h2>
                
                {error && <div className="modal-error">{error}</div>}

                <div className="modal-body">
                    <div className="avatar-section">
                        <div className="avatar-preview">
                            <img src={previewUrl} alt="Profile" />
                        </div>
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={handleFileChange}
                            id="avatar-upload"
                            style={{ display: 'none' }}
                        />
                        <Button onClick={() => fileInputRef.current.click()}>
                            Cambiar Foto
                        </Button>
                    </div>

                    <div className="bio-section">
                        <label>Biografía</label>
                        <textarea 
                            value={bio} 
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Cuéntanos sobre ti..."
                            rows="4"
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <div onClick={onClose} className="cancel-btn">Cancelar</div>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
