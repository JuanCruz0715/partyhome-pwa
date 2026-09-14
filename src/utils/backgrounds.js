// Fondos predefinidos con gradientes CSS
export const BACKGROUND_PRESETS = [
  {
    id: 'default',
    name: 'Por defecto',
    type: 'solid',
    value: '#ffffff',
    preview: 'bg-white',
  },
  {
    id: 'ocean',
    name: 'Océano',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    preview: 'bg-gradient-to-br from-indigo-400 to-purple-600',
  },
  {
    id: 'sunset',
    name: 'Atardecer',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    preview: 'bg-gradient-to-br from-pink-400 to-red-500',
  },
  {
    id: 'forest',
    name: 'Bosque',
    type: 'gradient',
    value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    preview: 'bg-gradient-to-br from-blue-400 to-cyan-400',
  },
  {
    id: 'fire',
    name: 'Fuego',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    preview: 'bg-gradient-to-br from-pink-400 to-yellow-300',
  },
  {
    id: 'lavender',
    name: 'Lavanda',
    type: 'gradient',
    value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    preview: 'bg-gradient-to-br from-teal-200 to-pink-200',
  },
  {
    id: 'midnight',
    name: 'Medianoche',
    type: 'gradient',
    value: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    preview: 'bg-gradient-to-br from-gray-800 to-gray-600',
  },
  {
    id: 'sunny',
    name: 'Soleado',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    preview: 'bg-gradient-to-br from-yellow-300 to-orange-400',
  },
  {
    id: 'mint',
    name: 'Menta',
    type: 'gradient',
    value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    preview: 'bg-gradient-to-br from-green-300 to-blue-300',
  },
  {
    id: 'cherry',
    name: 'Cereza',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    preview: 'bg-gradient-to-br from-red-300 to-pink-200',
  },
];

export function getBackgroundStyle(party) {
  if (!party) return {};

  const type = party.background_type;

  // Imagen personalizada
  if (type === 'image' && party.background_url) {
    return {
      backgroundImage: `url(${party.background_url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    };
  }

  // Gradiente predefinido
  if (type === 'gradient') {
    const preset = BACKGROUND_PRESETS.find((p) => p.id === party.background_value);
    if (preset) {
      return { background: preset.value };
    }
  }

  // Color sólido o default
  return { background: '#f9fafb' };
}