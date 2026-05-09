import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  User,
  Users,
  Clock,
  CalendarDays,
  ArrowLeft
} from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  group: string;
}

interface ClinicGroup {
  name: string;
  days: string[];
  duration: string;
  activities: number;
}

interface AttendanceRecord {
  _id: string;
  student: string;
  date: string;
  attended: boolean;
}

interface StudentAttendanceCalendarProps {
  clinicId: string;
  clinicName: string;
  students: Student[];
  clinicGroups: ClinicGroup[];
  onBack?: () => void;
}

const StudentAttendanceCalendar: React.FC<StudentAttendanceCalendarProps> = ({
  clinicId,
  clinicName,
  students,
  clinicGroups,
  onBack
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingDates, setSavingDates] = useState<Set<string>>(new Set());
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [showCalendar, setShowCalendar] = useState(false);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Fetch attendance records function
  const fetchAttendanceData = async (studentId: string, month: number, year: number) => {
    try {
      setIsLoading(true);
      const response = await attendanceAPI.getByStudentMonth(
        studentId,
        month + 1,
        year
      );
      setAttendanceRecords(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch attendance records when student or month changes
  useEffect(() => {
    if (selectedStudent) {
      fetchAttendanceData(selectedStudent._id, currentMonth, currentYear);
    }
  }, [selectedStudent, currentMonth, currentYear]);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setShowCalendar(true);
    // Reset to current month
    setCurrentMonth(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());
  };

  const handleCloseCalendar = () => {
    setShowCalendar(false);
    setSelectedStudent(null);
    setAttendanceRecords([]);
  };

  // Helper to create date in GMT-7 (Tepic timezone)
  const createDateInTepicTimezone = (year: number, month: number, day: number): Date => {
    // Create date string in YYYY-MM-DD format and parse as UTC to avoid timezone shifts
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00-07:00`;
    return new Date(dateStr);
  };

  const toggleAttendance = async (day: number) => {
    if (!selectedStudent) return;

    // Create date in Tepic timezone (GMT-7)
    const date = createDateInTepicTimezone(currentYear, currentMonth, day);
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Check if already marked - compare year, month, and day in local time
    const existingRecord = attendanceRecords.find(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === currentYear &&
             recordDate.getMonth() === currentMonth &&
             recordDate.getDate() === day;
    });

    // Toggle: if attended, set to false (remove), if not attended or no record, set to true
    const newAttendedState = !existingRecord?.attended;

    // Optimistic UI update
    setSavingDates(prev => new Set(prev).add(dateStr));

    try {
      await attendanceAPI.create({
        student: selectedStudent._id,
        clinic: clinicId,
        date: date.toISOString(),
        attended: newAttendedState
      });

      // Update local state
      if (selectedStudent) {
        await fetchAttendanceData(selectedStudent._id, currentMonth, currentYear);
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setSavingDates(prev => {
        const newSet = new Set(prev);
        newSet.delete(dateStr);
        return newSet;
      });
    }
  };

  const isDateAttended = (day: number): boolean => {
    return attendanceRecords.some(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === currentYear &&
             recordDate.getMonth() === currentMonth && 
             recordDate.getDate() === day && 
             record.attended;
    });
  };

  const isDateSaving = (day: number): boolean => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return savingDates.has(dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const getAttendanceStats = () => {
    const attended = attendanceRecords.filter(r => r.attended).length;
    const total = getDaysInMonth(currentMonth, currentYear);
    return { attended, total };
  };

  const filteredStudents = selectedGroup === 'all' 
    ? students 
    : students.filter(s => s.group === selectedGroup);

  // Calendar grid generation
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 md:h-14" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isAttended = isDateAttended(day);
      const isSaving = isDateSaving(day);
      const isToday = new Date().getDate() === day && 
                      new Date().getMonth() === currentMonth && 
                      new Date().getFullYear() === currentYear;

      days.push(
        <button
          key={day}
          onClick={() => toggleAttendance(day)}
          disabled={isLoading}
          className={`
            h-12 md:h-14 w-full rounded-xl font-semibold text-sm md:text-base
            flex items-center justify-center
            ${isAttended 
              ? 'bg-emerald-500 text-white' 
              : 'bg-slate-50 text-slate-600 border border-slate-200'
            }
            ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            ${isSaving ? 'opacity-70' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // Student Selection View
  if (!showCalendar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 p-6 mb-6 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-600 p-2.5 rounded-xl">
                    <CalendarDays className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                      {clinicName}
                    </h1>
                    <p className="text-slate-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Sistema de Control de Asistencia
                    </p>
                  </div>
                </div>
              </div>
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-blue-600 
                           hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Volver
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <label className="text-sm font-semibold text-slate-700">
                  Filtrar por grupo:
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                           outline-none text-sm font-medium text-slate-700
                           transition-all duration-200 hover:bg-white"
                >
                  <option value="all">Todos los grupos</option>
                  {clinicGroups.map((group, index) => (
                    <option key={index} value={group.name}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
                {filteredStudents.length} {filteredStudents.length === 1 ? 'alumno' : 'alumnos'}
              </div>
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudents.map((student, index) => (
              <button
                key={student._id}
                onClick={() => handleStudentSelect(student)}
                className="group bg-white rounded-2xl shadow-md shadow-slate-200/50 
                         border border-slate-100 p-5 text-left
                         transition-all duration-300 ease-out
                         hover:shadow-xl hover:shadow-blue-200/30 hover:border-blue-200
                         hover:-translate-y-1 active:scale-95"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 
                                w-14 h-14 rounded-2xl flex items-center justify-center
                                shadow-lg shadow-blue-200 group-hover:shadow-blue-300
                                transition-all duration-300 group-hover:scale-110">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-lg truncate 
                                 group-hover:text-blue-700 transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                      {student.group}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-blue-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span className="text-sm font-semibold">Ver calendario</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-slate-100">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                No hay alumnos disponibles
              </h3>
              <p className="text-slate-400">
                {selectedGroup === 'all' 
                  ? 'Esta clínica no tiene alumnos registrados' 
                  : 'No hay alumnos en este grupo'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calendar View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Student Info */}
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 p-6 mb-6 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 
                            w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                  {selectedStudent?.name}
                </h1>
                <p className="text-slate-500 flex items-center gap-2 mt-1">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {selectedStudent?.group}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">{clinicName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseCalendar}
              className="flex items-center gap-2 px-5 py-2.5 text-slate-600 
                       hover:text-blue-600 hover:bg-blue-50 
                       rounded-xl transition-all duration-200 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a alumnos
            </button>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 
                      border border-slate-100 overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 
                         transition-all duration-200 backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold">
                  {monthNames[currentMonth]}
                </h2>
                <p className="text-blue-100 text-lg">{currentYear}</p>
              </div>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 
                         transition-all duration-200 backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-slate-50 border-b border-slate-100 p-4">
            <div className="flex items-center justify-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm" />
                <span className="text-sm font-medium text-slate-600">
                  Asistió: <span className="text-emerald-600 font-bold">{getAttendanceStats().attended}</span> días
                </span>
              </div>
              <div className="h-6 w-px bg-slate-300" />
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-lg bg-slate-200 border border-slate-300" />
                <span className="text-sm font-medium text-slate-600">
                  Días del mes: {getAttendanceStats().total}
                </span>
              </div>
            </div>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 p-4 md:p-6 pb-2">
            {weekDays.map(day => (
              <div 
                key={day} 
                className="text-center py-2 text-sm font-bold text-slate-500 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 p-4 md:p-6 pt-2">
            {generateCalendarDays()}
          </div>

          {/* Instructions */}
          <div className="bg-slate-50 border-t border-slate-100 p-5">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <CalendarIcon className="w-4 h-4" />
              <span>Haz clic en cualquier día para marcar/desmarcar asistencia</span>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              La asistencia se guarda automáticamente
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm" />
            <span className="text-slate-600 font-medium">Asistió</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100">
            <div className="w-5 h-5 rounded-lg bg-slate-50 border border-slate-200" />
            <span className="text-slate-600 font-medium">No registrado</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100">
            <div className="w-5 h-5 rounded-lg ring-2 ring-blue-500 ring-offset-2 bg-white" />
            <span className="text-slate-600 font-medium">Hoy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceCalendar;
