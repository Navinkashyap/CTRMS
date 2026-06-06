import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, MinusCircle, Save } from 'lucide-react';
import { getClients } from '../lib/clientApi';
import { getProjects } from '../lib/projectApi';
import { createInvoice, updateInvoice, getInvoice, getNextInvoiceNumber } from '../lib/invoiceApi';

const EMPTY_ITEMS = Array.from({ length: 10 }, (_, i) => ({
  sNo: i + 1,
  particulars: '',
  amount: 0,
}));

const DEFAULT_FROM = {
  fromCompany: 'Convaq Technologies Pvt. Ltd.',
  fromAddress: 'B-11, Sector 65, Noida, IN 2001301',
  fromPhone: '+91-120-4280-274',
  fromEmail: 'accounts@perfectrans.com',
  fromWebsite: 'www.perfectrans.com',
  fromGSTIN: '09AAGCC0048P1ZD',
};

const DEFAULT_BANK = {
  bankGSTIN: '09AAGCC0048P1ZD',
  sacCode: '00440153',
  panNo: 'AAGCC0048P',
  accountHolderName: 'CONVAQ TECHNOLOGIES PRIVATE LIMITED',
  accountNumber: '000705041421',
  bankName: 'ICICI Bank',
  branchAddress: '9A Phelps, Connaught Place, New Delhi-110001',
  ifscCode: 'ICIC0000007',
  swiftCode: 'ICICINBBCTS',
  micrCode: '110229002',
  accountType: 'Current',
  paypalEmail: 'paypal@perfectrans.com',
  payoneerEmail: '',
};

