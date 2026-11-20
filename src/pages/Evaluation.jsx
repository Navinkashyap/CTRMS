import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Search,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Award
} from 'lucide-react';
import { createEvaluation } from '../lib/evaluationApi';
import { searchVendors } from '../lib/vendorApi';
import { getProjects } from '../lib/projectApi';
import { getLanguages } from '../lib/languageApi';
import { getServices } from '../lib/serviceApi';
import { getQualities } from '../lib/qualityApi';
import { getDeadlines } from '../lib/deadlineApi';

export default function Evaluation() {
  const [formData, setFormData] = useState({
    vendorId: '',
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

  const [projects, setProjects] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [services, setServices] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [vendorSuggestions, setVendorSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const searchTimeout = useRef(null);
  const vendorInputRef = useRef(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [projectData, languageData, serviceData, qualityData, deadlineData] = await Promise.all([
          getProjects(),
          getLanguages(),
          getServices(),
          getQualities(),
          getDeadlines(),
        ]);
        setProjects(projectData);
        setLanguages(languageData);
        setServices(serviceData);
        setQualities(qualityData.filter((q) => q.status === 'Active'));
        setDeadlines(deadlineData.filter((d) => d.status === 'Active'));
      } catch (error) {
        console.error('Failed to load evaluation options:', error);
      }
    };

    loadOptions();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVendorSearch = (value) => {
    setFormData((prev) => ({
      ...prev,
      vendor: value,
      vendorId: '',
    }));
    setShowSuggestions(true);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (!value.trim()) {
      setVendorSuggestions([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchVendors(value);
        setVendorSuggestions(results);
      } catch (error) {
        console.error('Vendor search failed:', error);
      }
    }, 300);
  };

  const selectVendor = (vendor) => {
    setFormData((prev) => ({
      ...prev,
      vendorId: vendor._id,
      vendor: vendor.name,
    }));
    setVendorSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vendorId) {
      setMessage({ type: 'error', text: 'Please select a vendor from the search results.' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: '', text: '' });

      await createEvaluation({
        vendorId: formData.vendorId,
        projectCode: formData.projectCode,
        sourceLang: formData.sourceLang,
        targetLang: formData.targetLang,
        service: formData.service,
        taskQuality: formData.taskQuality,
        serviceQuality: formData.serviceQuality,
        deadline: formData.deadline,
        remark: formData.remark,
      });

      setMessage({ type: 'success', text: 'Evaluation submitted successfully. Vendor ratings updated.' });
      setFormData({
        vendorId: '',
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
    } catch (error) {
      const errorText = error.response?.data?.message || 'Failed to submit evaluation.';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      vendorId: '',
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
    setVendorSuggestions([]);
    setShowSuggestions(false);
    setMessage({ type: '', text: '' });
  };

  const projectCodes = projects
    .map((project) => project.projectCode || project.projectId)
    .filter(Boolean);

  const qualityOptions = qualities.length > 0
    ? qualities.map((q) => q.type)
    : ['Excellent', 'Good', 'Average', 'Poor'];

  const deadlineOptions = deadlines.length > 0
    ? deadlines.map((d) => d.name)
    : ['On Time', 'Delayed'];

  return (
    <div className="font-sans text-slate-900 pb-10 min-h-screen bg-[#fafbfc] p-4 sm:p-8 animate-in fade-in duration-700">
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* Modern Header Section (Sticky / Non-scrollable) */}
        <div className="sticky top-0 z-30 bg-[#fafbfc]/95 backdrop-blur-md py-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:px-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="space-y-1.5">
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                Vendor Evaluation
              </h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide flex items-center gap-3">
                <Award className="w-4 h-4 text-indigo-600" />
                Rate vendor quality, delivery performance, and task execution
              </p>
            </div>
          </div>
        </div>

        {/* Premium Form Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-10 lg:p-12 overflow-hidden relative">

          {message.text && (
            <div
              className={`mb-8 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold border ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-xs'
                  : 'bg-rose-50 text-rose-700 border-rose-200/80 shadow-xs'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">

              {/* Vendor */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  Vendor <span className="text-rose-500">*</span>
                </label>
                <div className="relative group" ref={vendorInputRef}>
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    name="vendor"
                    required
                    placeholder="Search vendor by name or code..."
                    className="w-full h-11 pl-10 pr-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
                    value={formData.vendor}
                    onChange={(e) => handleVendorSearch(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    autoComplete="off"
                  />
                  {showSuggestions && vendorSuggestions.length > 0 && (
                    <div className="absolute z-30 w-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto custom-scrollbar p-1.5 animate-in fade-in duration-150">
                      {vendorSuggestions.map((vendor) => (
                        <button
                          key={vendor._id}
                          type="button"
                          className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-50/70 hover:text-indigo-700 rounded-xl text-sm transition-colors flex items-center justify-between"
                          onMouseDown={() => selectVendor(vendor)}
                        >
                          <span className="font-semibold text-slate-800">{vendor.name}</span>
                          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            {vendor.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Project Code */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  Project Code <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="projectCode"
                    required
                    className="w-full h-11 px-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
                    value={formData.projectCode}
                    onChange={handleFormChange}
                  >
                    <option value="">Select Project Code</option>
                    {projectCodes.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Source Lang */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  Source Lang <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="sourceLang"
                    required
                    className="w-full h-11 px-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
                    value={formData.sourceLang}
                    onChange={handleFormChange}
                  >
                    <option value="">Select Source Language</option>
                    {languages.map((lang) => (
                      <option key={lang._id} value={lang.name}>{lang.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Target Lang */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  Target Lang <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="targetLang"
                    required
                    className="w-full h-11 px-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
                    value={formData.targetLang}
                    onChange={handleFormChange}
                  >
                    <option value="">Select Target Language</option>
                    {languages.map((lang) => (
                      <option key={lang._id} value={lang.name}>{lang.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Service */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  Service <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="service"
                    required
                    className="w-full h-11 px-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
                    value={formData.service}
                    onChange={handleFormChange}
                  >
                    <option value="">Select Service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service.name}>{service.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Task Quality */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  Task Quality <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="taskQuality"
                    required
                    className="w-full h-11 px-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
                    value={formData.taskQuality}
                    onChange={handleFormChange}
                  >
                    <option value="">Select Task Quality</option>
                    {qualityOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Service Quality */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  Service Quality <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="serviceQuality"
                    required
                    className="w-full h-11 px-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
                    value={formData.serviceQuality}
                    onChange={handleFormChange}
                  >
                    <option value="">Select Service Quality</option>
                    {qualityOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  Deadline <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="deadline"
                    required
                    className="w-full h-11 px-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
                    value={formData.deadline}
                    onChange={handleFormChange}
                  >
                    <option value="">Select Deadline</option>
                    {deadlineOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Remark */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Remark / Performance Notes
              </label>
              <textarea
                name="remark"
                placeholder="Enter detailed feedback or evaluation remark..."
                rows={4}
                className="w-full px-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all resize-none placeholder:text-slate-400"
                value={formData.remark}
                onChange={handleFormChange}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-2xl shadow-[0_4px_12px_-2px_rgba(79,70,229,0.3)] transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Evaluation...' : 'Submit Evaluation'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-2xl transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Reset Form</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
