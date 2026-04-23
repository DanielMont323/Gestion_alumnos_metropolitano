import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Building2, 
  Users, 
  CheckSquare, 
  ClipboardList, 
  FileText, 
  User, 
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  currentClinic?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentClinic }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/clinics', label: 'Clínicas', icon: Building2 },
    { path: '/students', label: 'Alumnos', icon: Users },
    { path: '/attendance', label: 'Asistencia', icon: CheckSquare },
    { path: '/evaluations', label: 'Evaluaciones', icon: ClipboardList },
    { path: '/reports', label: 'Reportes', icon: FileText },
    { path: '/profile', label: 'Perfil', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">
          Gestión de Alumnos
        </h2>
        {currentClinic && (
          <p className="text-sm text-gray-600 mt-1">{currentClinic}</p>
        )}
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/' 
              ? location.pathname === '/' || location.pathname === '/dashboard'
              : location.pathname.startsWith(item.path);
            
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
