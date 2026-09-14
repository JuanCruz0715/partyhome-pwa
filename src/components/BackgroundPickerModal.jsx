import { useState, useRef } from 'react';
import { X, Image, Upload, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  updatePartyBackground, 
  uploadPartyBackground 
} from '../services/parties';
import { BACKGROUND_PRESETS } from '../utils/backgrounds';
import toast from 'react-hot-toast';

export default function BackgroundPickerModal({ 
  isOpen, 
  onClose, 
  party, 
  onSuccess 
}) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [selected, setSelected] = useState(party?.background_value || 'default');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = async (preset) => {
    setSelected(preset.id);
    setLoading(true);

    const { error } = await updatePartyBackground({
      partyId: party.id,
      backgroundType: preset.type,
      backgroundValue: preset.id,
      backgroundUrl: null,
    });

    setLoading(false);

    if (error) {
      toast.error('Error actualizando fondo');
    } else {
      toast.success('¡Fondo actualizado!');
      onSuccess?.();
      onClose();
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    setUploading(true);

    // 1. Subir imagen
    const { data: uploadData, error: uploadError } = await uploadPartyBackground({
      partyId: party.id,
      file,
    });

    if (uploadError) {
      setUploading(false);
      toast.error('Error subiendo imagen');
      return;
    }

    // 2. Actualizar party
    const { error: updateError } = await updatePartyBackground({
      partyId: party.id,
      backgroundType: 'image',
      backgroundValue: null,
      backgroundUrl: uploadData.url,
    });

    setUploading(false);

    if (updateError) {
      toast.error('Error actualizando fondo');
    } else {
      toast.success('¡Imagen subida!');
      onSuccess?.();
      onClose();
    }
  };

  const handleReset = async () => {
    setLoading(true);
    const { error } = await updatePartyBackground({
      partyId: party.id,
      backgroundType: 'solid',
      backgroundValue: 'default',
      backgroundUrl: null,
    });
    setLoading(false);

    if (error) toast.error('Error reseteando');
    else {
      toast.success('Fondo restaurado');
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Elegir fondo</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Subir imagen propia */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Upload size={16} />
              Subir imagen
            </h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-gray-300 hover:border-primary-500 rounded-xl p-6 transition-colors flex flex-col items-center gap-2 group"
            >
              {uploading ? (
                <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Image size={32} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                  <span className="text-sm font-medium text-gray-600">
                    {uploading ? 'Subiendo...' : 'Click para subir imagen'}
                  </span>
                  <span className="text-xs text-gray-400">
                    JPG, PNG, WEBP (máx 5MB)
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Divisor */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">O elegí un preset</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Grid de presets */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {BACKGROUND_PRESETS.map((preset) => {
              const isSelected = selected === preset.id;

              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  disabled={loading}
                  className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                    preset.preview
                  } ${
                    isSelected
                      ? 'ring-4 ring-primary-500 ring-offset-2'
                      : 'hover:ring-2 hover:ring-gray-300 ring-offset-2'
                  }`}
                  title={preset.name}
                >
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Check size={24} className="text-white drop-shadow-lg" />
                    </div>
                  )}
                  {preset.id === 'default' && !isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs font-medium">
                      Sin fondo
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Reset */}
          {party.background_type !== 'solid' && (
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                Restaurar fondo por defecto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}