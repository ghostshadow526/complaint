import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Filter, AlertTriangle, MapPin, Calendar, Clock, 
  CheckCircle2, FileText, ChevronRight, Upload, Sparkles, Image as ImageIcon,
  MessageSquare, Send, CheckCircle, HelpCircle, Eye
} from 'lucide-react';
import { User, Claim, CategoryType, SeverityType, Comment } from '../types';
import { getClaims, createClaim, getComments, addComment } from '../lib/storage';
import { CIVIC_PRESET_IMAGES } from '../mockData';
import { isFirebaseEnabled } from '../lib/firebase';

interface ClaimantDashboardProps {
  currentUser: User;
}

export const ClaimantDashboard: React.FC<ClaimantDashboardProps> = ({ currentUser }) => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  
  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('roads');
  const [severity, setSeverity] = useState<SeverityType>('medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>('');
  const [customImageBase64, setCustomImageBase64] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Filter States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Comments States
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch claims on mount and when claims are updated
  const fetchClaims = async () => {
    const allClaims = await getClaims();
    // Filter to show only this claimant's claims
    const userClaims = allClaims.filter(c => c.claimantId === currentUser.id);
    setClaims(userClaims);
    
    // Maintain active selected claim details if it's open
    if (selectedClaim) {
      const updated = allClaims.find(c => c.id === selectedClaim.id);
      if (updated) {
        setSelectedClaim(updated);
        const list = await getComments(updated.id);
        setComments(Array.isArray(list) ? list : []);
      }
    }
  };

  useEffect(() => {
    fetchClaims();
    // Poll every 5 seconds to get updates from admin in real-time
    const interval = setInterval(fetchClaims, 5000);
    return () => clearInterval(interval);
  }, [currentUser.id, selectedClaim?.id]);

  useEffect(() => {
    const loadComments = async () => {
      if (selectedClaim) {
        const list = await getComments(selectedClaim.id);
        setComments(Array.isArray(list) ? list : []);
      }
    };
    loadComments();
  }, [selectedClaim?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError('Image must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomImageBase64(reader.result as string);
      setSelectedPresetImage(''); // override preset
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (url: string) => {
    setSelectedPresetImage(url);
    setCustomImageBase64(''); // override custom upload
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!title || !location || !description) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const imageUrl = customImageBase64 || selectedPresetImage || 'https://images.unsplash.com/photo-1594913785162-e678537db463?q=80&w=800&auto=format&fit=crop';

    try {
      const newClaim = await createClaim({
        title,
        description,
        category,
        location,
        severity,
        claimantId: currentUser.id,
        claimantName: currentUser.name,
        imageUrl,
      });

      // Reset form
      setTitle('');
      setCategory('roads');
      setSeverity('medium');
      setLocation('');
      setDescription('');
      setSelectedPresetImage('');
      setCustomImageBase64('');
      
      // Flash success
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 5000);
      
      // Refresh claims list
      await fetchClaims();
      // Select the newly created claim so they can track it
      setSelectedClaim(newClaim);
    } catch (err: any) {
      setFormError('Failed to record complaint.');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim || !newCommentText.trim()) return;

    const comment = await addComment(
      selectedClaim.id,
      currentUser.name,
      'claimant',
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
      c.location.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

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

  const getStatusBadge = (stat: string) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
      in_progress: 'bg-teal-50 text-teal-700 border-teal-200/60',
      resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    };
    const labels = {
      pending: 'Pending Investigation',
      in_progress: 'Under Review',
      resolved: 'Resolved',
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${styles[stat as keyof typeof styles]}`}>
        {labels[stat as keyof typeof labels]}
      </span>
    );
  };

  // Quick stats
  const totalReported = claims.length;
  const inProgressCount = claims.filter(c => c.status === 'in_progress').length;
  const resolvedCount = claims.filter(c => c.status === 'resolved').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-stone-800">
      
      {/* Intro Greetings Banner */}
      <div className="mb-8 rounded-3xl border border-emerald-950 bg-[#0c231f] p-6 shadow-md text-white relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] opacity-75" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-white">Citizen Action Dashboard</h2>
              {isFirebaseEnabled ? (
                <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-400/20">
                  Firebase Live
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-400/20">
                  Local Sandbox Mode
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-stone-200">
              Welcome back, <strong className="text-white font-bold">{currentUser.name}</strong>. Submit complaints, and track resolutions directly.
            </p>
          </div>
          
          {/* Quick Metrics Cards */}
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4.5 py-3 backdrop-blur-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">Total Tickets</span>
              <span className="text-lg font-bold font-mono">{totalReported}</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4.5 py-3 backdrop-blur-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">In Progress</span>
              <span className="text-lg font-bold font-mono text-stone-100">{inProgressCount}</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4.5 py-3 backdrop-blur-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">Fully Resolved</span>
              <span className="text-lg font-bold font-mono text-emerald-300">{resolvedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Structural Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Side: Submit Complaint Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center space-x-2.5 border-b border-stone-100 pb-4 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 leading-tight">File Civic Complaint</h3>
                <p className="text-xs text-stone-500">Report broken roads, hospitals, or utilities</p>
              </div>
            </div>

            {formSuccess && (
              <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-semibold text-emerald-800 flex items-start space-x-2.5">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="font-bold">Complaint Ticket Created!</p>
                  <p className="mt-1 text-[11px] font-normal leading-relaxed text-emerald-600">
                    Your request was recorded. A permanent tracking ticket code has been generated. Inspect progress in the tracking queue on the right.
                  </p>
                </div>
              </div>
            )}

            {formError && (
              <div className="mb-5 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs font-semibold text-rose-800 flex items-start space-x-2">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  1. Issue Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'roads', label: 'Bad Roads', desc: 'Potholes, cracks' },
                    { id: 'hospitals', label: 'Hospitals', desc: 'Equipment, wait' },
                    { id: 'infrastructure', label: 'Infrastructure', desc: 'Parks, water' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as CategoryType)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center cursor-pointer transition-all ${
                        category === cat.id
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-600 font-semibold'
                          : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold leading-none">{cat.label}</span>
                      <span className="text-[9px] text-stone-400 mt-1 leading-tight">{cat.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  2. Incident Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Deep asphalt pothole causing tire damage"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors bg-stone-50/20"
                />
              </div>

              {/* Location input */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  3. Specific Location / Landmark
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MapPin className="h-4 w-4 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Oworo inward Lagos Island, near the bridge loop or landmark"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors bg-stone-50/20"
                  />
                </div>
              </div>

              {/* Severity Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  4. Severity / Risk Level
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'low', label: 'Low', color: 'hover:border-emerald-500 hover:bg-emerald-50/20 active:bg-emerald-50', active: 'border-emerald-600 bg-emerald-50 text-emerald-800' },
                    { id: 'medium', label: 'Medium', color: 'hover:border-emerald-500 hover:bg-emerald-50/20 active:bg-emerald-50', active: 'border-emerald-600 bg-emerald-50 text-emerald-800' },
                    { id: 'high', label: 'High', color: 'hover:border-amber-500 hover:bg-amber-50/20 active:bg-amber-50', active: 'border-amber-600 bg-amber-50 text-amber-800' },
                    { id: 'critical', label: 'Critical', color: 'hover:border-rose-500 hover:bg-rose-50/20 active:bg-rose-50', active: 'border-rose-600 bg-rose-50 text-rose-800 animate-pulse' }
                  ].map((sev) => (
                    <button
                      key={sev.id}
                      type="button"
                      onClick={() => setSeverity(sev.id as SeverityType)}
                      className={`rounded-lg border py-2 text-xs font-semibold text-center transition-all cursor-pointer ${
                        severity === sev.id
                          ? sev.active + ' ring-1 ring-current font-bold'
                          : 'border-stone-200 text-stone-600 bg-white ' + sev.color
                      }`}
                    >
                      {sev.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description field */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  5. Detailed Description
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the defect, safety hazard, and any impact on pedestrians or traffic. Be as descriptive as possible..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors resize-none bg-stone-50/20"
                />
              </div>

              {/* Photo upload / presets */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  6. Attach Visual Proof
                </label>
                
                {/* Visual preview if selected */}
                {(customImageBase64 || selectedPresetImage) && (
                  <div className="relative rounded-xl border border-stone-200 overflow-hidden h-36 bg-stone-50 flex items-center justify-center">
                    <img 
                      src={customImageBase64 || selectedPresetImage} 
                      alt="Complaint attachment preview" 
                      className="object-cover h-full w-full"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCustomImageBase64('');
                        setSelectedPresetImage('');
                      }}
                      className="absolute top-2 right-2 rounded-full bg-stone-900/80 text-white p-1 hover:bg-slate-900 transition-colors text-xs cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Upload options selection */}
                <div className="grid grid-cols-2 gap-3">
                  {/* File Upload Trigger */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-200 p-4 text-center cursor-pointer hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                  >
                    <Upload className="h-5 w-5 text-stone-500 mb-1" />
                    <span className="text-[11px] font-bold text-stone-700">Upload Image</span>
                    <span className="text-[9px] text-stone-400">Max size 2MB</span>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* Preset Library Quick Buttons */}
                  <div className="flex flex-col rounded-xl border border-stone-200 bg-white p-2 justify-between">
                    <span className="text-[10px] font-bold text-stone-600 block px-1.5 pt-0.5 uppercase tracking-wider mb-1">
                      Or select preset:
                    </span>
                    <div className="grid grid-cols-2 gap-1 px-1 pb-1">
                      {CIVIC_PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handlePresetSelect(preset.url)}
                          className={`rounded-lg border px-2 py-1.5 text-[10px] font-semibold truncate text-left transition-all hover:bg-stone-50 cursor-pointer ${
                            selectedPresetImage === preset.url 
                              ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-600' 
                              : 'border-stone-100 text-stone-600 bg-white'
                          }`}
                        >
                          {preset.label.split(' / ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 border border-emerald-500/30 backdrop-blur-md py-3.5 px-4 text-sm font-bold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
              >
                <span>Submit Civic Complaint</span>
                <Plus className="ml-1.5 h-4 w-4 text-emerald-600" />
              </button>

            </form>
          </div>
        </div>

        {/* Right Side: Active complaints, tracking search and live timeline details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Claims Queue Header & Search Filters */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-stone-850 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-emerald-600" />
              Your Reported Cases
            </h3>

            {/* Filters bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute inset-y-0 left-0 pl-3 h-full w-5 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search tracking #, location or title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors bg-stone-50/20"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">All Categories</option>
                  <option value="roads">Roads</option>
                  <option value="hospitals">Hospitals</option>
                  <option value="infrastructure">Infrastructure</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Complaints list */}
            <div className="mt-5 space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredClaims.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-stone-100 rounded-xl">
                  <HelpCircle className="mx-auto h-9 w-9 text-stone-300" />
                  <p className="mt-2 text-sm font-semibold text-stone-600">No reported complaints found</p>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                    Try adjusting your filters or use the left pane form to create your first civic request ticket.
                  </p>
                </div>
              ) : (
                filteredClaims.map((claim) => {
                  const isCurrentlySelected = selectedClaim?.id === claim.id;
                  return (
                    <div
                      key={claim.id}
                      onClick={() => {
                        setSelectedClaim(claim);
                      }}
                      className={`group rounded-xl border p-4 transition-all cursor-pointer text-left ${
                        isCurrentlySelected
                          ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-stone-500">
                              {claim.trackingNumber}
                            </span>
                            <span className="inline-flex items-center rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-stone-600 border border-stone-200/50">
                              {claim.category}
                            </span>
                            {getSeverityBadge(claim.severity)}
                          </div>
                          
                          <h4 className="font-bold text-stone-900 group-hover:text-emerald-850 text-sm leading-tight pt-1">
                            {claim.title}
                          </h4>
                          
                          <div className="flex items-center space-x-3 text-stone-400 text-[11px] pt-1">
                            <span className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                              <span className="truncate max-w-[180px]">{claim.location}</span>
                            </span>
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(claim.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Status chip */}
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          {getStatusBadge(claim.status)}
                          <span className="inline-flex items-center text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors">
                            <Eye className="mr-1 h-3.5 w-3.5 animate-pulse" />
                            Details
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Live tracking timeline details */}
          {selectedClaim && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm text-left">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-stone-500">
                      LIVE TRACKING LOG
                    </span>
                    <span className="text-stone-200">•</span>
                    <span className="font-mono text-xs font-bold text-stone-900">
                      {selectedClaim.trackingNumber}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-stone-900 leading-tight mt-1">
                    {selectedClaim.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-55 cursor-pointer"
                >
                  Close Track
                </button>
              </div>

              {/* Resolution details banner */}
              {selectedClaim.status === 'resolved' && (
                <div className="mb-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 p-5 text-emerald-900">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900 leading-tight">Civic Case Resolved!</h4>
                      <p className="text-xs text-emerald-600 mt-1">
                        Resolved on {new Date(selectedClaim.resolvedAt || '').toLocaleString()}
                      </p>
                      
                      <div className="mt-3.5 bg-white rounded-xl border border-emerald-100 p-4 shadow-xs">
                        <span className="text-[9px] font-bold tracking-wider uppercase text-emerald-600 block mb-1">
                          Official Resolution Log:
                        </span>
                        <p className="text-xs font-medium text-stone-700 leading-relaxed italic">
                          "{selectedClaim.resolvedNotes}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress timeline stepper */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-4">
                  Resolution Progress Timeline
                </h4>
                
                <div className="grid grid-cols-3 gap-2 relative">
                  {/* Connect Line */}
                  <div className="absolute top-4.5 left-10 right-10 h-0.5 bg-stone-100 -z-10" />
                  
                  {/* Step 1: Ticket Opened */}
                  <div className="text-center flex flex-col items-center">
                    <div className="h-9 w-9 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-sm">
                      <CheckCircle2 className="h-4.5 w-4.5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-stone-900 mt-2 block leading-none">Ticket Opened</span>
                    <span className="text-[10px] text-stone-400 mt-1.5 font-mono">
                      {new Date(selectedClaim.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Step 2: Under Investigation */}
                  <div className="text-center flex flex-col items-center">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-sm ${
                      selectedClaim.status === 'in_progress' || selectedClaim.status === 'resolved'
                        ? 'bg-teal-550 bg-teal-600 text-white'
                        : 'bg-stone-100 text-stone-400'
                    }`}>
                      {selectedClaim.status === 'in_progress' || selectedClaim.status === 'resolved' ? (
                        <Clock className="h-4.5 w-4.5 text-white" />
                      ) : (
                        <span className="font-mono text-xs">2</span>
                      )}
                    </div>
                    <span className={`text-xs font-bold mt-2 block leading-none ${
                      selectedClaim.status === 'in_progress' || selectedClaim.status === 'resolved' ? 'text-teal-700' : 'text-stone-400'
                    }`}>
                      Under Review
                    </span>
                    <span className="text-[10px] text-stone-400 mt-1.5 font-mono">
                      {selectedClaim.status === 'in_progress' || selectedClaim.status === 'resolved' ? 'Active Dispatch' : 'Awaiting Review'}
                    </span>
                  </div>

                  {/* Step 3: Resolution Achieved */}
                  <div className="text-center flex flex-col items-center">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-sm ${
                      selectedClaim.status === 'resolved'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-stone-100 text-stone-400'
                    }`}>
                      {selectedClaim.status === 'resolved' ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-white" />
                      ) : (
                        <span className="font-mono text-xs">3</span>
                      )}
                    </div>
                    <span className={`text-xs font-bold mt-2 block leading-none ${
                      selectedClaim.status === 'resolved' ? 'text-emerald-700' : 'text-stone-400'
                    }`}>
                      Case Resolved
                    </span>
                    <span className="text-[10px] text-stone-400 mt-1.5 font-mono">
                      {selectedClaim.status === 'resolved' ? 'Verified Done' : 'Pending Repair'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Case Details Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-stone-100 pt-5">
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Description:</span>
                    <p className="text-xs text-stone-600 leading-relaxed mt-1">{selectedClaim.description}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Address / Location:</span>
                    <p className="text-xs font-semibold text-stone-800 leading-relaxed mt-1 flex items-center">
                      <MapPin className="h-3.5 w-3.5 text-stone-500 mr-1 flex-shrink-0" />
                      {selectedClaim.location}
                    </p>
                  </div>
                </div>

                {/* Photo attachment display */}
                {selectedClaim.imageUrl && (
                  <div className="rounded-xl border border-stone-200 bg-stone-50 overflow-hidden h-40 relative group">
                    <img 
                      src={selectedClaim.imageUrl} 
                      alt="Verification attachment" 
                      className="object-cover w-full h-full"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 text-stone-900 px-3 py-1 text-xs font-bold rounded-lg shadow-xs">
                        Official Attached Photo
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Ticket Chat Feed (Interaction loop) */}
              <div className="border-t border-stone-100 pt-5 mt-5">
                <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1.5 text-stone-500" />
                  Ticket Communication Feed ({comments.length})
                </h4>

                {/* Chat items list */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto mb-3 bg-stone-50/50 rounded-xl p-3 border border-stone-100">
                  {comments.length === 0 ? (
                    <p className="text-xs text-stone-400 text-center py-4">No logged messages yet. You can write details or follow-ups below.</p>
                  ) : (
                    comments.map((comm) => (
                      <div key={comm.id} className="text-xs">
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

                {/* Comment box form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Provide incident update or question..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 flex items-center justify-center transition-colors shrink-0 cursor-pointer animate-pulse"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
