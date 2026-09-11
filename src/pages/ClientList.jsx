import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpDown,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Filter,
  LoaderCircle,
  MoreVertical,
  Search,
  Settings,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

import { getClients } from '../lib/clientApi';

const allColumns = [
  { id: 'domain', label: 'Domain' },
  { id: 'status', label: 'Status' },
  { id: 'membership', label: 'Membership' },
  { id: 'name', label: 'Name' },
  { id: 'website', label: 'Website' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'city', label: 'City' },
  { id: 'country', label: 'Country' },
  { id: 'registrationDate', label: 'Date of Registration' },
  { id: 'currency', label: 'Currency' },
  { id: 'createdBy', label: 'Added By' },
];

const DEFAULT_VISIBLE_COLUMNS = ['domain', 'status', 'membership', 'name', 'website', 'email', 'phone', 'city', 'country', 'registrationDate'];

export default function ClientList() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [openActionId, setOpenActionId] = useState(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const savedColumns = localStorage.getItem('clientListVisibleColumns');
    if (savedColumns) {
      try {
        return JSON.parse(savedColumns);
      } catch (e) {
        return DEFAULT_VISIBLE_COLUMNS;
      }
    }
    return DEFAULT_VISIBLE_COLUMNS;
  });
  const [tempVisibleColumns, setTempVisibleColumns] = useState(visibleColumns);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Manual column widths (px), keyed by column id — lets users drag a column
  // border to resize it. Persisted so the layout survives a refresh.
  const [colWidths, setColWidths] = useState(() => {
    try {
      const saved = localStorage.getItem('clientListColWidths');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const resizingRef = useRef(null);

  const startResize = (e, colId) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = colWidths[colId] || e.currentTarget.parentElement.offsetWidth;
    resizingRef.current = { colId, startX, startWidth };

    const onMouseMove = (moveEvent) => {
      if (!resizingRef.current) return;
      const { colId: id, startX: sx, startWidth: sw } = resizingRef.current;
      const newWidth = Math.max(80, sw + (moveEvent.clientX - sx));
      setColWidths((prev) => ({ ...prev, [id]: newWidth }));
    };
    const onMouseUp = () => {
      resizingRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setColWidths((current) => {
        localStorage.setItem('clientListColWidths', JSON.stringify(current));
        return current;
      });
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };



  useEffect(() => {
    const handleClickOutside = () => setOpenActionId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);


  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = await getClients();
        setClients(data);
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Could not load clients.');
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);



  const sortedAndFilteredClients = useMemo(() => {
    let result = [...clients];
    const query = searchQuery.toLowerCase();

    if (query) {
      result = result.filter((client) => {
        return (
          (client.name || '').toLowerCase().includes(query) ||
          (client.domain || '').toLowerCase().includes(query) ||
          (client.membershipCode || '').toLowerCase().includes(query) ||
          (client.country || '').toLowerCase().includes(query) ||
          (client.city || '').toLowerCase().includes(query) ||
          (client.email || '').toLowerCase().includes(query) ||
          (client.phone || '').toLowerCase().includes(query)
        );
      });
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = (a[sortConfig.key] || '').toString().toLowerCase();
        const bVal = (b[sortConfig.key] || '').toString().toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [clients, searchQuery, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };



  const handleEdit = (client) => {
    navigate('add-client', { state: { client } });
  };

  const handleAdd = () => {
    navigate('add-client');
  };

  const toggleColumnSelection = (colId) => {
    setTempVisibleColumns((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  const applyColumnSettings = () => {
    setVisibleColumns(tempVisibleColumns);
    localStorage.setItem('clientListVisibleColumns', JSON.stringify(tempVisibleColumns));
    setIsSettingsModalOpen(false);
  };

  const renderSortableHeader = (id, label) => (
    <th
      key={id}
      style={colWidths[id] ? { width: `${colWidths[id]}px`, minWidth: `${colWidths[id]}px`, maxWidth: `${colWidths[id]}px` } : undefined}
      className="relative px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hover:bg-slate-100/50 transition-colors select-none"
    >
      <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden cursor-pointer" onClick={() => requestSort(id)}>
        <span className="truncate">{label}</span>
        <ArrowUpDown className={`w-3 h-3 shrink-0 ${sortConfig.key === id ? 'text-indigo-500' : 'text-slate-300'}`} />
      </div>
      {/* Drag handle to manually resize this column */}
      <div
        onMouseDown={(e) => startResize(e, id)}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-indigo-200/60 active:bg-indigo-300"
      />
    </th>
  );

  return (
    <div className="font-sans text-slate-900 pb-10 min-h-screen bg-[#fafbfc] p-4 sm:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:px-8 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Client List
            </h1>
            <p className="text-slate-500 text-sm font-medium tracking-wide flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              Manage and monitor your corporate partnerships and client directory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search clients..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">


              <button
                onClick={() => {
                  setTempVisibleColumns(visibleColumns);
                  setIsSettingsModalOpen(true);
                }}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center"
              >
                <Settings className="w-5 h-5" />
              </button>

              <div className="w-px h-6 bg-slate-200 hidden md:block mx-1"></div>

              <button
                onClick={handleAdd}
                className="flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-[0_4px_12px_-2px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                Add Client
              </button>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-3 rounded-[2rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 shadow-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
          <div className="overflow-x-auto custom-scrollbarThin">
            <table className="w-full text-left text-sm border-collapse min-w-[1000px] table-fixed">
              <thead className="sticky top-0 z-20">
                <tr className="bg-slate-50/80 border-b border-slate-100/80">
                  {renderSortableHeader('membershipCode', 'Client Code')}
                  {visibleColumns.includes('domain') && renderSortableHeader('domain', 'Domain')}
                  {visibleColumns.includes('status') && renderSortableHeader('status', 'Status')}
                  {visibleColumns.includes('membership') && renderSortableHeader('membership', 'Membership')}
                  {visibleColumns.includes('name') && renderSortableHeader('name', 'Name')}
                  {visibleColumns.includes('website') && renderSortableHeader('website', 'Website')}
                  {visibleColumns.includes('email') && renderSortableHeader('email', 'Email')}
                  {visibleColumns.includes('phone') && renderSortableHeader('phone', 'Phone')}
                  {visibleColumns.includes('address') && renderSortableHeader('address', 'Address')}
                  {visibleColumns.includes('city') && renderSortableHeader('city', 'City')}
                  {visibleColumns.includes('country') && renderSortableHeader('country', 'Country')}
                  {visibleColumns.includes('currency') && renderSortableHeader('currency', 'Currency')}
                  {visibleColumns.includes('registrationDate') && renderSortableHeader('registrationDate', 'Date of Registration')}
                  {visibleColumns.includes('createdBy') && renderSortableHeader('createdBy', 'Added By')}
                  <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider text-center sticky right-0 bg-slate-50 z-30 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)] border-l border-slate-100">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {loading && (
                  <tr>
                    <td colSpan={visibleColumns.length + 2} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-600 space-y-3">
                        <LoaderCircle className="w-10 h-10 animate-spin text-indigo-500" />
                        <p className="font-medium text-slate-500">Loading clients...</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && sortedAndFilteredClients.length === 0 && (
                  <tr>
                    <td colSpan={visibleColumns.length + 2} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-600 space-y-3">
                        <Search className="w-12 h-12 text-slate-200" />
                        <p className="font-medium text-slate-500">No clients found matching your search.</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && sortedAndFilteredClients.map((client, idx) => (
                  <tr key={client._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-slate-400 font-medium text-sm">
                        {client.membershipCode?.replace('MEM-', '') || '-'}
                      </span>
                    </td>
                    {visibleColumns.includes('domain') && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${['Active', 'Client'].includes(client.status)
                              ? 'bg-indigo-500'
                              : ['Onboarding', 'Prospect Warm'].includes(client.status)
                                ? 'bg-amber-400'
                                : client.status === 'Prospect Cold'
                                  ? 'bg-blue-400'
                                  : 'bg-slate-300'
                              }`}
                          />
                          <span className="font-medium text-slate-700">
                            {client.domain || 'NA'}
                          </span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.includes('status') && (
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${['Active', 'Client'].includes(client.status)
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                            : ['Onboarding', 'Prospect Warm'].includes(client.status)
                              ? 'text-amber-700 bg-amber-50 border border-amber-200/60'
                              : client.status === 'Prospect Cold'
                                ? 'text-blue-700 bg-blue-50 border border-blue-200/60'
                                : 'text-slate-600 bg-slate-50 border border-slate-200'
                            }`}
                        >
                          {client.status}
                        </span>
                      </td>
                    )}
                    {visibleColumns.includes('membership') && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(client.membership) && client.membership.length > 0 ? (
                            client.membership.map((m, i) => (
                              <span key={i} className="font-medium text-slate-700 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded text-[10px] whitespace-nowrap">
                                {m}
                              </span>
                            ))
                          ) : (
                            <span className="font-medium text-slate-700 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded text-[10px]">
                              {client.membership || 'PROZ'}
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.includes('name') && (
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => navigate(`view-client/${client._id}`)}
                            className="text-left font-semibold text-slate-900 hover:text-indigo-600 hover:underline transition-colors"
                          >
                            {client.name}
                          </button>
                        </div>
                      </td>
                    )}
                    {visibleColumns.includes('website') && (
                      <td className="px-4 py-3 text-blue-600 truncate max-w-[150px]">
                        {client.website ? (
                          <a href={client.website} target="_blank" rel="noreferrer" className="hover:underline">
                            {client.website}
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.includes('email') && <td className="px-4 py-3 text-slate-600">{client.email || '-'}</td>}
                    {visibleColumns.includes('phone') && <td className="px-4 py-3 text-slate-600">{client.phone || '-'}</td>}
                    {visibleColumns.includes('address') && <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={client.address}>{client.address || '-'}</td>}
                    {visibleColumns.includes('city') && <td className="px-4 py-3 text-slate-600">{client.city || '-'}</td>}
                    {visibleColumns.includes('country') && <td className="px-4 py-3 text-slate-600 font-medium">{client.country || '-'}</td>}
                    {visibleColumns.includes('currency') && (
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-700 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded text-xs">
                          {client.currency || 'USD'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.includes('registrationDate') && <td className="px-4 py-3 text-slate-500">{client.registrationDate || '-'}</td>}
                    {visibleColumns.includes('createdBy') && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
                            {client.createdBy?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <span className="font-medium text-slate-700 text-sm whitespace-nowrap">{client.createdBy || 'System Admin'}</span>
                        </div>
                      </td>
                    )}

                    <td className={`px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-slate-50 transition-colors border-l border-slate-100 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)] ${openActionId === client._id ? 'z-40' : 'z-20'}`}>
                      <div className="relative flex justify-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setOpenActionId(openActionId === client._id ? null : client._id)}
                          className={`p-2 rounded-xl transition-all ${openActionId === client._id
                            ? 'bg-indigo-50 text-indigo-600 shadow-inner'
                            : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                            }`}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {openActionId === client._id && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 py-2 z-30 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                            <div className="px-4 py-1.5 mb-1 border-b border-slate-50">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</p>
                            </div>
                            <button
                              onClick={() => {
                                setOpenActionId(null);
                                navigate(`view-client/${client._id}`);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-white flex items-center justify-center transition-colors">
                                <Eye className="w-4 h-4" />
                              </div>
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                setOpenActionId(null);
                                navigate('/contacts', { state: { clientName: client.name } });
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-white flex items-center justify-center transition-colors">
                                <Users className="w-4 h-4" />
                              </div>
                              View Contacts
                            </button>
                            <button
                              onClick={() => {
                                setOpenActionId(null);
                                handleEdit(client);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-white flex items-center justify-center transition-colors">
                                <Edit3 className="w-4 h-4" />
                              </div>
                              Edit Client
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Showing <span className="text-slate-900 font-semibold">{sortedAndFilteredClients.length}</span> of <span className="text-slate-900 font-semibold">{clients.length}</span> Clients
            </p>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-30 cursor-not-allowed">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-semibold text-sm shadow-sm shadow-indigo-200">1</button>
              <button className="w-8 h-8 rounded-lg text-slate-600 font-medium text-sm hover:bg-slate-100 transition-all">2</button>
              <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>



      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsSettingsModalOpen(false)} />

          <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white text-lg font-semibold tracking-tight">Choose Columns</h2>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-0.5">
                {allColumns.map((col) => (
                  <label key={col.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer h-5 w-5 appearance-none rounded border-2 border-slate-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                        checked={tempVisibleColumns.includes(col.id)}
                        onChange={() => toggleColumnSelection(col.id)}
                      />
                      <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={applyColumnSettings}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-indigo-500/10"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbarThin::-webkit-scrollbar { height: 4px; }
        .custom-scrollbarThin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
