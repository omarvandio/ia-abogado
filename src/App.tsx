import React, { useState } from 'react';
import { Scale, User, LogOut, Users, MessageSquare, History } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Chat } from './components/Chat';
import { LawyerDirectory } from './components/LawyerDirectory';

function AppContent() {
  const { user, isAnonymous, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(!isAnonymous && !user);
  const [showLawyerDirectory, setShowLawyerDirectory] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'history'>('chat');

  const handleSignOut = async () => {
    await signOut();
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Scale className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ABOGA</h1>
              <p className="text-xs text-gray-500">Asistente legal informativo - Perú</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowLawyerDirectory(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Users size={18} />
              <span>Ver Abogados</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user.email}</div>
                  <div className="text-xs text-gray-500">Usuario registrado</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-gray-900 transition"
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : isAnonymous ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">Modo anónimo</div>
                  <div className="text-xs text-gray-500">Sin historial guardado</div>
                </div>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <User size={18} />
                  <span>Registrarse</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <User size={18} />
                <span>Iniciar sesión</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="w-64 bg-white border-r border-gray-200 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveView('chat')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                activeView === 'chat'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageSquare size={20} />
              <span className="font-medium">Nueva consulta</span>
            </button>

            <button
              onClick={() => setActiveView('history')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                activeView === 'history'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              disabled={!user}
            >
              <History size={20} />
              <span className="font-medium">Historial</span>
            </button>
          </nav>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2 text-sm">¿Necesitas un abogado?</h3>
            <p className="text-xs text-blue-700 mb-3">
              Conecta con abogados verificados para consultas personalizadas
            </p>
            <button
              onClick={() => setShowLawyerDirectory(true)}
              className="w-full bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Ver directorio
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-900 mb-1 text-sm flex items-center">
              <Scale size={16} className="mr-2" />
              Información legal
            </h3>
            <p className="text-xs text-yellow-800">
              Esta es información general. Para situaciones específicas, consulta con un abogado colegiado.
            </p>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {activeView === 'chat' ? (
            <Chat />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <History size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Historial de consultas</h2>
                <p className="text-gray-600">
                  {user
                    ? 'Próximamente podrás ver tu historial completo de consultas'
                    : 'Regístrate para guardar tu historial de consultas'}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {showLawyerDirectory && <LawyerDirectory onClose={() => setShowLawyerDirectory(false)} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
