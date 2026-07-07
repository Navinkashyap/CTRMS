import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown
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
    <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        {message.text && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">

            <div className="space-y-2">
              <label className="text-[14px] font-bold text-slate-700">
                Vendor <span className="text-red-500">*</span>
              </label>
              <div className="relative group" ref={vendorInputRef}>
                <input
                  type="text"
                  name="vendor"
                  required
                  placeholder="Search Vendor By Name OR Code"
                  className="w-full h-12 px-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-600"
                  value={formData.vendor}
                  onChange={(e) => handleVendorSearch(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  autoComplete="off"
                />
                {showSuggestions && vendorSuggestions.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {vendorSuggestions.map((vendor) => (
                      <button
                        key={vendor._id}
                        type="button"
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm border-b border-slate-100 last:border-0"
                        onMouseDown={() => selectVendor(vendor)}
                      >
                        <span className="font-medium text-slate-900">{vendor.name}</span>
                        <span className="text-slate-500 ml-2">({vendor.code})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

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
                  {projectCodes.map((code) => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
              </div>
            </div>

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
                  {languages.map((lang) => (
                    <option key={lang._id} value={lang.name}>{lang.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
              </div>
            </div>

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
                  {languages.map((lang) => (
                    <option key={lang._id} value={lang.name}>{lang.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
              </div>
            </div>

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
                  {services.map((service) => (
                    <option key={service._id} value={service.name}>{service.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
              </div>
            </div>

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
                  {qualityOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
              </div>
            </div>

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
                  <option value="">Service Quality</option>
                  {qualityOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
              </div>
            </div>

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
                  {deadlineOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
              </div>
            </div>

          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-bold text-slate-700">Remark</label>
            <textarea
              name="remark"
              placeholder="Enter Remark"
              rows={5}
              className="w-full px-4 py-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none placeholder:text-slate-600"
              value={formData.remark}
              onChange={handleFormChange}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-10 py-3 bg-[#405ba0] hover:bg-[#354c86] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-md active:scale-95"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
