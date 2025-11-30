import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';

const DashboardChart = () => {
  const [data, setData] = useState([]);
  const [growthRate, setGrowthRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axiosInstance.get('/dashboard/chart');
        const { chartData, growthRate } = response.data.data;
        setData(chartData);
        setGrowthRate(growthRate);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
        setData([
          { name: 'Jan', patients: 65, appointments: 40 },
          { name: 'Feb', patients: 59, appointments: 45 },
          { name: 'Mar', patients: 80, appointments: 90 },
          { name: 'Apr', patients: 81, appointments: 70 },
          { name: 'May', patients: 56, appointments: 60 },
          { name: 'Jun', patients: 105, appointments: 120 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div className="h-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            Hospital Performance
          </h3>
          <p className="text-sm text-gray-500 mt-1">Patient visits vs. Appointments (Last 6 Months)</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${growthRate >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
          {growthRate >= 0 ? '+' : ''}{growthRate}% vs last month
        </span>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area
              type="monotone"
              dataKey="patients"
              stroke="#0d9488"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPatients)"
              name="New Patients"
            />
            <Area
              type="monotone"
              dataKey="appointments"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAppointments)"
              name="Appointments"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardChart;