export const EXPENSE_CATEGORIES = [
  { id: 'supermarket', label: 'Supermercado', emoji: '🛒', color: 'bg-green-100 text-green-700' },
  { id: 'services', label: 'Servicios', emoji: '💡', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'rent', label: 'Alquiler', emoji: '🏠', color: 'bg-blue-100 text-blue-700' },
  { id: 'cleaning', label: 'Limpieza', emoji: '🧹', color: 'bg-purple-100 text-purple-700' },
  { id: 'food', label: 'Comida', emoji: '🍕', color: 'bg-orange-100 text-orange-700' },
  { id: 'transport', label: 'Transporte', emoji: '🚗', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'entertainment', label: 'Entretenimiento', emoji: '🎬', color: 'bg-pink-100 text-pink-700' },
  { id: 'other', label: 'Otros', emoji: '📦', color: 'bg-gray-100 text-gray-700' },
];

export function getCategoryById(id) {
  return EXPENSE_CATEGORIES.find((c) => c.id === id) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}