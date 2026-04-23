const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Clinic = require('./models/Clinic');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const Evaluation = require('./models/Evaluation');

// MongoDB connection
mongoose.connect('mongodb+srv://Spacecards:Yomero2420@cluster0.xi0cc.mongodb.net/gestion_alumnos?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Clinic.deleteMany({});
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    await Evaluation.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    await adminUser.save();

    // Create instructor user
    const instructorPassword = await bcrypt.hash('instructor123', 10);
    const instructorUser = new User({
      username: 'instructor',
      password: instructorPassword,
      role: 'instructor'
    });
    await instructorUser.save();

    console.log('Created users');

    // Create clinics
    const clinics = [
      {
        name: 'Clínica Santa María',
        address: 'Av. Principal #123, Santiago',
        groups: [
          {
            name: 'Lunes a Miércoles',
            days: ['Lunes', 'Martes', 'Miércoles'],
            duration: '3 semanas',
            activities: 12
          },
          {
            name: 'Lunes a Jueves',
            days: ['Lunes', 'Martes', 'Miércoles', 'Jueves'],
            duration: '4 semanas',
            activities: 16
          },
          {
            name: 'Jueves a Viernes',
            days: ['Jueves', 'Viernes'],
            duration: '2 semanas',
            activities: 8
          }
        ]
      },
      {
        name: 'Hospital San José',
        address: 'Calle Secundaria #456, Santiago',
        groups: [
          {
            name: 'Lunes a Miércoles',
            days: ['Lunes', 'Martes', 'Miércoles'],
            duration: '3 semanas',
            activities: 12
          },
          {
            name: 'Sábados',
            days: ['Sábado'],
            duration: '4 semanas',
            activities: 8
          }
        ]
      },
      {
        name: 'Clínica del Valle',
        address: 'Ruta Central #789, Santiago',
        groups: [
          {
            name: 'Lunes a Viernes',
            days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
            duration: '5 semanas',
            activities: 20
          }
        ]
      }
    ];

    const createdClinics = await Clinic.insertMany(clinics);
    console.log('Created clinics');

    // Create students
    const studentNames = [
      'María Fernanda López',
      'Juan Carlos Martínez',
      'Ana Sofía González',
      'Pedro Andrés Silva',
      'Catalina Isabel Rojas',
      'Diego Alejandro Torres',
      'Valentina Ignacia Fuentes',
      'Sebastián Nicolás Vargas',
      'Isidora Francisca Morales',
      'Benjamín Ignacio Espinoza',
      'Francisca Valentina Paredes',
      'Vicente Javier Herrera'
    ];

    const students = [];
    const groups = ['Lunes a Miércoles', 'Lunes a Jueves', 'Jueves a Viernes', 'Sábados', 'Lunes a Viernes'];

    for (let i = 0; i < studentNames.length; i++) {
      const clinicIndex = Math.floor(i / 4) % createdClinics.length;
      const groupIndex = i % groups.length;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60));

      students.push({
        name: studentNames[i],
        clinic: createdClinics[clinicIndex]._id,
        group: groups[groupIndex],
        startDate: startDate,
        notes: `Estudiante ${i + 1}`,
        attendancePercentage: Math.floor(Math.random() * 40) + 60, // 60-100%
        performance: Math.floor(Math.random() * 40) + 60, // 60-100%
        presentation: Math.floor(Math.random() * 40) + 60, // 60-100%
        workbookProgress: Math.floor(Math.random() * 40) + 60, // 60-100%
        trainingHours: Math.floor(Math.random() * 40) + 10 // 10-50 hours
      });
    }

    const createdStudents = await Student.insertMany(students);
    console.log('Created students');

    // Create attendance records
    const attendanceRecords = [];
    const today = new Date();
    
    for (const student of createdStudents) {
      // Create attendance for the last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Random attendance (70% chance of attending)
        const attended = Math.random() > 0.3;
        
        attendanceRecords.push({
          student: student._id,
          clinic: student.clinic,
          date: date,
          attended: attended
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log('Created attendance records');

    // Create evaluations
    const evaluations = [];
    
    for (const student of createdStudents) {
      // Create 1-3 evaluations per student
      const evaluationCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < evaluationCount; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        evaluations.push({
          student: student._id,
          clinic: student.clinic,
          date: date,
          performance: Math.floor(Math.random() * 40) + 60,
          presentation: Math.floor(Math.random() * 40) + 60,
          workbookActivities: Math.floor(Math.random() * 10) + 5,
          trainingHours: Math.floor(Math.random() * 30) + 10,
          attendance: student.attendancePercentage,
          workbook: Math.min(100, (Math.floor(Math.random() * 10) + 5) * 10),
          constantTraining: Math.min(100, (Math.floor(Math.random() * 30) + 10) * 2)
        });
      }
    }

    await Evaluation.insertMany(evaluations);
    console.log('Created evaluations');

    // Update clinic student counts
    for (const clinic of createdClinics) {
      const studentCount = await Student.countDocuments({ clinic: clinic._id });
      await Clinic.findByIdAndUpdate(clinic._id, { totalStudents: studentCount });
    }

    console.log('Updated clinic student counts');
    console.log('Database seeded successfully!');
    
    console.log('\nLogin credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Instructor: username=instructor, password=instructor123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedData();
