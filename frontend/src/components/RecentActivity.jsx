import React from 'react';
import { UserPlus, Calendar, Clock } from 'lucide-react';

const RecentActivity = ({ activities }) => {
  
  // Helper to format "2 hours ago" or "Just now"
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Clock className="h-5 w-5 text-teal-600" />
          Recent Activity
        </h3>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
          Latest Updates
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-0">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent activity.</p>
        ) : (
          activities.map((item, index) => (
            <div 
              key={`${item._id}-${index}`} 
              className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0"
            >
              {/* Icon Box */}
              <div className={`p-2 rounded-full shrink-0 ${
                item.type === 'patient' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
              }`}>
                {item.type === 'patient' ? <UserPlus className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {item.type === 'patient' 
                    ? `New Patient Registered: ${item.name}`
                    : `Appointment: ${item.patient?.name || 'Patient'} with Dr. ${item.doctor?.lastName}`
                  }
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.type === 'patient' 
                    ? `ID: ${item.patientId}`
                    : `Status: ${item.status}`
                  }
                </p>
              </div>

              {/* Time */}
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatTime(item.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;