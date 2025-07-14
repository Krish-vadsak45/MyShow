import {
  AlertTriangle,
  FileText,
  MessageSquare,
  Shield,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

export const ReportForm = () => {
  const [reportData, setReportData] = useState({
    type: "",
    title: "",
    description: "",
    priority: "medium",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportTypes = [
    { value: "bug", label: "Bug Report", icon: AlertTriangle },
    { value: "feature", label: "Feature Request", icon: Sparkles },
    { value: "content", label: "Content Issue", icon: FileText },
    { value: "security", label: "Security Concern", icon: Shield },
    { value: "other", label: "Other", icon: MessageSquare },
  ];

  const handleChange = (e) => {
    setReportData({
      ...reportData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    // Reset form
    setReportData({
      type: "",
      title: "",
      description: "",
      priority: "medium",
      email: "",
    });
    alert("Report submitted successfully!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Report Type *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {reportTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <label
                key={type.value}
                className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  reportData.type === type.value
                    ? "border-red-500 bg-red-500/10"
                    : "border-gray-700 hover:border-gray-600 bg-gray-900/30"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={reportData.type === type.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <IconComponent
                  className={`w-6 h-6 mb-2 ${
                    reportData.type === type.value
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-xs text-center ${
                    reportData.type === type.value
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {type.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={reportData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
            placeholder="Brief title for your report"
          />
        </div>
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={reportData.priority}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Email Address (Optional)
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={reportData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
          placeholder="For follow-up (optional)"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={reportData.description}
          onChange={handleChange}
          required
          rows={6}
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 resize-none"
          placeholder="Please provide detailed information about the issue or request..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Submitting...
          </>
        ) : (
          <>
            <AlertTriangle className="w-5 h-5 mr-2" />
            Submit Report
          </>
        )}
      </button>
    </form>
  );
};
