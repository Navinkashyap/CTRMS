import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  User,
  Plus,
  Eye,
  Edit,
  Trash2,
  X
} from 'lucide-react';

const initialInvoices = [
  { invoiceNo: 'INV-001', vendor: 'Diwakar Mani', totalAmount: '12,500', status: 'Paid', invoiceDate: '2026-03-01', dueDate: '2026-03-15' },
  { invoiceNo: 'INV-002', vendor: 'Nasim Zaman', totalAmount: '8,400', status: 'Pending', invoiceDate: '2026-03-10', dueDate: '2026-03-24' },
];

export default function InvoiceList() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [filters, setFilters] = useState({
    invoiceNo: '',
    vendor: '',
    status: 'Status'
  });

  const [formData, setFormData] = useState({
    invoiceNo: '',
    vendor: '',
    totalAmount: '',
    status: 'Pending',
    invoiceDate: '',
    dueDate: ''
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesInvoiceNo = invoice.invoiceNo.toLowerCase().includes(filters.invoiceNo.toLowerCase());
    const matchesVendor = invoice.vendor.toLowerCase().includes(filters.vendor.toLowerCase());
    const matchesStatus = filters.status === 'Status' || invoice.status === filters.status;
    return matchesInvoiceNo && matchesVendor && matchesStatus;
  });

  const handleCreate = () => {
    setEditingInvoice(null);
    setFormData({ invoiceNo: `INV-${Math.floor(Math.random() * 1000)}`, vendor: '', totalAmount: '', status: 'Pending', invoiceDate: '', dueDate: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({ ...invoice });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingInvoice) {
      setInvoices(invoices.map(inv => inv.invoiceNo === editingInvoice.invoiceNo ? { ...formData } : inv));
    } else {
      setInvoices([...invoices, { ...formData }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700">
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* Premium Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/60 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent italic text-left">
              Invoice List
            </h1>
            <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Manage and track all your vendor invoices and payments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 ml-auto md:ml-0">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-2px] transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </button>
          </div>
        </div>

        {/* Invoice Table Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden relative border-t-4 border-t-indigo-600">
          <div className="overflow-x-auto custom-scrollbarThin">
            <table className="w-full text-left text-[13px] border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 font-black text-slate-700 uppercase tracking-wider text-[11px] border-r border-slate-100 w-12 text-center text-left">#</th>
                  <th className="px-6 py-4 border-r border-slate-100 min-w-[200px] text-left">
                    <div className="space-y-2">
                      <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Invoice No.</span>
                      <div className="relative group">
                        <input
                          type="text"
                          placeholder=""
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                          value={filters.invoiceNo}
                          onChange={(e) => setFilters({ ...filters, invoiceNo: e.target.value })}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-4 border-r border-slate-100 min-w-[250px] text-left">
                    <div className="space-y-2 text-left">
                      <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Vendor</span>
                      <div className="relative group">
                        <input
                          type="text"
                          placeholder=""
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                          value={filters.vendor}
                          onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-4 border-r border-slate-100 text-left">
                    <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Total Amount</span>
                  </th>
                  <th className="px-6 py-4 border-r border-slate-100 min-w-[150px] text-left">
                    <div className="space-y-2">
                      <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Status</span>
                      <select
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-sm cursor-pointer appearance-none relative"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      >
                        <option>Status</option>
                        <option>Paid</option>
                        <option>Pending</option>
                        <option>Overdue</option>
                        <option>Draft</option>
                      </select>
                    </div>
                  </th>
                  <th className="px-6 py-4 border-r border-slate-100 text-left">
                    <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Invoice Date</span>
                  </th>
                  <th className="px-6 py-4 border-r border-slate-100 text-left">
                    <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Due Date</span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice, idx) => (
                    <tr key={idx} className="group hover:bg-indigo-50/20 transition-all duration-200">
                      <td className="px-6 py-4 text-center border-r border-slate-50">
                        <span className="font-bold text-slate-600">{idx + 1}</span>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-50 text-left">
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-100 ">
                          {invoice.invoiceNo}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-50 text-left">
                        <span className="font-extrabold text-slate-900">{invoice.vendor}</span>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-50 text-left">
                        <span className="font-bold text-slate-700 ">₹{invoice.totalAmount}</span>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-50 text-left">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            invoice.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              'bg-rose-100 text-rose-700 border border-rose-200'
                          }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-50 text-left">
                        <span className="text-slate-500 font-medium ">{invoice.invoiceDate}</span>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-50 text-left">
                        <span className="text-slate-500 font-medium ">{invoice.dueDate}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => alert(`Viewing PDF for ${invoice.invoiceNo}`)}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all outline-none"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all outline-none"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-dashed border-slate-200">
                          <FileText className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium tracking-tight">
                          Currently, there are no invoice available.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredInvoices.length > 0 && (
            <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                Showing <span className="text-slate-900 font-black">{filteredInvoices.length}</span> Invoices
              </p>
              <div className="flex items-center gap-1">
                <button className="p-2 text-slate-600 hover:text-indigo-600 transition-colors disabled:opacity-30">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs shadow-lg shadow-indigo-100">1</button>
                <button className="p-2 text-slate-600 hover:text-indigo-600 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
                  {editingInvoice ? 'Edit Invoice' : 'New Invoice'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Financial Records Management</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Vendor Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Enter vendor name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Amount (₹)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Status</label>
                  <select
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                    <option>Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Invoice Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Due Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 hover:translate-y-[-2px] transition-all active:scale-95"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbarThin::-webkit-scrollbar { height: 2px; }
        .custom-scrollbarThin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
