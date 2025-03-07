import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const WorkoutLayout = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg shadow hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
};

export default WorkoutLayout; 