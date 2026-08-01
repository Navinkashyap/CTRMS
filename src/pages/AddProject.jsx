import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, ArrowLeft, Check, X, Info, ArrowRight, Upload, Trash2 } from 'lucide-react';
import { createProject, getProjects, updateProject, getProject } from '../lib/projectApi';
import { getClients } from '../lib/clientApi';
import { getContacts } from '../lib/contactApi';
import { getLanguages } from '../lib/languageApi';
import { getTools } from '../lib/toolApi';
import { getSpecializations } from '../lib/specializationApi';
import { getUnits } from '../lib/unitApi';
import { getServices } from '../lib/serviceApi';

const DEFAULT_TRANSLATION_TASKS = [
  { taskName: 'Translation', rate: 1 },
];

const getLangCode = (langId, languageList) => {
  const lang = languageList.find((l) => l._id === langId);
  if (!lang) return '';
  if (lang.localeCode) return lang.localeCode.toUpperCase();
  return lang.name?.slice(0, 3).toUpperCase() || '';
};

const getLangName = (langId, languageList) => {
  const lang = languageList.find((l) => l._id === langId);
  return lang?.name || '';
};

const calcTaskFees = (quantity, rate) =>
  (Number(quantity) || 0) * (Number(rate) || 0);

const createDefaultTasks = (currency = 'INR', defaultUnit = 'Words') =>
  DEFAULT_TRANSLATION_TASKS.map((t) => ({
    taskName: t.taskName,
    unit: defaultUnit,
    quantity: 100,
    rate: t.rate,
    currency,
    fees: calcTaskFees(100, t.rate),
    startDate: '',
    endDate: '',
    status: 'Not Started',
  }));

