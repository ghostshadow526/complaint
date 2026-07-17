import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Clock, CheckCircle2, Search, Filter, AlertOctagon, AlertTriangle, 
  MapPin, User as UserIcon, Calendar, CheckSquare, Eye, MessageSquare, Send, 
  Activity, Landmark, FileText, ChevronRight, HelpCircle, CheckCircle, Info
} from 'lucide-react';
import { Claim, CategoryType, SeverityType, Comment, User, StatusType } from '../types';
import { getClaims, updateClaimStatus, getComments, addComment } from '../lib/storage';
import { isFirebaseEnabled } from '../lib/firebase';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';

interface AdminDashboardProps {
  currentUser: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  
  // Resolution notes states
  const [resolvedNotes, setResolvedNotes] = useState('');
  const [resolutionSuccess, setResolutionSuccess] = useState(false);
  const [resolutionError, setResolutionError] = useState('');
  
  // Admin Chat States
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  // Table Search / Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const fetchClaims = async () => {
    const allClaims = await getClaims();
    setClaims(allClaims);
    
    // Sync selected claim details
    if (selectedClaim) {
      const updated = allClaims.find(c => c.id === selectedClaim.id);
      if (updated) {
        setSelectedClaim(updated);
        const list = await getComments(updated.id);
        setComments(list);
      }
    }
  };

  useEffect(() => {
    fetchClaims();
    // Poll for changes every 5 seconds to get incoming tickets
    const interval = setInterval(fetchClaims, 5000);
    return () => clearInterval(interval);
  }, [selectedClaim?.id]);

  useEffect(() => {
    const loadComments = async () => {
      if (selectedClaim) {
        const list = await getComments(selectedClaim.id);
        setComments(list);
      }
    };
    loadComments();
  }, [selectedClaim?.id]);

  const handleUpdateStatus = async (id: string, newStatus: StatusType) => {
    try {
      const updated = await updateClaimStatus(id, newStatus);
      await fetchClaims();
      setSelectedClaim(updated);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResolutionError('');
    setResolutionSuccess(false);

    if (!selectedClaim) return;
    if (!resolvedNotes.trim() || resolvedNotes.trim().length < 10) {
      setResolutionError('Please enter descriptive resolution notes (at least 10 characters) explaining the physical repairs or departmental actions.');
      return;
    }

    try {
      const updated = await updateClaimStatus(selectedClaim.id, 'resolved', resolvedNotes.trim());
      
      // Post an automated comment explaining resolution
      await addComment(
        selectedClaim.id,
        currentUser.name,
        'admin',
        `CIVIC CASE RESOLVED: ${resolvedNotes.trim()}`
      );

      setResolvedNotes('');
      setResolutionSuccess(true);
      await fetchClaims();
      setSelectedClaim(updated);
      
      setTimeout(() => setResolutionSuccess(false), 5000);
    } catch (err: any) {
      setResolutionError('Failed to record resolution.');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim || !newCommentText.trim()) return;

    const comment = await addComment(
      selectedClaim.id,
      currentUser.name,
      'admin',
      newCommentText.trim()
    );

    setComments([...comments, comment]);
    setNewCommentText('');
  };

  // Filter logic
  const filteredClaims = claims.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(search.toLowerCase()) || 
      c.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.claimantName.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || c.severity === severityFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesSeverity;
  });

  // Stats Counters
  const totalCount = claims.length;
  const pendingCount = claims.filter(c => c.status === 'pending').length;
  const inProgressCount = claims.filter(c => c.status === 'in_progress').length;
  const resolvedCount = claims.filter(c => c.status === 'resolved').length;
  const criticalCount = claims.filter(c => c.severity === 'critical' && c.status !== 'resolved').length;

  // Chart Data preparation
  const categoryData = [
    { name: 'Roads & Asphalt', value: claims.filter(c => c.category === 'roads').length, color: '#10b981' },
    { name: 'Medical / Hospitals', value: claims.filter(c => c.category === 'hospitals').length, color: '#0f766e' },
    { name: 'Utilities / Infra', value: claims.filter(c => c.category === 'infrastructure').length, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  const severityData = [
    { name: 'Low', count: claims.filter(c => c.severity === 'low').length },
    { name: 'Medium', count: claims.filter(c => c.severity === 'medium').length },
    { name: 'High', count: claims.filter(c => c.severity === 'high').length },
    { name: 'Critical', count: claims.filter(c => c.severity === 'critical').length },
  ];

  const getSeverityBadge = (sev: SeverityType) => {
    const styles = {
      low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      medium: 'bg-teal-50 text-teal-700 border-teal-100',
      high: 'bg-amber-50 text-amber-700 border-amber-100',
      critical: 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse',
    };
    return (
      <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold ${styles[sev]}`}>
        {sev.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (stat: StatusType) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
      in_progress: 'bg-teal-50 text-teal-700 border-teal-200/60',
      resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    };
    const labels = {
      pending: 'Pending Review',
      in_progress: 'Under Review',
      resolved: 'Case Resolved',
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${styles[stat]}`}>
        {labels[stat]}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-stone-850">
      
      {/* Admin Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-200 pb-5 mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-emerald-600 animate-bounce" />
            <span className="text-xs font-bold font-mono tracking-wider text-stone-500 uppercase">
              Works Commission Resolution Command
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-stone-900 mt-1">
            Commissioner Infrastructure Log
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {isFirebaseEnabled ? (
            <div className="flex items-center gap-2 bg-emerald-50/80 px-3 py-1.5 rounded-full border border-emerald-100">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-bold text-emerald-700 font-mono">
                FIREBASE SYNC ACTIVE // CLOUD OK
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
              <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-[10px] font-bold text-amber-700 font-mono">
                LOCAL STORAGE // SANDBOX FALLBACK
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Admin Counters Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 mb-8">
        
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Total Claims</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-stone-900 font-mono">{totalCount}</span>
            <span className="text-[10px] font-semibold text-stone-400">tickets</span>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Awaiting Review</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-amber-600 font-mono">{pendingCount}</span>
            <span className="text-[10px] font-semibold text-stone-400">pending</span>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Under Review</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-teal-700 font-mono">{inProgressCount}</span>
            <span className="text-[10px] font-semibold text-stone-400">active</span>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Resolved Archive</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-emerald-600 font-mono">{resolvedCount}</span>
            <span className="text-[10px] font-semibold text-stone-400">closed</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-rose-200 bg-rose-50/25 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">Unresolved Critical</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-rose-700 font-mono">{criticalCount}</span>
            <span className="text-[10px] font-bold text-rose-500">alarms</span>
          </div>
        </div>

      </div>

      {/* Analytics Charts Panels */}
      {totalCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Chart 1: Category Distribution */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 flex items-center">
              <Activity className="h-4 w-4 text-stone-500 mr-2" />
              Infrastructure Volume By Department
            </h3>
            <div className="h-48">
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-stone-400 text-xs">No data recorded</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Ticket(s)`, 'Count']} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '500' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Severity distribution */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 flex items-center">
              <AlertOctagon className="h-4 w-4 text-stone-500 mr-2" />
              Risk Severity Profile Distribution
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value} Ticket(s)`, 'Volume']} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {severityData.map((entry, index) => {
                      const colors = ['#10b981', '#0f766e', '#f59e0b', '#f43f5e'];
                      return <Cell key={`cell-${index}`} fill={colors[index]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Main Board Split Queue & Action details */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Side (Large column if detail open, full otherwise): Complaints List */}
        <div className={`transition-all duration-300 ${selectedClaim ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            
            {/* Filter controls */}
            <div className="p-5 border-b border-stone-100 bg-stone-50/50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h3 className="font-bold text-stone-800 flex items-center text-sm uppercase tracking-wider">
                  <FileText className="h-4.5 w-4.5 mr-2 text-emerald-600" />
                  Active Claims Desk ({filteredClaims.length})
                </h3>
                
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative">
                    <Search className="absolute inset-y-0 left-0 pl-3 h-full w-4.5 text-stone-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search name, ID, title..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="block w-full rounded-xl border border-stone-200 py-2 pl-9 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors bg-white"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-xs font-bold text-stone-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="all">All Category</option>
                    <option value="roads">Roads</option>
                    <option value="hospitals">Hospitals</option>
                    <option value="infrastructure">Infrastructure</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-xs font-bold text-stone-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-xs font-bold text-stone-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="all">All Severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Main Claims Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-mono text-[10px] font-bold uppercase bg-stone-50/20">
                    <th className="py-3.5 px-4 font-semibold">Claimant / Ticket</th>
                    <th className="py-3.5 px-4 font-semibold">Incident Details</th>
                    <th className="py-3.5 px-4 font-semibold">Department</th>
                    <th className="py-3.5 px-4 font-semibold">Risk Level</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs text-stone-750">
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">
                        <HelpCircle className="mx-auto h-8 w-8 text-stone-300 mb-2" />
                        <p className="font-semibold text-stone-600 text-sm">No matching tickets found</p>
                        <p className="text-xs text-stone-400 mt-1">Adjust search parameters or status filters above</p>
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((claim) => {
                      const isSelected = selectedClaim?.id === claim.id;
                      return (
                        <tr
                          key={claim.id}
                          onClick={() => {
                            setSelectedClaim(claim);
                            setComments(getComments(claim.id));
                          }}
                          className={`hover:bg-stone-50 cursor-pointer transition-colors ${
                            isSelected ? 'bg-emerald-50/40 text-emerald-950 font-semibold' : ''
                          }`}
                        >
                          {/* Claimant ID Column */}
                          <td className="py-4.5 px-4">
                            <div className="font-mono font-bold text-stone-800">
                              {claim.trackingNumber}
                            </div>
                            <div className="text-stone-400 text-[10px] mt-0.5 font-medium flex items-center">
                              <UserIcon className="h-2.5 w-2.5 mr-0.5" />
                              {claim.claimantName}
                            </div>
                          </td>

                          {/* Details Column */}
                          <td className="py-4.5 px-4 max-w-[220px]">
                            <div className="font-bold text-stone-900 truncate leading-snug">
                              {claim.title}
                            </div>
                            <div className="text-stone-500 text-[10px] truncate mt-0.5 flex items-center">
                              <MapPin className="h-2.5 w-2.5 mr-0.5 flex-shrink-0" />
                              {claim.location}
                            </div>
                          </td>

                          {/* Department Column */}
                          <td className="py-4.5 px-4 font-medium uppercase text-[10px] text-stone-500">
                            {claim.category}
                          </td>

                          {/* Risk Column */}
                          <td className="py-4.5 px-4">
                            {getSeverityBadge(claim.severity)}
                          </td>

                          {/* Status Badge Column */}
                          <td className="py-4.5 px-4">
                            {getStatusBadge(claim.status)}
                          </td>

                          {/* Action Column */}
                          <td className="py-4.5 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClaim(claim);
                                setComments(getComments(claim.id));
                              }}
                              className="rounded-lg border border-stone-200 bg-white hover:bg-stone-50 p-1.5 transition-all inline-flex items-center text-stone-600 hover:text-stone-900 cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right Side: Case Action Detailed Review panel (Width changes dynamically) */}
        {selectedClaim && (
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm text-left">
              
              {/* Detail Header */}
              <div className="flex items-start justify-between border-b border-stone-100 pb-4 mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-stone-500 uppercase">
                      Ticket File Inspect
                    </span>
                    <span className="text-stone-200">•</span>
                    <span className="font-mono text-[10px] font-extrabold text-stone-900">
                      {selectedClaim.trackingNumber}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-stone-900 mt-1 leading-tight">
                    {selectedClaim.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Close File
                </button>
              </div>

              {/* Status control buttons */}
              <div className="space-y-3 border-b border-stone-100 pb-5 mb-5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Quick Ticket Actions:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={selectedClaim.status === 'pending'}
                    onClick={() => handleUpdateStatus(selectedClaim.id, 'pending')}
                    className="flex-1 rounded-xl border border-amber-200 bg-amber-50/30 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100/50 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Set Pending Review
                  </button>

                  <button
                    disabled={selectedClaim.status === 'in_progress'}
                    onClick={() => handleUpdateStatus(selectedClaim.id, 'in_progress')}
                    className="flex-1 rounded-xl border border-emerald-250 border-emerald-100 bg-emerald-50/30 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100/50 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Dispatch Review
                  </button>
                </div>
              </div>

              {/* Citizen Details */}
              <div className="bg-stone-50/60 rounded-xl border border-stone-100 p-4 mb-5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-500">
                  <span>Claimant citizen:</span>
                  <span className="font-bold text-stone-800">{selectedClaim.claimantName}</span>
                </div>
                <div className="flex items-center justify-between text-stone-500">
                  <span>Report Location:</span>
                  <span className="font-semibold text-stone-800 truncate max-w-[200px]">{selectedClaim.location}</span>
                </div>
                <div className="flex items-center justify-between text-stone-500">
                  <span>Date Registered:</span>
                  <span className="font-semibold text-stone-800">
                    {new Date(selectedClaim.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Attached Image display */}
              {selectedClaim.imageUrl && (
                <div className="mb-5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                    Physical Evidence Image:
                  </span>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 overflow-hidden h-40 relative group">
                    <img 
                      src={selectedClaim.imageUrl} 
                      alt="Citizen evidence photo" 
                      className="object-cover w-full h-full"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a 
                        href={selectedClaim.imageUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-white/95 text-stone-900 px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm hover:scale-105 transition-transform"
                      >
                        Inspect Full Size
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Ticket Description */}
              <div className="mb-5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                  Incident Description Log:
                </span>
                <p className="text-xs text-stone-600 bg-stone-50/30 border border-stone-100 rounded-xl p-3 leading-relaxed">
                  {selectedClaim.description}
                </p>
              </div>

              {/* Resolution Action log panel */}
              <div className="border-t border-stone-100 pt-5 mt-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-1 text-emerald-600" />
                    Publish Civic Resolution
                  </span>
                  {selectedClaim.status === 'resolved' && (
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-sm">
                      RESOLVED
                    </span>
                  )}
                </div>

                {resolutionSuccess && (
                  <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs font-semibold text-emerald-800 flex items-center space-x-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                    <span>Resolution published! Claimant can see this instantly.</span>
                  </div>
                )}

                {resolutionError && (
                  <div className="mb-4 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs font-semibold text-rose-800 flex items-start space-x-2">
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0" />
                    <span>{resolutionError}</span>
                  </div>
                )}

                <form onSubmit={handleResolveSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                      Enter Field Resolution Log
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={resolvedNotes}
                      onChange={(e) => setResolvedNotes(e.target.value)}
                      placeholder="Explain physical repair completions, municipal contractors, or equipment replacements. This is published to the citizen dashboard..."
                      className="block w-full rounded-xl border border-stone-200 px-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center rounded-xl bg-emerald-600 py-3 px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors cursor-pointer"
                  >
                    <span>Mark Case Fully Resolved</span>
                    <CheckSquare className="ml-1.5 h-3.5 w-3.5" />
                  </button>
                </form>
              </div>

              {/* Chat log interaction */}
              <div className="border-t border-stone-100 pt-5 mt-5">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1.5 text-stone-500" />
                  Audit Communication Feed ({comments.length})
                </h4>

                {/* Comments Scroll box */}
                <div className="space-y-3 max-h-[160px] overflow-y-auto mb-3 bg-stone-50/50 rounded-xl p-3 border border-stone-100">
                  {comments.length === 0 ? (
                     <p className="text-xs text-stone-400 text-center py-2">No comments logged for audit trail.</p>
                  ) : (
                    comments.map((comm) => (
                      <div key={comm.id} className="text-[11px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-stone-800 flex items-center gap-1.5">
                            {comm.authorName}
                            <span className={`px-1 rounded-[4px] text-[8px] font-extrabold uppercase ${
                              comm.authorRole === 'admin' ? 'bg-[#e6f4f1] text-[#0f766e]' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {comm.authorRole === 'admin' ? 'Staff' : 'Citizen'}
                            </span>
                          </span>
                          <span className="text-[9px] text-stone-400 font-mono">
                            {new Date(comm.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-stone-600 bg-white border border-stone-100 rounded-lg p-2 leading-relaxed">
                          {comm.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Command room message send */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Send private message or field update..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
  );
};
