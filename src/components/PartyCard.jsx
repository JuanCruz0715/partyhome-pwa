import { Users, MapPin, Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PartyCard({ party }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/party/${party.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="card card-hover group relative overflow-hidden"
    >
      {/* Badge de rol */}
      {party.role === 'owner' && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded-full">
          <Crown size={12} />
          Admin
        </div>
      )}

      {/* Ícono grande */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl mb-4 shadow-sm">
        🏠
      </div>

      {/* Nombre */}
      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
        {party.name}
      </h3>

      {/* Dirección */}
      {party.address && (
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin size={14} />
          <span className="truncate">{party.address}</span>
        </div>
      )}

      {/* Código */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-500">Código:</span>
        <code className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">
          {party.code}
        </code>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Users size={14} />
          <span>Miembro</span>
        </div>
        <ArrowRight
          size={16}
          className="text-primary-600 group-hover:translate-x-1 transition-transform"
        />
      </div>
    </div>
  );
}