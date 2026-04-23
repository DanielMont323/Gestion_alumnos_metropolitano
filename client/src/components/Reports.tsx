import React, { useState, useEffect } from 'react';
import { reportsAPI, clinicsAPI } from '../services/api';
import { 
  FileText, 
  Building2, 
  Users, 
  TrendingUp, 
  Calendar,
  Download,
  ChevronRight 
} from 'lucide-react';

interface Clinic {
  _id: string;
  name: string;
  address: string;
  totalStudents: number;
  avgAttendance: number;
  avgPerformance: number;
  groups: Array<{
    name: string;
    days: string[];
    duration: string;
    activities: number;
  }>;
}

interface GeneralSummary {
  totalClinics: number;
  totalStudents: number;
  clinics: Clinic[];
}

interface ReportsProps {
  clinicId?: string;
  clinicName?: string;
}

const Reports: React.FC<ReportsProps> = ({ clinicId, clinicName }) => {
  const [summary, setSummary] = useState<GeneralSummary | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<string>(clinicId || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await reportsAPI.getGeneralSummary();
      setSummary(response.data);
    } catch (err: any) {
      setError('Error al cargar los reportes');
      console.error('Error fetching reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBgColor = (value: number) => {
    if (value >= 80) return 'bg-green-100';
    if (value >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error || 'No se pudieron cargar los datos'}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Gestión de Alumnos - Reportes
        </h1>
        <p className="text-gray-600">Resumen general de alumnos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="text-blue-600" size={24} />
            </div>
            <div className="text-3xl font-bold text-gray-800">{summary.totalClinics}</div>
          </div>
          <div className="text-sm text-gray-600">Total de clínicas</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
            <div className="text-3xl font-bold text-gray-800">{summary.totalStudents}</div>
          </div>
          <div className="text-sm text-gray-600">Total de alumnos</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {summary.clinics.length > 0 
                ? Math.round(summary.clinics.reduce((sum, c) => sum + c.avgAttendance, 0) / summary.clinics.length)
                : 0}%
            </div>
          </div>
          <div className="text-sm text-gray-600">Asistencia promedio</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={20} />
            Detalles por clínica
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clínica
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alumnos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grupos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asistencia Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Desempeño Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary.clinics.map((clinic) => (
                <tr key={clinic._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{clinic.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{clinic.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{clinic.totalStudents}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{clinic.groups.length} grupos</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceBgColor(clinic.avgAttendance)} ${getPerformanceColor(clinic.avgAttendance)}`}>
                      {clinic.avgAttendance}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceBgColor(clinic.avgPerformance)} ${getPerformanceColor(clinic.avgPerformance)}`}>
                      {clinic.avgPerformance}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      Ver detalles
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {summary.clinics.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No hay clínicas registradas
            </h3>
            <p className="text-gray-500">
              No se encontraron clínicas para generar reportes
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Download size={20} />
          Exportar reporte
        </button>
      </div>
    </div>
  );
};

export default Reports;
