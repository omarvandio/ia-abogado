import React, { useState, useEffect } from 'react';
import { Star, Clock, DollarSign, Award, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/supabase';

type Lawyer = Database['public']['Tables']['lawyers']['Row'];

interface LawyerDirectoryProps {
  onClose: () => void;
}

export function LawyerDirectory({ onClose }: LawyerDirectoryProps) {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadLawyers();
  }, []);

  const loadLawyers = async () => {
    const { data, error } = await supabase
      .from('lawyers')
      .select('*')
      .eq('available', true)
      .order('rating', { ascending: false });

    if (!error && data) {
      setLawyers(data);
    }
    setLoading(false);
  };

  const handleConsultation = async (lawyer: Lawyer) => {
    if (!user) {
      alert('Debes iniciar sesión para solicitar una consulta');
      return;
    }

    const agreedRate = (lawyer.hourly_rate_min + lawyer.hourly_rate_max) / 2;

    const { error } = await supabase.from('consultations').insert({
      user_id: user.id,
      lawyer_id: lawyer.id,
      status: 'pending',
      agreed_rate: agreedRate,
      notes: 'Solicitud desde directorio de abogados',
    });

    if (!error) {
      alert('Solicitud enviada. El abogado se pondrá en contacto contigo pronto.');
      setSelectedLawyer(null);
    } else {
      alert('Error al enviar la solicitud');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center">Cargando abogados...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-5xl w-full p-6 my-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Directorio de Abogados</h2>

        {selectedLawyer ? (
          <div>
            <button
              onClick={() => setSelectedLawyer(null)}
              className="text-blue-600 hover:text-blue-700 mb-4"
            >
              ← Volver al directorio
            </button>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedLawyer.full_name}</h3>
                  <p className="text-sm text-gray-500">CAL {selectedLawyer.license_number}</p>
                </div>
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-lg">
                  <Star className="text-yellow-500 mr-1" size={18} fill="currentColor" />
                  <span className="font-semibold">{selectedLawyer.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <Clock className="mr-2 text-blue-600" size={20} />
                  <div>
                    <div className="text-xs text-gray-500">Experiencia</div>
                    <div className="font-medium">{selectedLawyer.years_experience} años</div>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Award className="mr-2 text-blue-600" size={20} />
                  <div>
                    <div className="text-xs text-gray-500">Consultas</div>
                    <div className="font-medium">{selectedLawyer.total_consultations}</div>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <DollarSign className="mr-2 text-blue-600" size={20} />
                  <div>
                    <div className="text-xs text-gray-500">Tarifa por hora</div>
                    <div className="font-medium">
                      S/ {selectedLawyer.hourly_rate_min} - {selectedLawyer.hourly_rate_max}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Especialidades</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedLawyer.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Biografía</h4>
                <p className="text-gray-700">{selectedLawyer.bio}</p>
              </div>

              <button
                onClick={() => handleConsultation(selectedLawyer)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Solicitar consulta
              </button>

              {!user && (
                <p className="text-sm text-gray-500 text-center mt-3">
                  Debes iniciar sesión para solicitar una consulta
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => setSelectedLawyer(lawyer)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{lawyer.full_name}</h3>
                    <p className="text-xs text-gray-500">CAL {lawyer.license_number}</p>
                  </div>
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                    <Star className="text-yellow-500 mr-1" size={14} fill="currentColor" />
                    <span className="text-sm font-semibold">{lawyer.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {lawyer.specialties.slice(0, 3).map((spec, i) => (
                    <span
                      key={i}
                      className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="mr-1" size={14} />
                    {lawyer.years_experience} años
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-1" size={14} />
                    S/ {lawyer.hourly_rate_min}-{lawyer.hourly_rate_max}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
