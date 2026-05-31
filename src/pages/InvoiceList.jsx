import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { getInvoices, deleteInvoice } from '../lib/invoiceApi';

export default function InvoiceList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    invoiceNo: '',
    vendor: '',
    status: 'Status',
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      console.error('Failed to fetch invoices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (id, invoiceNumber) => {
    if (!window.confirm(`Delete invoice ${invoiceNumber}?`)) return;
    try {
      await deleteInvoice(id);
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete invoice');
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesInvoiceNo = (invoice.invoiceNumber || '').toLowerCase().includes(filters.invoiceNo.toLowerCase());
    const matchesVendor = (invoice.billToCompany || '').toLowerCase().includes(filters.vendor.toLowerCase());
    const matchesStatus = filters.status === 'Status' || invoice.status === filters.status;
    return matchesInvoiceNo && matchesVendor && matchesStatus;
  });

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
              Manage and track all your client invoices and payments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 ml-auto md:ml-0">
            <button
              onClick={() => navigate('/invoice/add-invoice')}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-2px] transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </button>
          </div>
        </div>

        {/* Invoice Table Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden relative border-t-4 border-t-indigo-600">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Loading invoices…</p>
              </div>
            </div>
          ) : (
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
                        <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Client</span>
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
                    <th className="px-6 py-4 text-center">
                      <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice, idx) => (
                      <tr key={invoice._id} className="group hover:bg-indigo-50/20 transition-all duration-200">
                        <td className="px-6 py-4 text-center border-r border-slate-50">
                          <span className="font-bold text-slate-600">{idx + 1}</span>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-50 text-left">
                          <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-100 ">
                            {invoice.invoiceNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-50 text-left">
                          <span className="font-extrabold text-slate-900">{invoice.billToCompany || '—'}</span>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-50 text-left">
                          <span className="font-bold text-slate-700 ">
                            {invoice.currency || '₹'} {(invoice.totalAmount || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-50 text-left">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            invoice.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            invoice.status === 'Draft' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                            'bg-rose-100 text-rose-700 border border-rose-200'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-50 text-left">
                          <span className="text-slate-500 font-medium ">
                            {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-IN') : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/invoice/view-invoice/${invoice._id}`)}
                              className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all outline-none"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate('/invoice/add-invoice', { state: { invoiceId: invoice._id } })}
                              className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all outline-none"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(invoice._id, invoice.invoiceNumber)}
                              className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all outline-none"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-dashed border-slate-200">
                            <FileText className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-slate-500 font-medium tracking-tight">
                            Currently, there are no invoices available.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

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

      <style>{`
        .custom-scrollbarThin::-webkit-scrollbar { height: 2px; }
        .custom-scrollbarThin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
