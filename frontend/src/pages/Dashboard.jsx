import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import DashboardChart from '../components/DashboardChart';
import { toast } from 'react-toastify';
import { 
  Users, 
  Activity, 
  Calendar, 
  FileText, 
  Loader2
} from 'lucide-react';
import RecentActivity from '../components/RecentActivity';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/dashboard/stats');
        const { stats, recentPatients, recentAppointments } = response.data.data;
        
        setStats(stats);
        
        // Combine and format recent activity
        const activities = [
          ...recentPatients.map(p => ({ ...p, type: 'patient' })),
          ...recentAppointments.map(a => ({ ...a, type: 'appointment' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
         .slice(0, 10); // Limit to 10 most recent
        
        setRecentActivity(activities);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  // Card Component for consistency
  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md">
      <div>
        <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 md:p-4 rounded-full ${bgColor} ${color}`}>
        <Icon className="h-5 w-5 md:h-6 md:w-6" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-teal-600 text-white p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-sm md:text-base text-teal-100">
            Welcome back! Here's what's happening in your hospital today.
          </p>
        </div>
        {/* Decorative Background Element */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white opacity-10 transform skew-x-12 hidden md:block"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Patients" 
          value={stats.totalPatients} 
          icon={Users} 
          color="text-blue-600" 
          bgColor="bg-blue-50" 
        />
        <StatCard 
          title="Doctors Available" 
          value={stats.totalDoctors} 
          icon={Activity} 
          color="text-green-600" 
          bgColor="bg-green-50" 
        />
        <StatCard 
          title="Total Appointments" 
          value={stats.totalAppointments} 
          icon={FileText} 
          color="text-purple-600" 
          bgColor="bg-purple-50" 
        />
        <StatCard 
          title="Pending Visits" 
          value={stats.pendingAppointments} 
          icon={Calendar} 
          color="text-orange-600" 
          bgColor="bg-orange-50" 
        />
      </div>

       {/* Chart & Activity Section */}
       <div className="flex flex-col lg:flex-row gap-6 lg:gap-6">
          <div className="flex-1 lg:flex-none lg:w-2/3 h-[400px] lg:h-[450px]"> {/* Responsive Height Container */}
              <DashboardChart />
          </div>
          <div className="flex-1 lg:flex-none lg:w-1/3 h-[400px] lg:h-[450px]"> {/* Same Responsive Height Container */}
              <RecentActivity activities={recentActivity} />
          </div>
      </div>

      {/* Recent Activity / Placeholder Area */}
    </div>
  );
};

export default Dashboard;