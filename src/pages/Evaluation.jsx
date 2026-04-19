import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown 
} from 'lucide-react';

export default function Evaluation() {
  const [formData, setFormData] = useState({
    vendor: '',
    projectCode: '',
    sourceLang: '',
    targetLang: '',
    service: '',
    taskQuality: '',
    serviceQuality: '',
    deadline: '',
    remark: ''
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Evaluation Submitted:', formData);
    // Add success message or redirect logic here
  };

  return (
    <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            
            {/* Vendor Search */}
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-slate-700">
                Vendor <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  name="vendor"
                  required
                  placeholder="Search Vendor By Name OR"
                  className="w-full h-12 px-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
                  value={formData.vendor}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            {/* Project Code */}
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-slate-700">
                Project Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  name="projectCode"
                  required
                  className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600"
                  value={formData.projectCode}
                  onChange={handleFormChange}
                >
                  <option value="">Project Code</option>
                  <option value="PRJ001">PRJ001</option>
                  <option value="PRJ002">PRJ002</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Source Lang */}
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-slate-700">
                Source Lang <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  name="sourceLang"
                  required
                  className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600"
                  value={formData.sourceLang}
                  onChange={handleFormChange}
                >
                  <option value="">Select</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Target Lang */}
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-slate-700">
                Target Lang <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  name="targetLang"
                  required
                  className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600"
                  value={formData.targetLang}
                  onChange={handleFormChange}
                >
                  <option value="">Target Lang</option>
                  <option value="Hindi">Hindi</option>
                  <option value="French">French</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Service */}
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-slate-700">
                Service <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  name="service"
                  required
                  className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600"
                  value={formData.service}
                  onChange={handleFormChange}
                >
                  <option value="">Service</option>
                  <option value="Translation">Translation</option>
                  <option value="Proofreading">Proofreading</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Task Quality */}
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-slate-700">
                Task Quality <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  name="taskQuality"
                  required
                  className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600"
                  value={formData.taskQuality}
                  onChange={handleFormChange}
                >
                  <option value="">Task Quality</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Service Quality */}
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-slate-700">
                Service Quality <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  name="serviceQuality"
                  required
                  className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600"
                  value={formData.serviceQuality}
                  onChange={handleFormChange}
                >
                  <option value="">Service Quali</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-slate-700">
                Deadline <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  name="deadline"
                  required
                  className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600"
                  value={formData.deadline}
                  onChange={handleFormChange}
                >
                  <option value="">Deadline</option>
                  <option value="On Time">On Time</option>
                  <option value="Delayed">Delayed</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Remark */}
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-slate-700">Remark</label>
            <textarea 
              name="remark"
              placeholder="Enter Remark"
              rows={5}
              className="w-full px-4 py-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none placeholder:text-slate-400"
              value={formData.remark}
              onChange={handleFormChange}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="submit"
              className="px-10 py-3 bg-[#405ba0] hover:bg-[#354c86] text-white font-bold rounded-lg transition-colors shadow-md active:scale-95"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
