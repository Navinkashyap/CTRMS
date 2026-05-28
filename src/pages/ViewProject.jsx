import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MinusCircle, Plus, FolderGit2 } from 'lucide-react';
import { getProject, getProjects, updateProject } from '../lib/projectApi';
import { getClients } from '../lib/clientApi';
import { getContacts } from '../lib/contactApi';
import { getLanguages } from '../lib/languageApi';
import { getTools } from '../lib/toolApi';
import { getSpecializations } from '../lib/specializationApi';
import { getUnits } from '../lib/unitApi';

const DEFAULT_TRANSLATION_TASKS = [
  { taskName: 'Translation', rate: 1 },
  { taskName: 'Editing', rate: 0.5 },
  { taskName: 'Proofreading', rate: 0.25 },
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

const normalizeTargets = (targets = []) =>
  targets.map((t) => ({
    sourceLanguage: t.sourceLanguage?._id || t.sourceLanguage || '',
    targetLanguage: t.targetLanguage?._id || t.targetLanguage || '',
    service: t.service?._id || t.service || '',
    tasks: (t.tasks || []).map((task) => ({
      taskName: task.taskName || '',
      unit: task.unit || 'Words',
      quantity: task.quantity ?? 0,
      rate: task.rate ?? 0,
      currency: task.currency || '',
      fees: task.fees ?? calcTaskFees(task.quantity, task.rate),
      startDate: task.startDate || '',
      endDate: task.endDate || '',
      status: task.status || 'Not Started',
    })),
  }));

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

const cellInput =
  'w-full min-w-0 px-2 py-1.5 bg-white border-0 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400';
const cellSelect =
  'w-full min-w-0 px-2 py-1.5 bg-white border-0 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer';

export default function ViewProject() {
  const navigate = useNavigate();
  const { id } = useParams();



  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);

  // Masters
  const [clients, setClients] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [tools, setTools] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [programNames, setProgramNames] = useState([]);
  const [unitsList, setUnitsList] = useState([]);

  const [formData, setFormData] = useState({
    projectName: '',
    projectCode: '',
    jobType: '',
    projectManager: '',
    source: 'Outsource',
    type: 'Non Extended',
    projectStatus: 'In Progress',
    receivingDate: '',
    dueDate: '',
    dueTime: '',
    dateOfDelivery: '',
    client: '',
    clientContact: '',
    clientPO: '',
    clientProjectCode: '',
    isProgramGroup: false,
    programName: '',
    amount: '',
    description: '',
    translationTool: '',
    subjectMatter: '',
    deliverable: '',
    gstEnabled: false,
    otherCharges: 0,
    otherChargesLabel: 'None',
    targets: [],
    referenceFiles: [''],
    workingFiles: [''],
    remark: ''
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [projRes, clientsRes, contactsRes, langsRes, allProjects, toolsRes, specsRes, unitsRes] = await Promise.all([
          getProject(id),
          getClients(),
          getContacts(),
          getLanguages(),
          getProjects(),
          getTools(),
          getSpecializations(),
          getUnits(),
        ]);

        setProject(projRes);
        setClients(clientsRes);
        setContacts(contactsRes);
        setLanguages(langsRes);
        setTools(toolsRes.filter((t) => t.status === 'Active'));
        setSpecializations(specsRes.filter((s) => s.status === 'Active'));
        setUnitsList(unitsRes.filter((u) => u.status !== 'Inactive'));

        const names = [
          ...new Set(
            allProjects
              .map((p) => p.programName)
              .filter(Boolean)
          ),
        ].sort((a, b) => a.localeCompare(b));
        setProgramNames(names);

        const toDatetimeLocal = (dateString) => {
          if (!dateString) return '';
          const d = new Date(dateString);
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        };

        setFormData({
          projectName: projRes.projectName || '',
          projectCode: projRes.projectCode || '',
          jobType: projRes.jobType || '',
          projectManager: projRes.projectManager?._id || projRes.projectManager || '',
          source: projRes.source || 'Outsource',
          type: projRes.type || 'Non Extended',
          projectStatus: projRes.projectStatus || 'In Progress',
          receivingDate: toDatetimeLocal(projRes.receivingDate),
          dueDate: toDatetimeLocal(projRes.dueDate),
          dueTime: projRes.dueTime || '',
          dateOfDelivery: toDatetimeLocal(projRes.dateOfDelivery),
          client: projRes.client?._id || projRes.client || '',
          clientContact: projRes.clientContact?._id || projRes.clientContact || '',
          clientPO: projRes.clientPO || '',
          clientProjectCode: projRes.clientProjectCode || '',
          isProgramGroup: Boolean(projRes.isProgramGroup),
          programName: projRes.programName || '',
          amount: projRes.amount || '',
          description: projRes.description || '',
          translationTool: projRes.translationTool || '',
          subjectMatter: projRes.subjectMatter || '',
          deliverable: projRes.deliverable || '',
          gstEnabled: Boolean(projRes.gstEnabled),
          cgstPercent: projRes.cgstPercent ?? 9,
          sgstPercent: projRes.sgstPercent ?? 9,
          igstPercent: projRes.igstPercent ?? 18,
          otherCharges: projRes.otherCharges ?? 0,
          otherChargesLabel: projRes.otherChargesLabel || 'None',
          targets: normalizeTargets(projRes.targets),
          referenceFiles: projRes.referenceFiles?.length ? projRes.referenceFiles : [''],
          workingFiles: projRes.workingFiles?.length ? projRes.workingFiles : [''],
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
    if (formData.isProgramGroup && !formData.programName) {
      alert('Please select a program name.');
      return;
    }
    try {
      await updateProject(id, preparePayload());
      alert('Project updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to update project');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'isProgramGroup' && !value) {
        next.programName = '';
      }
      return next;
    });
  };

  const selectedClient = clients.find((c) => c._id === formData.client);
  const clientCurrency = selectedClient?.currency || 'INR';
  const clientState = selectedClient?.state?.trim().toLowerCase() || '';
  const isUP = clientState === 'up' || clientState === 'uttar pradesh';

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
    targets: formData.targets.map((target) => ({
      ...target,
      tasks: target.tasks.map((task) => ({
        ...task,
        currency: task.currency || clientCurrency,
        fees: calcTaskFees(task.quantity, task.rate),
      })),
    })),
  });

  if (loading) return <div className="text-center py-20">Loading...</div>;

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <FolderGit2 className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
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

  const renderTranslationsContent = () => {
    const th = 'border border-slate-300 bg-slate-100 px-2 py-2 text-xs font-bold text-slate-700 text-left';
    const td = 'border border-slate-300 p-0 align-middle';

    return (
      <div className="space-y-4 animate-in fade-in duration-500 mb-12">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-800">Translations</h2>
        </div>

        {/* Header metadata */}
        <div className="border border-slate-300 rounded overflow-hidden text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-300">
            <div className="flex border-b md:border-b-0 md:border-r border-slate-300">
              <span className="w-36 shrink-0 px-3 py-2 text-sm bg-slate-50 font-bold text-slate-700 border-r border-slate-300">Tool</span>
              <select
                value={formData.translationTool}
                onChange={(e) => handleInputChange('translationTool', e.target.value)}
                className={`flex-1 ${cellSelect}`}
              >
                <option value="">Select Tool</option>
                {tools.map((t) => (
                  <option key={t._id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="flex border-b md:border-b-0 md:border-r border-slate-300">
              <span className="w-36 shrink-0 px-3 py-2 text-sm bg-slate-50 font-bold text-slate-700 border-r border-slate-300">Subject Matter</span>
              <select
                value={formData.subjectMatter}
                onChange={(e) => handleInputChange('subjectMatter', e.target.value)}
                className={`flex-1 ${cellSelect}`}
              >
                <option value="">Select Subject</option>
                {specializations.map((s) => (
                  <option key={s._id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="hidden md:block"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-300">
            <div className="flex border-b md:border-b-0 md:border-r border-slate-300">
              <span className="w-36 shrink-0 px-3 py-2 text-sm bg-slate-50 font-bold text-slate-700 border-r border-slate-300">No. of Targets</span>
              <div className="flex-1 px-3 py-2 text-sm bg-white text-slate-800 font-medium">
                {formData.targets.length === 0
                  ? '0'
                  : `${formData.targets.length} (${targetSummary.join(', ') || '—'})`}
              </div>
            </div>
            <div className="hidden md:block"></div>
          </div>
          <div className="flex">
            <span className="w-36 shrink-0 px-3 py-2 text-sm bg-slate-50 font-bold text-slate-700 border-r border-slate-300">Deliverable</span>
            <textarea
              rows={3}
              value={formData.deliverable}
              onChange={(e) => handleInputChange('deliverable', e.target.value)}
              className={`flex-1 ${cellInput} resize-y`}
              placeholder="Enter deliverable details"
            />
          </div>
        </div>


        {/* Task tables per target */}
        <div className="space-y-6">
          {formData.targets.map((target, idx) => {
            const targetCode = getLangCode(target.targetLanguage, languages);
            const targetName = getLangName(target.targetLanguage, languages);

            return (
              <div key={idx} className="border border-slate-300 rounded overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border-b border-slate-300 px-4 py-2">
                  <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span>Source:</span>
                      <select
                        value={target.sourceLanguage || ''}
                        onChange={(e) => handleTargetChange(idx, 'sourceLanguage', e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded bg-white text-sm font-semibold"
                      >
                        <option value="">Select Source</option>
                        {languages.map((l) => (
                          <option key={l._id} value={l._id}>
                            {l.localeCode || l.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Target:</span>
                      <select
                        value={target.targetLanguage}
                        onChange={(e) => handleTargetChange(idx, 'targetLanguage', e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded bg-white text-sm font-semibold"
                      >
                        <option value="">Select Target</option>
                        {languages.map((l) => (
                          <option key={l._id} value={l._id}>
                            {l.localeCode || l.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {targetName && (
                      <span className="text-slate-500 font-medium">({targetName})</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTarget(idx)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    Remove Target
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[900px] text-sm">
                    <thead>
                      <tr>
                        <th className={th}>Task</th>
                        <th className={th}>Quantity</th>
                        <th className={th}>Unit</th>
                        <th className={th}>Rate</th>
                        <th className={th}>Currency</th>
                        <th className={th}>Fees</th>
                        <th className={`${th} w-20 text-center`}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {target.tasks.map((task, tIdx) => (
                        <tr key={tIdx} className="bg-white">
                          <td className={td}>
                            <input
                              type="text"
                              value={task.taskName}
                              onChange={(e) => handleTaskChange(idx, tIdx, 'taskName', e.target.value)}
                              className={cellInput}
                              placeholder="Task name"
                            />
                          </td>
                          <td className={td}>
                            <input
                              type="number"
                              min="0"
                              value={task.quantity}
                              onChange={(e) => handleTaskChange(idx, tIdx, 'quantity', e.target.value)}
                              className={`${cellInput} text-center`}
                            />
                          </td>
                          <td className={td}>
                            <select
                              value={task.unit}
                              onChange={(e) => handleTaskChange(idx, tIdx, 'unit', e.target.value)}
                              className={cellSelect}
                            >
                              {unitsList.length > 0 ? (
                                unitsList.map(u => <option key={u._id} value={u.name}>{u.name}</option>)
                              ) : (
                                <option value="Words">Words</option>
                              )}
                            </select>
                          </td>
                          <td className={td}>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={task.rate}
                              onChange={(e) => handleTaskChange(idx, tIdx, 'rate', e.target.value)}
                              className={`${cellInput} text-center`}
                            />
                          </td>
                          <td className={td}>
                            <input
                              type="text"
                              value={task.currency || ''}
                              onChange={(e) => handleTaskChange(idx, tIdx, 'currency', e.target.value.toUpperCase())}
                              className={`${cellInput} text-center font-semibold text-slate-700`}
                              placeholder={clientCurrency}
                            />
                          </td>
                          <td className={`${td} text-center font-bold text-slate-800 bg-amber-50/40`}>
                            {calcTaskFees(task.quantity, task.rate).toFixed(2)}
                          </td>
                          <td className={`${td} text-center`}>
                            <div className="flex items-center justify-center gap-1 py-1">
                              <button
                                type="button"
                                onClick={() => addTask(idx)}
                                className="w-7 h-7 rounded border border-slate-300 bg-white hover:bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center"
                                title="Add row"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeTask(idx, tIdx)}
                                disabled={target.tasks.length <= 1}
                                className="w-7 h-7 rounded border border-slate-300 bg-white hover:bg-rose-50 text-rose-600 font-bold flex items-center justify-center disabled:opacity-30"
                                title="Remove row"
                              >
                                <MinusCircle className="w-3.5 h-3.5" />
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
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-sm font-bold"
          >
            <Plus className="w-4 h-4" /> Add Target Language
          </button>
        </div>

        {/* Totals footer */}
        <div className="flex flex-col lg:flex-row gap-8 justify-between items-start pt-4 border-t border-slate-200">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">GST (Yes/No),</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gstEnabled"
                  checked={formData.gstEnabled === true}
                  onChange={() => handleInputChange('gstEnabled', true)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="text-sm font-medium">Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gstEnabled"
                  checked={formData.gstEnabled === false}
                  onChange={() => handleInputChange('gstEnabled', false)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="text-sm font-medium">No</span>
              </label>
            </div>
            {formData.gstEnabled && (
              <div className="flex items-center gap-4 mt-2">
                {isUP ? (
                  <>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      CGST (%):
                      <input
                        type="number"
                        min="0"
                        value={formData.cgstPercent}
                        onChange={(e) => handleInputChange('cgstPercent', e.target.value)}
                        className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      SGST (%):
                      <input
                        type="number"
                        min="0"
                        value={formData.sgstPercent}
                        onChange={(e) => handleInputChange('sgstPercent', e.target.value)}
                        className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                      />
                    </label>
                  </>
                ) : (
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    IGST (%):
                    <input
                      type="number"
                      min="0"
                      value={formData.igstPercent}
                      onChange={(e) => handleInputChange('igstPercent', e.target.value)}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="w-full max-w-sm border border-slate-300 rounded overflow-hidden text-sm ml-auto">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border border-slate-300 bg-slate-50 px-4 py-2 font-bold text-slate-700">Sub-Total</td>
                  <td className="border border-slate-300 px-4 py-2 text-right font-semibold">{subTotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 bg-slate-50 px-4 py-2 font-bold text-slate-700">
                    Tax {formData.gstEnabled ? (isUP ? `(CGST - ${formData.cgstPercent}% & SGST - ${formData.sgstPercent}%)` : `(IGST - ${formData.igstPercent}%)`) : ''}
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-right font-semibold">
                    {formData.gstEnabled ? taxAmount.toFixed(2) : '0.00'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 bg-slate-50 px-4 py-2 font-bold text-slate-700">Other</td>
                  <td className="border border-slate-300 p-0">
                    <div className="flex">
                      <input
                        type="text"
                        value={formData.otherChargesLabel}
                        onChange={(e) => handleInputChange('otherChargesLabel', e.target.value)}
                        className="w-1/2 px-2 py-2 border-0 border-r border-slate-200 text-sm"
                        placeholder="None"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.otherCharges}
                        onChange={(e) => handleInputChange('otherCharges', e.target.value)}
                        className="w-1/2 px-2 py-2 border-0 text-sm text-right"
                      />
                    </div>
                  </td>
                </tr>
                <tr className="bg-slate-100">
                  <td className="border border-slate-300 px-4 py-2.5 font-black text-slate-900">Total</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-right font-black text-lg text-slate-900">
                    {grandTotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload files section */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Upload files</h3>
          <p className="text-sm font-medium text-slate-500">For Translation</p>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <span className="w-32 shrink-0 font-bold text-slate-700 pt-2">Reference files</span>
              <div className="flex-1 space-y-2">
                {(formData.referenceFiles?.length ? formData.referenceFiles : ['']).map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="file"
                      onChange={(e) => handleFileFieldChange('referenceFiles', idx, e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm"
                    />
                    <button type="button" onClick={() => addFileField('referenceFiles')} className="w-8 h-8 rounded border border-slate-300 bg-white hover:bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => removeFileField('referenceFiles', idx)} disabled={(formData.referenceFiles?.length || 1) <= 1} className="w-8 h-8 rounded border border-slate-300 bg-white hover:bg-rose-50 text-rose-600 font-bold flex items-center justify-center disabled:opacity-30">
                      <MinusCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <span className="w-32 shrink-0 font-bold text-slate-700 pt-2">Working files</span>
              <div className="flex-1 space-y-2">
                {(formData.workingFiles?.length ? formData.workingFiles : ['']).map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="file"
                      onChange={(e) => handleFileFieldChange('workingFiles', idx, e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm"
                    />
                    <button type="button" onClick={() => addFileField('workingFiles')} className="w-8 h-8 rounded border border-slate-300 bg-white hover:bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => removeFileField('workingFiles', idx)} disabled={(formData.workingFiles?.length || 1) <= 1} className="w-8 h-8 rounded border border-slate-300 bg-white hover:bg-rose-50 text-rose-600 font-bold flex items-center justify-center disabled:opacity-30">
                      <MinusCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  };

  const renderCompanyContent = () => {
    return (
      <div className="space-y-5 animate-in fade-in duration-500">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-800">Project</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-4xl mx-auto py-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Project Code</label>
            <input
              type="text"
              value={formData.projectCode}
              onChange={(e) => handleInputChange('projectCode', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Status</label>
            <select
              value={formData.projectStatus}
              onChange={(e) => handleInputChange('projectStatus', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Project being created">Project being created</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Client</label>
            <select
              value={formData.client}
              onChange={(e) => handleInputChange('client', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500/20"
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
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Select Contact</option>
              {contacts.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Client Project Code</label>
            <input
              type="text"
              value={formData.clientProjectCode}
              onChange={(e) => handleInputChange('clientProjectCode', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Client PO</label>
            <input
              type="text"
              value={formData.clientPO}
              onChange={(e) => handleInputChange('clientPO', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Amount</label>
            <input
              type="text"
              placeholder="e.g. 10000"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Due Date</label>
              <input
                type="date"
                value={formData.dueDate ? formData.dueDate.slice(0, 10) : ''}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Due Time</label>
              <input
                type="time"
                value={formData.dueTime || ''}
                onChange={(e) => handleInputChange('dueTime', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-bold text-slate-700">Description</label>
            <textarea
              rows={3}
              placeholder="Enter project description..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500/20 resize-y"
            />
          </div>
          <div className="space-y-3 md:col-span-2">
            <label className="block text-sm font-bold text-slate-700">Program/Project Group</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="isProgramGroup"
                  checked={formData.isProgramGroup === true}
                  onChange={() => handleInputChange('isProgramGroup', true)}
                  className="w-5 h-5 accent-indigo-600"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="isProgramGroup"
                  checked={formData.isProgramGroup === false}
                  onChange={() => handleInputChange('isProgramGroup', false)}
                  className="w-5 h-5 accent-indigo-600"
                />
                <span>No</span>
              </label>
            </div>
          </div>
          {formData.isProgramGroup && (
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-slate-700">
                Program Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="program-name-list"
                required
                placeholder="Select or enter program name"
                value={formData.programName}
                onChange={(e) => handleInputChange('programName', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500/20"
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
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6">
        <h1 className="text-xl font-black text-slate-800 tracking-tight">
          Update Project ({project.projectId})
        </h1>
        <div className="min-h-[400px] space-y-5">
          {renderCompanyContent()}
          {renderTranslationsContent()}
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button onClick={handleUpdate} className="px-6 py-2.5 text-sm bg-[#3f5d9a] hover:bg-[#344d7e] text-white rounded-lg font-bold">Update</button>
            <button onClick={() => navigate('/projects')} className="px-6 py-2.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold">Cancel</button>
          </div>
        </div>
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