export default function AddProject() {
  const navigate = useNavigate();
  const location = useLocation();

  const editId = location.state?.project?.id || location.state?.project?._id;
  const isEditMode = Boolean(editId);

  const [loading, setLoading] = useState(true);

  // Masters
  const [clients, setClients] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [tools, setTools] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [programNames, setProgramNames] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [services, setServices] = useState([]);

  const [formData, setFormData] = useState({
    projectName: '',
    projectCode: '',
    client: '',
    clientContact: '',
    clientPO: '',
    clientProjectCode: '',
    projectStatus: 'In Progress',
    isProgramGroup: false,
    programName: '',
    amount: '',
    dueDate: '',
    dueTime: '',
    description: '',
    translationTool: '',
    subjectMatter: '',
    gstEnabled: false,
    cgstPercent: 9,
    sgstPercent: 9,
    igstPercent: 18,
    otherCharges: 0,
    otherChargesLabel: 'None',
    targets: [],
    referenceFiles: [''],
    workingFiles: [''],
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [clientsRes, contactsRes, langsRes, allProjects, toolsRes, specsRes, unitsRes, servicesRes] = await Promise.all([
          getClients(),
          getContacts(),
          getLanguages(),
          getProjects(),
          getTools(),
          getSpecializations(),
          getUnits(),
          getServices(),
        ]);
        setClients(clientsRes);
        setContacts(contactsRes);
        setLanguages(langsRes);
        setTools(toolsRes.filter((t) => t.status === 'Active'));
        setSpecializations(specsRes.filter((s) => s.status === 'Active'));
        setUnitsList(unitsRes.filter((u) => u.status !== 'Inactive'));
        setServices(servicesRes.filter((s) => s.status === 'Active'));

        const names = [
          ...new Set(
            allProjects
              .map((p) => p.programName)
              .filter(Boolean)
          ),
        ].sort((a, b) => a.localeCompare(b));
        setProgramNames(names);

        // Set default Target Language
        const hiIN = langsRes.find((l) => l.localeCode === 'hi-IN' || l.name === 'Hindi');
        const enUS = langsRes.find((l) => l.localeCode === 'en-US' || l.name === 'English' || l.name === 'English (US)');

        let editData = null;
        if (isEditMode) {
          editData = await getProject(editId);
        }

        setFormData((prev) => {
          if (editData) {
            return {
              ...prev,
              projectName: editData.projectName || '',
              projectCode: editData.projectCode || '',
              client: editData.client?._id || editData.client || '',
              clientContact: editData.clientContact?._id || editData.clientContact || '',
              clientPO: editData.clientPO || '',
              clientProjectCode: editData.clientProjectCode || '',
              projectStatus: editData.projectStatus || editData.status || 'In Progress',
              isProgramGroup: editData.isProgramGroup || false,
              programName: editData.programName || '',
              amount: editData.amount || '',
              dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString().split('T')[0] : '',
              dueTime: editData.dueTime || '',
              description: editData.description || '',
              translationTool: editData.translationTool || '',
              subjectMatter: editData.subjectMatter || '',
              gstEnabled: editData.gstEnabled || false,
              cgstPercent: editData.cgstPercent ?? 9,
              sgstPercent: editData.sgstPercent ?? 9,
              igstPercent: editData.igstPercent ?? 18,
              otherCharges: editData.otherCharges || 0,
              otherChargesLabel: editData.otherChargesLabel || 'None',
              targets: editData.targets && editData.targets.length > 0 ? editData.targets.map(t => ({
                sourceLanguage: t.sourceLanguage?._id || t.sourceLanguage || '',
                targetLanguage: t.targetLanguage?._id || t.targetLanguage || '',
                service: t.service?._id || t.service || '',
                tasks: t.tasks && t.tasks.length > 0 ? t.tasks.map(task => ({
                  ...task,
                  startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
                  endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '',
                })) : createDefaultTasks('INR', unitsRes.length > 0 ? unitsRes[0].name : 'Words')
              })) : [{
                sourceLanguage: enUS ? enUS._id : '',
                targetLanguage: hiIN ? hiIN._id : '',
                service: '',
                tasks: createDefaultTasks('INR', unitsRes.length > 0 ? unitsRes[0].name : 'Words')
              }],
              referenceFiles: editData.referenceFiles && editData.referenceFiles.length > 0 ? editData.referenceFiles : [''],
              workingFiles: editData.workingFiles && editData.workingFiles.length > 0 ? editData.workingFiles : [''],
            };
          }

          if (prev.targets.length === 0) {
            return {
              ...prev,
              targets: [{
                sourceLanguage: enUS ? enUS._id : '',
                targetLanguage: hiIN ? hiIN._id : '',
                service: '',
                tasks: createDefaultTasks('INR', unitsRes.length > 0 ? unitsRes[0].name : 'Words')
              }]
            };
          }
          return prev;
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'isProgramGroup' && !value) {
        next.programName = '';
      }
      if (field === 'client') {
        next.clientContact = '';
        const clientObj = clients.find((c) => c._id === value);
        const newCurrency = clientObj?.currency || 'INR';
        if (next.targets && next.targets.length > 0) {
          next.targets = next.targets.map((target) => ({
            ...target,
            tasks: target.tasks.map((task) => ({
              ...task,
              currency: newCurrency,
            })),
          }));
        }
      }
      return next;
    });
  };

  const selectedClient = clients.find((c) => c._id === formData.client);
  const clientCurrency = selectedClient?.currency || 'INR';
  const clientState = selectedClient?.state?.trim().toLowerCase() || '';
  const isUP = ['up', 'uttar pradesh', 'uttarpradesh', 'uttar pardesh', 'u.p', 'u.p.', 'uttarpardesh'].includes(clientState);

  const targetSummary = formData.targets
    .map((t) => getLangName(t.targetLanguage, languages))
    .filter(Boolean);

  const allTaskFees = formData.targets.reduce(
    (sum, target) =>
      sum +
      target.tasks.reduce(
        (tSum, task) => tSum + calcTaskFees(task.quantity, task.rate),
        0
      ),
    0
  );
  const subTotal = allTaskFees;
  let taxAmount = 0;
  if (formData.gstEnabled) {
    if (isUP) {
      taxAmount = subTotal * ((Number(formData.cgstPercent) + Number(formData.sgstPercent)) / 100);
    } else {
      taxAmount = subTotal * (Number(formData.igstPercent) / 100);
    }
  }
  const grandTotal = subTotal + taxAmount + (Number(formData.otherCharges) || 0);

  // File field helpers
  const addFileField = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const removeFileField = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFileFieldChange = (field, index, value) => {
    const updated = [...(formData[field] || [])];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  // Target helpers
  const addTarget = () => {
    const hiIN = languages.find((l) => l.localeCode === 'hi-IN' || l.name === 'Hindi');
    const enUS = languages.find((l) => l.localeCode === 'en-US' || l.name === 'English' || l.name === 'English (US)');

    setFormData((prev) => ({
      ...prev,
      targets: [
        ...prev.targets,
        {
          sourceLanguage: enUS ? enUS._id : '',
          targetLanguage: hiIN ? hiIN._id : '',
          service: '',
          tasks: createDefaultTasks(
            clients.find((c) => c._id === prev.client)?.currency || 'INR',
            unitsList.length > 0 ? unitsList[0].name : 'Words'
          ),
        },
      ],
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
    if (field === 'targetLanguage' && value && newTargets[index].tasks.length === 0) {
      newTargets[index].tasks = createDefaultTasks(clientCurrency, unitsList.length > 0 ? unitsList[0].name : 'Words');
    }
    setFormData({ ...formData, targets: newTargets });
  };

  const addTask = (targetIndex) => {
    const newTargets = [...formData.targets];
    newTargets[targetIndex].tasks.push({
      taskName: '',
      unit: unitsList.length > 0 ? unitsList[0].name : 'Words',
      quantity: 100,
      rate: 0,
      currency: clientCurrency,
      fees: 0,
      startDate: '',
      endDate: '',
      status: 'Not Started',
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
    const task = { ...newTargets[targetIndex].tasks[taskIndex], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      task.fees = calcTaskFees(task.quantity, task.rate);
    }
    if (field === 'currency') {
      task.currency = value;
    }
    newTargets[targetIndex].tasks[taskIndex] = task;
    setFormData({ ...formData, targets: newTargets });
  };

  const preparePayload = () => ({
    ...formData,
    projectName: formData.projectName || formData.projectCode || 'Untitled Project',
    service: formData.targets && formData.targets.length > 0 ? formData.targets[0].service : '',
    budget: formData.amount || '',
    deadline: formData.dueDate || '',
    status: formData.projectStatus || 'In Progress',
    targets: formData.targets.map((t) => ({
      ...t,
      tasks: t.tasks.map((task) => ({
        ...task,
        fees: calcTaskFees(task.quantity, task.rate),
      })),
    })),
  });

  const handleSubmit = async () => {
    if (formData.isProgramGroup && !formData.programName) {
      alert('Please select a program name.');
      return;
    }
    try {
      if (isEditMode) {
        await updateProject(editId, preparePayload());
        alert('Project updated successfully!');
      } else {
        await createProject(preparePayload());
        alert('Project created successfully!');
      }
      navigate('/projects');
    } catch (error) {
      console.error(error);
      alert(isEditMode ? 'Failed to update project' : 'Failed to create project');
    }
  };

  if (loading) {
    return (
      <div className="ap-loading">
        <div className="ap-loading-inner">
          <div className="ap-spinner" />
          <p className="ap-loading-text">Loading masters…</p>
        </div>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
          .ap-loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif; background: #f0f2f8; }
          .ap-loading-inner { display: flex; flex-direction: column; align-items: center; gap: 12px; }
          .ap-spinner { width: 40px; height: 40px; border: 4px solid #e0e7ff; border-top-color: #4361ee; border-radius: 50%; animation: ap-spin 0.8s linear infinite; }
          .ap-loading-text { font-size: 14px; font-weight: 600; color: #64748b; }
          @keyframes ap-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="ap-page">
      {/* ── HEADER ── */}
      <header className="ap-header">
        <div className="ap-header-brand">
          <h1 className="ap-logo">Perfectrans<sup>™</sup></h1>
          <p className="ap-logo-sub">A Brand of Convoq Technologies Pvt. Ltd.</p>
        </div>
        <div className="ap-header-right">
          <button type="button" onClick={() => navigate('/projects')} className="ap-back-btn">
            <ArrowLeft size={14} /> Back to Projects
          </button>
          <h2 className="ap-page-title">{isEditMode ? 'Edit Project' : 'Create Project'}</h2>
        </div>
        <div className="ap-avatar-circle">
          <span style={{ fontSize: '16px' }}>👤</span>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="ap-main">

        {/* ═══ SECTION 01 — PROJECT INFORMATION ═══ */}
        <section className="ap-card">
          <div className="ap-card-header">
            <div className="ap-card-header-left">
              <span className="ap-step-num">01</span>
              <div>
                <h3 className="ap-card-title">Project Information</h3>
                <p className="ap-card-subtitle">Provide basic details about the project</p>
              </div>
            </div>
            <button type="button" className="ap-icon-btn-ghost"><Info size={18} /></button>
          </div>

          <div className="ap-card-body">
            <div className="ap-form-grid-2">
              {/* Project Code */}
              <div className="ap-field">
                <label className="ap-label">Project Code</label>
                <input
                  type="text"
                  value={formData.projectCode}
                  onChange={(e) => handleInputChange('projectCode', e.target.value)}
                  className="ap-input"
                  placeholder="e.g. PRJ-001"
                />
              </div>
              {/* Status */}
              <div className="ap-field">
                <label className="ap-label">Status</label>
                <select
                  value={formData.projectStatus}
                  onChange={(e) => handleInputChange('projectStatus', e.target.value)}
                  className="ap-input"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Project being created">Project being created</option>
                  <option value="Not Started">Not Started</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              {/* Client */}
              <div className="ap-field">
                <label className="ap-label">Client</label>
                <select
                  value={formData.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  className="ap-input"
                >
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              {/* Client Contact */}
              <div className="ap-field">
                <label className="ap-label">Client Contact</label>
                <select
                  value={formData.clientContact}
                  onChange={(e) => handleInputChange('clientContact', e.target.value)}
                  className="ap-input"
                >
                  <option value="">Select Contact</option>
                  {contacts
                    .filter(c => !formData.client || c.company === clients.find(cl => cl._id === formData.client)?.name || c.clientId === formData.client)
                    .map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              {/* Amount */}
              <div className="ap-field">
                <label className="ap-label">Amount ({clientCurrency})</label>
                <div className="ap-input-icon-wrap">
                  <input
                    type="text"
                    placeholder="e.g. 120"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="ap-input"
                  />
                  <span className="ap-input-suffix">₹</span>
                </div>
              </div>
              {/* Due Date + Due Time */}
              <div className="ap-field-row">
                <div className="ap-field" style={{ flex: 1 }}>
                  <label className="ap-label">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="ap-input"
                  />
                </div>
                <div className="ap-field" style={{ flex: 1 }}>
                  <label className="ap-label">Due Time</label>
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => handleInputChange('dueTime', e.target.value)}
                    className="ap-input"
                  />
                </div>
              </div>
              {/* Client PO# */}
              <div className="ap-field">
                <label className="ap-label">Client PO#</label>
                <input
                  type="text"
                  value={formData.clientPO}
                  onChange={(e) => handleInputChange('clientPO', e.target.value)}
                  className="ap-input"
                  placeholder="e.g. PO#12345"
                />
              </div>
              {/* Client Project Code */}
              <div className="ap-field">
                <label className="ap-label">Client Project Code (CPC)</label>
                <input
                  type="text"
                  value={formData.clientProjectCode}
                  onChange={(e) => handleInputChange('clientProjectCode', e.target.value)}
                  className="ap-input"
                  placeholder="e.g. MS-0076565"
                />
              </div>
              {/* Instruction */}
              <div className="ap-field ap-full-width">
                <label className="ap-label">Instruction</label>
                <textarea
                  rows={4}
                  placeholder="Enter project instruction..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="ap-input ap-textarea"
                />
              </div>
              {/* Program / Project Group */}
              <div className="ap-field ap-full-width">
                <label className="ap-label">Program / Project Group</label>
                <div className="ap-radio-group">
                  <label className="ap-radio-label">
                    <input
                      type="radio"
                      name="isProgramGroup"
                      checked={formData.isProgramGroup === true}
                      onChange={() => handleInputChange('isProgramGroup', true)}
                      className="ap-radio"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="ap-radio-label">
                    <input
                      type="radio"
                      name="isProgramGroup"
                      checked={formData.isProgramGroup === false}
                      onChange={() => handleInputChange('isProgramGroup', false)}
                      className="ap-radio"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
              {/* Program Name (conditional) */}
              {formData.isProgramGroup && (
                <div className="ap-field ap-full-width">
                  <label className="ap-label">
                    Program Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    list="program-name-list"
                    required
                    placeholder="Select or enter program name"
                    value={formData.programName}
                    onChange={(e) => handleInputChange('programName', e.target.value)}
                    className="ap-input"
                  />
                  <datalist id="program-name-list">
                    {programNames.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 02 — TASK DETAILS ═══ */}
        <section className="ap-card">
          <div className="ap-card-header">
            <div className="ap-card-header-left">
              <span className="ap-step-num">02</span>
              <div>
                <h3 className="ap-card-title">Task Details</h3>
                <p className="ap-card-subtitle">Define tasks, targets, languages and pricing</p>
              </div>
            </div>
          </div>

          <div className="ap-card-body">
            {/* Tool / Subject Matter / Specialization / No. of Targets */}
            <div className="ap-meta-row">
              <div className="ap-meta-item">
                <span className="ap-meta-icon">📊</span>
                <span className="ap-meta-label-text">Tool</span>
                <select
                  value={formData.translationTool}
                  onChange={(e) => handleInputChange('translationTool', e.target.value)}
                  className="ap-meta-select"
                >
                  <option value="">Select Tool</option>
                  {tools.map((t) => (
                    <option key={t._id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="ap-meta-item">
                <span className="ap-meta-label-text">Subject Matter</span>
                <select
                  value={formData.subjectMatter}
                  onChange={(e) => handleInputChange('subjectMatter', e.target.value)}
                  className="ap-meta-select"
                >
                  <option value="">Specialization</option>
                  {specializations.map((s) => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="ap-meta-item">
                <span className="ap-meta-label-text">Specialization</span>
                <select className="ap-meta-select" disabled>
                  <option>{formData.subjectMatter || '—'}</option>
                </select>
              </div>
              <div className="ap-meta-item ap-meta-item-targets">
                <span className="ap-meta-label-text">No. of Targets</span>
                <span className="ap-meta-value">{formData.targets.length}</span>
                {targetSummary.length > 0 && (
                  <span className="ap-meta-hint">({targetSummary.join(', ')})</span>
                )}
              </div>
            </div>

            {/* Target language blocks */}
            {formData.targets.map((target, idx) => {
              const targetName = getLangName(target.targetLanguage, languages);

              return (
                <div key={idx} className="ap-target-block">
                  {/* Source → Target language row */}
                  <div className="ap-lang-row">
                    <div className="ap-lang-pair">
                      <span className="ap-lang-icon">🌐</span>
                      <span className="ap-lang-label">Source</span>
                      <select
                        value={target.sourceLanguage || ''}
                        onChange={(e) => handleTargetChange(idx, 'sourceLanguage', e.target.value)}
                        className="ap-lang-select"
                      >
                        <option value="">Select Source</option>
                        {languages.map((l) => (
                          <option key={l._id} value={l._id}>
                            {l.localeCode || l.name}
                          </option>
                        ))}
                      </select>

                      <ArrowRight size={16} className="ap-lang-arrow" />

                      <span className="ap-lang-label">Target Language</span>
                      <select
                        value={target.targetLanguage}
                        onChange={(e) => handleTargetChange(idx, 'targetLanguage', e.target.value)}
                        className="ap-lang-select"
                      >
                        <option value="">Select Target</option>
                        {languages.map((l) => (
                          <option key={l._id} value={l._id}>
                            {l.localeCode || l.name}
                          </option>
                        ))}
                      </select>

                      {targetName && <span className="ap-lang-name">({targetName})</span>}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeTarget(idx)}
                      className="ap-btn-remove-target"
                    >
                      Remove Target
                    </button>
                  </div>

                  {/* Task table */}
                  <div className="ap-task-table-wrap">
                    <table className="ap-task-table">
                      <thead>
                        <tr>
                          <th>Task</th>
                          <th>Quantity</th>
                          <th>Unit</th>
                          <th>Rate</th>
                          <th>Currency</th>
                          <th>Fees</th>
                          <th style={{ width: '70px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {target.tasks.map((task, tIdx) => (
                          <tr key={tIdx}>
                            <td>
                              <select
                                value={task.taskName}
                                onChange={(e) => handleTaskChange(idx, tIdx, 'taskName', e.target.value)}
                                className="ap-cell-select"
                              >
                                <option value="">Select Service</option>
                                {services.map((s) => (
                                  <option key={s._id} value={s.name}>{s.name}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                value={task.quantity}
                                onChange={(e) => handleTaskChange(idx, tIdx, 'quantity', e.target.value)}
                                className="ap-cell-input"
                              />
                            </td>
                            <td>
                              <select
                                value={task.unit}
                                onChange={(e) => handleTaskChange(idx, tIdx, 'unit', e.target.value)}
                                className="ap-cell-select"
                              >
                                {unitsList.length > 0 ? (
                                  unitsList.map(u => <option key={u._id} value={u.name}>{u.name}</option>)
                                ) : (
                                  <option value="Words">Words</option>
                                )}
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={task.rate}
                                onChange={(e) => handleTaskChange(idx, tIdx, 'rate', e.target.value)}
                                className="ap-cell-input"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={task.currency || ''}
                                onChange={(e) => handleTaskChange(idx, tIdx, 'currency', e.target.value.toUpperCase())}
                                className="ap-cell-input ap-cell-currency"
                                placeholder={clientCurrency}
                              />
                            </td>
                            <td className="ap-cell-fees">
                              {calcTaskFees(task.quantity, task.rate).toFixed(2)}
                            </td>
                            <td>
                              <div className="ap-cell-actions">
                                <button
                                  type="button"
                                  onClick={() => addTask(idx)}
                                  className="ap-icon-btn ap-icon-btn-blue"
                                  title="Add row"
                                >
                                  <Plus size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeTask(idx, tIdx)}
                                  disabled={target.tasks.length <= 1}
                                  className="ap-icon-btn ap-icon-btn-red"
                                  title="Remove row"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={addTarget}
              className="ap-btn-add-target"
            >
              <Plus size={16} /> Add Target Language
            </button>
          </div>
        </section>

        {/* ═══ SECTION 03 — PAYMENT & BILLING ═══ */}
        <section className="ap-card">
          <div className="ap-card-header">
            <div className="ap-card-header-left">
              <span className="ap-step-num">03</span>
              <div>
                <h3 className="ap-card-title">Payment &amp; Billing</h3>
                <p className="ap-card-subtitle">Set GST and review price summary</p>
              </div>
            </div>
          </div>

          <div className="ap-card-body">
            <div className="ap-billing-layout">
              {/* Left — GST */}
              <div className="ap-billing-left">
                <label className="ap-label" style={{ fontWeight: 700, fontSize: '14px' }}>GST</label>
                <div className="ap-radio-group" style={{ marginTop: '8px' }}>
                  <label className="ap-radio-label">
                    <input
                      type="radio"
                      name="gstEnabled"
                      checked={formData.gstEnabled === true}
                      onChange={() => handleInputChange('gstEnabled', true)}
                      className="ap-radio"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="ap-radio-label">
                    <input
                      type="radio"
                      name="gstEnabled"
                      checked={formData.gstEnabled === false}
                      onChange={() => handleInputChange('gstEnabled', false)}
                      className="ap-radio"
                    />
                    <span>No</span>
                  </label>
                </div>
                {formData.gstEnabled && (
                  <div className="ap-gst-inputs">
                    {isUP ? (
                      <>
                        <label className="ap-gst-field">
                          CGST (%):
                          <input
                            type="number"
                            min="0"
                            value={formData.cgstPercent}
                            onChange={(e) => handleInputChange('cgstPercent', e.target.value)}
                            className="ap-gst-input"
                          />
                        </label>
                        <label className="ap-gst-field">
                          SGST (%):
                          <input
                            type="number"
                            min="0"
                            value={formData.sgstPercent}
                            onChange={(e) => handleInputChange('sgstPercent', e.target.value)}
                            className="ap-gst-input"
                          />
                        </label>
                      </>
                    ) : (
                      <label className="ap-gst-field">
                        IGST (%):
                        <input
                          type="number"
                          min="0"
                          value={formData.igstPercent}
                          onChange={(e) => handleInputChange('igstPercent', e.target.value)}
                          className="ap-gst-input"
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* Right — Summary Table */}
              <div className="ap-billing-right">
                <table className="ap-summary-table">
                  <tbody>
                    <tr>
                      <td className="ap-summary-label">Sub-Total</td>
                      <td className="ap-summary-value">{subTotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="ap-summary-label">
                        Tax{formData.gstEnabled ? (isUP ? ` (CGST ${formData.cgstPercent}% & SGST ${formData.sgstPercent}%)` : ` (IGST ${formData.igstPercent}%)`) : ''}
                      </td>
                      <td className="ap-summary-value">
                        {formData.gstEnabled ? taxAmount.toFixed(2) : '0.00'}
                      </td>
                    </tr>
                    <tr>
                      <td className="ap-summary-label">Other</td>
                      <td className="ap-summary-value-other">
                        <input
                          type="text"
                          value={formData.otherChargesLabel}
                          onChange={(e) => handleInputChange('otherChargesLabel', e.target.value)}
                          className="ap-other-label-input"
                          placeholder="None"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.otherCharges}
                          onChange={(e) => handleInputChange('otherCharges', e.target.value)}
                          className="ap-other-amount-input"
                        />
                      </td>
                    </tr>
                    <tr className="ap-summary-total-row">
                      <td className="ap-summary-total-label">Total</td>
                      <td className="ap-summary-total-value">
                        <span className="ap-currency-badge">{clientCurrency}</span>
                        <span className="ap-total-amount">{grandTotal.toFixed(2)}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 04 — UPLOAD FILES ═══ */}
        <section className="ap-card">
          <div className="ap-card-header">
            <div className="ap-card-header-left">
              <span className="ap-step-num ap-step-num-pink">04</span>
              <div>
                <h3 className="ap-card-title">Upload Files</h3>
                <p className="ap-card-subtitle">Upload reference and working files</p>
              </div>
            </div>
          </div>

          <div className="ap-card-body">
            <div className="ap-upload-section">
              {/* Reference files */}
              <div className="ap-upload-row">
                <span className="ap-upload-label">Reference files</span>
                <div className="ap-upload-fields">
                  {(formData.referenceFiles?.length ? formData.referenceFiles : ['']).map((file, idx) => (
                    <div key={idx} className="ap-upload-field-row">
                      <input
                        type="file"
                        onChange={(e) => handleFileFieldChange('referenceFiles', idx, e.target.value)}
                        className="ap-file-input"
                      />
                      <button
                        type="button"
                        onClick={() => addFileField('referenceFiles')}
                        className="ap-icon-btn ap-icon-btn-blue"
                      >
                        <Upload size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFileField('referenceFiles', idx)}
                        disabled={(formData.referenceFiles?.length || 1) <= 1}
                        className="ap-icon-btn ap-icon-btn-red"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Working files */}
              <div className="ap-upload-row">
                <span className="ap-upload-label">Working files</span>
                <div className="ap-upload-fields">
                  {(formData.workingFiles?.length ? formData.workingFiles : ['']).map((file, idx) => (
                    <div key={idx} className="ap-upload-field-row">
                      <input
                        type="file"
                        onChange={(e) => handleFileFieldChange('workingFiles', idx, e.target.value)}
                        className="ap-file-input"
                      />
                      <button
                        type="button"
                        onClick={() => addFileField('workingFiles')}
                        className="ap-icon-btn ap-icon-btn-blue"
                      >
                        <Upload size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFileField('workingFiles', idx)}
                        disabled={(formData.workingFiles?.length || 1) <= 1}
                        className="ap-icon-btn ap-icon-btn-red"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ACTIONS ── */}
        <div className="ap-actions-container">
          <button type="button" onClick={handleSubmit} className="ap-btn-create">
            <Check size={16} />
            {isEditMode ? 'Update Project' : 'Create Project'}
          </button>
          <button type="button" onClick={() => navigate('/projects')} className="ap-btn-cancel">
            <X size={16} />
            Cancel
          </button>
        </div>
      </main>

      {/* ── STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        /* ===== PAGE ===== */
        .ap-page {
          font-family: 'Outfit', sans-serif;
          background: #f0f2f8;
          min-height: 100vh;
          padding-bottom: 40px;
        }
        .ap-page *, .ap-page *::before, .ap-page *::after {
          font-family: 'Outfit', sans-serif;
          box-sizing: border-box;
        }

        /* ===== HEADER ===== */
        .ap-header {
          background: #fff;
          border-top: 3.5px solid #4361ee;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 32px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .ap-header-brand {}
        .ap-logo {
          font-size: 22px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
          line-height: 1.2;
          letter-spacing: -0.3px;
        }
        .ap-logo sup { font-size: 11px; vertical-align: super; }
        .ap-logo-sub {
          font-size: 11px;
          color: #94a3b8;
          margin: 2px 0 0;
          font-weight: 400;
        }
        .ap-header-right {
          text-align: right;
        }
        .ap-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #64748b;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-bottom: 2px;
          font-weight: 500;
          width: auto;
        }
        .ap-back-btn:hover { color: #4361ee; }
        .ap-page-title {
          font-size: 20px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
          letter-spacing: -0.3px;
        }
        .ap-avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4361ee, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* ===== MAIN ===== */
        .ap-main {
          max-width: 100%;
          margin: 0;
          padding: 12px 6px;
        }

        /* ===== CARDS ===== */
        .ap-card {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.05);
          margin-bottom: 0px;
          overflow: visible;
          border: 1px solid #f1f5f9;
        }
        .ap-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 24px 28px 0;
        }
        .ap-card-header-left {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .ap-step-num {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #eef1ff;
          color: #4361ee;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 15px;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .ap-step-num-pink {
          background: #fff0f3;
          color: #e11d48;
        }
        .ap-card-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1.3;
        }
        .ap-card-subtitle {
          font-size: 12px;
          color: #94a3b8;
          margin: 3px 0 0;
          font-weight: 400;
        }
        .ap-icon-btn-ghost {
          background: none;
          border: 1px solid #e2e8f0;
          color: #94a3b8;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          transition: all 0.15s;
        }
        .ap-icon-btn-ghost:hover { background: #f1f5f9; color: #4361ee; border-color: #c7d2fe; }
        .ap-card-body {
          padding: 22px 28px 28px;
        }

        /* ===== FORM GRID ===== */
        .ap-form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 28px;
        }
        .ap-full-width { grid-column: 1 / -1; }
        .ap-field { display: flex; flex-direction: column; gap: 7px; }
        .ap-field-row { display: flex; gap: 16px; }
        .ap-label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }
        .ap-input {
          width: 100%;
          padding: 10px 13px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: #fff;
          color: #1e293b;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .ap-input:focus {
          border-color: #4361ee;
          box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.08);
        }
        .ap-input::placeholder { color: #94a3b8; }
        .ap-textarea { resize: vertical; min-height: 90px; }
        .ap-input-icon-wrap { position: relative; }
        .ap-input-icon-wrap .ap-input { padding-right: 36px; }
        .ap-input-suffix {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 14px;
          font-weight: 600;
          pointer-events: none;
        }

        /* ===== RADIO ===== */
        .ap-radio-group { display: flex; align-items: center; gap: 22px; }
        .ap-radio-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 14px;
          color: #475569;
          cursor: pointer;
          font-weight: 500;
        }
        .ap-radio {
          width: 16px;
          height: 16px;
          accent-color: #4361ee;
          cursor: pointer;
        }

        /* ===== META ROW (Section 02 header bar) ===== */
        .ap-meta-row {
          display: flex;
          flex-wrap: wrap;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 22px;
          background: #fff;
        }
        .ap-meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 16px;
          border-right: 1px solid #e2e8f0;
          font-size: 13px;
          color: #475569;
          flex: 1;
          min-width: 0;
        }
        .ap-meta-item:last-child { border-right: none; }
        .ap-meta-icon { font-size: 16px; flex-shrink: 0; }
        .ap-meta-label-text { font-weight: 600; white-space: nowrap; font-size: 12px; color: #64748b; flex-shrink: 0; }
        .ap-meta-select {
          padding: 5px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 13px;
          background: #fff;
          color: #475569;
          min-width: 0;
          flex: 1;
          outline: none;
          cursor: pointer;
        }
        .ap-meta-select:focus { border-color: #4361ee; }
        .ap-meta-select:disabled { background: #f8fafc; color: #94a3b8; cursor: default; }
        .ap-meta-value { font-weight: 700; color: #1e293b; font-size: 14px; }
        .ap-meta-hint { font-size: 12px; color: #94a3b8; font-weight: 400; }
        .ap-meta-item-targets { flex: 1.2; }

        /* ===== LANGUAGE ROW ===== */
        .ap-target-block { margin-bottom: 22px; }
        .ap-lang-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 14px;
        }
        .ap-lang-pair {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .ap-lang-icon { font-size: 20px; }
        .ap-lang-label { font-size: 13px; font-weight: 600; color: #475569; }
        .ap-lang-select {
          padding: 7px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          font-size: 13px;
          background: #f8fafc;
          color: #1e293b;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }
        .ap-lang-select:focus { border-color: #4361ee; box-shadow: 0 0 0 2px rgba(67,97,238,0.08); }
        .ap-lang-arrow { color: #94a3b8; flex-shrink: 0; }
        .ap-lang-name { font-size: 13px; color: #94a3b8; font-weight: 400; }
        .ap-btn-remove-target {
          padding: 7px 18px;
          border: 1.5px solid #ef4444;
          border-radius: 8px;
          background: #fff;
          color: #ef4444;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          width: auto;
        }
        .ap-btn-remove-target:hover { background: #fef2f2; }

        /* ===== TASK TABLE ===== */
        .ap-task-table-wrap { overflow-x: auto; margin-bottom: 4px; }
        .ap-task-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .ap-task-table thead th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 600;
          font-size: 12px;
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1.5px solid #e2e8f0;
          white-space: nowrap;
        }
        .ap-task-table tbody td {
          padding: 0;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }
        .ap-cell-input {
          width: 100%;
          padding: 11px 12px;
          border: none;
          font-size: 13px;
          background: transparent;
          color: #1e293b;
          outline: none;
          text-align: center;
        }
        .ap-cell-input:focus { background: #f8fafc; }
        .ap-cell-select {
          width: 100%;
          padding: 11px 12px;
          border: none;
          font-size: 13px;
          background: transparent;
          color: #1e293b;
          outline: none;
          cursor: pointer;
        }
        .ap-cell-select:focus { background: #f8fafc; }
        .ap-cell-currency { font-weight: 600; text-align: center; }
        .ap-cell-fees {
          padding: 11px 12px;
          text-align: center;
          font-weight: 700;
          color: #1e293b;
        }
        .ap-cell-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 6px;
        }

        /* ===== ICON BUTTONS ===== */
        .ap-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .ap-icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .ap-icon-btn-blue {
          background: #eef1ff;
          color: #4361ee;
        }
        .ap-icon-btn-blue:hover:not(:disabled) { background: #dce2ff; }
        .ap-icon-btn-red {
          background: #fef2f2;
          color: #ef4444;
        }
        .ap-icon-btn-red:hover:not(:disabled) { background: #fee2e2; }

        .ap-btn-add-target {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 20px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          background: #fff;
          color: #475569;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          margin-top: 8px;
          width: auto;
        }
        .ap-btn-add-target:hover { background: #f8fafc; border-color: #4361ee; color: #4361ee; }

        /* ===== BILLING LAYOUT ===== */
        .ap-billing-layout {
          display: flex;
          gap: 40px;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .ap-billing-left { flex: 0 0 auto; }
        .ap-billing-right { flex: 0 0 auto; min-width: 300px; }
        .ap-gst-inputs { display: flex; gap: 16px; margin-top: 14px; flex-wrap: wrap; }
        .ap-gst-field {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }
        .ap-gst-input {
          width: 64px;
          padding: 7px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          text-align: center;
          font-size: 13px;
          outline: none;
        }
        .ap-gst-input:focus { border-color: #4361ee; }

        /* ===== SUMMARY TABLE ===== */
        .ap-summary-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }
        .ap-summary-table td {
          padding: 11px 18px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
        }
        .ap-summary-table tr:last-child td { border-bottom: none; }
        .ap-summary-label { color: #64748b; font-weight: 600; white-space: nowrap; }
        .ap-summary-value { text-align: right; color: #1e293b; font-weight: 600; }
        .ap-summary-value-other { display: flex; align-items: center; gap: 0; }
        .ap-other-label-input {
          width: 90px;
          padding: 6px 8px;
          border: none;
          border-right: 1px solid #e2e8f0;
          font-size: 13px;
          outline: none;
          color: #64748b;
          background: transparent;
        }
        .ap-other-amount-input {
          width: 80px;
          padding: 6px 10px;
          border: none;
          font-size: 13px;
          text-align: right;
          outline: none;
          color: #1e293b;
          font-weight: 600;
          background: transparent;
        }
        .ap-summary-total-row { background: #f0fdf4; }
        .ap-summary-total-label { font-weight: 800; color: #1e293b; font-size: 14px; }
        .ap-summary-total-value {
          text-align: right;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }
        .ap-currency-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          background: #dcfce7;
          color: #16a34a;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .ap-total-amount {
          font-size: 20px;
          font-weight: 800;
          color: #16a34a;
        }

        /* ===== UPLOAD ===== */
        .ap-upload-section { display: flex; flex-direction: column; gap: 18px; }
        .ap-upload-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .ap-upload-label {
          width: 120px;
          flex-shrink: 0;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          padding-top: 10px;
        }
        .ap-upload-fields { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .ap-upload-field-row { display: flex; align-items: center; gap: 8px; }
        .ap-file-input {
          flex: 1;
          padding: 9px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          background: #f8fafc;
          color: #475569;
        }

        /* ===== ACTIONS ===== */
        .ap-actions-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
        }
        .ap-btn-create {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 28px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.25);
          width: auto;
        }
        .ap-btn-create:hover { background: linear-gradient(135deg, #16a34a, #15803d); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); }
        .ap-btn-cancel {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 28px;
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          width: auto;
        }
        .ap-btn-cancel:hover { background: #e2e8f0; }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .ap-header { padding: 12px 16px; flex-wrap: wrap; gap: 12px; }
          .ap-main { padding: 0 12px; margin: 16px auto; }
          .ap-card-header { padding: 18px 18px 0; }
          .ap-card-body { padding: 16px 18px 20px; }
          .ap-form-grid-2 { grid-template-columns: 1fr; }
          .ap-meta-row { flex-direction: column; }
          .ap-meta-item { border-right: none; border-bottom: 1px solid #e2e8f0; }
          .ap-meta-item:last-child { border-bottom: none; }
          .ap-lang-row { flex-direction: column; align-items: flex-start; }
          .ap-lang-pair { flex-wrap: wrap; }
          .ap-billing-layout { flex-direction: column; }
          .ap-billing-right { min-width: 100%; }
          .ap-upload-row { flex-direction: column; }
          .ap-upload-label { width: auto; padding-top: 0; }
          .ap-field-row { flex-direction: column; gap: 18px; }
        }

        /* ===== SCROLLBAR ===== */
        .ap-page ::-webkit-scrollbar { width: 6px; height: 6px; }
        .ap-page ::-webkit-scrollbar-track { background: transparent; }
        .ap-page ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .ap-page ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
