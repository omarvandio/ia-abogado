import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, continueAnonymously } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setError('Cuenta creada exitosamente. Por favor inicia sesión.');
        setIsSignUp(false);
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = () => {
    continueAnonymously();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Procesando...' : isSignUp ? 'Registrarse' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleAnonymous}
            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            Continuar sin cuenta
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Sin registro no podrás guardar tu historial
          </p>
        </div>
      </div>
    </div>
  );
}
