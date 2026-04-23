import React, { useState, useEffect } from 'react';
import { studentsAPI, evaluationsAPI } from '../services/api';
import { X, Save, Calculator, TrendingUp, Award, BookOpen, Clock } from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  group: string;
  attendancePercentage: number;
  workbookProgress: number;
  trainingHours: number;
  clinic: string;
}

interface StudentEvaluationProps {
  studentId: string;
  clinicName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const StudentEvaluation: React.FC<StudentEvaluationProps> = ({
  studentId,
  clinicName,
  onClose,
  onSuccess,
}) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    performance: '',
    presentation: '',
    workbookActivities: '',
    trainingHours: '',
  });
  const [calculatedMetrics, setCalculatedMetrics] = useState({
    attendance: 0,
    workbook: 0,
    constantTraining: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  useEffect(() => {
    calculateMetrics();
  }, [formData, student]);

  const fetchStudent = async () => {
    try {
      const response = await studentsAPI.getById(studentId);
      setStudent(response.data);
    } catch (err: any) {
      setError('Error al cargar los datos del alumno');
    }
  };

  const calculateMetrics = () => {
    if (!student) return;

    const attendance = student.attendancePercentage;
    const workbook = Math.min(100, (Number(formData.workbookActivities) || 0) * 10);
    const constantTraining = Math.min(100, (Number(formData.trainingHours) || 0) * 2);

    setCalculatedMetrics({ attendance, workbook, constantTraining });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setIsLoading(true);
    setError('');

    try {
      await evaluationsAPI.create({
        student: studentId,
        clinic: student.clinic,
        performance: Number(formData.performance),
        presentation: Number(formData.presentation),
        workbookActivities: Number(formData.workbookActivities),
        trainingHours: Number(formData.trainingHours),
        ...calculatedMetrics,
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar la evaluación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? '' : Math.max(0, Math.min(100, Number(value)));
    setFormData({ ...formData, [name]: numValue });
  };

  if (!student) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="text-center text-gray-600">Cargando datos del alumno...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {clinicName} - Evaluación del alumno
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{student.name}</h3>
            <p className="text-sm text-gray-600">Grupo: {student.group}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desempeño (0-100)
                </label>
                <input
                  type="number"
                  name="performance"
                  value={formData.performance}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="0-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presentación (0-100)
                </label>
                <input
                  type="number"
                  name="presentation"
                  value={formData.presentation}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="0-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actividades del cuadernillo
                </label>
                <input
                  type="number"
                  name="workbookActivities"
                  value={formData.workbookActivities}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Número de actividades"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horas de capacitación
                </label>
                <input
                  type="number"
                  name="trainingHours"
                  value={formData.trainingHours}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Total de horas"
                  required
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calculator size={20} />
                Resultados automáticos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Asistencia</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {calculatedMetrics.attendance}%
                  </div>
                  <div className="text-xs text-gray-600">Basado en registros de asistencia</div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Cuadernillo</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {calculatedMetrics.workbook}%
                  </div>
                  <div className="text-xs text-gray-600">10 actividades = 100%</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Capacitación</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {calculatedMetrics.constantTraining}%
                  </div>
                  <div className="text-xs text-gray-600">50 horas = 100%</div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Save size={20} />
                {isLoading ? 'Guardando...' : 'Guardar evaluación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentEvaluation;
