import React, { useState } from 'react';
import axios from 'axios';
import { 
  Search, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Type, 
  Activity,
  ChevronRight,
  Terminal,
  Download,
  FileText,
  ExternalLink,
  BarChart3,
  Layout,
  Layers,
  Globe,
  Monitor,
  Cpu,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface AnalysisResult {
  url: string;
  status: number;
  loadTime: number;
  metadata: {
    title: string;
    description: string;
    titleLength: number;
    descriptionLength: number;
  };
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    all: { tag: string, text: string }[];
  };
  images: {
    total: number;
    missingAlt: number;
    details: { src: string, alt: string | null }[];
  };
  links: {
    total: number;
    checked: any[];
    broken: any[];
  };
}

const PremiumMetric = ({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: 'green' | 'yellow' | 'red' }) => {
  const themes = {
    green: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    yellow: 'border-amber-500/30 bg-amber-500/5 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    red: 'border-rose-500/30 bg-rose-500/5 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
  };

  return (
    <div className={`border rounded-2xl p-6 flex flex-col gap-3 transition-all hover:translate-y-[-4px] ${themes[color]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{label}</span>
        <Icon className="w-5 h-5 opacity-80" />
      </div>
      <div className="text-4xl font-black tracking-tighter">{value}</div>
    </div>
  );
};

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const calculateScore = (res: AnalysisResult) => {
    let score = 100;
    if (!res.metadata.title || res.metadata.titleLength < 30) score -= 10;
    if (!res.metadata.description) score -= 15;
    if (res.headings.h1.length !== 1) score -= 10;
    if (res.images.missingAlt > 0) score -= Math.min(15, res.images.missingAlt * 2);
    if (res.links.broken.length > 0) score -= Math.min(20, res.links.broken.length * 5);
    return Math.max(0, score);
  };

  const analyzeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/analyze', { 
        url: url.startsWith('http') ? url : `https://${url}` 
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const seoScore = result ? calculateScore(result) : 0;
  
  const chartData = result ? [
    { name: 'H1', count: result.headings.h1.length },
    { name: 'H2', count: result.headings.h2.length },
    { name: 'H3', count: result.headings.h3.length },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0F1116] text-[#E2E8F0] font-sans selection:bg-emerald-500/30">
      {/* Premium Banner */}
      <div className="bg-gradient-to-r from-emerald-600/20 via-blue-600/10 to-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛰️</span>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tighter text-white uppercase leading-none">
                StockFlow <span className="text-emerald-500">Intelligence</span>
              </h1>
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Premium Dashboard v3.0</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <Cpu className="w-3 h-3 text-emerald-500" />
              Neural Engine Active
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <Zap className="w-3 h-3 text-amber-500" />
              Real-time Heuristics
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search Experience */}
        <div className="mb-16">
          <form onSubmit={analyzeUrl} className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center bg-zinc-900/60 border border-white/10 rounded-3xl overflow-hidden focus-within:border-emerald-500/50 transition-all shadow-2xl">
                <Globe className="ml-6 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter target URL for deep audit..."
                  className="w-full bg-transparent px-5 py-6 text-white placeholder:text-zinc-700 focus:outline-none text-lg font-medium"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="mr-3 px-10 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black uppercase text-xs tracking-widest rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Analyze
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-12 p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-4 max-w-3xl mx-auto"
            >
              <XCircle className="w-6 h-6 shrink-0" />
              <div className="text-sm font-bold uppercase tracking-wider">{error}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PremiumMetric 
                label="SEO Health Score" 
                value={`${seoScore}%`} 
                icon={Activity}
                color={seoScore > 80 ? 'green' : seoScore > 50 ? 'yellow' : 'red'}
              />
              <PremiumMetric 
                label="Load Latency" 
                value={`${result.loadTime}ms`} 
                icon={Zap}
                color={result.loadTime < 800 ? 'green' : result.loadTime < 2000 ? 'yellow' : 'red'}
              />
              <PremiumMetric 
                label="Broken Links" 
                value={result.links.broken.length} 
                icon={LinkIcon}
                color={result.links.broken.length === 0 ? 'green' : 'red'}
              />
            </div>

            {/* Tabbed Results */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
              <div className="flex flex-wrap gap-10 border-b border-white/5 mb-10">
                {[
                  { id: 'overview', label: 'Overview', icon: '📋' },
                  { id: 'media', label: 'Media Audit', icon: '🖼️' },
                  { id: 'links', label: 'Link Intelligence', icon: '🔗' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-6 flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${
                      activeTab === tab.id ? 'text-emerald-500' : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTabPremium"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div>
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] block mb-3">Target Title</span>
                        <div className="p-6 bg-black/40 border border-white/5 rounded-3xl text-lg font-bold text-white leading-tight">
                          {result.metadata.title || <span className="text-rose-500 italic">No Title Detected</span>}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] block mb-3">Meta Description</span>
                        <div className="p-6 bg-black/40 border border-white/5 rounded-3xl text-sm text-zinc-400 leading-relaxed">
                          {result.metadata.description || <span className="text-rose-500 italic">No Description Found</span>}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] block mb-6">Heading Distribution</span>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} layout="vertical" margin={{ left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" horizontal={false} />
                            <XAxis type="number" stroke="#4A4A4A" fontSize={10} hide />
                            <YAxis dataKey="name" type="category" stroke="#4A4A4A" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                              cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                              contentStyle={{ backgroundColor: '#0A0A0B', border: '1px solid #1A1A1A', borderRadius: '12px' }}
                            />
                            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={30}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#3B82F6'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'media' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Image Asset Integrity</h3>
                      <div className="flex gap-4">
                        <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase">
                          {result.images.total - result.images.missingAlt} Optimized
                        </div>
                        <div className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full uppercase">
                          {result.images.missingAlt} Missing Alt
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                      {result.images.details.map((img, i) => (
                        <div key={i} className="flex items-center gap-6 p-5 bg-black/30 border border-white/5 rounded-3xl hover:border-emerald-500/20 transition-all">
                          <div className="w-16 h-16 bg-zinc-800 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center">
                            {img.src?.startsWith('http') ? (
                              <img src={img.src} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-zinc-600" />
                            )}
                          </div>
                          <div className="flex-1 truncate">
                            <p className="text-[10px] text-zinc-600 font-mono truncate mb-1">{img.src}</p>
                            <div className="flex items-center gap-2">
                              {img.alt ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <XCircle className="w-3 h-3 text-rose-500" />
                              )}
                              <span className={`text-xs font-medium ${img.alt ? 'text-zinc-400' : 'text-rose-500 italic'}`}>
                                {img.alt || "Missing alternative text attribute"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'links' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Link Intelligence Network</h3>
                      <span className="text-[10px] font-bold text-zinc-400 bg-white/5 px-3 py-1 rounded-full uppercase">
                        {result.links.checked.length} Scanned
                      </span>
                    </div>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                      {result.links.checked.map((link, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-black/30 border border-white/5 rounded-3xl">
                          <div className="flex flex-col gap-1 truncate max-w-[80%]">
                            <span className="text-[10px] text-zinc-600 font-mono truncate">{link.href}</span>
                            <span className="text-sm font-bold text-zinc-300 truncate">{link.text || "(Anchor text missing)"}</span>
                          </div>
                          <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            link.ok ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {link.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Prominent Download Experience */}
            <div className="flex flex-col items-center gap-8 py-12">
              <div className="flex flex-col items-center text-center gap-2">
                <h3 className="text-xl font-black uppercase tracking-tight">Audit Finalized</h3>
                <p className="text-zinc-500 text-sm max-w-md">
                  The StockFlow Neural Engine has completed its analysis of {new URL(result.url).hostname}. Export the full technical report below.
                </p>
              </div>
              <button
                onClick={() => {
                  const timestamp = new Date().toLocaleString();
                  const hostname = new URL(result.url).hostname;
                  
                  let report = `==================================================\n`;
                  report += `STOCKFLOW PREMIUM SEO AUDIT REPORT\n`;
                  report += `==================================================\n\n`;
                  
                  report += `1. EXECUTIVE SUMMARY\n`;
                  report += `--------------------------------------------------\n`;
                  report += `Target URL: ${result.url}\n`;
                  report += `SEO Health Score: ${seoScore}%\n`;
                  report += `Load Latency: ${result.loadTime}ms\n`;
                  report += `Broken Links: ${result.links.broken.length}\n`;
                  report += `Audit Timestamp: ${timestamp}\n\n`;
                  
                  report += `2. METADATA DETAILS\n`;
                  report += `--------------------------------------------------\n`;
                  report += `Title: ${result.metadata.title || 'NOT FOUND'}\n`;
                  report += `Title Length: ${result.metadata.titleLength} characters\n`;
                  report += `Meta Description: ${result.metadata.description || 'NOT FOUND'}\n`;
                  report += `Description Length: ${result.metadata.descriptionLength} characters\n\n`;
                  
                  report += `3. IMAGE AUDIT LIST (MISSING ALT ATTRIBUTES)\n`;
                  report += `--------------------------------------------------\n`;
                  const missingAlts = result.images.details.filter(img => !img.alt);
                  if (missingAlts.length > 0) {
                    missingAlts.forEach((img, idx) => {
                      report += `[${idx + 1}] Source: ${img.src}\n`;
                    });
                  } else {
                    report += `No images missing alt attributes found.\n`;
                  }
                  report += `\n`;
                  
                  report += `4. HEADING AUDIT LIST\n`;
                  report += `--------------------------------------------------\n`;
                  ['h1', 'h2', 'h3'].forEach(tag => {
                    const headings = result.headings.all.filter(h => h.tag === tag);
                    report += `${tag.toUpperCase()} (${headings.length} found):\n`;
                    if (headings.length > 0) {
                      headings.forEach((h, idx) => {
                        report += `  - ${h.text}\n`;
                      });
                    } else {
                      report += `  - No ${tag.toUpperCase()} tags detected.\n`;
                    }
                    report += `\n`;
                  });
                  
                  report += `5. TECHNICAL SPECS (LINK NETWORK)\n`;
                  report += `--------------------------------------------------\n`;
                  if (result.links.checked.length > 0) {
                    result.links.checked.forEach((link, idx) => {
                      const type = link.href.startsWith('http') && !link.href.includes(hostname) ? 'EXTERNAL' : 'INTERNAL';
                      report += `[${idx + 1}] [${type}] [Status: ${link.status}] ${link.href}\n`;
                      report += `    Anchor Text: ${link.text || '(None)'}\n`;
                    });
                  } else {
                    report += `No links detected on the page.\n`;
                  }
                  
                  report += `\n==================================================\n`;
                  report += `END OF REPORT - STOCKFLOW INTELLIGENCE\n`;
                  report += `==================================================\n`;

                  const blob = new Blob([report], { type: 'text/plain' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `stockflow-seo-audit-${hostname}.txt`;
                  a.click();
                }}
                className="group relative flex items-center gap-4 px-12 py-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-sm tracking-[0.2em] rounded-[2rem] transition-all shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:shadow-[0_25px_50px_rgba(16,185,129,0.3)] hover:scale-105"
              >
                <FileText className="w-6 h-6" />
                Download Technical Report
                <div className="absolute inset-0 rounded-[2rem] border-2 border-emerald-500 scale-110 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            </div>
          </motion.div>
        )}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="w-32 h-32 bg-zinc-900/50 rounded-[3rem] flex items-center justify-center mb-10 border border-white/5 relative group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-all" />
              <Monitor className="w-12 h-12 text-zinc-700 relative z-10" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">System Ready</h2>
            <p className="text-zinc-500 max-w-sm text-sm leading-relaxed font-medium">
              Awaiting target URL input for deep-scan SEO analysis. Neural heuristics are primed for deployment.
            </p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1A1A1A;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}} />
    </div>
  );
}
