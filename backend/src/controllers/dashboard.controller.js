const Patient = require('../models/patient.model.js');
const User = require('../models/user.model.js');
const Appointment = require('../models/appointment.model.js');

exports.getDashboardStats = async (req, res, next) => {
  console.log("db0")
  try {
    console.log("db1")
    // 1. Determine Models (Multi-Tenancy)
    const TenantPatient = req.tenantDB
      ? req.tenantDB.model('Patient', Patient.schema)
      : Patient;

    const TenantAppointment = req.tenantDB
      ? req.tenantDB.model('Appointment', Appointment.schema)
      : Appointment;

    // 2. Execute Stats Queries
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments
    ] = await Promise.all([
      TenantPatient.countDocuments(req.tenantDB ? {} : { tenantId: req.user.tenantId }),
      User.countDocuments({ tenantId: req.user.tenantId, role: 'DOCTOR' }),
      TenantAppointment.countDocuments(req.tenantDB ? {} : { tenantId: req.user.tenantId }),
      TenantAppointment.countDocuments(
        req.tenantDB ? { status: 'Scheduled' } : { tenantId: req.user.tenantId, status: 'Scheduled' }
      )
    ]);
    console.log("db2")
    // 3. Fetch Recent Activity Data
    const recentPatients = await TenantPatient.find(
      req.tenantDB ? {} : { tenantId: req.user.tenantId }
    )
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    let recentAppointments = await TenantAppointment.find(
      req.tenantDB ? {} : { tenantId: req.user.tenantId }
    )
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('patient', 'name')
      .lean();

    // 4. Manual Population for Doctors (Global DB -> Tenant DB)
    const doctorIds = Array.from(new Set(recentAppointments.map(function (app) {
      return app.doctor ? app.doctor.toString() : null;
    })));

    if (doctorIds.length > 0) {
      const doctors = await User.find({ _id: { $in: doctorIds } }, 'firstName lastName');
      const doctorMap = doctors.reduce(function (acc, doc) {
        acc[doc._id.toString()] = doc;
        return acc;
      }, {});

      recentAppointments = recentAppointments.map(function (app) {
        const doctorId = app.doctor ? app.doctor.toString() : null;
        const doctorInfo = doctorMap[doctorId] || { firstName: 'Unknown', lastName: 'Doctor' };
        return Object.assign({}, app, { doctor: doctorInfo });
      });
    }
    console.log("db3")
    // 5. Response
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          pendingAppointments
        },
        recentPatients,
        recentAppointments
      },
    });

  } catch (error) {
    next(error);
  }
};

exports.getChartData = async (req, res, next) => {
  try {
    // 1. Determine Models (Multi-Tenancy)
    const TenantPatient = req.tenantDB
      ? req.tenantDB.model('Patient', Patient.schema)
      : Patient;

    const TenantAppointment = req.tenantDB
      ? req.tenantDB.model('Appointment', Appointment.schema)
      : Appointment;

    // 2. Get last 6 months data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 3. Aggregate patients by month
    const patientStats = await TenantPatient.aggregate([
      {
        $match: {
          ...(req.tenantDB ? {} : { tenantId: req.user.tenantId }),
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 4. Aggregate appointments by month
    const appointmentStats = await TenantAppointment.aggregate([
      {
        $match: {
          ...(req.tenantDB ? {} : { tenantId: req.user.tenantId }),
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 5. Format data for chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const monthName = monthNames[month - 1];

      const patientCount = (patientStats.find(function (stat) {
        return stat._id.year === year && stat._id.month === month;
      }) || {}).count || 0;

      const appointmentCount = (appointmentStats.find(function (stat) {
        return stat._id.year === year && stat._id.month === month;
      }) || {}).count || 0;

      chartData.push({
        name: monthName,
        patients: patientCount,
        appointments: appointmentCount
      });
    }

    // 6. Calculate growth percentage
    const currentMonth = chartData[chartData.length - 1];
    const previousMonth = chartData[chartData.length - 2];
    const growthRate = previousMonth ?
      ((currentMonth.patients - previousMonth.patients) / previousMonth.patients * 100).toFixed(1) :
      0;

    res.status(200).json({
      success: true,
      data: {
        chartData,
        growthRate: parseFloat(growthRate)
      }
    });

  } catch (error) {
    next(error);
  }
};