import React, { useState } from 'react';
import { 
  ArrowRight, ShieldCheck, HeartHandshake, FileText, CheckCircle2, 
  HelpCircle, Activity, MapPin, ClipboardList, Sparkles, Shield, 
  User, Clock, MessageSquare, AlertTriangle, ChevronRight, Landmark, Info 
} from 'lucide-react';
import { motion } from 'motion/react';

interface HomePageProps {
  onGetStarted: (role: 'claimant' | 'admin') => void;
  onExploreClaims: () => void;
}

export function HomePage({ onGetStarted, onExploreClaims }: HomePageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { label: 'Complaints Resolved', value: '1,428', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Average Resolution Time', value: '36 Hours', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Verified Contractors', value: '14 Active', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Community Rating', value: '98.4%', icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  const categories = [
    { 
      title: 'Roads & Highways', 
      desc: 'Reporting express lane asphalt craters, deep potholes, failing bridge joints, and damaged road safety rails.', 
      img: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800&auto=format&fit=crop',
      tag: '42 resolved this week'
    },
    { 
      title: 'Hospitals & Primary Health Centres', 
      desc: 'Equipment failures, broken reception seating, clinic maintenance defects, and local hospital facility complaints.', 
      img: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce2?q=80&w=800&auto=format&fit=crop',
      tag: '100% staff dispatched'
    },
    { 
      title: 'Water Supply & Public Drainage', 
      desc: 'High-pressure water main bursts, flooded pathways, heavy street gutter blockages, and sewage leaks.', 
      img: 'https://images.unsplash.com/photo-1542013936693-8848e5744a9b?q=80&w=800&auto=format&fit=crop',
      tag: 'Under 2hr response time'
    },
    { 
      title: 'Power Grids & Public Lighting', 
      desc: 'Reporting fallen electrical utility poles, damaged community transformers, and broken public streetlights.', 
      img: 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?q=80&w=800&auto=format&fit=crop',
      tag: 'Active utility tracking'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Quick Filing',
      desc: 'Upload an incident image, specify the GPS location or landmark, and rank the severity level from Low to Critical.'
    },
    {
      num: '02',
      title: 'Immediate Audit',
      desc: 'The complaint enters the admin dashboard where the State Works Commissioner reviews structural risks.'
    },
    {
      num: '03',
      title: 'Staff Dispatch',
      desc: 'Verified public works contractors or water/power engineers are deployed to the field. Progress is logged live.'
    },
    {
      num: '04',
      title: 'Verified Closeout',
      desc: 'The reporting citizen receives an official resolution notice containing physical repair evidence logs.'
    }
  ];

  const reviews = [
    {
      name: 'Amina Bello',
      role: 'Ikeja LGA resident, Lagos',
      comment: 'Reported a deep, dangerous pothole on the Third Mainland Bridge loop and was shocked to see the Ministry of Works road crews repairing it the next morning! Incredible speed.',
      avatar: 'AB'
    },
    {
      name: 'Emeka Nwosu',
      role: 'Wuse II resident, Abuja',
      comment: 'The water main pipe burst outside the crescent was flooding the entire walkway. I filed a report with a quick photo, and the FCT Water Board arrived with heavy gear in under 90 minutes.',
      avatar: 'EN'
    }
  ];

  const faqs = [
    {
      q: 'How does MUFTASEER NAIJA COMPLAINT HUB prioritize incoming cases?',
      a: 'Reports are categorized automatically and sorted by severity levels: Low, Medium, High, and Critical. Critical-priority reports (such as electrical outages, water main floods, or clinic hazards) trigger urgent system alarms for immediate dispatcher dispatch.'
    },
    {
      q: 'Can I monitor the progress of my reported incident?',
      a: 'Yes, absolutely! Each submitted complaint generates a unique, trackable CIVIC serial number. You can search this tracking code on your dashboard to see when it transitions from Pending, to Under Dispatch, to Case Resolved.'
    },
    {
      q: 'Do I need specialized documents to report a public defect in Nigeria?',
      a: 'No documents are necessary. Just snap a photo of the issue or select one of our pre-populated civic preset images, type a clear title, specify a nearby Nigerian landmark or street location, and click submit.'
    },
    {
      q: 'Who verifies that the repair has been successfully completed?',
      a: 'All completions require the public works commissioner or municipal engineer to submit an official Case Resolution Note documenting the physical fixes, contractor hours, and outcome before the ticket is archived.'
    }
  ];

  return (
    <div className="bg-[#fcfbf9] min-h-screen text-stone-800">
      {/* Hero Section */}
      <section className="relative bg-[#0c231f] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-emerald-950">
        {/* Ambient Grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] opacity-70" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Hero text */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-400/20 rounded-full text-xs font-bold text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Empowering Nigerian Civic Transparency
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
              MUFTASEER <br />
              <span className="text-emerald-400">NAIJA COMPLAINT HUB</span>
            </h1>
            <p className="text-base sm:text-lg text-stone-200/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              A premium, high-fidelity resolution portal designed for Nigerian citizens to instantly report road damage, broken water mains, power grid faults, and primary health centre defects directly to the State Commissioner.
            </p>
            
            {/* Real Glass Buttons */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
              <button 
                onClick={() => onGetStarted('claimant')}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                File a Complaint
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
              <button 
                onClick={() => onGetStarted('admin')}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white backdrop-blur-md border border-white/25 font-bold text-sm transition-all shadow-lg cursor-pointer"
              >
                <Shield className="mr-2 w-4 h-4 text-emerald-400" />
                Administrative Terminal
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-mono text-emerald-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                SSL Encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Status Tracker
              </span>
            </div>
          </div>

          {/* Hero graphic / Beautiful Image frame with Glass overlay */}
          <div className="flex-1 w-full max-w-xl">
            <div className="relative rounded-2xl border border-white/10 shadow-2xl overflow-hidden aspect-[16/10] group">
              {/* Actual realistic civic image */}
              <img 
                src="https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=1000&auto=format&fit=crop" 
                alt="Third Mainland Bridge, Lagos, Nigeria" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              {/* Dark overlay with gradient for glass contrast */}
              <div className="absolute inset-0 bg-linear-to-t from-[#0c231f]/90 via-[#0c231f]/30 to-transparent" />
              
              {/* Floating Glassmorphic status panel */}
              <div className="absolute bottom-4 left-4 right-4 bg-stone-900/60 backdrop-blur-md rounded-xl p-4 border border-white/15 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono tracking-widest text-emerald-300">SYSTEM MONITOR // LIVE</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">● ONLINE</span>
                </div>
                <h4 className="text-sm font-bold tracking-tight text-white">Active District Resolve Tracker</h4>
                <p className="text-xs text-stone-200/90 leading-relaxed mt-1">
                  1,428 community tickets dispatched, audited, and physically verified. Click above to file your incident report.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact Statistics */}
      <section className="relative -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 shadow-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-stone-100">
            {stats.map((st, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-3">
                <div className={`p-3 rounded-xl ${st.bg} ${st.color} mb-3.5 shadow-xs`}>
                  <st.icon className="w-5.5 h-5.5" />
                </div>
                <span className="text-2xl font-black text-stone-900 font-mono tracking-tight">{st.value}</span>
                <span className="text-xs font-bold text-stone-500 mt-1 uppercase tracking-wider">{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Mission Statement */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black tracking-widest text-emerald-700 uppercase">Service Coverage</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight">
            Comprehensive Infrastructure Safeguards
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed font-medium">
            We are dedicated to resolving any defect affecting the public sphere. Report incidents under these specialized divisions.
          </p>
        </div>

        {/* Categories Grid with real images */}
        <div className="grid md:grid-cols-2 gap-8">
          {categories.map((cat, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-all group"
            >
              {/* Photo */}
              <div className="sm:w-48 h-48 sm:h-auto relative overflow-hidden flex-shrink-0 bg-stone-100">
                <img 
                  src={cat.img} 
                  alt={cat.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-[#0c231f]/80 backdrop-blur-xs px-2.5 py-1 rounded text-[9px] font-bold text-emerald-200 uppercase tracking-wide">
                  {cat.tag}
                </div>
              </div>

              {/* Text content */}
              <div className="p-6 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-stone-950 group-hover:text-emerald-700 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed font-medium">
                    {cat.desc}
                  </p>
                </div>
                
                <button 
                  onClick={() => onGetStarted('claimant')}
                  className="mt-4 inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors self-start cursor-pointer"
                >
                  Report issue in this division
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Step-by-Step */}
      <section className="bg-stone-50/80 py-20 px-4 sm:px-6 lg:px-8 border-y border-stone-200/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black tracking-widest text-emerald-700 uppercase">Interactive Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight">
              Four Steps to Public Resolution
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed font-medium">
              A highly optimized pipeline engineered for rapid dispatch and complete civic accountability.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs relative overflow-hidden group hover:border-emerald-200 transition-all"
              >
                <span className="absolute top-4 right-4 text-3xl font-black text-stone-100 select-none group-hover:text-stone-200/50 transition-colors">
                  {st.num}
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm mb-4">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-stone-900 text-sm mb-2">{st.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-medium">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Quote / Commission Seal */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#0c231f] rounded-3xl border border-emerald-950 p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:20px_20px] opacity-60" />
          
          <div className="relative flex flex-col lg:flex-row items-center gap-10">
            {/* Image representing standard leadership/trust */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-emerald-900 shadow-xl flex-shrink-0 flex items-center justify-center font-black text-2xl tracking-widest text-emerald-200 bg-gradient-to-b from-emerald-900 to-stone-950">
              <Landmark className="w-12 h-12 text-emerald-300" />
            </div>

            <div className="space-y-4 text-center lg:text-left flex-1">
              <p className="text-lg sm:text-xl font-medium italic text-emerald-50 leading-relaxed">
                "Our promise is simple: absolute visibility. In the past, complaints went into a void. With the MUFTASEER NAIJA COMPLAINT HUB, every ticket stays on a live, interactive dashboard until verified physical repairs are signed off by leadership."
              </p>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Office of the Commissioner for Works & Infrastructure</h4>
                <p className="text-[11px] text-emerald-300 uppercase tracking-widest mt-1 font-mono">Lagos State & FCT Public Works Division</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Citizen Review Spotlight */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-stone-200/60">
        <div className="grid md:grid-cols-2 gap-8">
          {reviews.map((rev, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between">
              <p className="text-xs text-stone-600 leading-relaxed italic font-medium">
                "{rev.comment}"
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-xs shadow-xs">
                  {rev.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{rev.name}</h4>
                  <p className="text-[10px] text-stone-400 font-medium">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <HelpCircle className="w-8 h-8 text-emerald-700 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-950 tracking-tight">
            Frequently Answered Questions
          </h2>
          <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">
            Everything you need to know about MUFTASEER NAIJA COMPLAINT HUB
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpened = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpened ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-stone-800 hover:text-emerald-700 transition-colors focus:outline-none cursor-pointer"
                >
                  <span className="text-sm">{faq.q}</span>
                  <span className={`w-6 h-6 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-xs text-stone-500 transition-transform ${isOpened ? 'rotate-90' : ''}`}>
                    ▶
                  </span>
                </button>
                {isOpened && (
                  <div className="px-5 pb-5 pt-1 text-xs text-stone-500 leading-relaxed font-medium border-t border-stone-50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA bottom block */}
      <section className="bg-[#0c231f] text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden border-t border-emerald-950">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
        <div className="relative max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to upgrade your neighborhood?
          </h2>
          <p className="text-sm text-stone-200 max-w-xl mx-auto leading-relaxed font-medium">
            Join thousands of active citizens tracking and fixing infrastructure defects in real-time. Secure, transparent, and direct.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <button 
              onClick={() => onGetStarted('claimant')}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              Report First Incident
            </button>
            <button 
              onClick={() => onGetStarted('admin')}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/15 border border-white/25 text-white rounded-xl font-bold text-sm transition-all cursor-pointer"
            >
              Staff Portal Access
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
