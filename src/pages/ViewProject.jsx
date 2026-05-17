import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight,
  Calendar,
  X,
  Menu,
  MinusCircle,
  Plus,
  FolderGit2
} from 'lucide-react';
import { getProject, updateProject } from '../lib/projectApi';
import { getClients } from '../lib/clientApi';
import { getContacts } from '../lib/contactApi';
import { getServices } from '../lib/serviceApi';
import { getLanguages } from '../lib/languageApi';

export default function ViewProject() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState('Project');
  const tabs = ['Project', 'Company', 'Translations', 'Remark'];

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  
  // Masters
  const [clients, setClients] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [services, setServices] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [formData, setFormData] = useState({
    projectName: '',
    jobType: '',
    projectManager: '',
    source: 'Outsource',
    type: 'Non Extended',
    projectStatus: 'In Progress',
    receivingDate: '',
    dueDate: '',
    dateOfDelivery: '',
    client: '',
    clientContact: '',
    clientPO: '',
    clientProjectCode: '',
    sourceLanguage: '',
    targets: [],
    remark: ''
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [projRes, clientsRes, contactsRes, servicesRes, langsRes] = await Promise.all([
          getProject(id),
          getClients(),
          getContacts(),
          getServices(),
          getLanguages()
        ]);

        setProject(projRes);
        setClients(clientsRes);
        setContacts(contactsRes);
        setServices(servicesRes);
        setLanguages(langsRes);

        const toDatetimeLocal = (dateString) => {
          if (!dateString) return '';
          const d = new Date(dateString);
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        };

        setFormData({
          projectName: projRes.projectName || '',
          jobType: projRes.jobType || '',
          projectManager: projRes.projectManager?._id || projRes.projectManager || '',
          source: projRes.source || 'Outsource',
          type: projRes.type || 'Non Extended',
          projectStatus: projRes.projectStatus || 'In Progress',
          receivingDate: toDatetimeLocal(projRes.receivingDate),
          dueDate: toDatetimeLocal(projRes.dueDate),
          dateOfDelivery: toDatetimeLocal(projRes.dateOfDelivery),
          client: projRes.client?._id || projRes.client || '',
          clientContact: projRes.clientContact?._id || projRes.clientContact || '',
          clientPO: projRes.clientPO || '',
          clientProjectCode: projRes.clientProjectCode || '',
          sourceLanguage: projRes.sourceLanguage?._id || projRes.sourceLanguage || '',
          targets: projRes.targets || [],
          remark: projRes.remark || ''
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAll();
  }, [id]);

  const handleUpdate = async () => {
    try {
      await updateProject(id, formData);
      alert('Project updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to update project');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTarget = () => {
    setFormData((prev) => ({
      ...prev,
      targets: [...prev.targets, { targetLanguage: '', service: '', tasks: [] }]
    }));
  };

  const removeTarget = (index) => {
    setFormData((prev) => ({
      ...prev,
      targets: prev.targets.filter((_, i) => i !== index)
    }));
  };

  const handleTargetChange = (index, field, value) => {
    const newTargets = [...formData.targets];
    newTargets[index][field] = value;
    setFormData({ ...formData, targets: newTargets });
  };

  const addTask = (targetIndex) => {
    const newTargets = [...formData.targets];
    newTargets[targetIndex].tasks.push({
      taskName: '',
      startDate: '',
      endDate: '',
      unit: 'Word',
      quantity: 0,
      status: 'Not Started'
    });
    setFormData({ ...formData, targets: newTargets });
  };

  const removeTask = (targetIndex, taskIndex) => {
    const newTargets = [...formData.targets];
    newTargets[targetIndex].tasks = newTargets[targetIndex].tasks.filter((_, i) => i !== taskIndex);
    setFormData({ ...formData, targets: newTargets });
  };

  const handleTaskChange = (targetIndex, taskIndex, field, value) => {
    const newTargets = [...formData.targets];
    newTargets[targetIndex].tasks[taskIndex][field] = value;
    setFormData({ ...formData, targets: newTargets });
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <FolderGit2 className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Project Not Found</h2>
        <p className="text-slate-500 mb-6">Could not find project details for ID: {id}</p>
        <button
          onClick={() => navigate('/projects')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Project':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-800">Project</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto py-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Project Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Job Type</label>
                <input
                  type="text"
                  value={formData.jobType}
                  onChange={(e) => handleInputChange('jobType', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Project Manager</label>
                <select
                  value={formData.projectManager}
                  onChange={(e) => handleInputChange('projectManager', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select Manager</option>
                  {contacts.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">Project Source</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="source" value="Inhouse" checked={formData.source === 'Inhouse'} onChange={(e) => handleInputChange('source', e.target.value)} className="w-5 h-5 accent-indigo-600" />
                    <span>Inhouse</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="source" value="Outsource" checked={formData.source === 'Outsource'} onChange={(e) => handleInputChange('source', e.target.value)} className="w-5 h-5 accent-indigo-600" />
                    <span>Outsource</span>
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">Project Type</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="type" value="Extended" checked={formData.type === 'Extended'} onChange={(e) => handleInputChange('type', e.target.value)} className="w-5 h-5 accent-indigo-600" />
                    <span>Extended</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="type" value="Non Extended" checked={formData.type === 'Non Extended'} onChange={(e) => handleInputChange('type', e.target.value)} className="w-5 h-5 accent-indigo-600" />
                    <span>Non Extended</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Project Status</label>
                <select
                  value={formData.projectStatus}
                  onChange={(e) => handleInputChange('projectStatus', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option>On Hold</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Not Started</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Receiving Date</label>
                <input
                  type="datetime-local"
                  value={formData.receivingDate}
                  onChange={(e) => handleInputChange('receivingDate', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Due Date</label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Date of Delivery</label>
                <input
                  type="datetime-local"
                  value={formData.dateOfDelivery}
                  onChange={(e) => handleInputChange('dateOfDelivery', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-6 border-t border-slate-50 max-w-4xl mx-auto">
              <button onClick={handleUpdate} className="px-8 py-3 bg-[#3f5d9a] hover:bg-[#344d7e] text-white rounded-lg font-bold">Update</button>
              <button onClick={() => navigate('/projects')} className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold">Cancel</button>
            </div>
          </div>
        );
      case 'Translations':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-800">Translations</h2>
            </div>
            <div className="space-y-6 max-w-full">
              <div className="flex items-center gap-6 max-w-md">
                <label className="block text-sm font-bold text-slate-700 w-32 shrink-0">Source <span className="text-red-500">*</span></label>
                <select
                  value={formData.sourceLanguage}
                  onChange={(e) => handleInputChange('sourceLanguage', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">Select Source</option>
                  {languages.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                {formData.targets.map((target, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-6">
                      <div className="flex-1 flex items-center gap-6">
                        <div className="flex items-center gap-4 w-1/3">
                          <label className="text-xs font-bold text-slate-500 uppercase w-16 shrink-0">Target</label>
                          <select
                            value={target.targetLanguage}
                            onChange={(e) => handleTargetChange(idx, 'targetLanguage', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                          >
                            <option value="">Select Target</option>
                            {languages.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center gap-4 w-1/2">
                          <label className="text-xs font-bold text-slate-500 uppercase w-16 shrink-0">Service</label>
                          <select
                            value={target.service}
                            onChange={(e) => handleTargetChange(idx, 'service', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                          >
                            <option value="">Select Service</option>
                            {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <button onClick={() => removeTarget(idx)} className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600">
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2 pl-4">
                      {target.tasks.map((task, tIdx) => (
                        <div key={tIdx} className="flex items-center gap-4 py-1">
                          <input
                            type="text"
                            placeholder="Task Name"
                            value={task.taskName}
                            onChange={(e) => handleTaskChange(idx, tIdx, 'taskName', e.target.value)}
                            className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-xs"
                          />
                          <div className="flex-1 flex items-center gap-3">
                            <input
                              type="date"
                              value={task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleTaskChange(idx, tIdx, 'startDate', e.target.value)}
                              className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-xs"
                            />
                            <input
                              type="date"
                              value={task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleTaskChange(idx, tIdx, 'endDate', e.target.value)}
                              className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-xs"
                            />
                            <select
                              value={task.unit}
                              onChange={(e) => handleTaskChange(idx, tIdx, 'unit', e.target.value)}
                              className="px-2 py-2 border border-slate-200 rounded-lg text-xs w-20"
                            >
                              <option value="Word">Word</option>
                              <option value="Hour">Hour</option>
                              <option value="Page">Page</option>
                            </select>
                            <input
                              type="number"
                              value={task.quantity}
                              onChange={(e) => handleTaskChange(idx, tIdx, 'quantity', e.target.value)}
                              className="w-16 px-2 py-2 border border-slate-200 rounded-lg text-xs text-center"
                            />
                            <select
                              value={task.status}
                              onChange={(e) => handleTaskChange(idx, tIdx, 'status', e.target.value)}
                              className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-xs"
                            >
                              <option value="Not Started">Not Started</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                            <button onClick={() => removeTask(idx, tIdx)} className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => addTask(idx)} className="text-indigo-600 text-xs font-bold flex items-center gap-1 mt-2">
                        <Plus className="w-3 h-3" /> Add Task
                      </button>
                    </div>
                  </div>
                ))}
                
                <button onClick={addTarget} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold">
                  <Plus className="w-4 h-4" /> Add Target Language
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-6 border-t border-slate-50 w-full">
              <button onClick={handleUpdate} className="px-8 py-2.5 bg-[#3f5d9a] hover:bg-[#344d7e] text-white rounded-lg font-bold">Update</button>
              <button onClick={() => navigate('/projects')} className="px-8 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold">Cancel</button>
            </div>
          </div>
        );
      case 'Company':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-800">Company</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto py-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Client</label>
                <select
                  value={formData.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Client Contact</label>
                <select
                  value={formData.clientContact}
                  onChange={(e) => handleInputChange('clientContact', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select Contact</option>
                  {contacts.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Client PO</label>
                <input
                  type="text"
                  value={formData.clientPO}
                  onChange={(e) => handleInputChange('clientPO', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Client Project Code</label>
                <input
                  type="text"
                  value={formData.clientProjectCode}
                  onChange={(e) => handleInputChange('clientProjectCode', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-6 border-t border-slate-50 max-w-4xl mx-auto">
              <button onClick={handleUpdate} className="px-8 py-3 bg-[#3f5d9a] hover:bg-[#344d7e] text-white rounded-lg font-bold">Update</button>
              <button onClick={() => navigate('/projects')} className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold">Cancel</button>
            </div>
          </div>
        );
      case 'Remark':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-800">Remark</h2>
            </div>
            <div className="max-w-4xl mx-auto py-4">
              <textarea
                value={formData.remark}
                onChange={(e) => handleInputChange('remark', e.target.value)}
                placeholder="Remark"
                rows={6}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 resize-y"
              />
              <div className="flex gap-3 pt-8">
                <button onClick={handleUpdate} className="px-8 py-2.5 bg-[#3f5d9a] hover:bg-[#344d7e] text-white rounded-lg font-bold">Update</button>
                <button onClick={() => navigate('/projects')} className="px-8 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold">Cancel</button>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Update Project ({project.projectId})
        </h1>
        <div className="border-b border-slate-200">
          <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-sm font-bold transition-all border-x border-t rounded-t-xl -mb-px shrink-0 ${
                  activeTab === tab
                    ? 'bg-white border-slate-200 text-indigo-600 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]'
                    : 'bg-transparent border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="min-h-[500px]">{renderTabContent()}</div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
