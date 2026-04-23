import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import { Calendar, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

interface AttendanceRecord {
  _id: string;
  date: string;
  attended: boolean;
}

interface Student {
  _id: string;
  name: string;
  group: string;
}

interface AttendanceHistoryProps {
  studentId: string;
  studentName: string;
  studentGroup: string;
  clinicName: string;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  studentId,
  studentName,
  studentGroup,
  clinicName,
}) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [studentId, selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const response = await attendanceAPI.getByStudentMonth(studentId, selectedMonth, selectedYear);
      setAttendance(response.data);
    } catch (err: any) {
      setError('Error al cargar el historial de asistencia');
      console.error('Error fetching attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getDayOfWeek = (day: number, month: number, year: number) => {
    return new Date(year, month - 1, day).getDay();
  };

  const getAttendanceForDay = (day: number) => {
    const date = new Date(selectedYear, selectedMonth - 1, day);
    const dateStr = date.toISOString().split('T')[0];
    return attendance.find(record => record.date.startsWith(dateStr));
  };

  const getMonthSummary = () => {
    const attended = attendance.filter(record => record.attended).length;
    const total = attendance.length;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
    
    return { attended, total, percentage };
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const summary = getMonthSummary();
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDayOfWeek = getDayOfWeek(1, selectedMonth, selectedYear);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {clinicName} - Historial de asistencia
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{studentName}</span>
          <span>·</span>
          <span>{studentGroup}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-gray-600" />
              <label htmlFor="month" className="text-sm font-medium text-gray-700">
                Mes:
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="year" className="text-sm font-medium text-gray-700">
                Año:
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {[2023, 2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            {monthNames[selectedMonth - 1]} {selectedYear}
          </h3>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2"></div>
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const attendanceRecord = getAttendanceForDay(day);
              const isToday = new Date().getDate() === day && 
                            new Date().getMonth() + 1 === selectedMonth && 
                            new Date().getFullYear() === selectedYear;
              
              return (
                <div
                  key={day}
                  className={`p-2 border rounded-lg text-center ${
                    isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-800 mb-1">{day}</div>
                  {attendanceRecord ? (
                    attendanceRecord.attended ? (
                      <CheckCircle size={16} className="text-green-600 mx-auto" />
                    ) : (
                      <XCircle size={16} className="text-red-600 mx-auto" />
                    )
                  ) : (
                    <div className="w-4 h-4 mx-auto border border-gray-300 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3">Resumen del mes</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.attended}</div>
              <div className="text-sm text-gray-600">Días asistidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.total - summary.attended}</div>
              <div className="text-sm text-gray-600">Días faltas</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                summary.percentage >= 80 ? 'text-green-600' : 
                summary.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {summary.percentage}%
              </div>
              <div className="text-sm text-gray-600">Porcentaje</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Leyenda</h3>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span>Asistió</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle size={16} className="text-red-600" />
            <span>No asistió</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-gray-300 rounded-full"></div>
            <span>Sin registro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-blue-500 bg-blue-50 rounded"></div>
            <span>Hoy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
