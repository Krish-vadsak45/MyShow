import React from "react";
import { ShieldX, ArrowLeft, AlertTriangle } from "lucide-react";

const AccessDenied = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-600"></div>

        {/* Main icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-2 animate-pulse">
              <ShieldX className="w-10 h-10 text-red-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-2 leading-relaxed">
          You don't have permission to access this admin area.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Please contact your administrator if you believe this is an error.
        </p>

        {/* Divider */}
        <div className="w-16 h-0.5 bg-gradient-to-r from-red-300 to-red-500 mx-auto mb-8"></div>

        {/* Go back button */}
        <button
          onClick={handleGoBack}
          className="group inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 w-full sm:w-auto cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Go Back
        </button>

        {/* Additional info */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Error Code: 403 - Forbidden Access
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-50 rounded-full opacity-50"></div>
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-gray-50 rounded-full opacity-30"></div>
      </div>

      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(203 213 225) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>
    </div>
  );
};

export default AccessDenied;