export default function AddInvoice() {
  const navigate = useNavigate();
  const location = useLocation();

  const editId = location.state?.invoiceId;
  const isEditMode = Boolean(editId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    supplierNo: 'N/A',
    ...DEFAULT_FROM,
    client: '',
    billToCompany: '',
    billToAddress: '',
    billToEmail: '',
    billToPhone: '',
    billToGSTIN: '',
    items: EMPTY_ITEMS.map((item) => ({ ...item })),
    gstEnabled: false,
    cgstPercent: 9,
    sgstPercent: 9,
    igstPercent: 18,
    currency: 'INR',
    status: 'Pending',
    project: '',
    ...DEFAULT_BANK,
  });

  // Fetch masters
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [clientsRes, projectsRes] = await Promise.all([getClients(), getProjects()]);
        setClients(clientsRes);
        setProjects(projectsRes);

        if (isEditMode) {
          const inv = await getInvoice(editId);
          setFormData({
            invoiceNumber: inv.invoiceNumber || '',
            invoiceDate: inv.invoiceDate ? inv.invoiceDate.split('T')[0] : '',
            supplierNo: inv.supplierNo || 'N/A',
            fromCompany: inv.fromCompany || DEFAULT_FROM.fromCompany,
            fromAddress: inv.fromAddress || DEFAULT_FROM.fromAddress,
            fromPhone: inv.fromPhone || DEFAULT_FROM.fromPhone,
            fromEmail: inv.fromEmail || DEFAULT_FROM.fromEmail,
            fromWebsite: inv.fromWebsite || DEFAULT_FROM.fromWebsite,
            fromGSTIN: inv.fromGSTIN || DEFAULT_FROM.fromGSTIN,
            client: inv.client?._id || inv.client || '',
            billToCompany: inv.billToCompany || '',
            billToAddress: inv.billToAddress || '',
            billToEmail: inv.billToEmail || '',
            billToPhone: inv.billToPhone || '',
            billToGSTIN: inv.billToGSTIN || '',
            items: inv.items && inv.items.length > 0
              ? [...inv.items, ...EMPTY_ITEMS.slice(inv.items.length)].slice(0, 10)
              : EMPTY_ITEMS.map((item) => ({ ...item })),
            gstEnabled: inv.gstEnabled || false,
            cgstPercent: inv.cgstPercent ?? 9,
            sgstPercent: inv.sgstPercent ?? 9,
            igstPercent: inv.igstPercent ?? 18,
            currency: inv.currency || 'INR',
            status: inv.status || 'Pending',
            project: inv.project?._id || inv.project || '',
            bankGSTIN: inv.bankGSTIN || DEFAULT_BANK.bankGSTIN,
            sacCode: inv.sacCode || DEFAULT_BANK.sacCode,
            panNo: inv.panNo || DEFAULT_BANK.panNo,
            accountHolderName: inv.accountHolderName || DEFAULT_BANK.accountHolderName,
            accountNumber: inv.accountNumber || DEFAULT_BANK.accountNumber,
            bankName: inv.bankName || DEFAULT_BANK.bankName,
            branchAddress: inv.branchAddress || DEFAULT_BANK.branchAddress,
            ifscCode: inv.ifscCode || DEFAULT_BANK.ifscCode,
            swiftCode: inv.swiftCode || DEFAULT_BANK.swiftCode,
            micrCode: inv.micrCode || DEFAULT_BANK.micrCode,
            accountType: inv.accountType || DEFAULT_BANK.accountType,
            paypalEmail: inv.paypalEmail || DEFAULT_BANK.paypalEmail,
            payoneerEmail: inv.payoneerEmail || DEFAULT_BANK.payoneerEmail,
          });
        } else {
          try {
            const { invoiceNumber } = await getNextInvoiceNumber();
            setFormData((prev) => ({ ...prev, invoiceNumber }));
          } catch {
            // fallback
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [editId, isEditMode]);

  // When client changes, auto-fill Bill To fields
  const handleClientChange = (clientId) => {
    const selected = clients.find((c) => c._id === clientId);
    setFormData((prev) => ({
      ...prev,
      client: clientId,
      project: '', // Reset project when client changes
      billToCompany: selected?.name || '',
      billToAddress: [selected?.address, selected?.city, selected?.state, selected?.zip, selected?.country].filter(Boolean).join(', ') || '',
      billToEmail: selected?.email || '',
      billToPhone: selected?.phone || '',
      billToGSTIN: selected?.gstIn || '',
    }));
  };

  // When project changes, auto-fill particulars and amount into the next empty row
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const handleProjectChange = (projectId) => {
    if (!projectId) {
      setSelectedProjectId('');
      return;
    }

    const selectedProject = projects.find((p) => p._id === projectId);
    
    if (selectedProject) {
      let particularsText = '';
      const po = selectedProject.clientPO ? `PO No: ${selectedProject.clientPO}` : '';
      const name = selectedProject.isProgramGroup ? selectedProject.programName : selectedProject.projectName;
      const code = selectedProject.projectCode ? `Code: ${selectedProject.projectCode}` : '';
      
      particularsText = [po, name, code].filter(Boolean).join(' / ');

      // Try to calculate total fees and words from targets/tasks if available
      let totalFees = 0;
      let totalWords = 0;
      let rate = 0;

      if (selectedProject.targets && selectedProject.targets.length > 0) {
        selectedProject.targets.forEach(target => {
          if (target.tasks && target.tasks.length > 0) {
            target.tasks.forEach(task => {
              totalFees += Number(task.fees) || 0;
              if (task.unit === 'Words') {
                totalWords += Number(task.quantity) || 0;
              }
              if (task.rate) rate = task.rate; // just taking last rate for particulars if needed
            });
          }
        });
      }

      if (totalWords > 0) {
        particularsText += ` / ${totalWords} Words`;
      }
      if (rate > 0) {
        particularsText += ` / Rate: ${rate}`;
      }

      const amount = totalFees > 0 ? totalFees : (Number(selectedProject.amount) || 0);

      const newItems = [...formData.items];
      
      // Find the first empty row
      let emptyIndex = newItems.findIndex(item => item.particulars.trim() === '' && (!item.amount || Number(item.amount) === 0));
      
      if (emptyIndex === -1) {
        // No empty row found, append a new one
        emptyIndex = newItems.length;
        newItems.push({ sNo: emptyIndex + 1, particulars: '', amount: 0 });
      }

      newItems[emptyIndex] = {
        ...newItems[emptyIndex],
        particulars: particularsText,
        amount: amount
      };

      setFormData((prev) => ({
        ...prev,
        project: projectId, // Keeps reference to the last added project for the DB
        items: newItems
      }));
      
      // Reset dropdown so they can pick another project
      setSelectedProjectId('');
    }
  };

  // Determine if client is from UP (same state logic as AddProject.jsx)
  const selectedClient = clients.find((c) => c._id === formData.client);
  const clientState = selectedClient?.state?.trim().toLowerCase() || '';
  const isUP = clientState === 'up' || clientState === 'uttar pradesh';

  // Calculate totals
  const subtotal = formData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  if (formData.gstEnabled) {
    if (isUP) {
      cgstAmount = subtotal * (Number(formData.cgstPercent) / 100);
      sgstAmount = subtotal * (Number(formData.sgstPercent) / 100);
    } else {
      igstAmount = subtotal * (Number(formData.igstPercent) / 100);
    }
  }
  const totalAmount = subtotal + cgstAmount + sgstAmount + igstAmount;

  // Item handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index] = { ...updated[index], [field]: field === 'amount' ? Number(value) || 0 : value };
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { sNo: prev.items.length + 1, particulars: '', amount: 0 }],
    }));
  };

  const removeItemRow = (index) => {
    if (formData.items.length <= 1) return;
    const updated = formData.items.filter((_, i) => i !== index).map((item, i) => ({ ...item, sNo: i + 1 }));
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Submit
  const handleSubmit = async () => {
    if (!formData.billToCompany.trim()) {
      alert('Please select a client (Bill To)');
      return;
    }

    const payload = {
      ...formData,
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount,
      items: formData.items.filter((item) => item.particulars.trim() || item.amount > 0),
    };

    try {
      setSaving(true);
      if (isEditMode) {
        await updateInvoice(editId, payload);
        alert('Invoice updated successfully!');
      } else {
        await createInvoice(payload);
        alert('Invoice created successfully!');
      }
      navigate('/invoice');
    } catch (err) {
      console.error(err);
      alert('Failed to save invoice.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading invoice…</p>
        </div>
      </div>
    );
  }

  const cellInput = 'w-full px-2 py-1.5 bg-white border-0 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400';
  const labelCell = 'px-3 py-2 text-sm bg-slate-50 font-bold text-slate-700 border-r border-slate-300 whitespace-nowrap';
  const valueCell = 'px-3 py-2 text-sm';

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      <div className="max-w-[1100px] mx-auto p-4 md:p-6 space-y-6">

        {/* Back + Title */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/invoice')}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">
            {isEditMode ? 'Edit Invoice' : 'Create Invoice'}
          </h1>
        </div>

        {/* ── INVOICE DOCUMENT ── */}
        <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm">

          {/* Top Header: Perfectrans + Date/InvoiceNo/Supplier */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-300">
            {/* Left: Brand */}
            <div className="p-5 border-b md:border-b-0 md:border-r border-slate-300">
              <h2 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Georgia, serif', color: '#2563eb' }}>
                Perfectrans<sup className="text-xs align-super">™</sup>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">A Brand of Convaq Technologies Pvt. Ltd.</p>
            </div>

            {/* Right: Date / Invoice # / Supplier */}
            <div className="p-0">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className={labelCell}>DATE:</td>
                    <td className="p-0">
                      <input
                        type="date"
                        value={formData.invoiceDate}
                        onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                        className={cellInput}
                      />
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className={labelCell}>INVOICE #</td>
                    <td className="px-3 py-2 text-sm font-bold text-slate-800">{formData.invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td className={labelCell}>Supplier No.</td>
                    <td className="p-0">
                      <input
                        type="text"
                        value={formData.supplierNo}
                        onChange={(e) => handleInputChange('supplierNo', e.target.value)}
                        className={cellInput}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* From / Bill To */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-300">
            {/* FROM */}
            <div className="p-4 border-b md:border-b-0 md:border-r border-slate-300 text-sm space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">From:</p>
              <p className="font-extrabold text-slate-900">{formData.fromCompany}</p>
              <p className="text-slate-600">{formData.fromAddress}</p>
              <p className="text-slate-600">Phone: {formData.fromPhone}</p>
              <p className="text-slate-600">
                e-mail: <a href={`mailto:${formData.fromEmail}`} className="text-blue-600 underline">{formData.fromEmail}</a>
              </p>
              <p className="text-slate-600">
                Website: <a href={`https://${formData.fromWebsite}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">{formData.fromWebsite}</a>
              </p>
              <p className="text-slate-600">GSTIN: {formData.fromGSTIN}</p>
            </div>

            {/* BILL TO */}
            <div className="p-4 text-sm space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bill to:</p>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">Select Client</label>
                <select
                  value={formData.client}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select Client</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Project Dropdown */}
              {formData.client && (
                <div className="space-y-1.5 mt-2">
                  <label className="block text-xs font-bold text-indigo-600">Add Project as Line Item</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-indigo-50 border border-indigo-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Select a Project to add...</option>
                    {projects
                      .filter((p) => p.client === formData.client || p.client?._id === formData.client)
                      .map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.isProgramGroup ? p.programName : p.projectName} {p.clientPO ? `(PO: ${p.clientPO})` : ''}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 gap-1.5 mt-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 w-20 shrink-0">Company</span>
                  <input
                    type="text"
                    value={formData.billToCompany}
                    onChange={(e) => handleInputChange('billToCompany', e.target.value)}
                    className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm"
                    placeholder="Company Name"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 w-20 shrink-0">Address:</span>
                  <input
                    type="text"
                    value={formData.billToAddress}
                    onChange={(e) => handleInputChange('billToAddress', e.target.value)}
                    className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm"
                    placeholder="Address"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 w-20 shrink-0">Email:</span>
                  <input
                    type="text"
                    value={formData.billToEmail}
                    onChange={(e) => handleInputChange('billToEmail', e.target.value)}
                    className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm"
                    placeholder="Email"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 w-20 shrink-0">Phone:</span>
                  <input
                    type="text"
                    value={formData.billToPhone}
                    onChange={(e) => handleInputChange('billToPhone', e.target.value)}
                    className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm"
                    placeholder="Phone"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 w-20 shrink-0">GSTIN:</span>
                  <input
                    type="text"
                    value={formData.billToGSTIN}
                    onChange={(e) => handleInputChange('billToGSTIN', e.target.value)}
                    className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm"
                    placeholder="GSTIN"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Items Table ── */}
          <div className="border-b border-slate-300">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-3 py-2.5 text-left font-bold text-slate-700 w-14">No.</th>
                    <th className="border border-slate-300 px-3 py-2.5 text-left font-bold text-slate-700">Particulars</th>
                    <th className="border border-slate-300 px-3 py-2.5 text-right font-bold text-slate-700 w-36">Amount</th>
                    <th className="border border-slate-300 px-3 py-2.5 text-center font-bold text-slate-700 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => (
                    <tr key={idx} className="bg-white hover:bg-slate-50/50">
                      <td className="border border-slate-300 px-3 py-1 text-center font-semibold text-slate-600">
                        {item.sNo}
                      </td>
                      <td className="border border-slate-300 p-0">
                        <input
                          type="text"
                          value={item.particulars}
                          onChange={(e) => handleItemChange(idx, 'particulars', e.target.value)}
                          className={cellInput}
                          placeholder={idx === 0 ? 'PO No. / PM / Project Code / Words / Lang Pair / Rate / Fees' : ''}
                        />
                      </td>
                      <td className="border border-slate-300 p-0">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.amount || ''}
                          onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                          className={`${cellInput} text-right font-semibold`}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="border border-slate-300 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          disabled={formData.items.length <= 1}
                          className="text-rose-500 hover:text-rose-700 disabled:opacity-20 p-1"
                          title="Remove row"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>
          </div>

          {/* ── GST & Totals ── */}
          <div className="flex flex-col lg:flex-row border-b border-slate-300">
            {/* Left: GST Toggle */}
            <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-slate-300 space-y-3">
              <label className="block text-sm font-bold text-slate-700">GST</label>
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

              {/* Status */}
              <div className="pt-3 space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Right: Totals Table */}
            <div className="w-full lg:max-w-sm">
              <table className="w-full border-collapse text-sm">
                <tbody>
                  <tr>
                    <td className="border border-slate-300 bg-slate-50 px-4 py-2.5 font-bold text-slate-700">SUBTOTAL</td>
                    <td className="border border-slate-300 px-4 py-2.5 text-right font-semibold">
                      {formData.currency} {subtotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 bg-slate-50 px-4 py-2.5 font-bold text-slate-700">
                      CGST ({formData.cgstPercent}%)
                    </td>
                    <td className="border border-slate-300 px-4 py-2.5 text-right font-semibold">
                      {formData.currency} {cgstAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 bg-slate-50 px-4 py-2.5 font-bold text-slate-700">
                      SGST ({formData.sgstPercent}%)
                    </td>
                    <td className="border border-slate-300 px-4 py-2.5 text-right font-semibold">
                      {formData.currency} {sgstAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 bg-slate-50 px-4 py-2.5 font-bold text-slate-700">
                      IGST ({formData.igstPercent}%)
                    </td>
                    <td className="border border-slate-300 px-4 py-2.5 text-right font-semibold">
                      {formData.currency} {igstAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border-2 border-green-500 px-4 py-3 font-black text-slate-900 text-sm">
                      TOTAL (in {formData.currency})
                    </td>
                    <td className="border-2 border-green-500 px-4 py-3 text-right font-black text-lg text-green-700">
                      {formData.currency} {totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Bank Info Section ── */}
          <div className="p-4">
            <div className="border border-slate-300 rounded overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-300">
                <h3 className="text-sm font-black text-slate-800">Bank info</h3>
              </div>
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {[
                    ['GSTIN', 'bankGSTIN'],
                    ['SAC Code', 'sacCode'],
                    ['PAN No.', 'panNo'],
                    ['A/c holder\'s name:', 'accountHolderName'],
                    ['Account number:', 'accountNumber'],
                    ['Bank Name:', 'bankName'],
                    ['Branch Address:', 'branchAddress'],
                    ['IFSC code:', 'ifscCode'],
                    ['Swift Code:', 'swiftCode'],
                    ['MICR Code', 'micrCode'],
                    ['Account type:', 'accountType'],
                    ['PayPal:', 'paypalEmail'],
                    ['Payoneer:', 'payoneerEmail'],
                  ].map(([label, field]) => (
                    <tr key={field} className="border-b border-slate-200 last:border-b-0">
                      <td className="px-4 py-1.5 bg-slate-50 font-bold text-slate-700 border-r border-slate-200 w-44 whitespace-nowrap">
                        {label}
                      </td>
                      <td className="p-0">
                        <input
                          type="text"
                          value={formData[field]}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className={cellInput}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ── Action Buttons ── */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 text-sm bg-[#3f5d9a] hover:bg-[#344d7e] text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Invoice'}
          </button>
          <button
            onClick={() => navigate('/invoice')}
            className="px-6 py-2.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Outfit', sans-serif; }
      `}</style>
    </div>
  );
}
