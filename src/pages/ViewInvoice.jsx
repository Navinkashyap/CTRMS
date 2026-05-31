import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import { getInvoice } from '../lib/invoiceApi';

export default function ViewInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await getInvoice(id);
        setInvoice(data);
      } catch (err) {
        console.error('Failed to fetch invoice:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">
        Invoice not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-20 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Invoices
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
        </div>

        {/* INVOICE PAPER */}
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden print:shadow-none print:border-none print:rounded-none printable-invoice">
          
          {/* Top Brand & Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-100">
            <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center">
              <h2 className="text-4xl font-black tracking-tight text-blue-700" style={{ fontFamily: 'Georgia, serif' }}>
                Perfectrans<sup className="text-sm align-super text-blue-500">™</sup>
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">A Brand of Convaq Technologies Pvt. Ltd.</p>
            </div>
            <div className="p-8 md:p-10 bg-slate-50/50 flex flex-col justify-center">
              <div className="space-y-4 max-w-sm ml-auto w-full">
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Date</span>
                  <span className="font-bold text-slate-700 text-sm">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-IN') : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Invoice #</span>
                  <span className="font-black text-indigo-700 text-lg">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Supplier No.</span>
                  <span className="font-bold text-slate-700 text-sm">{invoice.supplierNo || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Status</span>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                    invoice.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    invoice.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* From & Bill To */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-100">
            <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-slate-100">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">From</h3>
              <p className="font-black text-xl text-slate-800">{invoice.fromCompany}</p>
              <div className="mt-4 space-y-1.5 text-sm text-slate-600 font-medium">
                <p>{invoice.fromAddress}</p>
                <p>Phone: <span className="text-slate-800">{invoice.fromPhone}</span></p>
                <p>Email: <a href={`mailto:${invoice.fromEmail}`} className="text-indigo-600 hover:text-indigo-800 transition-colors">{invoice.fromEmail}</a></p>
                <p>Website: <a href={`https://${invoice.fromWebsite}`} className="text-indigo-600 hover:text-indigo-800 transition-colors">{invoice.fromWebsite}</a></p>
                <p className="mt-4 inline-block bg-slate-100 px-3 py-1 rounded-md text-xs font-bold text-slate-700">GSTIN: {invoice.fromGSTIN}</p>
              </div>
            </div>
            <div className="p-8 md:p-10">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Bill To</h3>
              <p className="font-black text-xl text-slate-800">{invoice.billToCompany}</p>
              <div className="mt-4 space-y-1.5 text-sm text-slate-600 font-medium">
                {invoice.billToAddress && <p className="whitespace-pre-wrap">{invoice.billToAddress}</p>}
                {invoice.billToPhone && <p>Phone: <span className="text-slate-800">{invoice.billToPhone}</span></p>}
                {invoice.billToEmail && <p>Email: <a href={`mailto:${invoice.billToEmail}`} className="text-indigo-600 hover:text-indigo-800 transition-colors">{invoice.billToEmail}</a></p>}
                {invoice.billToGSTIN && <p className="mt-4 inline-block bg-slate-100 px-3 py-1 rounded-md text-xs font-bold text-slate-700">GSTIN: {invoice.billToGSTIN}</p>}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs w-20 text-center">No.</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs">Particulars</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs text-right w-48">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => (
                    <tr key={item._id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5 text-center font-bold text-slate-400">{item.sNo || idx + 1}</td>
                      <td className="px-8 py-5 text-slate-700 font-medium">{item.particulars}</td>
                      <td className="px-8 py-5 text-right font-black text-slate-900">
                        {invoice.currency} {item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-8 py-12 text-center text-slate-400 font-medium">No items found in this invoice.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-slate-200 flex flex-col md:flex-row">
            <div className="flex-1 p-8 md:p-10 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
               <div className="h-full flex flex-col justify-end">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notes / Terms</p>
                 <p className="text-sm text-slate-600 font-medium max-w-sm">
                   Please review all details before processing payment. Thank you for doing business with us!
                 </p>
               </div>
            </div>
            <div className="w-full md:w-96 bg-slate-50">
              <div className="p-8 md:p-10 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500">Subtotal</span>
                  <span className="font-black text-slate-900">{invoice.currency} {(invoice.subtotal || 0).toFixed(2)}</span>
                </div>
                {invoice.gstEnabled && invoice.cgstAmount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-500">CGST ({invoice.cgstPercent}%)</span>
                    <span className="font-bold text-slate-700">{invoice.currency} {invoice.cgstAmount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.gstEnabled && invoice.sgstAmount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-500">SGST ({invoice.sgstPercent}%)</span>
                    <span className="font-bold text-slate-700">{invoice.currency} {invoice.sgstAmount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.gstEnabled && invoice.igstAmount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-500">IGST ({invoice.igstPercent}%)</span>
                    <span className="font-bold text-slate-700">{invoice.currency} {invoice.igstAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-6 mt-4 border-t-2 border-slate-200 border-dashed">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Total</span>
                    <span className="text-3xl font-black text-indigo-700">{invoice.currency} {(invoice.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Info */}
          <div className="p-8 md:p-10 border-t border-slate-100 bg-slate-900 text-white rounded-b-[2rem] print:rounded-none">
            <h4 className="font-black text-indigo-400 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              Bank Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6 text-sm">
              {invoice.bankGSTIN && <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">GSTIN</p><p className="font-medium text-slate-100">{invoice.bankGSTIN}</p></div>}
              {invoice.sacCode && <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">SAC Code</p><p className="font-medium text-slate-100">{invoice.sacCode}</p></div>}
              {invoice.panNo && <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">PAN No.</p><p className="font-medium text-slate-100">{invoice.panNo}</p></div>}
              {invoice.accountHolderName && <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">A/c Name</p><p className="font-medium text-slate-100">{invoice.accountHolderName}</p></div>}
              {invoice.accountNumber && <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">Account No</p><p className="font-medium text-slate-100">{invoice.accountNumber}</p></div>}
              {invoice.bankName && <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">Bank Name</p><p className="font-medium text-slate-100">{invoice.bankName}</p></div>}
              {invoice.branchAddress && <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">Branch</p><p className="font-medium text-slate-100">{invoice.branchAddress}</p></div>}
              {invoice.ifscCode && <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">IFSC Code</p><p className="font-medium text-slate-100">{invoice.ifscCode}</p></div>}
              {invoice.swiftCode && <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">Swift Code</p><p className="font-medium text-slate-100">{invoice.swiftCode}</p></div>}
              {invoice.micrCode && <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">MICR Code</p><p className="font-medium text-slate-100">{invoice.micrCode}</p></div>}
              {invoice.accountType && <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">Account Type</p><p className="font-medium text-slate-100">{invoice.accountType}</p></div>}
              {invoice.paypalEmail && <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">PayPal</p><p className="font-medium text-slate-100">{invoice.paypalEmail}</p></div>}
              {invoice.payoneerEmail && <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">Payoneer</p><p className="font-medium text-slate-100">{invoice.payoneerEmail}</p></div>}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media print {
          body {
            background-color: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .printable-invoice {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .min-h-screen {
            min-height: auto !important;
            background: white !important;
            padding-bottom: 0 !important;
          }
          .max-w-5xl {
            max-width: 100% !important;
            padding: 0 !important;
          }
          nav, aside, header { 
            display: none !important; 
          }
          .bg-slate-900 {
            background-color: #0f172a !important; /* Force dark background */
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .bg-slate-50 {
            background-color: #f8fafc !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
