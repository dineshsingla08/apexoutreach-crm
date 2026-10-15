import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users, Mail, MessageSquare, Send, CheckCircle2, AlertCircle, RefreshCw,
  Search, Filter, ExternalLink, Phone, Building2, MapPin, Star, Play, Pause,
  Square, ShieldCheck, Settings, Download, FileSpreadsheet, Eye, Sparkles,
  ChevronRight, ChevronLeft, ArrowUpRight, Copy, Check, Clock, TrendingUp, AlertTriangle,
  Upload, Plus, Edit3, Key, UserCheck, Trash2, ArrowRight, Wand2, Zap, Briefcase,
  HeartHandshake, FileDown, LayoutGrid, List, Smartphone, Monitor, ChevronDown, FileText,
  Compass, Globe, Calendar, CalendarPlus, CheckSquare, CloudLightning,
  Bot, Flame, CheckCheck, ListTodo, Workflow, Layers,
  HelpCircle, Server, Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';

const API_BASE = '/api';

const INDUSTRY_TEMPLATES = {
  mfg_industrial: {
    id: 'mfg_industrial',
    name: 'Manufacturing & Industrial Supply',
    subject: "Optimizing operational margins & supplier buffer for {name}",
    body: `Dear {name} Team,

I've been following {name}'s industrial footprint in {area}. For prominent manufacturing and supply operations in {city}, fluctuating raw material lead times and vendor provisions often tie up significant working capital.

We specialize in helping industrial leaders unlock 12–18% efficiency in their supply payment cycles and treasury reserves without compromising cash liquidity:

1. Raw Material Reserve Optimization: Eliminate idle cash drag while safeguarding supplier commitments.
2. Vendor Cycle Streamlining: Cut operational processing friction across your {category} supply chain.
3. Rapid ROI: Realize measurable cost recovery and treasury yield within the first 60 days.

Would you be open to a brief 5-minute introductory call this Thursday around 11:30 AM or 3:00 PM to review a 1-page efficiency breakdown for {name}?

Best regards,
{sender_name}
{sender_phone} | {sender_email}`
  },
  tech_saas: {
    id: 'tech_saas',
    name: 'B2B Technology & Software Services',
    subject: "Accelerating recurring pipeline & client retention for {name}",
    body: `Hi {name} Leadership Team,

Noticed {name}'s technology solutions in {area}. For growth-stage software and B2B tech firms in {city}, sustaining high contract velocity while managing retainer runway and talent delivery is the top operational challenge.

We partner with modern technology firms to automate service delivery bottlenecks and elevate annual client retention:

• Pipeline Conversion Uplift: Increase qualified demo-to-close velocity by up to 24%.
• Churn Shielding: Automated engagement touchpoints that protect monthly recurring retainers.
• Cashflow Efficiency: Ensure zero delay between milestone delivery and cash settlement.

Could we schedule a concise 4-minute discussion this Wednesday or Thursday to share benchmark metrics from peer tech companies in {city}?

Best regards,
{sender_name}
{sender_phone} | {sender_email}`
  },
  logistics_supply_chain: {
    id: 'logistics_supply_chain',
    name: 'Logistics, Transport & Warehousing',
    subject: "Fleet turnaround & freight settlement efficiency for {name}",
    body: `Dear {name} Operations Team,

Managing line-haul schedules, warehouse turnaround, and fuel price volatility requires exceptional margin discipline across {area}.

We consult with logistics and transport providers across {city} to eliminate payment delays and improve asset productivity:

1. Fast-Track Freight Billing: Compress detention and vendor settlement cycles from 45 days down to 10 days.
2. Working Capital Buffer: Safeguard fleet operations with liquid credit and low-drag cash allocation.
3. Transparent Tracking: Full visibility into trip profitability and operational expense leakages.

Would you have 5 minutes this week for a quick consultation on streamlining freight settlement for {name}?

Best regards,
{sender_name}
{sender_phone} | {sender_email}`
  },
  real_estate_construction: {
    id: 'real_estate_construction',
    name: 'Real Estate, Construction & Development',
    subject: "Project financing & escrow milestone liquidity for {name}",
    body: `Dear {name} Development Team,

Congratulations on your active footprint and reputation across {area}. In commercial construction and real estate development in {city}, keeping contractor milestones aligned with liquidity drawdowns is essential to avoid project stalls.

We structure working capital solutions and project cash flow management for leading builders:

• Escrow & Milestone Cash Management: Maximize interest yields on pre-disbursement funds while complying with regulatory guidelines.
• Contractor Draw Optimization: Eliminate costly downtime between construction phases.
• Bank & CMA Structuring: Expedited access to institutional project credit lines at competitive terms.

Could we connect for a brief 5-minute call this Thursday to explore cash flow structuring for your upcoming projects in {area}?

Best regards,
{sender_name}
{sender_phone} | {sender_email}`
  },
  b2b_professional: {
    id: 'b2b_professional',
    name: 'General B2B Professional Services',
    subject: "Strategic growth & working capital efficiency for {name}",
    body: `Dear {name} Team,

I've been following {name}'s prominent reputation in {area}. As commercial service providers scale in {city}, balancing client deliverables with billing predictability and cash reserves determines long-term profitability.

We work alongside top B2B firms in {category} to optimize core business operations:

• Revenue Predictability: Shorten client invoice collection windows and reduce unbilled WIP.
• Capital Preservation: Put surplus reserves to work in safe, liquid instruments earning ~7% annualized returns.
• Operational Bandwidth: Free up partner time to focus on high-margin advisory and business expansion.

Would you be open to a quick 5-minute introductory call this week to review how peer firms in {city} are optimizing their cash efficiency?

Best regards,
{sender_name}
{sender_phone} | {sender_email}`
  },
  digital_agency: {
    id: 'digital_agency',
    name: 'Digital Agency & Client Acquisition (Web, SEO, Ads)',
    subject: "Acquiring 20–35 qualified appointments monthly for {name}",
    body: `Hi {name} Leadership Team,

I came across {name}'s operations in {area}. For top {category} providers in {city}, acquiring high-intent clients predictably without burning budget on untargeted social media boosts is the main growth priority.

We build end-to-end client acquisition engines tailored for local service leaders:

• High-Intent Search Ads: Capture prospective clients actively searching for {category} services in {area}.
• Conversion Landing Pages: Modern, mobile-first design that turns visitors into qualified phone & email inquiries.
• Automated WhatsApp Booking: Route incoming inquiries directly to your calendar or front desk to confirm appointments.

Would you be open to a concise 4-minute discussion this Thursday around 11:30 AM or 3:00 PM to review a 1-page growth roadmap for {name}?

Best regards,
{sender_name}
{sender_phone} | {sender_email}`
  },
  medical_health: {
    id: 'medical_health',
    name: 'Healthcare, Dental & Medical Clinics',
    subject: "Scaling patient OPD & local visibility for {name} ({area})",
    body: `Dear {name} Practice Management,

I've been following {name}'s strong reputation in {area}. For established clinics and healthcare centers in {city}, filling doctors' daily consultation OPD schedules with qualified patient inquiries requires steady local visibility.

We implement predictable patient acquisition systems for medical & diagnostic practices:

• Google Map Pack Optimization: Ensure {name} ranks in the top 3 results for clinical searches in {area}.
• High-Intent Treatment Inquiries: Target patients looking for specialized consultations and treatments nearby.
• Direct Front-Desk WhatsApp Routing: Cut patient drop-offs by confirming OPD consultations instantly.

Could we schedule a concise 5-minute phone call this Wednesday or Thursday to review patient demand in {area}?

Best regards,
{sender_name}
{sender_phone} | {sender_email}`
  },
  universal_agency: {
    id: 'universal_agency',
    name: 'Universal B2B Agency & Growth Pitch',
    subject: "Quick growth & partnership inquiry for {name} ({area})",
    body: `Hi {name} Leadership Team,

Noticed {name}'s operations and market presence across {area}.

We partner with prominent {category} companies in {city} to scale new business acquisition, automate client follow-ups, and eliminate operational bottlenecks:

1. Measurable ROI: Deliver quantifiable revenue and client velocity within 45 days.
2. Zero Workflow Friction: Seamless integration with your current tools and operations.
3. Dedicated Growth Support: Tailored execution aligned with {name}'s quarterly targets.

Would you be open to an introductory 4-minute discussion this Thursday around 11:30 AM or 3:00 PM to explore potential synergies?

Best regards,
{sender_name}
{sender_phone} | {sender_email}`
  }
};

export default function App() {
  // Navigation: 'crm', 'scraper', 'campaign', 'whatsapp', 'logs', 'settings'
  const [activeTab, setActiveTab] = useState('crm');

  // CRM View Mode: 'table' or 'kanban'
  const [crmView, setCrmView] = useState('table');

  // Datasets
  const [csvFiles, setCsvFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('MASTER_CRM');
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Pagination in Table View
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Accounts & Sender Configuration
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('dinesh_singhal');
  const [editingAccount, setEditingAccount] = useState(null);
  const [testingSmtp, setTestingSmtp] = useState(false);

  // CRM Filters & Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [emailFilter, setEmailFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [scoreSortOrder, setScoreSortOrder] = useState('score_desc');
  const [highPriorityFilter, setHighPriorityFilter] = useState(false);
  const [showSearchHelp, setShowSearchHelp] = useState(false);
  const [showSmtpHealthTooltip, setShowSmtpHealthTooltip] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
  const [activeDossierLead, setActiveDossierLead] = useState(null);

  // Kanban Drag and Drop State
  const [draggedLead, setDraggedLead] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  // Deduplication Intelligence Stats
  const [dedupStats, setDedupStats] = useState(null);
  const [isRunningDedup, setIsRunningDedup] = useState(false);

  // Micro-Batch Queue Throttling State
  const [microBatchSize, setMicroBatchSize] = useState(4);
  const [batchCooldown, setBatchCooldown] = useState(10);
  const [jitterMin, setJitterMin] = useState(3);
  const [jitterMax, setJitterMax] = useState(7);

  // Quick Activity Timeline Log State
  const [newTouchpointText, setNewTouchpointText] = useState('');
  const [newTouchpointChannel, setNewTouchpointChannel] = useState('call');

  // Lead Notes (Persistent locally)
  const [leadNotes, setLeadNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('crm_lead_notes') || '{}');
    } catch {
      return {};
    }
  });

  // Calendar Scheduled Events
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showCalendarWidget, setShowCalendarWidget] = useState(false);
  const [schedTitle, setSchedTitle] = useState('');
  const [schedDatetime, setSchedDatetime] = useState('');
  const [schedAgenda, setSchedAgenda] = useState('');

  // Follow-Up Tasks & Reminders
  const [tasks, setTasks] = useState([]);
  const [taskSummary, setTaskSummary] = useState({ pending: 0, overdue: 0 });
  const [showTaskDrawer, setShowTaskDrawer] = useState(false);
  const [taskFilter, setTaskFilter] = useState('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAction, setNewTaskAction] = useState('call');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [taskSelectedLeadId, setTaskSelectedLeadId] = useState('');

  // Quick Jump Navigation
  const [jumpPageInput, setJumpPageInput] = useState('');

  // AI Spark Icebreaker Generator
  const [showAiSparkModal, setShowAiSparkModal] = useState(false);
  const [aiSparkLead, setAiSparkLead] = useState(null);
  const [aiIcebreakerData, setAiIcebreakerData] = useState(null);
  const [loadingAiSpark, setLoadingAiSpark] = useState(false);
  const [copiedIcebreakerId, setCopiedIcebreakerId] = useState(null);

  // AI Email Generator per Lead
  const [aiAngle, setAiAngle] = useState('mutual_fund');
  const [aiTone, setAiTone] = useState('consultative');
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedAiOutreach, setGeneratedAiOutreach] = useState(null);

  // AI Multi-Touch Sequence Hook State
  const [activeSequenceData, setActiveSequenceData] = useState(null);
  const [activeSequenceStep, setActiveSequenceStep] = useState(1);
  const [isGeneratingSequence, setIsGeneratingSequence] = useState(false);
  const [showSequencePanel, setShowSequencePanel] = useState(false);

  // WhatsApp Templates Quick-Dispatcher
  const [waTemplates, setWaTemplates] = useState([]);
  const [selectedWaTemplateId, setSelectedWaTemplateId] = useState('liquid_mf');
  const [showNewWaModal, setShowNewWaModal] = useState(false);
  const [newWaTitle, setNewWaTitle] = useState('');
  const [newWaCategory, setNewWaCategory] = useState('General');
  const [newWaContent, setNewWaContent] = useState('');

  // Daily Automation & Quotas
  const [cronTracker, setCronTracker] = useState({
    date: '',
    sent_today: 0,
    daily_limit: 50,
    remaining_today: 50,
    token: 'apex_secret_cron_2026',
    webhook_endpoint: '/api/cron/dispatch-daily?token=apex_secret_cron_2026'
  });
  const [triggeringDaily, setTriggeringDaily] = useState(false);

  // In-App Google Maps Scraper
  const [scraperQuery, setScraperQuery] = useState('Chartered Accountants in Gurgaon');
  const [scraperCity, setScraperCity] = useState('Gurgaon, Haryana');
  const [scraperLimit, setScraperLimit] = useState(25);
  const [scraperOutputName, setScraperOutputName] = useState('scraped_ca_gurgaon.csv');
  const [scraperAppendMaster, setScraperAppendMaster] = useState(true);
  const [scraperJob, setScraperJob] = useState({
    is_running: false,
    query: '',
    city: '',
    limit: 25,
    found: 0,
    emails_found: 0,
    percentage: 0,
    output_filename: '',
    logs: [],
    recent_leads: []
  });

  // Email Campaign Composer State
  const [selectedTemplate, setSelectedTemplate] = useState('mfg_industrial');
  const [customSubject, setCustomSubject] = useState(INDUSTRY_TEMPLATES['mfg_industrial']?.subject || '');
  const [customBody, setCustomBody] = useState(INDUSTRY_TEMPLATES['mfg_industrial']?.body || '');
  const [isCustomMode, setIsCustomMode] = useState(true);
  const [previewLead, setPreviewLead] = useState(null);
  const [renderedPreview, setRenderedPreview] = useState(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState('dineshsingla08@gmail.com');
  const [sendingTest, setSendingTest] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [isTransformingAi, setIsTransformingAi] = useState(false);
  const [activePolisher, setActivePolisher] = useState(null);
  const [toast, setToast] = useState(null);

  // WhatsApp Composer & Auto-Queue State
  const [customWaText, setCustomWaText] = useState('');
  const [waQueueIndex, setWaQueueIndex] = useState(0);

  // Batch Job State
  const [batchStatus, setBatchStatus] = useState({
    is_running: false,
    is_paused: false,
    total: 0,
    sent: 0,
    failed: 0,
    percentage: 0,
    current_lead: '',
    current_email: '',
    logs: []
  });
  const [delayRange, setDelayRange] = useState({ min: 5, max: 10 });
  const [audienceType, setAudienceType] = useState('all_with_email');

  // Logs
  const [sentLogs, setSentLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Refs
  const fileInputRef = useRef(null);
  const terminalLogsRef = useRef(null);
  const scraperLogsRef = useRef(null);
  const emailBodyTextareaRef = useRef(null);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Initial Load
  useEffect(() => {
    fetchCsvs();
    fetchAccounts();
    fetchCronStatus();
    fetchCalendarEvents();
    fetchTasks();
    fetchWaTemplates();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks || []);
        setTaskSummary({ pending: data.pending_count || 0, overdue: data.overdue_count || 0 });
      }
    } catch (e) {
      console.error('Error fetching tasks:', e);
    }
  };

  const fetchWaTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/whatsapp/templates`);
      const data = await res.json();
      if (data.success && data.templates) {
        setWaTemplates(data.templates);
      }
    } catch (e) {
      console.error('Error fetching WA templates:', e);
    }
  };

  const fetchCsvs = async () => {
    try {
      const res = await fetch(`${API_BASE}/csvs`);
      const data = await res.json();
      if (data.success) {
        setCsvFiles(data.files);
        if (!selectedFile) setSelectedFile('MASTER_CRM');
      }
    } catch (err) {
      console.error('Error fetching CSVs:', err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_BASE}/accounts`);
      const data = await res.json();
      if (data.success && data.accounts.length > 0) {
        setAccounts(data.accounts);
        if (!selectedAccount) {
          const relay = data.accounts.find(a => a.id === 'dinesh_singhal') || data.accounts[0];
          setSelectedAccount(relay.id);
        }
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

  const fetchCronStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/cron/status`);
      const data = await res.json();
      if (data.success && data.tracker) {
        setCronTracker(data.tracker);
        if (data.tracker.micro_batch_size) setMicroBatchSize(data.tracker.micro_batch_size);
        if (data.tracker.batch_cooldown) setBatchCooldown(data.tracker.batch_cooldown);
        if (data.tracker.jitter_min) setJitterMin(data.tracker.jitter_min);
        if (data.tracker.jitter_max) setJitterMax(data.tracker.jitter_max);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/calendar/events`);
      const data = await res.json();
      if (data.success) {
        setCalendarEvents(data.events || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Load Leads for Active File
  useEffect(() => {
    if (selectedFile) {
      loadLeadsForFile(selectedFile);
    }
  }, [selectedFile]);

  const loadLeadsForFile = async (filename) => {
    setLoadingLeads(true);
    setSelectedLeadIds(new Set());
    setWaQueueIndex(0);
    setCurrentPage(1);
    try {
      const res = await fetch(`${API_BASE}/leads?file=${encodeURIComponent(filename)}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
        if (data.dedup_stats) {
          setDedupStats(data.dedup_stats);
        }
        if (data.leads.length > 0) {
          setPreviewLead(data.leads[0]);
        }
      } else {
        showToast(data.error, 'error');
      }
    } catch (err) {
      showToast('Failed to load leads from database', 'error');
    } finally {
      setLoadingLeads(false);
    }
  };

  // On-Demand Fuzzy Deduplication Audit
  const runDeduplicationAudit = async () => {
    setIsRunningDedup(true);
    try {
      const res = await fetch(`${API_BASE}/crm/deduplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        if (data.stats) setDedupStats(data.stats);
        await loadLeadsForFile(selectedFile);
      }
    } catch {
      showToast('Error running deduplication audit', 'error');
    } finally {
      setIsRunningDedup(false);
    }
  };

  // 3. Handle Direct CSV Upload with Smart Deduplication
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/upload-csv`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Uploaded ${data.filename} successfully!`);
        await fetchCsvs();
        setSelectedFile(data.filename);
      } else {
        showToast(data.error || 'Failed to upload CSV', 'error');
      }
    } catch (err) {
      showToast('Upload error', 'error');
    }
  };

  // 4. Batch Polling Effect
  useEffect(() => {
    let interval = null;
    const pollBatch = async () => {
      try {
        const res = await fetch(`${API_BASE}/batch-status`);
        const data = await res.json();
        if (data.success && data.job) {
          const wasRunning = batchStatus.is_running;
          setBatchStatus(data.job);
          if (wasRunning && !data.job.is_running && data.job.sent > 0) {
            confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
            showToast(`Batch completed! ${data.job.sent} emails delivered successfully.`, 'success');
            fetchCronStatus();
          }
        }
      } catch (e) {
        // quiet error
      }
    };

    pollBatch();
    interval = setInterval(pollBatch, 2000);
    return () => clearInterval(interval);
  }, [batchStatus.is_running]);

  // Autoscroll terminal
  useEffect(() => {
    if (terminalLogsRef.current) {
      terminalLogsRef.current.scrollTop = terminalLogsRef.current.scrollHeight;
    }
  }, [batchStatus.logs]);

  // 5. Scraper Polling Effect
  useEffect(() => {
    let interval = null;
    const pollScraper = async () => {
      try {
        const res = await fetch(`${API_BASE}/scraper/status`);
        const data = await res.json();
        if (data.success && data.job) {
          const wasRunning = scraperJob.is_running;
          setScraperJob(data.job);
          if (wasRunning && !data.job.is_running && data.job.found > 0) {
            confetti({ particleCount: 80, spread: 60 });
            showToast(`Scrape completed! Discovered ${data.job.found} businesses (${data.job.emails_found} with emails).`, 'success');
            await fetchCsvs();
          }
        }
      } catch (e) {
        // quiet error
      }
    };

    pollScraper();
    if (scraperJob.is_running) {
      interval = setInterval(pollScraper, 1500);
    }
    return () => clearInterval(interval);
  }, [scraperJob.is_running]);

  // Autoscroll scraper logs
  useEffect(() => {
    if (scraperLogsRef.current) {
      scraperLogsRef.current.scrollTop = scraperLogsRef.current.scrollHeight;
    }
  }, [scraperJob.logs]);

  // 6. Dynamic Preview Generation
  useEffect(() => {
    const fetchPreview = async () => {
      if (!previewLead) return;
      try {
        const res = await fetch(`${API_BASE}/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            template_id: selectedTemplate,
            lead: previewLead,
            account_id: selectedAccount,
            custom_subject: isCustomMode ? customSubject : '',
            custom_body: isCustomMode ? customBody : '',
            custom_wa: customWaText
          })
        });
        const data = await res.json();
        if (data.success) {
          setRenderedPreview(data);
          if (!isCustomMode && !customSubject) {
            setCustomSubject(data.subject);
            setCustomBody(data.body_plain);
          }
          if (!customWaText) {
            setCustomWaText(data.wa_text);
          }
        }
      } catch (err) {
        console.error('Preview error:', err);
      }
    };
    fetchPreview();
  }, [selectedTemplate, previewLead, selectedAccount, isCustomMode, customSubject, customBody, customWaText]);

  // Insert Variable at Cursor in Email Composer
  const insertVariable = (variableTag) => {
    const textarea = emailBodyTextareaRef.current;
    if (!textarea) {
      setCustomBody(prev => prev + ' ' + variableTag);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = customBody;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    setCustomBody(before + variableTag + after);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variableTag.length, start + variableTag.length);
    }, 50);
  };

  // Dynamic Industry Template Selector
  const handleSelectTemplate = (templateKey) => {
    setSelectedTemplate(templateKey);
    const tmpl = INDUSTRY_TEMPLATES[templateKey];
    if (tmpl) {
      setCustomSubject(tmpl.subject);
      setCustomBody(tmpl.body);
      setIsCustomMode(true);
      showToast(`Loaded "${tmpl.name}" preset template!`);
    }
  };

  // Flexible AI Message Polishers (Value-First, Pain-Point, Social Proof, Short & Punchy)
  const handleApplyAiPolisher = async (styleKey) => {
    setIsTransformingAi(true);
    setActivePolisher(styleKey);
    setIsCustomMode(true);

    try {
      const res = await fetch(`${API_BASE}/ai/transform-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: styleKey,
          text: customBody,
          subject: customSubject,
          lead: previewLead,
          account_id: selectedAccount
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.subject) setCustomSubject(data.subject);
        if (data.body) setCustomBody(data.body);
        showToast(`Transformed copy: ${data.style_label} (${data.word_count || ''} words)`);
      } else {
        applyClientSidePolisher(styleKey);
      }
    } catch (e) {
      applyClientSidePolisher(styleKey);
    } finally {
      setIsTransformingAi(false);
      setTimeout(() => setActivePolisher(null), 2500);
    }
  };

  // Client-Side Resilient AI Polisher Fallback
  const applyClientSidePolisher = (styleKey) => {
    setIsCustomMode(true);
    if (styleKey === 'value_first') {
      setCustomSubject("Quick ROI & operational efficiency gains for {name}");
      setCustomBody(
        `Dear {name} Team,\n\nFollowing your operations in {area}, our focus is straightforward: helping prominent {category} firms unlock 12%–18% efficiency in working capital and operational turnaround without changing existing vendors.\n\nHere is the direct value upside we quantify for our partners:\n• Direct Cost Savings: Reclaim ₹1.5L–₹4L in annual uncaptured cash drag and idle provisions.\n• Capital Liquidity: Maintain 100% instant access to reserves with zero operational disruption.\n• Rapid Payback: Realize measurable efficiency metrics within the first 45–60 days.\n\nWould you be open to a 4-minute introductory call this Thursday to review a 1-page efficiency projection for {name}?\n\nBest regards,\n{sender_name}\n{sender_phone} | {sender_email}`
      );
      showToast('Applied "Value-First Prospecting" polisher!');
    } else if (styleKey === 'pain_point') {
      setCustomSubject("Addressing the hidden operational bottleneck in {area} for {name}");
      setCustomBody(
        `Dear {name} Leadership,\n\nRunning a high-performing {category} enterprise in {area} typically comes with an unseen drag: delayed supplier settlements, idle current account cash erosion, and administrative overheads that quietly drain profit margins.\n\nLeaving these workflow bottlenecks unaddressed compounds each quarter, costing firms across {city} significant margin dilution.\n\nWe implement structured workflow frameworks that eliminate invoice lag, maximize treasury yields at ~7%, and automate administrative follow-ups.\n\nCould we connect for a brief 5-minute diagnostic call this Wednesday or Thursday to review where {name} might be experiencing friction?\n\nBest regards,\n{sender_name}\n{sender_phone} | {sender_email}`
      );
      showToast('Applied "Pain-Point Agitator" polisher!');
    } else if (styleKey === 'social_proof') {
      setCustomSubject("How leading {category} operators in {city} scaled margins (+ note for {name})");
      setCustomBody(
        `Hi {name} Team,\n\nCongratulations on your strong reputation and client standing in {area}.\n\nLast quarter, we worked with three established {category} leaders across {city}. By restructuring their short-term operational buffers and vendor turnaround timelines, each business captured over ₹2.4L in additional annual yield while cutting settlement friction by 35%.\n\nGiven {name}'s standing in {area}, we could replicate similar bottom-line efficiency gains for your team with zero change to your day-to-day operations.\n\nWould you be open to reviewing a 2-minute anonymized case study on a quick call this Thursday?\n\nBest regards,\n{sender_name}\n{sender_phone} | {sender_email}`
      );
      showToast('Applied "Case Study / Social Proof" polisher!');
    } else if (styleKey === 'short_punchy' || styleKey === 'punchy') {
      setCustomSubject("Quick question for {name} ({area})");
      setCustomBody(
        `Hi {name} Team,\n\nNoticed your operations in {area} — are you currently capturing ~7% annualized on idle operational cash, or is it sitting in a 0% current account?\n\nWe help {category} firms across {city} safely optimize reserve liquidity with 24-hour instant withdrawal.\n\nOpen to a 3-minute chat this Thursday at 11:30 AM or 3:00 PM?\n\nBest,\n{sender_name}\n{sender_phone}`
      );
      showToast('Applied "Short & Punchy (<60w)" polisher!');
    }
  };

  const applyTonePreset = (toneKey) => handleApplyAiPolisher(toneKey === 'punchy' ? 'short_punchy' : toneKey);

  // Launch In-App Google Maps Scraper
  const handleStartScraper = async () => {
    if (!scraperQuery.trim()) {
      showToast('Please enter search keywords (e.g. Chartered Accountants in Gurgaon)', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/scraper/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: scraperQuery.trim(),
          city: scraperCity.trim(),
          limit: scraperLimit,
          output_filename: scraperOutputName.trim(),
          append_to_master: scraperAppendMaster
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setScraperJob(prev => ({ ...prev, is_running: true, query: scraperQuery }));
      } else {
        showToast(data.error || 'Failed to start scraper', 'error');
      }
    } catch (e) {
      showToast('Network error launching scraper', 'error');
    }
  };

  const handleStopScraper = async () => {
    try {
      await fetch(`${API_BASE}/scraper/stop`, { method: 'POST' });
      showToast('Sent stop signal to scraper');
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger Daily Batch Automation Webhook
  const handleTriggerDailyCron = async () => {
    setTriggeringDaily(true);
    try {
      const res = await fetch(`${API_BASE}/cron/dispatch-daily?token=${encodeURIComponent(cronTracker.token)}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        fetchCronStatus();
      } else {
        showToast(data.message || data.error, 'error');
      }
    } catch (e) {
      showToast('Error triggering daily cron', 'error');
    } finally {
      setTriggeringDaily(false);
    }
  };

  const handleSaveCronSettings = async (newLimit, newToken, newBatchSize, newCooldown, newJMin, newJMax) => {
    try {
      const res = await fetch(`${API_BASE}/cron/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daily_limit: newLimit,
          token: newToken,
          micro_batch_size: newBatchSize ?? microBatchSize,
          batch_cooldown: newCooldown ?? batchCooldown,
          jitter_min: newJMin ?? jitterMin,
          jitter_max: newJMax ?? jitterMax
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        fetchCronStatus();
      }
    } catch (e) {
      showToast('Error saving daily settings', 'error');
    }
  };

  // Kanban HTML5 Drag & Drop Handler with Instant State & Confetti
  const handleKanbanDrop = async (targetStageId) => {
    if (!draggedLead) return;
    const currentStatus = draggedLead.status || 'New';
    if (currentStatus === targetStageId) {
      setDraggedLead(null);
      setDragOverCol(null);
      return;
    }
    const leadToMove = draggedLead;
    setDraggedLead(null);
    setDragOverCol(null);

    // Instant local state update
    setLeads(prev => prev.map(l => l.id === leadToMove.id ? {
      ...l,
      status: targetStageId,
      last_contacted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } : l));

    if (activeDossierLead && activeDossierLead.id === leadToMove.id) {
      setActiveDossierLead(prev => ({
        ...prev,
        status: targetStageId,
        engagement_history: [
          ...(prev.engagement_history || []),
          {
            timestamp: new Date().toLocaleString(),
            channel: 'kanban_board',
            action: 'pipeline_drag',
            status: targetStageId,
            details: `Moved to ${targetStageId} via Kanban Drag & Drop`
          }
        ]
      }));
    }

    // Confetti celebration if converted!
    if (targetStageId === 'Converted') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast(`🎉 Congratulations! Converted "${leadToMove.name}"!`);
    } else {
      showToast(`Moved "${leadToMove.name}" to ${targetStageId}`);
    }

    // Persist via backend
    try {
      await fetch(`${API_BASE}/leads/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadToMove.id,
          email: leadToMove.email,
          status: targetStageId,
          channel: 'kanban_board',
          action: 'pipeline_drag',
          details: `Moved to ${targetStageId} via Kanban Drag & Drop`
        })
      });
    } catch (e) {
      console.error('Failed to persist status change', e);
    }
  };

  // Quick Activity Timeline Touchpoint Logger
  const handleQuickTouchpointLog = async (lead) => {
    if (!lead || !newTouchpointText.trim()) return;
    const text = newTouchpointText.trim();
    const channel = newTouchpointChannel || 'call';
    setNewTouchpointText('');

    const newEvt = {
      timestamp: new Date().toLocaleString(),
      channel: channel,
      action: 'note_logged',
      status: lead.status || 'Contacted',
      details: text
    };

    setLeads(prev => prev.map(l => {
      if (l.id === lead.id) {
        return {
          ...l,
          engagement_history: [...(l.engagement_history || []), newEvt]
        };
      }
      return l;
    }));

    if (activeDossierLead && activeDossierLead.id === lead.id) {
      setActiveDossierLead(prev => ({
        ...prev,
        engagement_history: [...(prev.engagement_history || []), newEvt]
      }));
    }

    try {
      await fetch(`${API_BASE}/leads/engagement-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          channel: channel,
          action: 'user_note',
          details: text
        })
      });
      showToast('Activity touchpoint logged in timeline!', 'success');
    } catch (err) {
      console.error('Error logging touchpoint', err);
    }
  };

  // Calendar Helpers: Google Calendar URL & .ics generator
  const makeGoogleCalendarUrl = (title, datetimeStr, agenda, location = '') => {
    if (!datetimeStr) return '#';
    const cleanDt = datetimeStr.replace(/[^0-9]/g, '');
    const start = cleanDt.length >= 12 ? cleanDt.slice(0, 12) + '00' : '20261016T110000';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${start}&details=${encodeURIComponent(agenda)}&location=${encodeURIComponent(location)}`;
  };

  const downloadIcsFile = (title, datetimeStr, agenda, location = '') => {
    const cleanDt = (datetimeStr || '').replace(/[^0-9]/g, '');
    const startDt = cleanDt.length >= 12 ? cleanDt.slice(0, 12) + '00' : '20261016T110000';
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ApexOutreach Studio//CRM Outreach//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nBEGIN:VEVENT\nSUMMARY:${title}\nDESCRIPTION:${agenda}\nLOCATION:${location}\nDTSTART:${startDt}\nDTEND:${startDt}\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'crm_reminder').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Downloaded .ics calendar invite!');
  };

  const handleSaveCalendarEvent = async () => {
    if (!activeDossierLead) return;
    const title = schedTitle || `Follow-up Consultation with ${activeDossierLead.name}`;
    const dt = schedDatetime || new Date(Date.now() + 86400000).toISOString().slice(0, 16);
    const agenda = schedAgenda || 'Mutual Fund Treasury & Working Capital Consultation';

    try {
      const res = await fetch(`${API_BASE}/calendar/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: activeDossierLead.id,
          lead_name: activeDossierLead.name,
          lead_phone: activeDossierLead.phone,
          lead_email: activeDossierLead.email,
          datetime: dt,
          title: title,
          agenda: agenda
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Scheduled follow-up with ${activeDossierLead.name}!`);
        fetchCalendarEvents();
        handleStatusChange(activeDossierLead, 'Follow-up');
      }
    } catch (e) {
      showToast('Error saving calendar event', 'error');
    }
  };

  // Snooze Calendar Appointment
  const handleSnoozeAppointment = async (evt, hours = 24) => {
    if (!evt) return;
    try {
      const res = await fetch(`${API_BASE}/calendar/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: evt.id,
          lead_name: evt.lead_name,
          hours: hours
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Appointment snoozed by ${hours} hours!`);
        fetchCalendarEvents();
      } else {
        showToast(data.error || 'Failed to snooze appointment', 'error');
      }
    } catch (e) {
      showToast('Error snoozing appointment', 'error');
    }
  };

  // Mark Calendar Appointment Complete
  const handleCompleteAppointment = async (evt) => {
    if (!evt) return;
    try {
      const res = await fetch(`${API_BASE}/calendar/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: evt.id,
          lead_name: evt.lead_name,
          lead_id: evt.lead_id
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
        showToast(`Consultation with ${evt.lead_name} marked complete! ✓`, 'success');
        fetchCalendarEvents();
        if (evt.lead_id) {
          setLeads(prev => prev.map(l => l.id === evt.lead_id ? { ...l, status: 'Interested' } : l));
          if (activeDossierLead && activeDossierLead.id === evt.lead_id) {
            setActiveDossierLead(prev => ({ ...prev, status: 'Interested' }));
          }
        }
      } else {
        showToast(data.error || 'Failed to complete appointment', 'error');
      }
    } catch (e) {
      showToast('Error completing appointment', 'error');
    }
  };

  // Save Sender Account Configuration
  const handleSaveAccount = async () => {
    if (!editingAccount) return;
    try {
      const res = await fetch(`${API_BASE}/accounts/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAccount)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        await fetchAccounts();
        setEditingAccount(null);
      } else {
        showToast(data.error || 'Failed to save account', 'error');
      }
    } catch (err) {
      showToast('Error saving account', 'error');
    }
  };

  // Test SMTP Connection
  const handleTestSmtp = async (account) => {
    setTestingSmtp(true);
    try {
      const res = await fetch(`${API_BASE}/accounts/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp_server: account.smtp_server,
          smtp_port: account.smtp_port,
          smtp_user: account.smtp_user,
          smtp_pass: account.smtp_pass
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
      } else {
        showToast(`SMTP Failed: ${data.error}`, 'error');
      }
    } catch (err) {
      showToast('Error testing SMTP connection', 'error');
    } finally {
      setTestingSmtp(false);
    }
  };

  // Update Lead Status & Engagement Event
  const handleStatusChange = async (lead, newStatus, action = 'status_update', details = '') => {
    try {
      const res = await fetch(`${API_BASE}/leads/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          email: lead.email,
          status: newStatus,
          action: action,
          channel: 'manual',
          details: details || `Stage updated to "${newStatus}"`
        })
      });
      const data = await res.json();
      if (data.success) {
        const updatedHistory = data.state?.engagement_history || [
          ...(lead.engagement_history || []),
          { timestamp: new Date().toLocaleTimeString(), channel: 'manual', action, status: newStatus, details }
        ];
        const nowIso = new Date().toISOString();
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus, last_contacted: nowIso, engagement_history: updatedHistory } : l));
        showToast(`Status updated to "${newStatus}" for ${lead.name}`);
        if (activeDossierLead && activeDossierLead.id === lead.id) {
          setActiveDossierLead(prev => ({ ...prev, status: newStatus, last_contacted: nowIso, engagement_history: updatedHistory }));
        }
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Simulate Lead Reply / Inbound Engagement Hook
  const handleSimulateReply = async (lead = activeDossierLead) => {
    if (!lead) return;
    try {
      const res = await fetch(`${API_BASE}/leads/engagement-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          channel: 'email',
          action: 'reply_received',
          details: `Inbound reply: "Interested in Mutual Fund Treasury yield calculation for ${lead.name}. Please call us."`,
          new_status: 'Interested'
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        showToast(`Simulated reply from ${lead.name}! Lead moved to "Interested" 🔥`, 'success');
        const updatedHistory = data.state?.engagement_history || [];
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'Interested', engagement_history: updatedHistory } : l));
        if (activeDossierLead && activeDossierLead.id === lead.id) {
          setActiveDossierLead(prev => ({ ...prev, status: 'Interested', engagement_history: updatedHistory }));
        }
      }
    } catch (e) {
      showToast('Error simulating reply', 'error');
    }
  };

  // AI Email Generator per Lead
  const handleGenerateAi = async (lead = activeDossierLead || previewLead) => {
    if (!lead) {
      showToast('No lead selected for AI personalization', 'error');
      return;
    }
    setIsGeneratingAi(true);
    try {
      const res = await fetch(`${API_BASE}/ai/personalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: lead,
          account_id: selectedAccount,
          angle: aiAngle,
          tone: aiTone,
          custom_prompt: aiCustomPrompt
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedAiOutreach(data);
        showToast(`Generated tailored outreach for ${lead.name}!`, 'success');
      } else {
        showToast(data.error || 'Failed to generate AI email', 'error');
      }
    } catch (e) {
      showToast('Network error generating AI email', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const applyAiToComposer = (aiData) => {
    if (!aiData) return;
    setCustomSubject(aiData.subject);
    setCustomBody(aiData.body_plain);
    setIsCustomMode(true);
    if (aiData.suggested_wa) {
      setCustomWaText(aiData.suggested_wa);
    }
    setActiveTab('campaign');
    showToast('Applied AI personalized outreach to Email Composer!');
  };

  // AI Multi-Touch Sequence Handlers
  const handleGenerateAiSequence = async (lead = previewLead || activeDossierLead) => {
    if (!lead) {
      showToast('No lead selected for sequence generation', 'error');
      return;
    }
    setIsGeneratingSequence(true);
    try {
      const res = await fetch(`${API_BASE}/ai/sequence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: lead,
          account_id: selectedAccount,
          strategy: aiAngle || 'mutual_fund'
        })
      });
      const data = await res.json();
      if (data.success && data.steps) {
        setActiveSequenceData(data);
        setActiveSequenceStep(1);
        setShowSequencePanel(true);
        showToast(`Generated 3-touch sequence for ${data.lead_name}!`, 'success');
      } else {
        showToast('Failed to generate sequence', 'error');
      }
    } catch {
      showToast('Network error generating sequence', 'error');
    } finally {
      setIsGeneratingSequence(false);
    }
  };

  const handleApplySequenceStep = (step) => {
    if (!step) return;
    setCustomSubject(step.subject);
    setCustomBody(step.body_plain);
    setIsCustomMode(true);
    showToast(`Applied ${step.title} to composer!`);
  };

  const handleAdvanceLeadSequence = async (lead, targetStep) => {
    if (!lead) return;
    try {
      const res = await fetch(`${API_BASE}/sequences/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          target_step: targetStep,
          step_title: `Touch ${targetStep}`
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, sequence_step: targetStep, status: targetStep > 1 ? 'Follow-up' : 'Contacted' } : l));
        if (activeDossierLead && activeDossierLead.id === lead.id) {
          setActiveDossierLead(prev => ({ ...prev, sequence_step: targetStep, status: targetStep > 1 ? 'Follow-up' : 'Contacted' }));
        }
      }
    } catch {
      showToast('Error advancing sequence', 'error');
    }
  };

  // Follow-Up Task Handlers
  const handleCreateTask = async (customLead = null) => {
    const targetLead = customLead || activeDossierLead || leads.find(l => l.id === taskSelectedLeadId);
    const title = newTaskTitle.trim() || `Follow-up with ${targetLead ? targetLead.name : 'Business Owner'}`;
    const dueDate = newTaskDueDate || new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16);

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: targetLead ? targetLead.id : '',
          lead_name: targetLead ? targetLead.name : 'General Follow-up',
          lead_phone: targetLead ? targetLead.phone : '',
          lead_email: targetLead ? targetLead.email : '',
          lead_city: targetLead ? (targetLead.area || targetLead.city) : '',
          title: title,
          action_type: newTaskAction,
          due_date: dueDate,
          notes: newTaskNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Created follow-up task!', 'success');
        setNewTaskTitle('');
        setNewTaskNotes('');
        await fetchTasks();
        if (targetLead) {
          handleStatusChange(targetLead, 'Follow-up', 'task_created', `Scheduled task: ${title}`);
        }
      }
    } catch (e) {
      showToast('Error creating task', 'error');
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId })
      });
      const data = await res.json();
      if (data.success) {
        if (data.task?.completed) {
          confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
          showToast('Task completed! Great work! 🎉');
        } else {
          showToast('Task marked active');
        }
        await fetchTasks();
      }
    } catch (e) {
      showToast('Error updating task', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Task deleted');
        await fetchTasks();
      }
    } catch (e) {
      showToast('Error deleting task', 'error');
    }
  };

  // WhatsApp Template Selection & Customization
  const handleSelectWaTemplate = (tpl) => {
    setSelectedWaTemplateId(tpl.id);
    setCustomWaText(tpl.text);
    showToast(`Loaded "${tpl.title}" template!`);
  };

  const handleSaveCustomWaTemplate = async () => {
    if (!newWaTitle.trim() || !newWaContent.trim()) {
      showToast('Please enter title and template text', 'error');
      return;
    }
    const newTpl = {
      id: `custom_${Date.now()}`,
      title: newWaTitle.trim(),
      category: newWaCategory.trim() || 'Custom',
      text: newWaContent.trim()
    };
    const updated = [...waTemplates, newTpl];
    try {
      const res = await fetch(`${API_BASE}/whatsapp/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates: updated })
      });
      const data = await res.json();
      if (data.success) {
        setWaTemplates(updated);
        setSelectedWaTemplateId(newTpl.id);
        setCustomWaText(newTpl.text);
        setShowNewWaModal(false);
        setNewWaTitle('');
        setNewWaContent('');
        showToast('Saved custom WhatsApp template!', 'success');
      }
    } catch (e) {
      showToast('Error saving template', 'error');
    }
  };

  // Bulk Status Change
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedLeadIds.size === 0) return;
    const targetLeads = leads.filter(l => selectedLeadIds.has(l.id));
    try {
      for (const lead of targetLeads) {
        await fetch(`${API_BASE}/leads/update-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_id: lead.id, email: lead.email, status: newStatus })
        });
      }
      setLeads(prev => prev.map(l => selectedLeadIds.has(l.id) ? { ...l, status: newStatus } : l));
      showToast(`Updated ${targetLeads.length} leads to "${newStatus}"!`);
    } catch (e) {
      showToast('Failed to update status in bulk', 'error');
    }
  };

  // Note Saver
  const saveLeadNote = (leadId, noteText) => {
    const updated = { ...leadNotes, [leadId]: noteText };
    setLeadNotes(updated);
    try {
      localStorage.setItem('crm_lead_notes', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Send Test Email
  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      showToast('Please enter a valid test recipient email', 'error');
      return;
    }
    setSendingTest(true);
    try {
      const target = previewLead || leads[0];
      const res = await fetch(`${API_BASE}/send-single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: target,
          template_id: selectedTemplate,
          account_id: selectedAccount,
          override_email: testEmailRecipient,
          custom_subject: isCustomMode ? customSubject : '',
          custom_body: isCustomMode ? customBody : ''
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Test email successfully sent to ${testEmailRecipient}!`);
      } else {
        showToast(data.error || 'Test email failed', 'error');
      }
    } catch (err) {
      showToast('Network error sending test email', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  // Start Batch Dispatch
  const handleStartBatch = async () => {
    let targets = [];
    if (audienceType === 'selected_only') {
      targets = leads.filter(l => selectedLeadIds.has(l.id) && l.has_email);
      if (targets.length === 0) {
        showToast('Please select at least 1 lead with email from the CRM table', 'error');
        return;
      }
    } else {
      targets = leads.filter(l => l.has_email);
    }

    if (targets.length === 0) {
      showToast('No leads with valid email in this list', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/batch-start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leads: targets,
          template_id: selectedTemplate,
          account_id: selectedAccount,
          delay_min: delayRange.min,
          delay_max: delayRange.max,
          csv_name: selectedFile,
          custom_subject: isCustomMode ? customSubject : '',
          custom_body: isCustomMode ? customBody : '',
          micro_batch_size: microBatchSize,
          batch_cooldown: batchCooldown,
          jitter_min: jitterMin,
          jitter_max: jitterMax
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setBatchStatus(prev => ({ ...prev, is_running: true }));
      } else {
        showToast(data.error, 'error');
      }
    } catch (err) {
      showToast('Error starting batch dispatch', 'error');
    }
  };

  const handleBatchControl = async (action) => {
    try {
      await fetch(`${API_BASE}/batch-control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Sent Logs
  const fetchSentLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`${API_BASE}/logs`);
      const data = await res.json();
      if (data.success) {
        setSentLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchSentLogs();
    }
  }, [activeTab]);

  // Export to CSV Generator
  const exportLeadsToCsv = (leadsToExport, filenamePrefix = 'leads_export') => {
    if (!leadsToExport || leadsToExport.length === 0) {
      showToast('No leads to export', 'error');
      return;
    }
    const headers = ['Business Name', 'City', 'Area', 'Category', 'Email', 'Phone', 'WhatsApp', 'Rating', 'Reviews', 'Status', 'Website'];
    const rows = leadsToExport.map(l => [
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.area || '').replace(/"/g, '""')}"`,
      `"${(l.category || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.wa_phone || '').replace(/"/g, '""')}"`,
      `"${(l.rating || '').replace(/"/g, '""')}"`,
      `"${(l.reviews || '').replace(/"/g, '""')}"`,
      `"${(l.status || 'New').replace(/"/g, '""')}"`,
      `"${(l.website || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${leadsToExport.length} leads to CSV!`);
  };

  // Filter derivations
  const cities = useMemo(() => {
    const set = new Set();
    leads.forEach(l => { if (l.city) set.add(l.city); });
    return Array.from(set).sort();
  }, [leads]);

  const categories = useMemo(() => {
    const set = new Set();
    leads.forEach(l => { if (l.category) set.add(l.category); });
    return Array.from(set).sort();
  }, [leads]);

  // Relative Time Formatter for Last Contacted metadata
  const formatRelativeTime = (timestamp) => {
    if (!timestamp || timestamp === 'Never' || timestamp === 'None') {
      return { text: 'Never', isNever: true };
    }
    try {
      const date = new Date(timestamp.includes('T') ? timestamp : timestamp.replace(/-/g, '/'));
      if (isNaN(date.getTime())) {
        return { text: timestamp, isNever: false };
      }
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (diffMs < 0) {
        return { text: 'Just now', isNever: false };
      }
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return { text: 'Just now', isNever: false };
      if (diffMins < 60) return { text: `${diffMins}m ago`, isNever: false };
      if (diffHours < 24) return { text: `${diffHours}h ago`, isNever: false };
      if (diffDays === 1) return { text: 'Yesterday', isNever: false };
      if (diffDays < 30) return { text: `${diffDays}d ago`, isNever: false };
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths < 12) return { text: `${diffMonths}mo ago`, isNever: false };
      return { text: `${Math.floor(diffDays / 365)}y ago`, isNever: false };
    } catch {
      return { text: timestamp || 'Never', isNever: !timestamp };
    }
  };

  const highPriorityCount = useMemo(() => {
    return leads.filter(l => (l.lead_score || 0) >= 70 || l.lead_tier_code === 'hot').length;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const rawQ = searchQuery.trim();
    const tokens = rawQ ? rawQ.split(/\s+/).filter(Boolean) : [];
    
    // Parse smart filters out of tokens
    let textKeywords = [];
    let filterHasEmail = null;
    let filterHasPhone = null;
    let filterHasWa = null;
    let filterHasWebsite = null;
    let filterRatingMin = null;
    let filterRatingMax = null;
    let filterScoreMin = null;
    let filterScoreMax = null;
    let filterTier = null;
    let filterStatusToken = null;
    let filterCityToken = null;
    let filterAreaToken = null;
    let filterHasAppt = null;
    let filterHasTask = null;

    tokens.forEach(tok => {
      const lower = tok.toLowerCase();
      if (lower === 'has:email' || lower === 'has:mail') {
        filterHasEmail = true;
      } else if (lower === 'no:email' || lower === 'without:email') {
        filterHasEmail = false;
      } else if (lower === 'has:phone') {
        filterHasPhone = true;
      } else if (lower === 'has:wa' || lower === 'has:whatsapp') {
        filterHasWa = true;
      } else if (lower === 'has:web' || lower === 'has:website') {
        filterHasWebsite = true;
      } else if (lower === 'has:appt' || lower === 'has:appointment') {
        filterHasAppt = true;
      } else if (lower === 'has:task') {
        filterHasTask = true;
      } else if (lower.startsWith('rating:>=')) {
        filterRatingMin = parseFloat(lower.replace('rating:>=', ''));
      } else if (lower.startsWith('rating:>')) {
        filterRatingMin = parseFloat(lower.replace('rating:>', '')) + 0.01;
      } else if (lower.startsWith('rating:<=')) {
        filterRatingMax = parseFloat(lower.replace('rating:<=', ''));
      } else if (lower.startsWith('rating:<')) {
        filterRatingMax = parseFloat(lower.replace('rating:<', '')) - 0.01;
      } else if (lower.startsWith('rating:')) {
        filterRatingMin = parseFloat(lower.replace('rating:', ''));
      } else if (lower.startsWith('score:>=')) {
        filterScoreMin = parseFloat(lower.replace('score:>=', ''));
      } else if (lower.startsWith('score:>')) {
        filterScoreMin = parseFloat(lower.replace('score:>', '')) + 1;
      } else if (lower.startsWith('score:<=')) {
        filterScoreMax = parseFloat(lower.replace('score:<=', ''));
      } else if (lower.startsWith('score:<')) {
        filterScoreMax = parseFloat(lower.replace('score:<', '')) - 1;
      } else if (lower.startsWith('score:')) {
        filterScoreMin = parseFloat(lower.replace('score:', ''));
      } else if (lower.startsWith('tier:')) {
        filterTier = lower.replace('tier:', '');
      } else if (lower.startsWith('status:')) {
        filterStatusToken = lower.replace('status:', '');
      } else if (lower.startsWith('city:')) {
        filterCityToken = lower.replace('city:', '');
      } else if (lower.startsWith('area:')) {
        filterAreaToken = lower.replace('area:', '');
      } else {
        textKeywords.push(lower);
      }
    });

    let result = leads.filter(l => {
      // High-Priority quick filter button
      if (highPriorityFilter && (l.lead_score || 0) < 70 && l.lead_tier_code !== 'hot') return false;

      // Dropdown UI filters
      if (cityFilter !== 'ALL' && l.city !== cityFilter) return false;
      if (categoryFilter !== 'ALL' && l.category !== categoryFilter) return false;
      if (emailFilter === 'YES' && !l.has_email) return false;
      if (emailFilter === 'NO' && l.has_email) return false;
      if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
      if (tierFilter !== 'ALL' && (l.lead_tier_code || 'cold') !== tierFilter) return false;

      // Smart token filters
      if (filterHasEmail === true && !l.has_email) return false;
      if (filterHasEmail === false && l.has_email) return false;
      if (filterHasPhone === true && !l.phone) return false;
      if (filterHasWa === true && !l.wa_phone) return false;
      if (filterHasWebsite === true && !l.website) return false;
      if (filterHasAppt === true && !calendarEvents.some(e => e.lead_id === l.id || (e.lead_name && e.lead_name.toLowerCase() === l.name.toLowerCase()))) return false;
      if (filterHasTask === true && !tasks.some(t => (t.lead_id === l.id || (t.lead_name && t.lead_name.toLowerCase() === l.name.toLowerCase())) && !t.completed)) return false;

      if (filterRatingMin !== null && !isNaN(filterRatingMin)) {
        const r = parseFloat(l.rating) || 0;
        if (r < filterRatingMin) return false;
      }
      if (filterRatingMax !== null && !isNaN(filterRatingMax)) {
        const r = parseFloat(l.rating) || 0;
        if (r > filterRatingMax) return false;
      }
      if (filterScoreMin !== null && !isNaN(filterScoreMin)) {
        const s = l.lead_score || 0;
        if (s < filterScoreMin) return false;
      }
      if (filterScoreMax !== null && !isNaN(filterScoreMax)) {
        const s = l.lead_score || 0;
        if (s > filterScoreMax) return false;
      }
      if (filterTier) {
        const t = (l.lead_tier_code || (l.lead_score >= 70 ? 'hot' : l.lead_score >= 40 ? 'warm' : 'cold')).toLowerCase();
        if (!t.includes(filterTier)) return false;
      }
      if (filterStatusToken) {
        const st = (l.status || 'New').toLowerCase();
        if (!st.includes(filterStatusToken)) return false;
      }
      if (filterCityToken) {
        const ct = (l.city || '').toLowerCase();
        if (!ct.includes(filterCityToken)) return false;
      }
      if (filterAreaToken) {
        const ar = (l.area || '').toLowerCase();
        if (!ar.includes(filterAreaToken)) return false;
      }

      // Free text search matching all keywords
      if (textKeywords.length > 0) {
        const combined = `${l.name} ${l.city} ${l.area} ${l.category} ${l.email} ${l.phone} ${l.notes || ''}`.toLowerCase();
        const allMatch = textKeywords.every(kw => combined.includes(kw));
        if (!allMatch) return false;
      }

      return true;
    });

    if (scoreSortOrder === 'score_desc') {
      result.sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0));
    } else if (scoreSortOrder === 'score_asc') {
      result.sort((a, b) => (a.lead_score || 0) - (b.lead_score || 0));
    } else if (scoreSortOrder === 'rating_desc') {
      result.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    } else if (scoreSortOrder === 'name_asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [leads, searchQuery, cityFilter, categoryFilter, emailFilter, statusFilter, tierFilter, scoreSortOrder, highPriorityFilter, calendarEvents, tasks]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  // High-performance single-pass metrics computation for 60fps render
  const filteredMetrics = useMemo(() => {
    let withEmailCount = 0;
    let uncontactedCount = 0;
    let highRatedCount = 0;
    const stageMap = {
      'New': [],
      'Contacted': [],
      'Interested': [],
      'Follow-up': [],
      'Converted': [],
      'Do Not Contact': []
    };
    for (let i = 0; i < filteredLeads.length; i++) {
      const l = filteredLeads[i];
      if (l.has_email) withEmailCount++;
      const st = l.status || 'New';
      if (!l.status || st === 'New' || st.toLowerCase() === 'uncontacted') uncontactedCount++;
      const r = parseFloat(l.rating);
      if (!isNaN(r) && r > 4.5) highRatedCount++;
      if (stageMap[st]) {
        stageMap[st].push(l);
      } else {
        stageMap['New'].push(l);
      }
    }
    return { withEmailCount, uncontactedCount, highRatedCount, stageMap };
  }, [filteredLeads]);

  // Bulk Selection Helpers
  const selectAllWithEmail = () => {
    const ids = new Set(filteredLeads.filter(l => l.has_email).map(l => l.id));
    setSelectedLeadIds(ids);
    showToast(`Selected ${ids.size} leads with verified emails`);
  };

  const selectAllInView = () => {
    const ids = new Set(paginatedLeads.map(l => l.id));
    setSelectedLeadIds(ids);
    showToast(`Selected ${ids.size} leads on current page`);
  };

  const clearSelection = () => {
    setSelectedLeadIds(new Set());
  };

  const selectUncontactedOnly = () => {
    const uncontacted = filteredLeads.filter(l => !l.status || l.status === 'New' || l.status.toLowerCase() === 'uncontacted');
    const ids = new Set(uncontacted.map(l => l.id));
    setSelectedLeadIds(ids);
    showToast(`Selected ${ids.size} uncontacted leads`);
  };

  const selectHighRatedOnly = () => {
    const highRated = filteredLeads.filter(l => {
      const r = parseFloat(l.rating);
      return !isNaN(r) && r > 4.5;
    });
    const ids = new Set(highRated.map(l => l.id));
    setSelectedLeadIds(ids);
    showToast(`Selected ${ids.size} leads with rating > 4.5★`);
  };

  // Quick Jump Navigation Handler
  const handleQuickJump = () => {
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      setJumpPageInput('');
    } else {
      showToast(`Please enter a valid page number between 1 and ${totalPages}`, 'error');
    }
  };

  // AI Spark Icebreaker Handlers
  const handleOpenAiSpark = async (lead) => {
    if (!lead) return;
    setAiSparkLead(lead);
    setShowAiSparkModal(true);
    setLoadingAiSpark(true);
    setAiIcebreakerData(null);
    setCopiedIcebreakerId(null);

    try {
      const res = await fetch(`${API_BASE}/ai/icebreaker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead })
      });
      const data = await res.json();
      if (data.success) {
        setAiIcebreakerData(data);
      } else {
        showToast(data.error || 'Failed to generate icebreakers', 'error');
      }
    } catch (e) {
      showToast('Network error generating AI icebreakers', 'error');
    } finally {
      setLoadingAiSpark(false);
    }
  };

  const handleCopyIcebreaker = (hook) => {
    if (!hook || !hook.text) return;
    navigator.clipboard.writeText(hook.text);
    setCopiedIcebreakerId(hook.id);
    showToast(`Copied "${hook.badge}" icebreaker to clipboard!`);
    setTimeout(() => setCopiedIcebreakerId(null), 2500);
  };

  const handleApplyIcebreakerToComposer = (hook) => {
    if (!hook) return;
    setCustomSubject(hook.suggested_subject || `Quick question regarding ${aiSparkLead?.name || 'your company'}`);
    setCustomBody(hook.text);
    setIsCustomMode(true);
    if (hook.id === 'conversational') {
      setCustomWaText(hook.text);
    }
    if (aiSparkLead?.id) {
      setSelectedLeadIds(new Set([aiSparkLead.id]));
      setAudienceType('selected_only');
    }
    setShowAiSparkModal(false);
    setActiveTab('campaign');
    showToast(`Loaded "${hook.badge}" into Campaign Studio!`);
  };

  // WhatsApp Queue List
  const waQueueLeads = useMemo(() => {
    if (selectedLeadIds.size > 0) {
      return leads.filter(l => selectedLeadIds.has(l.id) && l.wa_phone);
    }
    return leads.filter(l => l.wa_phone);
  }, [leads, selectedLeadIds]);

  const currentWaLead = waQueueLeads[waQueueIndex] || waQueueLeads[0];
  const currentAccountObj = accounts.find(a => a.id === selectedAccount) || accounts[0] || {};

  // Funnel counts
  const countAll = leads.length;
  const countWithEmail = leads.filter(l => l.has_email).length;
  const countWithWa = leads.filter(l => l.wa_phone).length;
  const countContacted = leads.filter(l => l.status === 'Contacted').length;
  const countInterested = leads.filter(l => l.status === 'Interested' || l.status === 'Follow-up').length;

  const kanbanStages = [
    { id: 'New', label: 'New Leads', color: '#3b82f6', bg: '#eff6ff', icon: '🔵' },
    { id: 'Contacted', label: 'Contacted', color: '#10b981', bg: '#ecfdf5', icon: '🟢' },
    { id: 'Interested', label: 'Interested 🔥', color: '#f59e0b', bg: '#fffbeb', icon: '🔥' },
    { id: 'Follow-up', label: 'Follow-up ⏳', color: '#8b5cf6', bg: '#f5f3ff', icon: '⏳' },
    { id: 'Converted', label: 'Converted 🎉', color: '#059669', bg: '#ecfdf5', icon: '🎉' },
    { id: 'Do Not Contact', label: 'Do Not Contact 🛑', color: '#ef4444', bg: '#fef2f2', icon: '🛑' },
  ];

  const getInitials = (name) => {
    if (!name) return 'B';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      
      {/* Toast Alert */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 24,
          zIndex: 9999,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600,
          fontSize: 13,
          animation: 'fadeInSlide 0.2s ease-out'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.message}
        </div>
      )}

      {/* Hidden File Input for CSV Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv"
        style={{ display: 'none' }}
      />

      {/* Top Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '10px 28px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h1 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px', color: '#0f172a', margin: 0 }}>
                  ApexOutreach <span style={{ color: '#4f46e5' }}>Studio</span>
                </h1>
                <span style={{ fontSize: 10, background: '#eff6ff', color: '#4f46e5', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>PRO MASTER CRM</span>
              </div>
              <p style={{ fontSize: 11, color: '#64748b', margin: 0, fontWeight: 500 }}>Maps Scraper • Unified CRM • Daily Automations</p>
            </div>
          </div>

          <div style={{ width: 1, height: 26, background: '#e2e8f0' }} />

          {/* Active Dataset Selector with Unified Master Option & Fast Download */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '5px 10px', borderRadius: 8, border: '1px solid #cbd5e1', gap: 6 }}>
              <FileSpreadsheet size={15} color="#4f46e5" />
              <select
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
                style={{ background: 'transparent', color: '#0f172a', border: 'none', fontSize: 12, fontWeight: 700, outline: 'none', cursor: 'pointer', maxWidth: 320 }}
              >
                <option value="MASTER_CRM">
                  🌟 Unified Master CRM ({leads.length > 0 && selectedFile === 'MASTER_CRM' ? leads.length.toLocaleString() : '4,773+'} leads • Master DB)
                </option>
                {csvFiles.filter(f => f.filename !== 'MASTER_CRM').map(f => (
                  <option key={f.filename} value={f.filename}>
                    {f.filename.replace('.csv', '')} ({(f.row_count ?? 0).toLocaleString()} leads • {f.size_kb} KB)
                  </option>
                ))}
              </select>
            </div>

            <a
              href={`${API_BASE}/download-csv?file=${encodeURIComponent(selectedFile)}`}
              className="btn-secondary"
              style={{ fontSize: 11, padding: '6px 10px', textDecoration: 'none' }}
              title="Download currently active dataset as CSV"
            >
              <Download size={12} color="#4f46e5" /> Download CSV
            </a>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary"
              style={{ fontSize: 11, padding: '6px 10px' }}
              title="Upload new CSV file"
            >
              <Upload size={12} color="#059669" /> Upload CSV
            </button>
          </div>
        </div>

        {/* Center Navigation Tabs with Maps Scraper */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 10, border: '1px solid #e2e8f0', gap: 3 }}>
          {[
            { id: 'crm', label: 'CRM Leads', icon: Users, badge: selectedFile === 'MASTER_CRM' ? 'Master' : leads.length },
            { id: 'scraper', label: 'Maps Scraper', icon: Compass, badge: scraperJob.is_running ? 'Live' : null },
            { id: 'campaign', label: 'Campaign Studio', icon: Send, badge: batchStatus.is_running ? 'Live' : null },
            { id: 'whatsapp', label: 'WhatsApp Hub', icon: MessageSquare, badge: countWithWa },
            { id: 'logs', label: 'Sent Logs', icon: Clock },
            { id: 'settings', label: 'Daily & SMTP', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '6px 13px',
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 600,
                  color: isActive ? '#4f46e5' : '#64748b',
                  background: isActive ? '#ffffff' : 'transparent',
                  border: isActive ? '1px solid #cbd5e1' : '1px solid transparent',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} color={isActive ? '#4f46e5' : '#64748b'} />
                {tab.label}
                {tab.badge && (
                  <span style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 10,
                    background: tab.badge === 'Live' ? '#10b981' : isActive ? '#e0e7ff' : '#e2e8f0',
                    color: tab.badge === 'Live' ? '#fff' : isActive ? '#4f46e5' : '#475569',
                    fontWeight: 700
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Active Sender & Quota Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {batchStatus.is_running && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '5px 10px', borderRadius: 20 }}>
              <span className="pulse-indicator" style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>Dispatching: {batchStatus.percentage}%</span>
            </div>
          )}

          {scraperJob.is_running && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', padding: '5px 10px', borderRadius: 20 }}>
              <span className="pulse-indicator" style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
              <span style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 700 }}>Scraping Maps: {scraperJob.found} Found</span>
            </div>
          )}

          {/* Follow-up Tasks & Reminders Drawer Trigger */}
          <button
            onClick={() => setShowTaskDrawer(true)}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              background: taskSummary.overdue > 0 ? '#fef2f2' : '#ffffff',
              borderColor: taskSummary.overdue > 0 ? '#fca5a5' : '#cbd5e1',
              color: taskSummary.overdue > 0 ? '#b91c1c' : '#334155'
            }}
            title="Open Follow-Up Tasks & Reminders Drawer"
          >
            <CheckSquare size={14} color={taskSummary.overdue > 0 ? '#ef4444' : '#4f46e5'} />
            Tasks
            {taskSummary.pending > 0 && (
              <span style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 10,
                background: taskSummary.overdue > 0 ? '#ef4444' : '#4f46e5',
                color: '#fff',
                fontWeight: 800
              }}>
                {taskSummary.pending}
              </span>
            )}
          </button>

          {(() => {
            const sentToday = cronTracker.sent_today || 0;
            const dailyLimit = cronTracker.daily_limit || 50;
            const quotaPct = Math.min(100, Math.round((sentToday / dailyLimit) * 100));
            const quotaRemaining = Math.max(0, dailyLimit - sentToday);
            const quotaState = quotaPct >= 80 ? 'danger' : quotaPct >= 50 ? 'moderate' : 'safe';

            return (
              <div
                className="sender-quota-widget"
                onMouseEnter={() => setShowSmtpHealthTooltip(true)}
                onMouseLeave={() => setShowSmtpHealthTooltip(false)}
                onClick={() => {
                  setEditingAccount({ ...currentAccountObj });
                  setActiveTab('settings');
                }}
                title="Click to configure sender credentials, daily limits & SMTP relays"
              >
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#4f46e5', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getInitials(currentAccountObj.name || 'IS')}
                </div>

                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#0f172a', fontWeight: 700 }}>
                      {currentAccountObj.name || 'Configure Sender'}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '1px 5px', borderRadius: 10 }}>
                      <span className="smtp-pulse-dot" />
                      Healthy
                    </span>
                  </div>

                  {/* Visual Progress Bar & Quota indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <div className="quota-bar-track">
                      <div
                        className={`quota-bar-fill ${quotaState}`}
                        style={{ width: `${Math.max(4, quotaPct)}%` }}
                      />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: quotaState === 'danger' ? '#e11d48' : quotaState === 'moderate' ? '#d97706' : '#64748b' }}>
                      {sentToday}/{dailyLimit} ({quotaPct}%)
                    </span>
                  </div>
                </div>

                <Edit3 size={12} color="#94a3b8" style={{ marginLeft: 2 }} />

                {/* SMTP Health & Quota Diagnostics Tooltip Popover */}
                {showSmtpHealthTooltip && (
                  <div
                    className="smtp-health-tooltip"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Server size={14} color="#4f46e5" />
                        <strong style={{ fontSize: 12, color: '#0f172a' }}>SMTP Health & Relay Monitor</strong>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: 4 }}>
                        Operational (180ms)
                      </span>
                    </div>

                    <div style={{ fontSize: 11, color: '#475569', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Relay Host:</span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>{currentAccountObj.smtp_server || 'smtp.gmail.com'}:{currentAccountObj.smtp_port || 587}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Encryption:</span>
                        <span style={{ color: '#059669', fontWeight: 600 }}>TLS / SSL (Active)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Sender Email:</span>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{currentAccountObj.email || 'None'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Daily Quota Used:</span>
                        <strong style={{ color: quotaState === 'danger' ? '#dc2626' : quotaState === 'moderate' ? '#d97706' : '#047857' }}>
                          {sentToday} of {dailyLimit} sent ({quotaRemaining} remaining)
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Anti-Spam Throttling:</span>
                        <span style={{ color: '#4f46e5', fontWeight: 600 }}>4/batch (3-7s jitter)</span>
                      </div>
                    </div>

                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        onClick={() => {
                          setEditingAccount({ ...currentAccountObj });
                          setActiveTab('settings');
                          setShowSmtpHealthTooltip(false);
                        }}
                        className="btn-secondary"
                        style={{ fontSize: 10, padding: '3px 8px' }}
                      >
                        ⚙️ Edit Limits & Relay
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          setShowSmtpHealthTooltip(false);
                        }}
                        className="btn-primary"
                        style={{ fontSize: 10, padding: '3px 8px' }}
                      >
                        Test Connection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '18px 28px', maxWidth: 1700, margin: '0 auto', width: '100%' }}>

        {/* =========================================================================
            TAB 1: CRM LEADS & KANBAN PIPELINE (WITH MASTER DATABASE SUPPORT)
           ========================================================================= */}
        {activeTab === 'crm' && (
          <div className="animate-fade-in">
            {/* Interactive Pipeline Funnel */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div
                onClick={() => { setEmailFilter('ALL'); setStatusFilter('ALL'); setCurrentPage(1); }}
                className="stat-card"
                style={{ cursor: 'pointer', borderLeft: '4px solid #4f46e5' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>{countAll}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {selectedFile === 'MASTER_CRM' ? 'Master Leads (Merged)' : 'Businesses in View'}
                  </div>
                </div>
              </div>

              <div
                onClick={() => { setEmailFilter('YES'); setStatusFilter('ALL'); setCurrentPage(1); }}
                className="stat-card"
                style={{ cursor: 'pointer', borderLeft: '4px solid #059669' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#059669' }}>{countWithEmail}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Verified Emails ({Math.round(countWithEmail / (countAll || 1) * 100)}%)</div>
                </div>
              </div>

              <div
                onClick={() => { setActiveTab('whatsapp'); }}
                className="stat-card"
                style={{ cursor: 'pointer', borderLeft: '4px solid #128C7E' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e6fffa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#128C7E' }}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#128C7E' }}>{countWithWa}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>WhatsApp Numbers</div>
                </div>
              </div>

              <div
                onClick={() => { setStatusFilter('Contacted'); setCurrentPage(1); }}
                className="stat-card"
                style={{ cursor: 'pointer', borderLeft: '4px solid #0284c7' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0284c7' }}>{countContacted}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Contacted Leads</div>
                </div>
              </div>

              <div
                onClick={() => { setStatusFilter('Interested'); setCurrentPage(1); }}
                className="stat-card"
                style={{ cursor: 'pointer', borderLeft: '4px solid #d97706' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                  <Star size={18} fill="#f59e0b" color="#d97706" />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#d97706' }}>{countInterested}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Interested / Follow-up</div>
                </div>
              </div>
            </div>

            {/* Interactive Follow-Up Widget / Scheduled Calendar Banner */}
            {calendarEvents.length > 0 && (() => {
              const nextEvt = calendarEvents[calendarEvents.length - 1];
              return (
                <div className="interactive-followup-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ background: '#ede9fe', padding: '7px 9px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={18} color="#7c3aed" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#6d28d9' }}>
                          Upcoming Follow-Up Appointment
                        </span>
                        <span style={{ fontSize: 10, background: '#ede9fe', color: '#6d28d9', padding: '1px 8px', borderRadius: 10, fontWeight: 700 }}>
                          {calendarEvents.length} Scheduled
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#334155', marginTop: 2 }}>
                        Next: <strong>{nextEvt.lead_name}</strong> • <span style={{ color: '#7c3aed', fontWeight: 700 }}>📅 {nextEvt.datetime}</span> {nextEvt.agenda ? `— "${nextEvt.agenda}"` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleSnoozeAppointment(nextEvt, 24)}
                      className="followup-btn-snooze"
                      title="Postpone appointment by 24 hours"
                    >
                      <Clock size={12} /> Snooze (+24h)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCompleteAppointment(nextEvt)}
                      className="followup-btn-complete"
                      title="Mark appointment complete and log in lead history"
                    >
                      <Check size={12} /> Mark Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCalendarWidget(!showCalendarWidget)}
                      className="btn-secondary"
                      style={{ fontSize: 11, padding: '4px 10px', color: '#6d28d9', borderColor: '#ddd6fe' }}
                    >
                      {showCalendarWidget ? 'Hide Appointments' : `View All (${calendarEvents.length})`}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Expanded Calendar Appointments Drawer */}
            {showCalendarWidget && calendarEvents.length > 0 && (
              <div className="glass-panel" style={{ padding: 16, marginBottom: 14, background: '#ffffff' }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={15} color="#4f46e5" /> Scheduled Consultations & Calendar Sync
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                  {calendarEvents.map((evt, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>{evt.title}</strong>
                        {evt.snoozed_at && (
                          <span style={{ fontSize: 9, background: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                            Snoozed
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#4f46e5', fontWeight: 600, margin: '2px 0' }}>📅 {evt.datetime}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Client: {evt.lead_name} {evt.lead_phone && `(${evt.lead_phone})`}</div>
                      <p style={{ fontSize: 11, color: '#334155', margin: '4px 0 8px 0', fontStyle: 'italic' }}>"{evt.agenda}"</p>
                      
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleSnoozeAppointment(evt, 24)}
                          className="followup-btn-snooze"
                          style={{ fontSize: 10, padding: '3px 7px' }}
                          title="Snooze this appointment by 24h"
                        >
                          <Clock size={11} /> Snooze +24h
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCompleteAppointment(evt)}
                          className="followup-btn-complete"
                          style={{ fontSize: 10, padding: '3px 7px' }}
                          title="Mark complete"
                        >
                          <Check size={11} /> Complete
                        </button>
                        <a
                          href={makeGoogleCalendarUrl(evt.title, evt.datetime, evt.agenda, evt.lead_name)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary"
                          style={{ fontSize: 10, padding: '3px 7px', textDecoration: 'none' }}
                        >
                          Google Cal ↗
                        </a>
                        <button
                          onClick={() => downloadIcsFile(evt.title, evt.datetime, evt.agenda, evt.lead_name)}
                          className="btn-secondary"
                          style={{ fontSize: 10, padding: '3px 7px' }}
                        >
                          .ics
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Fuzzy Matching & Deduplication Master Banner */}
            {dedupStats && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ background: '#10b981', color: '#fff', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                    ✓
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#065f46', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>FUZZY MATCHING & DEDUPLICATION ACTIVE</span>
                      <span style={{ fontSize: 10, background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>
                        Domain + Phone + Name Similarity
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#047857' }}>
                      Merged <strong>{dedupStats.duplicates_merged?.toLocaleString()} duplicate records</strong> across {dedupStats.total_scanned?.toLocaleString()} scanned rows into <strong>{dedupStats.unique_leads?.toLocaleString()} clean profiles</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '3px 8px', borderRadius: 12, fontWeight: 700 }}>
                    🔥 {dedupStats.tier_a_hot || 0} Tier A Leads
                  </span>
                  <span style={{ fontSize: 11, background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: 12, fontWeight: 700 }}>
                    ⭐ {dedupStats.tier_b_warm || 0} Tier B Leads
                  </span>
                  <button
                    onClick={runDeduplicationAudit}
                    disabled={isRunningDedup}
                    className="btn-secondary"
                    style={{ fontSize: 11, padding: '4px 10px', borderColor: '#86efac', color: '#065f46', background: '#ffffff' }}
                    title="Run on-demand fuzzy deduplication audit across loaded datasets"
                  >
                    <RefreshCw size={11} className={isRunningDedup ? 'pulse-indicator' : ''} /> {isRunningDedup ? 'Auditing...' : 'Run Dedup Audit'}
                  </button>
                </div>
              </div>
            )}

            {/* Filter & Toolbar */}
            <div className="glass-panel" style={{ padding: '14px 18px', marginBottom: 14 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1, minWidth: 320 }}>
                  {/* Search with Smart Query Syntax Chips */}
                  <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 10 }} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        placeholder="Search company, area, category, email or syntax (e.g. has:email rating:>4.5)..."
                        style={{
                          width: '100%',
                          padding: '7px 12px 7px 32px',
                          fontSize: 12,
                          borderRadius: 8
                        }}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                          style={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Quick Smart Query Filter Chips */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Smart Syntax:</span>
                      <button
                        type="button"
                        onClick={() => setSearchQuery(prev => prev.includes('has:email') ? prev.replace(/has:email/g, '').trim() : `${prev} has:email`.trim())}
                        className={`smart-query-chip ${searchQuery.includes('has:email') ? 'active' : ''}`}
                        title="Filter leads with verified email addresses"
                      >
                        ✉️ has:email
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchQuery(prev => prev.includes('rating:>4.5') ? prev.replace(/rating:>4\.5/g, '').trim() : `${prev} rating:>4.5`.trim())}
                        className={`smart-query-chip ${searchQuery.includes('rating:>4.5') ? 'active' : ''}`}
                        title="Filter leads with Google rating > 4.5"
                      >
                        ⭐ rating:&gt;4.5
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchQuery(prev => prev.includes('score:>70') ? prev.replace(/score:>70/g, '').trim() : `${prev} score:>70`.trim())}
                        className={`smart-query-chip ${searchQuery.includes('score:>70') ? 'active' : ''}`}
                        title="Filter leads with Lead Score > 70"
                      >
                        🔥 score:&gt;70
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchQuery(prev => prev.includes('has:wa') ? prev.replace(/has:wa/g, '').trim() : `${prev} has:wa`.trim())}
                        className={`smart-query-chip ${searchQuery.includes('has:wa') ? 'active' : ''}`}
                        title="Filter leads with direct WhatsApp contact"
                      >
                        💬 has:wa
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSearchHelp(prev => !prev)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#6366f1',
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 2,
                          padding: '1px 3px'
                        }}
                      >
                        <HelpCircle size={11} /> Syntax Guide
                      </button>
                    </div>

                    {showSearchHelp && (
                      <div style={{
                        marginTop: 4,
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        padding: '6px 10px',
                        fontSize: 11,
                        color: '#334155',
                        lineHeight: 1.4,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <div>
                          <strong>Supported Query Operators:</strong><br />
                          • <code>has:email</code>, <code>no:email</code>, <code>has:phone</code>, <code>has:wa</code><br />
                          • <code>rating:&gt;4.5</code>, <code>rating:&gt;=4.0</code>, <code>score:&gt;70</code>, <code>score:&lt;50</code><br />
                          • <code>tier:hot</code>, <code>tier:warm</code>, <code>status:contacted</code>, <code>city:gurgaon</code><br />
                          • <code>has:appt</code> (appointments scheduled), <code>has:task</code> (pending tasks)
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowSearchHelp(false)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: 12, padding: '0 4px' }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Lead Score Sorting */}
                  <select
                    value={scoreSortOrder}
                    onChange={(e) => setScoreSortOrder(e.target.value)}
                    style={{ padding: '7px 10px', fontSize: 12, borderRadius: 8, fontWeight: 700, color: '#1e1b4b', background: '#f8fafc', border: '1.5px solid #c7d2fe' }}
                    title="Sort leads by Lead Score or other metrics"
                  >
                    <option value="score_desc">🔥 Sort: Highest Lead Score</option>
                    <option value="score_asc">❄️ Sort: Lowest Lead Score</option>
                    <option value="rating_desc">⭐ Sort: Highest Rating</option>
                    <option value="name_asc">🔤 Sort: Company Name (A-Z)</option>
                  </select>

                  {/* Lead Tier Filter */}
                  <select
                    value={tierFilter}
                    onChange={(e) => { setTierFilter(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '7px 10px', fontSize: 12, borderRadius: 8, fontWeight: 600 }}
                  >
                    <option value="ALL">All Lead Tiers (100%)</option>
                    <option value="hot">🔥 Tier A: Hot (70+ pts)</option>
                    <option value="warm">⭐ Tier B: Warm (40-69 pts)</option>
                    <option value="cold">❄️ Tier C: Cold (&lt;40 pts)</option>
                  </select>

                  {/* City Filter */}
                  <select
                    value={cityFilter}
                    onChange={(e) => { setCityFilter(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '7px 10px', fontSize: 12, borderRadius: 8 }}
                  >
                    <option value="ALL">All Cities ({cities.length})</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '7px 10px', fontSize: 12, borderRadius: 8, maxWidth: 180 }}
                  >
                    <option value="ALL">All Categories ({categories.length})</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  {/* Email Filter */}
                  <select
                    value={emailFilter}
                    onChange={(e) => { setEmailFilter(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '7px 10px', fontSize: 12, borderRadius: 8 }}
                  >
                    <option value="ALL">All Email Status</option>
                    <option value="YES">Has Email Only ✉️</option>
                    <option value="NO">No Email</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '7px 10px', fontSize: 12, borderRadius: 8 }}
                  >
                    <option value="ALL">All CRM Statuses</option>
                    <option value="New">Status: New</option>
                    <option value="Contacted">Status: Contacted</option>
                    <option value="Interested">Status: Interested</option>
                    <option value="Follow-up">Status: Follow-up</option>
                    <option value="Converted">Status: Converted</option>
                    <option value="Do Not Contact">Status: Do Not Contact</option>
                  </select>
                </div>

                {/* View Switcher Toggle & Export */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 8, border: '1px solid #e2e8f0', gap: 2 }}>
                    <button
                      onClick={() => setCrmView('table')}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: crmView === 'table' ? '#ffffff' : 'transparent',
                        color: crmView === 'table' ? '#4f46e5' : '#64748b',
                        boxShadow: crmView === 'table' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                      }}
                      title="Switch to Data Grid Table View"
                    >
                      <List size={14} /> Table View
                    </button>
                    <button
                      onClick={() => setCrmView('kanban')}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: crmView === 'kanban' ? '#ffffff' : 'transparent',
                        color: crmView === 'kanban' ? '#4f46e5' : '#64748b',
                        boxShadow: crmView === 'kanban' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                      }}
                      title="Switch to Pipeline Kanban Board"
                    >
                      <LayoutGrid size={14} /> Pipeline Board
                    </button>
                  </div>

                  <button
                    onClick={() => exportLeadsToCsv(filteredLeads, 'crm_filtered_leads')}
                    className="btn-secondary"
                    style={{ fontSize: 11, padding: '6px 10px' }}
                    title="Export filtered leads to CSV"
                  >
                    <FileDown size={13} color="#4f46e5" /> Export Filtered
                  </button>

                  <button
                    onClick={() => loadLeadsForFile(selectedFile)}
                    className="btn-secondary"
                    style={{ padding: '6px 8px' }}
                    title="Reload Database"
                  >
                    <RefreshCw size={13} className={loadingLeads ? 'pulse-indicator' : ''} />
                  </button>
                </div>
              </div>

              {/* Selection Shortcuts */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #f1f5f9', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 0.5 }}>SHORTCUTS:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setHighPriorityFilter(prev => !prev);
                      if (!highPriorityFilter) {
                        setScoreSortOrder('score_desc');
                      }
                      setCurrentPage(1);
                    }}
                    className={`btn-high-priority ${highPriorityFilter ? 'active' : ''}`}
                    title={highPriorityFilter ? "Active: Showing only High-Priority leads (Score >= 70). Click to show all." : "Quick Filter: Show only high-priority leads with score >= 70"}
                  >
                    <Flame size={13} />
                    <span>🔥 High-Priority Leads</span>
                    <span className="priority-count-badge">
                      {highPriorityCount}
                    </span>
                  </button>
                  <button onClick={selectAllWithEmail} className="btn-secondary" style={{ fontSize: 11, padding: '3px 8px' }}>
                    ✓ With Email ({filteredMetrics.withEmailCount})
                  </button>
                  <button onClick={selectUncontactedOnly} className="btn-secondary" style={{ fontSize: 11, padding: '3px 8px' }} title="Quick-select all leads not yet contacted">
                    ✓ Uncontacted Only ({filteredMetrics.uncontactedCount})
                  </button>
                  <button onClick={selectHighRatedOnly} className="btn-secondary" style={{ fontSize: 11, padding: '3px 8px' }} title="Quick-select all leads with Google rating > 4.5">
                    ✓ Rating &gt; 4.5★ ({filteredMetrics.highRatedCount})
                  </button>
                  <button onClick={selectAllInView} className="btn-secondary" style={{ fontSize: 11, padding: '3px 8px' }}>
                    ✓ Current Page ({paginatedLeads.length})
                  </button>
                  {selectedLeadIds.size > 0 && (
                    <button onClick={clearSelection} style={{ background: 'transparent', color: '#e11d48', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: '3px 6px' }}>
                      ✕ Clear Selection ({selectedLeadIds.size})
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {selectedLeadIds.size > 0 ? (
                    <>
                      <button
                        onClick={() => {
                          setAudienceType('selected_only');
                          setActiveTab('campaign');
                        }}
                        className="btn-primary"
                        style={{ fontSize: 11, padding: '5px 12px' }}
                      >
                        <Send size={12} /> Email {selectedLeadIds.size} Selected →
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('whatsapp');
                          setWaQueueIndex(0);
                        }}
                        className="btn-emerald"
                        style={{ fontSize: 11, padding: '5px 12px' }}
                      >
                        <MessageSquare size={12} /> WhatsApp {selectedLeadIds.size} Selected →
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          const emailLeads = filteredLeads.filter(l => l.has_email);
                          setSelectedLeadIds(new Set(emailLeads.map(l => l.id)));
                          setAudienceType('selected_only');
                          setActiveTab('campaign');
                          showToast(`Loaded ${emailLeads.length} targeted leads into Campaign Studio!`);
                        }}
                        className="btn-primary"
                        style={{ fontSize: 11, padding: '5px 12px', background: '#4f46e5' }}
                        title="Target all currently filtered leads with email in Campaign Studio"
                      >
                        <Send size={12} /> Target with Email ({filteredMetrics.withEmailCount}) ➔
                      </button>
                      <button
                        onClick={() => {
                          const waLeads = filteredLeads.filter(l => l.wa_phone);
                          setSelectedLeadIds(new Set(waLeads.map(l => l.id)));
                          setActiveTab('whatsapp');
                          setWaQueueIndex(0);
                          showToast(`Loaded ${waLeads.length} targeted leads into WhatsApp Hub!`);
                        }}
                        className="btn-emerald"
                        style={{ fontSize: 11, padding: '5px 12px' }}
                        title="Target all currently filtered leads with WhatsApp in WhatsApp Hub"
                      >
                        <MessageSquare size={12} /> Target with WhatsApp ({filteredLeads.filter(l => l.wa_phone).length}) ➔
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* VIEW MODE 1: MODERN TABLE VIEW */}
            {crmView === 'table' && (
              <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', maxHeight: '62vh' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                      <tr>
                        <th style={{ padding: '10px 14px', width: 36 }}>
                          <input
                            type="checkbox"
                            checked={paginatedLeads.length > 0 && paginatedLeads.every(l => selectedLeadIds.has(l.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeadIds(prev => new Set([...prev, ...paginatedLeads.map(l => l.id)]));
                              } else {
                                setSelectedLeadIds(prev => {
                                  const next = new Set(prev);
                                  paginatedLeads.forEach(l => next.delete(l.id));
                                  return next;
                                });
                              }
                            }}
                            style={{ cursor: 'pointer', accentColor: '#4f46e5' }}
                          />
                        </th>
                        <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700, fontSize: 12 }}>Business & Reputation</th>
                        <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700, fontSize: 12 }}>Location & Area</th>
                        <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700, fontSize: 12 }}>Category</th>
                        <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700, fontSize: 12 }}>Direct Contact</th>
                        <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700, fontSize: 12 }}>CRM Stage</th>
                        <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700, fontSize: 12 }}>Last Contacted</th>
                        <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700, fontSize: 12, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                            No businesses match your current filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedLeads.map((lead) => {
                          const isSelected = selectedLeadIds.has(lead.id);
                          const matchingAppt = calendarEvents.find(e => e.lead_id === lead.id || (e.lead_name && e.lead_name.toLowerCase() === lead.name.toLowerCase()));
                          const matchingTask = tasks.find(t => (t.lead_id === lead.id || (t.lead_name && t.lead_name.toLowerCase() === lead.name.toLowerCase())) && !t.completed);

                          return (
                            <tr
                              key={lead.id}
                              className={`crm-row ${isSelected ? 'selected' : ''}`}
                              onClick={() => setActiveDossierLead(lead)}
                              style={{ cursor: 'pointer' }}
                            >
                              <td style={{ padding: '10px 14px' }} onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    setSelectedLeadIds(prev => {
                                      const next = new Set(prev);
                                      if (next.has(lead.id)) next.delete(lead.id);
                                      else next.add(lead.id);
                                      return next;
                                    });
                                  }}
                                  style={{ cursor: 'pointer', accentColor: '#4f46e5' }}
                                />
                              </td>

                              <td style={{ padding: '10px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div className="avatar-badge" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                                    {getInitials(lead.name)}
                                  </div>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{lead.name}</strong>
                                      {lead.website && (
                                        <a href={lead.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: '#94a3b8' }}>
                                          <ExternalLink size={12} />
                                        </a>
                                      )}
                                      <span
                                        className={`score-badge score-badge-${lead.lead_tier_code || (lead.lead_score >= 70 ? 'hot' : lead.lead_score >= 40 ? 'warm' : 'cold')}`}
                                        title={`Lead Score: ${lead.lead_score || 0}/100 (${lead.lead_tier || 'Tier C: Cold'})`}
                                      >
                                        {(lead.lead_score >= 70 || lead.lead_tier_code === 'hot') ? '🔥' : (lead.lead_score >= 40 || lead.lead_tier_code === 'warm') ? '⭐' : '❄️'} {lead.lead_score || 0}
                                      </span>
                                      {(lead.merged_count > 1 || (lead.merged_from && lead.merged_from.length > 1)) && (
                                        <span
                                          className="dedup-tag-badge"
                                          title={`Smart Deduplication: merged from ${lead.merged_count || lead.merged_from.length} cross-source entries`}
                                        >
                                          🔗 {lead.merged_count || lead.merged_from.length} merged
                                        </span>
                                      )}
                                      {matchingAppt && (
                                        <span
                                          className="row-workflow-pill appointment"
                                          title={`Upcoming Scheduled Consultation: ${matchingAppt.title} (${matchingAppt.datetime})`}
                                          onClick={(e) => { e.stopPropagation(); setShowCalendarWidget(true); }}
                                        >
                                          📅 Appt: {matchingAppt.datetime ? matchingAppt.datetime.slice(5, 16) : 'Scheduled'}
                                        </span>
                                      )}
                                      {matchingTask && (
                                        <span
                                          className="row-workflow-pill task"
                                          title={`Pending Task Reminder: ${matchingTask.title} (Due: ${matchingTask.due_date || 'Soon'})`}
                                          onClick={(e) => { e.stopPropagation(); setShowTaskDrawer(true); }}
                                        >
                                          📋 Task: {matchingTask.title.slice(0, 18)}
                                        </span>
                                      )}
                                      {lead.sequence_step && (
                                        <span className="row-workflow-pill sequence" title={`Multi-Touch Sequence: Step ${lead.sequence_step} of 3`}>
                                          ⚡ Seq {lead.sequence_step}/3
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                      {lead.rating ? (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#d97706', fontWeight: 700, fontSize: 11 }}>
                                          <Star size={11} fill="#f59e0b" color="#d97706" /> {lead.rating}
                                          <span style={{ color: '#94a3b8', fontWeight: 500 }}>({lead.reviews || 0})</span>
                                        </span>
                                      ) : (
                                        <span style={{ fontSize: 11, color: '#94a3b8' }}>No ratings</span>
                                      )}
                                      {lead.source_file && (
                                        <span style={{ fontSize: 10, background: '#f1f5f9', color: '#64748b', padding: '1px 5px', borderRadius: 4 }}>
                                          {lead.source_file.replace('.csv', '').slice(0, 16)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td style={{ padding: '10px 14px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  <span className="badge badge-city" style={{ alignSelf: 'flex-start' }}>
                                    {lead.city.split(',')[0]}
                                  </span>
                                  <span style={{ fontSize: 11, color: '#64748b' }}>{lead.area}</span>
                                </div>
                              </td>

                              <td style={{ padding: '10px 14px' }}>
                                <span className="badge badge-cat">{lead.category}</span>
                              </td>

                              <td style={{ padding: '10px 14px' }} onClick={(e) => e.stopPropagation()}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                  {lead.has_email ? (
                                    <span className="badge badge-email" style={{ alignSelf: 'flex-start' }}>{lead.email}</span>
                                  ) : (
                                    <span className="badge badge-no-email" style={{ alignSelf: 'flex-start' }}>No Email</span>
                                  )}
                                  {lead.phone && (
                                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                                      📞 {lead.phone}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td style={{ padding: '10px 14px' }} onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={lead.status || 'New'}
                                  onChange={(e) => handleStatusChange(lead, e.target.value)}
                                  style={{
                                    background: lead.status === 'Contacted' ? '#ecfdf5' : lead.status === 'Interested' ? '#fffbeb' : lead.status === 'Converted' ? '#f5f3ff' : lead.status === 'Follow-up' ? '#f5f3ff' : '#ffffff',
                                    color: lead.status === 'Contacted' ? '#047857' : lead.status === 'Interested' ? '#b45309' : lead.status === 'Converted' ? '#7c3aed' : lead.status === 'Follow-up' ? '#6d28d9' : '#334155',
                                    borderColor: '#cbd5e1',
                                    padding: '3px 8px',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    borderRadius: 6
                                  }}
                                >
                                  <option value="New">● New</option>
                                  <option value="Contacted">✓ Contacted</option>
                                  <option value="Interested">🔥 Interested</option>
                                  <option value="Follow-up">⏳ Follow-up</option>
                                  <option value="Converted">🎉 Converted</option>
                                  <option value="Do Not Contact">✕ Do Not Contact</option>
                                </select>
                              </td>

                              {/* Last Contacted Metadata Column */}
                              <td style={{ padding: '10px 14px' }} onClick={(e) => e.stopPropagation()}>
                                {(() => {
                                  const rel = formatRelativeTime(lead.last_contacted);
                                  if (rel.isNever) {
                                    return (
                                      <span className="last-contacted-never" title="No outreach has been logged for this lead yet">
                                        <Clock size={11} color="#cbd5e1" /> Never
                                      </span>
                                    );
                                  }
                                  return (
                                    <span className="last-contacted-badge" title={`Last contacted on: ${lead.last_contacted}`}>
                                      <Clock size={11} color="#6366f1" /> {rel.text}
                                    </span>
                                  );
                                })()}
                              </td>

                              <td style={{ padding: '10px 14px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                <div style={{ display: 'inline-flex', gap: 6 }}>
                                  <button
                                    onClick={() => {
                                      setPreviewLead(lead);
                                      setActiveTab('campaign');
                                    }}
                                    className="btn-secondary"
                                    style={{ padding: '4px 8px', fontSize: 11 }}
                                    title="Open in Email Composer"
                                  >
                                    ✉️ Email
                                  </button>
                                  {lead.wa_phone && (
                                    <a
                                      href={`https://wa.me/${lead.wa_phone}?text=${encodeURIComponent(renderedPreview?.wa_text || customWaText)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={() => handleStatusChange(lead, 'Contacted')}
                                      style={{
                                        background: '#ecfdf5',
                                        color: '#047857',
                                        border: '1px solid #a7f3d0',
                                        textDecoration: 'none',
                                        padding: '4px 8px',
                                        borderRadius: 6,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center'
                                      }}
                                      title="Chat on WhatsApp"
                                    >
                                      💬 WA
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAiSpark(lead)}
                                    className="btn-spark-action"
                                    title="AI Spark: Generate contextual personalized outreach"
                                  >
                                    <Sparkles size={11} color="#6d28d9" /> Spark
                                  </button>
                                  <button
                                    onClick={() => setActiveDossierLead(lead)}
                                    className="btn-ghost"
                                    style={{ padding: '4px 6px' }}
                                    title="View Full Lead Intelligence Dossier"
                                  >
                                    <Eye size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="pagination-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>Showing <strong>{filteredLeads.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> – <strong>{Math.min(currentPage * pageSize, filteredLeads.length)}</strong> of <strong>{filteredLeads.length}</strong> businesses</span>
                    <select
                      value={pageSize}
                      onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                      style={{ padding: '3px 6px', fontSize: 11, borderRadius: 6 }}
                    >
                      <option value={15}>15 / page</option>
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                      <option value={100}>100 / page</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                    >
                      « First
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                    >
                      ‹ Prev
                    </button>
                    <span style={{ fontSize: 12, padding: '0 8px', fontWeight: 700, color: '#0f172a' }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                    >
                      Next ›
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                    >
                      Last »
                    </button>

                    <div className="quick-jump-container">
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Jump:</span>
                      <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={jumpPageInput}
                        onChange={(e) => setJumpPageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleQuickJump();
                        }}
                        placeholder={`${currentPage}/${totalPages}`}
                        className="quick-jump-input"
                        title={`Enter page 1 to ${totalPages} and press Enter`}
                      />
                      <button
                        type="button"
                        onClick={handleQuickJump}
                        className="btn-secondary"
                        style={{ padding: '3px 8px', fontSize: 11, fontWeight: 700, color: '#4f46e5', borderColor: '#c7d2fe', background: '#eef2ff' }}
                        title="Jump to specified page index"
                      >
                        Go →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE 2: KANBAN PIPELINE BOARD */}
            {crmView === 'kanban' && (
              <div className="kanban-grid animate-fade-in">
                {kanbanStages.map(stage => {
                  const stageLeads = filteredMetrics.stageMap[stage.id] || [];
                  return (
                    <div
                      key={stage.id}
                      className={`kanban-column ${dragOverCol === stage.id ? 'drag-over' : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragOverCol !== stage.id) setDragOverCol(stage.id);
                      }}
                      onDragLeave={() => {
                        if (dragOverCol === stage.id) setDragOverCol(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleKanbanDrop(stage.id);
                      }}
                    >
                      <div className="kanban-column-header" style={{ borderTop: `3px solid ${stage.color}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13 }}>{stage.icon}</span>
                          <strong style={{ fontSize: 13, color: '#0f172a' }}>{stage.label}</strong>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, background: stage.bg, color: stage.color, padding: '2px 8px', borderRadius: 10 }}>
                          {stageLeads.length}
                        </span>
                      </div>

                      <div className="kanban-cards-container">
                        {stageLeads.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '36px 12px', color: '#94a3b8', fontSize: 12 }}>
                            Drop leads here or advance from stages
                          </div>
                        ) : (
                          stageLeads.slice(0, 60).map(lead => {
                            const isBeingDragged = draggedLead?.id === lead.id;
                            const tierCode = lead.lead_tier_code || (lead.lead_score >= 70 ? 'hot' : lead.lead_score >= 40 ? 'warm' : 'cold');
                            return (
                              <div
                                key={lead.id}
                                draggable={true}
                                onDragStart={(e) => {
                                  setDraggedLead(lead);
                                  e.dataTransfer.setData('text/plain', lead.id);
                                  e.dataTransfer.effectAllowed = 'move';
                                }}
                                onDragEnd={() => {
                                  setDraggedLead(null);
                                  setDragOverCol(null);
                                }}
                                className={`kanban-card ${isBeingDragged ? 'is-dragging' : ''}`}
                                onClick={() => setActiveDossierLead(lead)}
                                title="Drag to move across pipeline stages, or click for Intelligence Dossier"
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span className="badge badge-cat" style={{ fontSize: 10 }}>{lead.category}</span>
                                    {(lead.merged_count > 1 || (lead.merged_from && lead.merged_from.length > 1)) && (
                                      <span className="dedup-tag-badge" style={{ fontSize: 9 }}>
                                        🔗 {lead.merged_count || lead.merged_from.length}
                                      </span>
                                    )}
                                    {lead.sequence_step && (
                                      <span className="sequence-badge" style={{ fontSize: 9 }}>
                                        ⚡ Touch {lead.sequence_step}/3
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span
                                      className={`score-badge score-badge-${tierCode}`}
                                      style={{ fontSize: 10, padding: '2px 6px' }}
                                      title={`Lead Score: ${lead.lead_score || 0}/100 (${lead.lead_tier || 'Tier C: Cold'})`}
                                    >
                                      {tierCode === 'hot' ? '🔥' : tierCode === 'warm' ? '⭐' : '❄️'} {lead.lead_score || 0}
                                    </span>
                                    {lead.rating && (
                                      <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, color: '#d97706', fontWeight: 700 }}>
                                        <Star size={10} fill="#f59e0b" color="#d97706" /> {lead.rating}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                                  {lead.name}
                                </h4>
                                <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 8px 0' }}>
                                  {lead.city} • {lead.area}
                                </p>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                                  {lead.has_email && (
                                    <span className="badge badge-email" style={{ fontSize: 10 }}>✉️ {lead.email}</span>
                                  )}
                                  {lead.phone && (
                                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#475569' }}>📞 {lead.phone}</span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #f1f5f9' }} onClick={(e) => e.stopPropagation()}>
                                  <div style={{ display: 'flex', gap: 4 }}>
                                    <button
                                      onClick={() => {
                                        setPreviewLead(lead);
                                        setActiveTab('campaign');
                                      }}
                                      className="btn-secondary"
                                      style={{ fontSize: 10, padding: '3px 6px' }}
                                      title="Email lead"
                                    >
                                      ✉️ Email
                                    </button>
                                    {lead.wa_phone && (
                                      <a
                                        href={`https://wa.me/${lead.wa_phone}?text=${encodeURIComponent(renderedPreview?.wa_text || customWaText)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={() => handleStatusChange(lead, 'Contacted')}
                                        style={{ background: '#ecfdf5', color: '#047857', padding: '3px 6px', borderRadius: 6, fontSize: 10, textDecoration: 'none', fontWeight: 700 }}
                                      >
                                        💬 WA
                                      </a>
                                    )}
                                  </div>

                                  {stage.id === 'New' && (
                                    <button onClick={() => handleStatusChange(lead, 'Contacted')} className="btn-ghost" style={{ fontSize: 10, color: '#059669', padding: '2px 4px' }} title="Move to Contacted">
                                      Advance →
                                    </button>
                                  )}
                                  {stage.id === 'Contacted' && (
                                    <button onClick={() => handleStatusChange(lead, 'Interested')} className="btn-ghost" style={{ fontSize: 10, color: '#d97706', padding: '2px 4px' }} title="Move to Interested">
                                      Interested 🔥
                                    </button>
                                  )}
                                  {stage.id === 'Interested' && (
                                    <button onClick={() => handleStatusChange(lead, 'Converted')} className="btn-ghost" style={{ fontSize: 10, color: '#7c3aed', padding: '2px 4px' }} title="Convert Lead!">
                                      Convert 🎉
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Floating Multi-Select Action Dock */}
            {selectedLeadIds.size > 0 && (
              <div className="floating-dock">
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  📌 {selectedLeadIds.size} Selected
                </span>

                <div style={{ width: 1, height: 20, background: '#cbd5e1' }} />

                <button
                  onClick={() => {
                    setAudienceType('selected_only');
                    setActiveTab('campaign');
                  }}
                  className="btn-primary"
                  style={{ fontSize: 12, padding: '7px 14px' }}
                >
                  <Send size={13} /> Compose Email Campaign
                </button>

                <button
                  onClick={() => {
                    setActiveTab('whatsapp');
                    setWaQueueIndex(0);
                  }}
                  className="btn-emerald"
                  style={{ fontSize: 12, padding: '7px 14px' }}
                >
                  <MessageSquare size={13} /> Open WhatsApp Blast Queue
                </button>

                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkStatusChange(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{ padding: '6px 10px', fontSize: 12, borderRadius: 8, borderColor: '#cbd5e1' }}
                >
                  <option value="">Set Status...</option>
                  <option value="New">Mark: New</option>
                  <option value="Contacted">Mark: Contacted</option>
                  <option value="Interested">Mark: Interested</option>
                  <option value="Follow-up">Mark: Follow-up</option>
                  <option value="Converted">Mark: Converted</option>
                  <option value="Do Not Contact">Mark: Do Not Contact</option>
                </select>

                <button
                  onClick={() => exportLeadsToCsv(leads.filter(l => selectedLeadIds.has(l.id)), 'selected_leads')}
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: '6px 10px' }}
                >
                  <FileDown size={13} /> Export CSV
                </button>

                <button
                  onClick={clearSelection}
                  style={{ background: 'transparent', color: '#e11d48', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', padding: '6px' }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: IN-APP GOOGLE MAPS SCRAPER
           ========================================================================= */}
        {activeTab === 'scraper' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 480px) 1fr', gap: 20 }}>
            {/* Scraper Config Panel */}
            <div className="glass-panel" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a' }}>
                  <Compass size={18} color="#4f46e5" /> Integrated Google Maps Scraper
                </h3>
                {scraperJob.is_running && (
                  <span className="badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                    <span className="pulse-indicator" style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} /> Live Running
                  </span>
                )}
              </div>

              {/* Universal Agency Niche Presets */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    🎯 Universal Niche Presets (Any Field)
                  </label>
                  <span style={{ fontSize: 10, color: '#4f46e5', fontWeight: 600 }}>1-Click Agency Targets</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 10 }}>
                  {[
                    { label: '🩺 Dental & Healthcare Clinics', query: 'Dental Clinics', cat: 'Healthcare' },
                    { label: '🚀 Digital Marketing Agencies', query: 'Digital Marketing Agencies', cat: 'Agencies' },
                    { label: '🏢 Real Estate Brokers', query: 'Real Estate Brokers', cat: 'Real Estate' },
                    { label: '🏭 Manufacturing & Supply', query: 'Manufacturing Units', cat: 'Industrial' },
                    { label: '🏋️ Gyms & Fitness Studios', query: 'Fitness Gyms', cat: 'Fitness' },
                    { label: '⚖️ Corporate Law & CA Firms', query: 'Chartered Accountants & Law Firms', cat: 'Legal & Finance' },
                    { label: '💻 B2B Tech & Software', query: 'Software Companies', cat: 'Technology' },
                    { label: '🍽️ Fine Dining & Restaurants', query: 'Restaurants', cat: 'Hospitality' }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const cityPart = scraperCity || 'Gurgaon, Haryana';
                        const fullQ = `${preset.query} in ${cityPart}`;
                        setScraperQuery(fullQ);
                        const clean = preset.query.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
                        setScraperOutputName(`scraped_${clean}.csv`);
                      }}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textAlign: 'left',
                        padding: '6px 8px',
                        background: scraperQuery.includes(preset.query) ? '#eef2ff' : '#f8fafc',
                        color: scraperQuery.includes(preset.query) ? '#4f46e5' : '#334155',
                        border: scraperQuery.includes(preset.query) ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                        borderRadius: 7,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>
                  SEARCH QUERY KEYWORDS
                </label>
                <input
                  type="text"
                  value={scraperQuery}
                  onChange={(e) => setScraperQuery(e.target.value)}
                  placeholder="e.g. Dentists in Miami or Digital Agencies in London"
                  style={{ width: '100%', padding: '9px 12px', fontSize: 13, fontWeight: 600 }}
                />
              </div>

              {/* Target City & Global City Selector */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    🌍 GLOBAL TARGET CITY / REGION
                  </label>
                  <span style={{ fontSize: 10, color: '#64748b' }}>Select or type any location</span>
                </div>
                <input
                  type="text"
                  value={scraperCity}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    setScraperCity(newCity);
                    if (scraperQuery.includes(' in ')) {
                      const prefix = scraperQuery.split(' in ')[0];
                      setScraperQuery(`${prefix} in ${newCity}`);
                    }
                  }}
                  placeholder="e.g. Miami, FL or London, UK or Gurgaon & Delhi NCR"
                  style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                  {[
                    'Miami, FL',
                    'Austin, TX',
                    'New York, NY',
                    'London, UK',
                    'Dubai, UAE',
                    'Sydney, Australia',
                    'Toronto, Canada',
                    'Gurgaon & Delhi NCR',
                    'Mumbai, India',
                    'Bangalore, India'
                  ].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setScraperCity(c);
                        if (scraperQuery.includes(' in ')) {
                          const prefix = scraperQuery.split(' in ')[0];
                          setScraperQuery(`${prefix} in ${c}`);
                        } else {
                          setScraperQuery(`${scraperQuery} in ${c}`);
                        }
                      }}
                      style={{
                        fontSize: 10,
                        background: scraperCity === c ? '#ecfdf5' : '#f1f5f9',
                        color: scraperCity === c ? '#047857' : '#475569',
                        border: scraperCity === c ? '1px solid #6ee7b7' : '1px solid #e2e8f0',
                        borderRadius: 5,
                        padding: '2px 7px',
                        cursor: 'pointer'
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrape Limit */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>MAX BUSINESSES TO EXTRACT</label>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#4f46e5', fontWeight: 700 }}>{scraperLimit} listings</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[10, 25, 50, 100].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setScraperLimit(val)}
                      className="btn-secondary"
                      style={{ flex: 1, fontSize: 11, padding: 6, borderColor: scraperLimit === val ? '#4f46e5' : '#cbd5e1' }}
                    >
                      {val} Leads
                    </button>
                  ))}
                </div>
              </div>

              {/* Output File Config */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>
                  OUTPUT CSV FILE NAME
                </label>
                <input
                  type="text"
                  value={scraperOutputName}
                  onChange={(e) => setScraperOutputName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 13, fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div style={{ marginBottom: 18, background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={scraperAppendMaster}
                    onChange={(e) => setScraperAppendMaster(e.target.checked)}
                    style={{ accentColor: '#4f46e5' }}
                  />
                  Auto-merge scraped payload into Master CRM Database
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                {scraperJob.is_running ? (
                  <button
                    onClick={handleStopScraper}
                    style={{ width: '100%', background: '#ef4444', color: '#fff', borderRadius: 8, padding: 12, fontSize: 13, fontWeight: 700 }}
                  >
                    <Square size={14} /> Stop Scraper Task
                  </button>
                ) : (
                  <button
                    onClick={handleStartScraper}
                    className="btn-primary"
                    style={{ width: '100%', padding: 12, fontSize: 14, fontWeight: 700, justifyContent: 'center' }}
                  >
                    <Compass size={16} /> Launch Google Maps Scraper
                  </button>
                )}
              </div>
            </div>

            {/* Scraper Live Monitor & Results Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Progress & Live Terminal */}
              <div className="glass-panel" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={scraperJob.is_running ? 'pulse-indicator' : ''} style={{ width: 10, height: 10, borderRadius: '50%', background: scraperJob.is_running ? '#3b82f6' : '#10b981' }} />
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Live Scraping Progress & Activity</h4>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                    <span>Discovered: <strong style={{ color: '#4f46e5' }}>{scraperJob.found}</strong> / {scraperJob.limit}</span>
                    <span>Emails Found: <strong style={{ color: '#059669' }}>{scraperJob.emails_found}</strong></span>
                  </div>
                </div>

                <div style={{ height: 8, width: '100%', background: '#e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ height: '100%', width: `${scraperJob.percentage}%`, background: 'linear-gradient(90deg, #3b82f6, #10b981)', transition: 'width 0.3s ease' }} />
                </div>

                {/* Scraper Console Terminal */}
                <div
                  ref={scraperLogsRef}
                  style={{
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: 8,
                    padding: 12,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: '#cbd5e1',
                    height: 140,
                    overflowY: 'auto'
                  }}
                >
                  {scraperJob.logs.length === 0 ? (
                    <div style={{ color: '#64748b' }}>Scraper idle. Click "Launch Google Maps Scraper" above to begin.</div>
                  ) : (
                    scraperJob.logs.map((log, i) => (
                      <div key={i} style={{ color: log.includes('Email:') ? '#34d399' : log.includes('[!]') ? '#f87171' : '#cbd5e1', marginBottom: 3 }}>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Scraped Results Feed */}
              <div className="glass-panel" style={{ padding: 20, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Extracted Businesses ({scraperJob.leads ? scraperJob.leads.length : 0})
                  </h4>
                  {scraperJob.leads && scraperJob.leads.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={async () => {
                          await fetchCsvs();
                          setSelectedFile(scraperOutputName);
                          setActiveTab('campaign');
                          showToast(`Loaded ${scraperJob.leads.length} scraped leads into Email Campaign Studio!`);
                        }}
                        className="btn-primary"
                        style={{ fontSize: 11, padding: '5px 12px', background: '#4f46e5' }}
                        title="Transfer scraped leads directly into Email Campaign Studio"
                      >
                        <Send size={12} /> Target with Email Campaign ➔
                      </button>

                      <button
                        onClick={async () => {
                          await fetchCsvs();
                          setSelectedFile(scraperOutputName);
                          setActiveTab('whatsapp');
                          setWaQueueIndex(0);
                          showToast(`Loaded ${scraperJob.leads.length} scraped leads into WhatsApp Hub!`);
                        }}
                        className="btn-emerald"
                        style={{ fontSize: 11, padding: '5px 12px' }}
                        title="Transfer scraped leads directly into WhatsApp Outreach Queue"
                      >
                        <MessageSquare size={12} /> Target with WhatsApp ➔
                      </button>

                      <button
                        onClick={() => exportLeadsToCsv(scraperJob.leads, scraperOutputName.replace('.csv', ''))}
                        className="btn-secondary"
                        style={{ fontSize: 11, padding: '5px 10px' }}
                      >
                        <Download size={12} /> Export CSV
                      </button>

                      <button
                        onClick={async () => {
                          await fetchCsvs();
                          setSelectedFile(scraperOutputName);
                          setActiveTab('crm');
                        }}
                        className="btn-secondary"
                        style={{ fontSize: 11, padding: '5px 10px' }}
                      >
                        <Users size={12} /> View in Master CRM →
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ overflowX: 'auto', maxHeight: '42vh' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                      <tr>
                        <th style={{ padding: '8px 10px' }}>Name</th>
                        <th style={{ padding: '8px 10px' }}>Category</th>
                        <th style={{ padding: '8px 10px' }}>Phone</th>
                        <th style={{ padding: '8px 10px' }}>Email</th>
                        <th style={{ padding: '8px 10px' }}>Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!scraperJob.leads || scraperJob.leads.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                            No businesses captured yet. Results will stream here live.
                          </td>
                        </tr>
                      ) : (
                        scraperJob.leads.map((l, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>{l['Business Name']}</td>
                            <td style={{ padding: '8px 10px' }}><span className="badge badge-cat">{l['Category']}</span></td>
                            <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)' }}>{l['Phone Number'] || '-'}</td>
                            <td style={{ padding: '8px 10px' }}>
                              {l['Email'] ? <span className="badge badge-email">{l['Email']}</span> : <span className="badge badge-no-email">Searching website...</span>}
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              {l['Rating'] ? <span style={{ color: '#d97706', fontWeight: 700 }}>★ {l['Rating']}</span> : '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: EMAIL CAMPAIGN & VISUAL IN-APP COMPOSER
           ========================================================================= */}
        {activeTab === 'campaign' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 490px) 1fr', gap: 20 }}>
            {/* Left Column: Composer Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div className="glass-panel" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a' }}>
                    <Edit3 size={18} color="#4f46e5" /> In-App Email Composer
                  </h3>
                  <label style={{ fontSize: 12, fontWeight: 700, color: isCustomMode ? '#059669' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={isCustomMode}
                      onChange={(e) => setIsCustomMode(e.target.checked)}
                      style={{ accentColor: '#059669' }}
                    />
                    Custom Text Mode
                  </label>
                </div>

                {/* Flexible AI Message Polishers */}
                <div style={{ marginBottom: 16, padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>
                      <Wand2 size={13} /> Flexible AI Message Polishers:
                    </div>
                    {isTransformingAi && (
                      <span style={{ fontSize: 10, color: '#7c3aed', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <RefreshCw size={11} className="animate-spin" /> Rewriting copy...
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleApplyAiPolisher('value_first')}
                      disabled={isTransformingAi}
                      className="btn-secondary"
                      style={{ fontSize: 11, padding: '6px 8px', justifyContent: 'flex-start', background: activePolisher === 'value_first' ? '#eff6ff' : '#ffffff', borderColor: activePolisher === 'value_first' ? '#3b82f6' : '#cbd5e1' }}
                      title="Reframes copy around quantifiable ROI, margin gains, and rapid payback"
                    >
                      <TrendingUp size={12} color="#2563eb" /> Value-First Prospecting
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAiPolisher('pain_point')}
                      disabled={isTransformingAi}
                      className="btn-secondary"
                      style={{ fontSize: 11, padding: '6px 8px', justifyContent: 'flex-start', background: activePolisher === 'pain_point' ? '#fff7ed' : '#ffffff', borderColor: activePolisher === 'pain_point' ? '#f97316' : '#cbd5e1' }}
                      title="Agitates operational bottlenecks, invoice lag, and invisible margin leakages"
                    >
                      <AlertTriangle size={12} color="#ea580c" /> Pain-Point Agitator
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAiPolisher('social_proof')}
                      disabled={isTransformingAi}
                      className="btn-secondary"
                      style={{ fontSize: 11, padding: '6px 8px', justifyContent: 'flex-start', background: activePolisher === 'social_proof' ? '#f5f3ff' : '#ffffff', borderColor: activePolisher === 'social_proof' ? '#8b5cf6' : '#cbd5e1' }}
                      title="Cites verified peer client benchmarks and success stories in {city}"
                    >
                      <Users size={12} color="#7c3aed" /> Case Study / Social Proof
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAiPolisher('short_punchy')}
                      disabled={isTransformingAi}
                      className="btn-secondary"
                      style={{ fontSize: 11, padding: '6px 8px', justifyContent: 'flex-start', background: activePolisher === 'short_punchy' ? '#ecfdf5' : '#ffffff', borderColor: activePolisher === 'short_punchy' ? '#10b981' : '#cbd5e1' }}
                      title="Under 60 words for maximum mobile readability and friction-free reply rate"
                    >
                      <Zap size={12} color="#059669" /> Short & Punchy (&lt;60w)
                    </button>
                  </div>
                </div>

                {/* =========================================================================
                    AI COLD OUTREACH COPYWRITER & MULTI-TOUCH SEQUENCE STUDIO
                   ========================================================================= */}
                <div className="sequence-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={14} color="#7c3aed" />
                      <strong style={{ fontSize: 13, color: '#1e1b4b' }}>AI Multi-Touch Sequence Studio</strong>
                    </div>
                    <span style={{ fontSize: 10, background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>
                      3-Touch Follow-Up Drip
                    </span>
                  </div>

                  <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    Synthesizes customized outreach copy calibrated to <strong>{previewLead?.name || 'Selected Lead'}</strong>'s industry ({previewLead?.category || 'General'}), location ({previewLead?.area || 'NCR'}), and Google review reputation.
                  </p>

                  <button
                    type="button"
                    onClick={() => handleGenerateAiSequence(previewLead)}
                    disabled={isGeneratingSequence}
                    className="btn-primary"
                    style={{ width: '100%', padding: '7px 10px', fontSize: 12, justifyContent: 'center', marginBottom: 12, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                  >
                    <Sparkles size={13} /> {isGeneratingSequence ? 'Synthesizing Sequence Copy...' : `⚡ Generate 3-Touch Sequence for ${previewLead?.name ? previewLead.name.split(' ')[0] : 'Lead'}`}
                  </button>

                  {/* Render Sequence Step Tabs if Active Sequence Exists */}
                  {activeSequenceData && activeSequenceData.steps && (
                    <div className="animate-fade-in">
                      <div className="sequence-nav-row">
                        {activeSequenceData.steps.map(step => (
                          <div
                            key={step.step_number}
                            onClick={() => setActiveSequenceStep(step.step_number)}
                            className={`sequence-step-tab ${activeSequenceStep === step.step_number ? 'active' : ''}`}
                          >
                            <span style={{ fontSize: 10, fontWeight: 800, color: activeSequenceStep === step.step_number ? '#4f46e5' : '#64748b' }}>
                              Touch {step.step_number} • {step.timing.split(' ')[0]}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {step.title.split(':')[1] || step.title}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Active Step Details */}
                      {(() => {
                        const curStep = activeSequenceData.steps.find(s => s.step_number === activeSequenceStep) || activeSequenceData.steps[0];
                        return (
                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#4f46e5' }}>
                                {curStep.title} ({curStep.timing})
                              </span>
                              <span style={{ fontSize: 10, background: '#e0e7ff', color: '#3730a3', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                                {curStep.hook_badge}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                              Subject: <span style={{ color: '#334155', fontWeight: 600 }}>{curStep.subject}</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#475569', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 6, padding: 8, maxHeight: 110, overflowY: 'auto', whiteSpace: 'pre-line', lineHeight: 1.5, marginBottom: 8 }}>
                              {curStep.body_plain}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => handleApplySequenceStep(curStep)}
                                className="btn-primary"
                                style={{ fontSize: 11, padding: '5px 8px', justifyContent: 'center' }}
                              >
                                ✉️ Apply to Composer →
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(curStep.body_plain);
                                  showToast('Copied step copy to clipboard!');
                                }}
                                className="btn-secondary"
                                style={{ fontSize: 11, padding: '5px 8px', justifyContent: 'center' }}
                              >
                                📋 Copy Step
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Dynamic Industry Template Switcher */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      DYNAMIC INDUSTRY TEMPLATE SWITCHER
                    </label>
                    <span style={{ fontSize: 10, background: '#eff6ff', color: '#3b82f6', padding: '1px 7px', borderRadius: 4, fontWeight: 700 }}>
                      Auto-Populates Copy
                    </span>
                  </div>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13, fontWeight: 600, borderRadius: 8, borderColor: '#cbd5e1' }}
                  >
                    <option value="mfg_industrial">🏭 Manufacturing & Industrial Supply</option>
                    <option value="tech_saas">💻 B2B Technology & Software Services</option>
                    <option value="logistics_supply_chain">🚚 Logistics, Transport & Warehousing</option>
                    <option value="real_estate_construction">🏗️ Real Estate, Construction & Development</option>
                    <option value="b2b_professional">💼 General B2B Professional Services</option>
                  </select>
                </div>

                {/* Sender Account */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>SENDER PROFILE (SMTP)</label>
                    <button
                      onClick={() => {
                        setEditingAccount({ ...currentAccountObj });
                        setActiveTab('settings');
                      }}
                      style={{ background: 'transparent', color: '#4f46e5', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Configure Details ⚙️
                    </button>
                  </div>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Audience */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>
                    RECIPIENT AUDIENCE
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setAudienceType('all_with_email')}
                      style={{
                        padding: '9px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: 'left',
                        background: audienceType === 'all_with_email' ? '#eef2ff' : '#ffffff',
                        border: audienceType === 'all_with_email' ? '1.5px solid #4f46e5' : '1px solid #cbd5e1',
                        color: audienceType === 'all_with_email' ? '#4f46e5' : '#475569'
                      }}
                    >
                      All with Email ({leads.filter(l => l.has_email).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudienceType('selected_only')}
                      style={{
                        padding: '9px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: 'left',
                        background: audienceType === 'selected_only' ? '#eef2ff' : '#ffffff',
                        border: audienceType === 'selected_only' ? '1.5px solid #4f46e5' : '1px solid #cbd5e1',
                        color: audienceType === 'selected_only' ? '#4f46e5' : '#475569'
                      }}
                    >
                      Selected Only ({selectedLeadIds.size})
                    </button>
                  </div>
                </div>

                {/* Subject Line Input */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>
                    EMAIL SUBJECT (Supports tags)
                  </label>
                  <input
                    type="text"
                    value={isCustomMode ? customSubject : (renderedPreview?.subject || '')}
                    onChange={(e) => {
                      setIsCustomMode(true);
                      setCustomSubject(e.target.value);
                    }}
                    style={{ width: '100%', padding: '9px 12px', fontSize: 13 }}
                  />
                </div>

                {/* Dynamic Variables Insertion Bar */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
                    INSERT PERSONALIZATION TAGS:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {['{name}', '{area}', '{city}', '{category}', '{rating}', '{sender_name}', '{sender_phone}'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setIsCustomMode(true);
                          insertVariable(tag);
                        }}
                        style={{
                          background: '#f1f5f9',
                          color: '#4f46e5',
                          border: '1px solid #e2e8f0',
                          borderRadius: 5,
                          padding: '3px 8px',
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Body Textarea */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>
                    EMAIL BODY (Real-time HTML preview on right)
                  </label>
                  <textarea
                    ref={emailBodyTextareaRef}
                    rows={8}
                    value={isCustomMode ? customBody : (renderedPreview?.body_plain || '')}
                    onChange={(e) => {
                      setIsCustomMode(true);
                      setCustomBody(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: 13,
                      lineHeight: 1.6,
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Throttle Delays */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>THROTTLE DELAY BETWEEN SENDS</label>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#4f46e5', fontWeight: 700 }}>{delayRange.min}s – {delayRange.max}s</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => setDelayRange({ min: 3, max: 6 })} className="btn-secondary" style={{ flex: 1, fontSize: 11, padding: 6, borderColor: delayRange.min === 3 ? '#4f46e5' : '#cbd5e1' }}>Fast (3-6s)</button>
                    <button type="button" onClick={() => setDelayRange({ min: 5, max: 10 })} className="btn-secondary" style={{ flex: 1, fontSize: 11, padding: 6, borderColor: delayRange.min === 5 ? '#4f46e5' : '#cbd5e1' }}>Safe (5-10s)</button>
                    <button type="button" onClick={() => setDelayRange({ min: 10, max: 20 })} className="btn-secondary" style={{ flex: 1, fontSize: 11, padding: 6, borderColor: delayRange.min === 10 ? '#4f46e5' : '#cbd5e1' }}>Relaxed (10-20s)</button>
                  </div>
                </div>

                {/* Dispatch Button */}
                <button
                  onClick={handleStartBatch}
                  disabled={batchStatus.is_running}
                  className="btn-emerald"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: 14,
                    fontWeight: 700,
                    opacity: batchStatus.is_running ? 0.6 : 1
                  }}
                >
                  <Send size={16} /> Shoot Campaign to {audienceType === 'selected_only' ? `${selectedLeadIds.size} Selected Leads` : `All Verified Emails (${leads.filter(l => l.has_email).length})`}
                </button>
              </div>

              {/* Single Test Email Card */}
              <div className="glass-panel" style={{ padding: 18 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a' }}>
                  <ShieldCheck size={16} color="#059669" /> Send Test to Your Own Inbox First
                </h4>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    placeholder="Enter your email"
                    style={{ flex: 1, padding: '7px 12px', fontSize: 13 }}
                  />
                  <button
                    onClick={handleSendTestEmail}
                    disabled={sendingTest}
                    className="btn-primary"
                    style={{ fontSize: 12, whiteSpace: 'nowrap' }}
                  >
                    {sendingTest ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Live Rendered Card Preview & Real-Time Dispatch Console */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Batch Console if running */}
              {batchStatus.is_running && (
                <div className="glass-panel" style={{ padding: 20, border: '1.5px solid #10b981', background: '#f0fdf4' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="pulse-indicator" style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#047857' }}>Live Outreach Running In App</h4>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {batchStatus.is_paused ? (
                        <button onClick={() => handleBatchControl('resume')} className="btn-emerald" style={{ padding: '5px 10px', fontSize: 11 }}>
                          <Play size={12} /> Resume
                        </button>
                      ) : (
                        <button onClick={() => handleBatchControl('pause')} className="btn-secondary" style={{ padding: '5px 10px', fontSize: 11 }}>
                          <Pause size={12} /> Pause
                        </button>
                      )}
                      <button onClick={() => handleBatchControl('stop')} style={{ background: '#ef4444', color: '#fff', borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600 }}>
                        <Square size={11} /> Stop Batch
                      </button>
                    </div>
                  </div>

                  <div style={{ height: 8, width: '100%', background: '#e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ height: '100%', width: `${batchStatus.percentage}%`, background: 'linear-gradient(90deg, #10b981, #4f46e5)', transition: 'width 0.4s ease' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#475569', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                    <div>
                      <span>Sent: <strong style={{ color: '#059669' }}>{batchStatus.sent}</strong> / {batchStatus.total}</span>
                      <span style={{ marginLeft: 12 }}>Failed: <strong style={{ color: '#ef4444' }}>{batchStatus.failed}</strong></span>
                      <span style={{ marginLeft: 12 }}>Progress: <strong>{batchStatus.percentage}%</strong></span>
                    </div>
                    <span className="micro-batch-pill">
                      ⏱️ Micro-Batch: {batchStatus.batch_size || microBatchSize || 3}/burst • {batchStatus.cooldown_seconds || batchCooldown || 10}s pause
                    </span>
                  </div>

                  <div
                    ref={terminalLogsRef}
                    style={{
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: 8,
                      padding: 12,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: '#cbd5e1',
                      height: 120,
                      overflowY: 'auto'
                    }}
                  >
                    {batchStatus.logs.map((log, i) => (
                      <div key={i} style={{ color: log.includes('[SENT]') ? '#34d399' : log.includes('[!]') ? '#f87171' : '#cbd5e1', marginBottom: 3 }}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rendered Preview Card with Device Switcher */}
              <div className="glass-panel" style={{ padding: 22, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>PREVIEW FOR:</span>
                    <select
                      value={previewLead?.id || ''}
                      onChange={(e) => {
                        const found = leads.find(l => l.id === e.target.value);
                        if (found) setPreviewLead(found);
                      }}
                      style={{ padding: '4px 8px', fontSize: 12 }}
                    >
                      {leads.slice(0, 100).map(l => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.area})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Device Switcher */}
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: 2, borderRadius: 6, gap: 2 }}>
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 5,
                        fontSize: 11,
                        background: previewDevice === 'desktop' ? '#ffffff' : 'transparent',
                        color: previewDevice === 'desktop' ? '#4f46e5' : '#64748b',
                        boxShadow: previewDevice === 'desktop' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                      }}
                      title="Desktop view"
                    >
                      <Monitor size={13} /> Desktop
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 5,
                        fontSize: 11,
                        background: previewDevice === 'mobile' ? '#ffffff' : 'transparent',
                        color: previewDevice === 'mobile' ? '#4f46e5' : '#64748b',
                        boxShadow: previewDevice === 'mobile' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                      }}
                      title="Mobile view"
                    >
                      <Smartphone size={13} /> Mobile
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>SUBJECT: </span>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>{renderedPreview?.subject}</strong>
                </div>

                {/* Rendered HTML Container */}
                <div style={{
                  background: '#f8fafc',
                  borderRadius: 10,
                  padding: previewDevice === 'mobile' ? '14px 10px' : '18px',
                  border: '1px solid #e2e8f0',
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: previewDevice === 'mobile' ? '360px' : '100%',
                    maxWidth: previewDevice === 'mobile' ? '360px' : '580px',
                    transition: 'all 0.25s ease'
                  }}>
                    {renderedPreview?.card_html ? (
                      <div dangerouslySetInnerHTML={{ __html: renderedPreview.card_html }} />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        Generating live preview...
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 4: WHATSAPP HUB & AUTO-QUEUE RUNNER
           ========================================================================= */}
        {activeTab === 'whatsapp' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: 20 }}>
            {/* Left Column: Template & Queue Controller */}
            <div className="glass-panel" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a' }}>
                  <MessageSquare size={18} color="#059669" /> WhatsApp Hub & Queue
                </h3>
                <span className="badge" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                  {waQueueLeads.length} WhatsApp Contacts
                </span>
              </div>

              {/* Lead Queue Step Box */}
              {waQueueLeads.length > 0 && currentWaLead && (
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      QUEUE POSITION: {waQueueIndex + 1} OF {waQueueLeads.length}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: 700 }}>
                      {Math.round(((waQueueIndex + 1) / waQueueLeads.length) * 100)}%
                    </span>
                  </div>

                  <div style={{ height: 6, width: '100%', background: '#e2e8f0', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ height: '100%', width: `${((waQueueIndex + 1) / waQueueLeads.length) * 100}%`, background: '#10b981', transition: 'width 0.2s' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div className="avatar-badge" style={{ background: '#ecfdf5', color: '#059669', width: 36, height: 36 }}>
                        {getInitials(currentWaLead.name)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>{currentWaLead.name}</h4>
                        <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{currentWaLead.city} • {currentWaLead.area} • {currentWaLead.category}</p>
                        <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: 700, margin: '4px 0 0 0' }}>📱 +{currentWaLead.wa_phone}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => setWaQueueIndex(prev => Math.max(0, prev - 1))}
                        disabled={waQueueIndex === 0}
                        className="btn-secondary"
                        style={{ padding: '5px 8px', fontSize: 11 }}
                        title="Previous Lead"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button
                        onClick={() => setWaQueueIndex(prev => Math.min(waQueueLeads.length - 1, prev + 1))}
                        disabled={waQueueIndex === waQueueLeads.length - 1}
                        className="btn-secondary"
                        style={{ padding: '5px 8px', fontSize: 11 }}
                        title="Skip to Next Lead"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Template Quick-Dispatcher Selector */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    ⚡ QUICK-DISPATCHER TEMPLATES
                  </label>
                  <button
                    onClick={() => setShowNewWaModal(true)}
                    style={{ background: 'transparent', color: '#059669', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={13} /> Add Template
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {waTemplates.map(tpl => {
                    const isSelected = selectedWaTemplateId === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSelectWaTemplate(tpl)}
                        className={`wa-template-pill ${isSelected ? 'active' : ''}`}
                      >
                        <span>{tpl.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Editable WhatsApp Text */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    MESSAGE BODY (WITH PLACEHOLDER TAGS)
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['{name}', '{area}', '{rating}', '{sender_name}'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setCustomWaText(prev => prev + ' ' + tag)}
                        style={{ fontSize: 10, background: '#f1f5f9', color: '#059669', border: '1px solid #cbd5e1', borderRadius: 4, padding: '2px 5px' }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={6}
                  value={customWaText}
                  onChange={(e) => setCustomWaText(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', fontSize: 13, lineHeight: 1.6 }}
                />
              </div>

              {/* Add Custom Template Inline Card */}
              {showNewWaModal && (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ fontSize: 12, color: '#166534' }}>Save New WhatsApp Template</strong>
                    <button onClick={() => setShowNewWaModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>✕</button>
                  </div>
                  <input
                    type="text"
                    placeholder="Template Title (e.g. 5-Min Working Capital Call)"
                    value={newWaTitle}
                    onChange={(e) => setNewWaTitle(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', fontSize: 12, marginBottom: 8 }}
                  />
                  <textarea
                    rows={3}
                    placeholder="Template text with {name}, {area}, {rating}, {sender_name}..."
                    value={newWaContent}
                    onChange={(e) => setNewWaContent(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', fontSize: 12, marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowNewWaModal(false)} className="btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}>Cancel</button>
                    <button onClick={handleSaveCustomWaTemplate} className="btn-emerald" style={{ fontSize: 11, padding: '4px 10px' }}>Save Template</button>
                  </div>
                </div>
              )}

              {/* Send and Advance CTA */}
              {currentWaLead?.wa_phone && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    type="button"
                    onClick={async () => {
                      const cleanPhone = currentWaLead.wa_phone;
                      const interpolated = (customWaText || renderedPreview?.wa_text || '')
                        .replace(/{name}/g, currentWaLead.name)
                        .replace(/{business_name}/g, currentWaLead.name)
                        .replace(/{area}/g, currentWaLead.area)
                        .replace(/{city}/g, currentWaLead.city)
                        .replace(/{category}/g, currentWaLead.category)
                        .replace(/{rating}/g, currentWaLead.rating || 'top')
                        .replace(/{sender_name}/g, currentAccountObj?.name || 'Growth Specialist')
                        .replace(/{sender_phone}/g, currentAccountObj?.phone || '+91 7015147209')
                        .replace(/{sender_company}/g, currentAccountObj?.designation || 'ApexOutreach Studio');

                      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(interpolated)}`, '_blank');
                      await handleStatusChange(currentWaLead, 'Contacted', 'whatsapp_sent', `Dispatched WhatsApp message`);

                      if (waQueueIndex < waQueueLeads.length - 1) {
                        setWaQueueIndex(prev => prev + 1);
                      } else {
                        confetti({ particleCount: 70, spread: 60 });
                        showToast('WhatsApp queue completed!');
                      }
                    }}
                    className="btn-emerald"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}
                  >
                    💬 Dispatch to WhatsApp & Advance ➔
                  </button>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => {
                        const interpolated = (customWaText || renderedPreview?.wa_text || '')
                          .replace(/{name}/g, currentWaLead.name)
                          .replace(/{business_name}/g, currentWaLead.name)
                          .replace(/{area}/g, currentWaLead.area)
                          .replace(/{city}/g, currentWaLead.city)
                          .replace(/{category}/g, currentWaLead.category)
                          .replace(/{rating}/g, currentWaLead.rating || 'top')
                          .replace(/{sender_name}/g, currentAccountObj?.name || 'Growth Specialist')
                          .replace(/{sender_phone}/g, currentAccountObj?.phone || '+91 7015147209');

                        navigator.clipboard.writeText(interpolated);
                        showToast('Copied message text to clipboard for SMS/LinkedIn/DMs!', 'success');
                      }}
                      className="btn-secondary"
                      style={{ flex: 1, padding: '8px', fontSize: 12, justifyContent: 'center' }}
                      title="Copy personalized text to clipboard for LinkedIn, SMS or Instagram"
                    >
                      <Copy size={13} /> Copy for SMS / DM
                    </button>

                    <button
                      type="button"
                      onClick={() => setWaQueueIndex(prev => Math.min(waQueueLeads.length - 1, prev + 1))}
                      disabled={waQueueIndex >= waQueueLeads.length - 1}
                      className="btn-secondary"
                      style={{ padding: '8px 12px', fontSize: 12 }}
                      title="Skip current lead without sending"
                    >
                      Skip ➔
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bubble Preview */}
            <div className="glass-panel" style={{ padding: 22 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#0f172a' }}>Real WhatsApp Bubble Preview</h4>
              <div style={{ background: '#e5ddd5', borderRadius: 12, padding: 24, border: '1px solid #cbd5e1' }}>
                <div style={{ background: '#dcf8c6', color: '#0f172a', borderRadius: '8px 8px 0 8px', padding: 16, fontSize: 14, lineHeight: 1.6, maxWidth: 520, marginLeft: 'auto', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  {renderedPreview?.wa_text || customWaText}
                  <div style={{ textAlign: 'right', fontSize: 10, color: '#64748b', marginTop: 8 }}>
                    Just now ✓✓
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: SENT LOGS & AUDIT HISTORY
           ========================================================================= */}
        {activeTab === 'logs' && (
          <div className="animate-fade-in glass-panel" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>Campaign Delivery Logs</h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Unified audit trail across all outreach files</p>
              </div>
              <button onClick={fetchSentLogs} className="btn-secondary" style={{ fontSize: 12 }}>
                <RefreshCw size={13} className={loadingLogs ? 'pulse-indicator' : ''} /> Refresh Logs
              </button>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '70vh' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <tr>
                    <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Timestamp</th>
                    <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Business Name</th>
                    <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Recipient Email</th>
                    <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Area</th>
                    <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Subject</th>
                    <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Engagement Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sentLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        No delivery logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    sentLogs.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>{log.timestamp}</td>
                        <td style={{ padding: '9px 12px', fontWeight: 700, color: '#0f172a' }}>{log.business_name}</td>
                        <td style={{ padding: '9px 12px', color: '#4f46e5' }}>{log.email}</td>
                        <td style={{ padding: '9px 12px', color: '#475569' }}>{log.city_area || log.area}</td>
                        <td style={{ padding: '9px 12px', color: '#334155' }}>{log.subject}</td>
                        <td style={{ padding: '9px 12px' }}>
                          <span className="badge badge-email">{log.status}</span>
                        </td>
                        <td style={{ padding: '9px 12px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => {
                                const matchLead = leads.find(l => l.email === log.email || l.name === log.business_name) || { id: log.email, name: log.business_name, email: log.email };
                                handleSimulateReply(matchLead);
                              }}
                              className="btn-secondary"
                              style={{ fontSize: 10, padding: '3px 7px', color: '#d97706', borderColor: '#fcd34d' }}
                              title="Simulate / Mark Lead Replied as Interested"
                            >
                              <Flame size={11} color="#f59e0b" /> Reply Received
                            </button>
                            <button
                              onClick={() => {
                                const matchLead = leads.find(l => l.email === log.email || l.name === log.business_name) || { id: log.email, name: log.business_name, email: log.email, area: log.city_area };
                                setNewTaskTitle(`Follow-up with ${log.business_name}`);
                                setNewTaskAction('call');
                                setNewTaskDueDate(new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16));
                                setTaskSelectedLeadId(matchLead.id);
                                setShowTaskDrawer(true);
                              }}
                              className="btn-secondary"
                              style={{ fontSize: 10, padding: '3px 7px' }}
                              title="Create Follow-up Task for this lead"
                            >
                              <CheckSquare size={11} color="#4f46e5" /> Set Task
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: SENDER SETTINGS, DAILY DISPATCH & CRON WEBHOOK
           ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 490px) 1fr', gap: 20 }}>
            {/* Account Profile Editor Form */}
            <div className="glass-panel" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a' }}>
                <Edit3 size={18} color="#4f46e5" /> Configure Sender Profile & Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>
                    SENDER NAME (Display Name)
                  </label>
                  <input
                    type="text"
                    value={editingAccount?.name || currentAccountObj?.name || ''}
                    onChange={(e) => setEditingAccount(prev => ({ ...(prev || currentAccountObj), name: e.target.value }))}
                    placeholder="e.g. CA Ishant Singla"
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>
                    SENDER EMAIL (From Address)
                  </label>
                  <input
                    type="email"
                    value={editingAccount?.email || currentAccountObj?.email || ''}
                    onChange={(e) => setEditingAccount(prev => ({ ...(prev || currentAccountObj), email: e.target.value }))}
                    placeholder="e.g. Ishantsingla94@gmail.com"
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>
                    PHONE / WHATSAPP NUMBER
                  </label>
                  <input
                    type="text"
                    value={editingAccount?.phone || currentAccountObj?.phone || ''}
                    onChange={(e) => setEditingAccount(prev => ({ ...(prev || currentAccountObj), phone: e.target.value }))}
                    placeholder="e.g. +91 7015147209"
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>
                      DESIGNATION
                    </label>
                    <input
                      type="text"
                      value={editingAccount?.designation || currentAccountObj?.designation || ''}
                      onChange={(e) => setEditingAccount(prev => ({ ...(prev || currentAccountObj), designation: e.target.value }))}
                      placeholder="e.g. Chartered Accountant"
                      style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>
                      REGION / SERVICE AREA
                    </label>
                    <input
                      type="text"
                      value={editingAccount?.location || currentAccountObj?.location || ''}
                      onChange={(e) => setEditingAccount(prev => ({ ...(prev || currentAccountObj), location: e.target.value }))}
                      placeholder="e.g. Gurgaon & Delhi NCR"
                      style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5', marginBottom: 10 }}>SMTP Credentials</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>SMTP Host</label>
                      <input
                        type="text"
                        value={editingAccount?.smtp_server || currentAccountObj?.smtp_server || 'smtp.gmail.com'}
                        onChange={(e) => setEditingAccount(prev => ({ ...(prev || currentAccountObj), smtp_server: e.target.value }))}
                        style={{ width: '100%', padding: '7px 10px', fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>Port</label>
                      <input
                        type="number"
                        value={editingAccount?.smtp_port || currentAccountObj?.smtp_port || 587}
                        onChange={(e) => setEditingAccount(prev => ({ ...(prev || currentAccountObj), smtp_port: e.target.value }))}
                        style={{ width: '100%', padding: '7px 10px', fontSize: 12 }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>Gmail App Password (16 characters)</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep existing password"
                      value={editingAccount?.smtp_pass || ''}
                      onChange={(e) => setEditingAccount(prev => ({ ...(prev || currentAccountObj), smtp_pass: e.target.value }))}
                      style={{ width: '100%', padding: '7px 10px', fontSize: 12 }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleTestSmtp(editingAccount || currentAccountObj)}
                      disabled={testingSmtp}
                      className="btn-secondary"
                      style={{ flex: 1, fontSize: 12, justifyContent: 'center' }}
                    >
                      <Key size={13} /> {testingSmtp ? 'Testing...' : 'Test Connection'}
                    </button>
                    <button
                      onClick={handleSaveAccount}
                      className="btn-emerald"
                      style={{ flex: 1, fontSize: 12, justifyContent: 'center' }}
                    >
                      <Check size={14} /> Save Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Dispatch Quotas & Webhook Automation Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Daily Automation Card */}
              <div className="glass-panel" style={{ padding: 22, border: '1.5px solid #4f46e5', background: '#faf5ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#4f46e5', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CloudLightning size={18} color="#7c3aed" /> Daily Sending Quota & Serverless Cron
                  </h3>
                  <span style={{ fontSize: 11, background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                    Auto-Throttling
                  </span>
                </div>

                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  Protect your Gmail account from being flagged or hitting the 500-email/day limit. Set a strict daily sending budget and trigger daily outreach via webhooks.
                </p>

                {/* Quota Gauge */}
                <div style={{ background: '#ffffff', border: '1px solid #ddd6fe', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Sent Today:</span>
                    <strong style={{ fontSize: 13, color: '#4f46e5', fontFamily: 'var(--font-mono)' }}>
                      {cronTracker.sent_today} / {cronTracker.daily_limit} emails
                    </strong>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, Math.round(cronTracker.sent_today / (cronTracker.daily_limit || 1) * 100))}%`, background: '#7c3aed' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginTop: 6 }}>
                    <span>Remaining budget for today: <strong>{cronTracker.remaining_today} emails</strong></span>
                    <span>Resets: Midnight UTC</span>
                  </div>
                </div>

                {/* Daily Limit Config */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>DAILY SENDING LIMIT</label>
                    <input
                      type="number"
                      value={cronTracker.daily_limit}
                      onChange={(e) => setCronTracker(prev => ({ ...prev, daily_limit: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '7px 10px', fontSize: 13, fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>CRON WEBHOOK TOKEN</label>
                    <input
                      type="text"
                      value={cronTracker.token}
                      onChange={(e) => setCronTracker(prev => ({ ...prev, token: e.target.value }))}
                      style={{ width: '100%', padding: '7px 10px', fontSize: 12, fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                </div>

                {/* Micro-Batch Queue Throttling for Free/Static Hosting */}
                <div style={{ background: '#ffffff', border: '1px solid #ddd6fe', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} color="#7c3aed" />
                      <strong style={{ fontSize: 12, color: '#1e1b4b' }}>Micro-Batch Queue Throttling (Serverless / Free Hosting Safe)</strong>
                    </div>
                    <span className="micro-batch-pill">
                      🛡️ Timeout & 550 Spam Guard
                    </span>
                  </div>

                  <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    Serverless platforms (Render, Vercel, Railway) terminate HTTP runners after 10–15 seconds. Micro-batching dispatches emails in small chunks with cool-down pauses and human-like randomized jitter sleep to protect your SMTP account and avoid host timeouts.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 3 }}>
                        MICRO-BATCH SIZE (EMAILS / CHUNK)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={microBatchSize}
                        onChange={(e) => setMicroBatchSize(Number(e.target.value))}
                        style={{ width: '100%', padding: '6px 8px', fontSize: 12 }}
                      />
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>Default: 3 emails / burst</span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 3 }}>
                        COOLDOWN PAUSE (SECONDS)
                      </label>
                      <input
                        type="number"
                        min={3}
                        max={60}
                        value={batchCooldown}
                        onChange={(e) => setBatchCooldown(Number(e.target.value))}
                        style={{ width: '100%', padding: '6px 8px', fontSize: 12 }}
                      />
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>Default: 10s pause between bursts</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 3 }}>
                        MIN JITTER DELAY (SECONDS)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={jitterMin}
                        onChange={(e) => setJitterMin(Number(e.target.value))}
                        style={{ width: '100%', padding: '6px 8px', fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 3 }}>
                        MAX JITTER DELAY (SECONDS)
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={30}
                        value={jitterMax}
                        onChange={(e) => setJitterMax(Number(e.target.value))}
                        style={{ width: '100%', padding: '6px 8px', fontSize: 12 }}
                      />
                    </div>
                  </div>
                </div>

                {/* External Cron Webhook URL */}
                <div style={{ background: '#ffffff', border: '1px solid #ddd6fe', borderRadius: 8, padding: 10, marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      EXTERNAL CRON WEBHOOK TRIGGER (For Cron-job.org / GitHub Actions):
                    </span>
                    <button
                      onClick={() => {
                        const fullUrl = `${window.location.origin}/api/cron/dispatch-daily?token=${encodeURIComponent(cronTracker.token)}`;
                        navigator.clipboard.writeText(fullUrl);
                        showToast('Copied Webhook URL to clipboard!');
                      }}
                      style={{ background: 'transparent', color: '#7c3aed', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                    >
                      <Copy size={12} /> Copy URL
                    </button>
                  </div>
                  <code style={{ fontSize: 11, color: '#6d28d9', wordBreak: 'break-all', fontFamily: 'var(--font-mono)', display: 'block' }}>
                    {window.location.origin}/api/cron/dispatch-daily?token={cronTracker.token}
                  </code>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleSaveCronSettings(cronTracker.daily_limit, cronTracker.token, microBatchSize, batchCooldown, jitterMin, jitterMax)}
                    className="btn-secondary"
                    style={{ flex: 1, fontSize: 12, justifyContent: 'center' }}
                  >
                    Save Quota & Throttling
                  </button>
                  <button
                    onClick={handleTriggerDailyCron}
                    disabled={triggeringDaily || cronTracker.remaining_today <= 0}
                    className="btn-primary"
                    style={{ flex: 1, fontSize: 12, justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                  >
                    <Zap size={13} /> {triggeringDaily ? 'Triggering...' : '⚡ Run Daily Dispatch Now'}
                  </button>
                </div>
              </div>

              {/* Profiles Switcher */}
              <div className="glass-panel" style={{ padding: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#0f172a' }}>Relay Profiles</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {accounts.map(acc => (
                    <div
                      key={acc.id}
                      style={{
                        background: selectedAccount === acc.id ? '#eef2ff' : '#ffffff',
                        border: selectedAccount === acc.id ? '1.5px solid #4f46e5' : '1px solid #cbd5e1',
                        borderRadius: 8,
                        padding: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: 13, color: '#0f172a' }}>{acc.name}</strong>
                        <div style={{ fontSize: 11, color: '#4f46e5' }}>{acc.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => setEditingAccount({ ...acc })}
                          className="btn-secondary"
                          style={{ fontSize: 10, padding: '4px 8px' }}
                        >
                          <Edit3 size={11} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAccount(acc.id);
                            showToast(`Active sender switched to ${acc.name}`);
                          }}
                          className={selectedAccount === acc.id ? 'btn-emerald' : 'btn-secondary'}
                          style={{ fontSize: 10, padding: '4px 8px' }}
                        >
                          {selectedAccount === acc.id ? 'Active ✓' : 'Select'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* =========================================================================
          SLIDE-OVER LEAD INTELLIGENCE DOSSIER (WITH CALENDAR INTEGRATION)
         ========================================================================= */}
      {activeDossierLead && (
        <div className="modal-overlay" onClick={() => setActiveDossierLead(null)}>
          <div
            className="slide-over-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f8fafc' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="avatar-badge" style={{ background: '#4f46e5', color: '#fff', width: 40, height: 40, fontSize: 15 }}>
                  {getInitials(activeDossierLead.name)}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 2px 0', color: '#0f172a' }}>{activeDossierLead.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="badge badge-cat" style={{ fontSize: 10 }}>{activeDossierLead.category}</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{activeDossierLead.city} • {activeDossierLead.area}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleOpenAiSpark(activeDossierLead)}
                  className="btn-spark-action"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  title="Generate Contextual AI Icebreaker"
                >
                  <Sparkles size={12} color="#6d28d9" /> AI Spark
                </button>
                <button
                  onClick={() => setActiveDossierLead(null)}
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '50%', width: 28, height: 28, color: '#64748b', fontSize: 14, cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: 22, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* ==========================================
                  LEAD SCORE & DEDUPLICATION INTELLIGENCE
                  ========================================== */}
              <div className="score-card-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} color="#d97706" />
                    <strong style={{ fontSize: 13, color: '#0f172a' }}>Automated Lead Score</strong>
                  </div>
                  <span className={`score-badge score-badge-${activeDossierLead.lead_tier_code || (activeDossierLead.lead_score >= 70 ? 'hot' : activeDossierLead.lead_score >= 40 ? 'warm' : 'cold')}`}>
                    {(activeDossierLead.lead_score >= 70 || activeDossierLead.lead_tier_code === 'hot') ? '🔥 Hot Lead' : (activeDossierLead.lead_score >= 40 || activeDossierLead.lead_tier_code === 'warm') ? '⭐ Warm Lead' : '❄️ Cold Lead'} ({activeDossierLead.lead_score || 0}/100)
                  </span>
                </div>

                <div className="score-progress-bar-bg" style={{ marginBottom: 10 }}>
                  <div
                    className="score-progress-bar-fill"
                    style={{
                      width: `${Math.max(5, Math.min(100, activeDossierLead.lead_score || 10))}%`,
                      background: (activeDossierLead.lead_score >= 70) ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : (activeDossierLead.lead_score >= 40) ? 'linear-gradient(90deg, #6366f1, #3b82f6)' : 'linear-gradient(90deg, #94a3b8, #64748b)'
                    }}
                  />
                </div>

                {/* Score Breakdown Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11 }}>
                  <div className="score-metric-row">
                    <span style={{ color: '#475569' }}>✉️ Email Verified:</span>
                    <strong style={{ color: activeDossierLead.has_email ? '#059669' : '#94a3b8' }}>
                      {activeDossierLead.has_email ? '+35 pts' : '0 pts'}
                    </strong>
                  </div>
                  <div className="score-metric-row">
                    <span style={{ color: '#475569' }}>🏢 Corporate Domain:</span>
                    <strong style={{ color: (activeDossierLead.has_email && !['gmail.com','yahoo.com','outlook.com','hotmail.com'].some(d => (activeDossierLead.email || '').includes(d))) ? '#059669' : '#94a3b8' }}>
                      {(activeDossierLead.has_email && !['gmail.com','yahoo.com','outlook.com','hotmail.com'].some(d => (activeDossierLead.email || '').includes(d))) ? '+10 pts' : '0 pts'}
                    </strong>
                  </div>
                  <div className="score-metric-row">
                    <span style={{ color: '#475569' }}>📞 Direct Phone/WA:</span>
                    <strong style={{ color: (activeDossierLead.phone || activeDossierLead.wa_phone) ? '#059669' : '#94a3b8' }}>
                      {(activeDossierLead.phone || activeDossierLead.wa_phone) ? '+20 pts' : '0 pts'}
                    </strong>
                  </div>
                  <div className="score-metric-row">
                    <span style={{ color: '#475569' }}>⭐ Rating & Reviews:</span>
                    <strong style={{ color: activeDossierLead.rating ? '#059669' : '#94a3b8' }}>
                      {activeDossierLead.rating ? `+${Math.min(25, Math.round((Number(activeDossierLead.rating) / 5) * 15) + (Number(activeDossierLead.reviews) > 0 ? 10 : 0))} pts` : '0 pts'}
                    </strong>
                  </div>
                  <div className="score-metric-row">
                    <span style={{ color: '#475569' }}>🌐 Verified Website:</span>
                    <strong style={{ color: activeDossierLead.website ? '#059669' : '#94a3b8' }}>
                      {activeDossierLead.website ? '+10 pts' : '0 pts'}
                    </strong>
                  </div>
                  <div className="score-metric-row">
                    <span style={{ color: '#475569' }}>🔗 Cross-Match Source:</span>
                    <strong style={{ color: '#4f46e5' }}>
                      {activeDossierLead.merged_count > 1 ? `${activeDossierLead.merged_count} sources merged` : 'Single Source'}
                    </strong>
                  </div>
                </div>

                {activeDossierLead.merged_from && activeDossierLead.merged_from.length > 1 && (
                  <div style={{ marginTop: 8, padding: '6px 8px', background: '#f8fafc', borderRadius: 6, fontSize: 10, color: '#64748b', border: '1px dashed #cbd5e1' }}>
                    Merged from: {activeDossierLead.merged_from.join(', ')}
                  </div>
                )}
              </div>

              {/* Quick Communication Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  onClick={() => {
                    setPreviewLead(activeDossierLead);
                    setActiveDossierLead(null);
                    setActiveTab('campaign');
                  }}
                  className="btn-primary"
                  style={{ justifyContent: 'center', padding: '9px' }}
                >
                  <Send size={13} /> Send Email
                </button>

                {activeDossierLead.wa_phone ? (
                  <a
                    href={`https://wa.me/${activeDossierLead.wa_phone}?text=${encodeURIComponent(renderedPreview?.wa_text || customWaText)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleStatusChange(activeDossierLead, 'Contacted')}
                    className="btn-emerald"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px' }}
                  >
                    💬 Chat WhatsApp
                  </a>
                ) : (
                  <button disabled className="btn-secondary" style={{ opacity: 0.5, justifyContent: 'center' }}>
                    No WhatsApp
                  </button>
                )}
              </div>

              {/* ==========================================
                  1. AI COLD OUTREACH PERSONALIZER PER LEAD
                  ========================================== */}
              <div className="ai-generator-box animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ background: '#4f46e5', color: '#fff', width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bot size={13} />
                    </div>
                    <strong style={{ fontSize: 13, color: '#1e1b4b' }}>AI Outreach Personalizer</strong>
                  </div>
                  <span style={{ fontSize: 10, background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: 8, fontWeight: 700 }}>
                    Tailored for {activeDossierLead.name.split(' ')[0]}
                  </span>
                </div>

                <p style={{ fontSize: 11, color: '#475569', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                  Generates cold outreach pitch using {activeDossierLead.name}'s industry ({activeDossierLead.category}), area ({activeDossierLead.area}), and {activeDossierLead.rating ? `${activeDossierLead.rating}★ rating` : 'business profile'}.
                </p>

                {/* Angle Selector Pills */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>
                    OUTREACH ANGLE / STRATEGY:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    {[
                      { id: 'mutual_fund', label: '💡 7% Liquid Treasury' },
                      { id: 'rating_compliment', label: '⭐ Rating Compliment' },
                      { id: 'gst_audit', label: '📊 CA Tax & Audit' },
                      { id: 'working_capital', label: '🏦 Working Capital' },
                      { id: 'custom', label: '✍️ Custom Prompt' }
                    ].map(ang => (
                      <button
                        key={ang.id}
                        type="button"
                        onClick={() => setAiAngle(ang.id)}
                        style={{
                          fontSize: 10,
                          padding: '4px 6px',
                          borderRadius: 6,
                          fontWeight: 600,
                          textAlign: 'left',
                          background: aiAngle === ang.id ? '#4f46e5' : '#ffffff',
                          color: aiAngle === ang.id ? '#ffffff' : '#475569',
                          border: aiAngle === ang.id ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                          cursor: 'pointer'
                        }}
                      >
                        {ang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>TONE:</span>
                  {['consultative', 'punchy', 'executive', 'warm'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAiTone(t)}
                      style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 4,
                        textTransform: 'capitalize',
                        background: aiTone === t ? '#1e1b4b' : '#f1f5f9',
                        color: aiTone === t ? '#ffffff' : '#64748b',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Custom Prompt Input if angle === 'custom' */}
                {aiAngle === 'custom' && (
                  <input
                    type="text"
                    placeholder="e.g. Focus on mutual fund safety vs bank FDs under 75 words"
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', fontSize: 11, marginBottom: 10 }}
                  />
                )}

                <button
                  type="button"
                  onClick={() => handleGenerateAi(activeDossierLead)}
                  disabled={isGeneratingAi}
                  className="btn-primary"
                  style={{ width: '100%', padding: '7px', fontSize: 12, justifyContent: 'center', marginBottom: generatedAiOutreach ? 10 : 0 }}
                >
                  <Sparkles size={13} /> {isGeneratingAi ? 'Synthesizing with AI...' : '⚡ Generate Personalized Pitch'}
                </button>

                {/* Generated AI Pitch Box */}
                {generatedAiOutreach && (
                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 12, marginTop: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1e1b4b', marginBottom: 4 }}>
                      SUBJECT: <span style={{ color: '#4f46e5' }}>{generatedAiOutreach.subject}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#334155', background: '#f8fafc', padding: 8, borderRadius: 6, maxHeight: 110, overflowY: 'auto', whiteSpace: 'pre-line', lineHeight: 1.5, marginBottom: 8, border: '1px solid #e2e8f0' }}>
                      {generatedAiOutreach.body_plain}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => applyAiToComposer(generatedAiOutreach)}
                        className="btn-primary"
                        style={{ fontSize: 11, padding: '5px 8px', justifyContent: 'center' }}
                      >
                        ✉️ Apply to Composer →
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedAiOutreach.body_plain);
                          showToast('Copied pitch to clipboard!');
                        }}
                        className="btn-secondary"
                        style={{ fontSize: 11, padding: '5px 8px', justifyContent: 'center' }}
                      >
                        📋 Copy Text
                      </button>
                    </div>
                  </div>
                )}

                {/* 3-Step Follow-Up Sequence Scaffolding */}
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Workflow size={13} color="#4f46e5" />
                      <strong style={{ fontSize: 11, color: '#1e1b4b', textTransform: 'uppercase' }}>
                        Multi-Touch Follow-Up Sequence
                      </strong>
                    </div>
                    {activeDossierLead.sequence_step ? (
                      <span className="sequence-badge">
                        ⚡ Step {activeDossierLead.sequence_step} of 3 Active
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, color: '#64748b' }}>Not Enrolled</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerateAiSequence(activeDossierLead)}
                    disabled={isGeneratingSequence}
                    className="btn-secondary"
                    style={{ width: '100%', fontSize: 11, padding: '6px', justifyContent: 'center', marginBottom: 10 }}
                  >
                    <Sparkles size={12} color="#7c3aed" /> {isGeneratingSequence ? 'Synthesizing...' : `⚡ Load 3-Touch Sequence for ${activeDossierLead.name.split(' ')[0]}`}
                  </button>

                  {activeSequenceData && activeSequenceData.lead_id === activeDossierLead.id && activeSequenceData.steps && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {activeSequenceData.steps.map(s => {
                        const isCurrent = (activeDossierLead.sequence_step || 1) === s.step_number;
                        const isPast = (activeDossierLead.sequence_step || 1) > s.step_number;
                        return (
                          <div
                            key={s.step_number}
                            style={{
                              background: isCurrent ? '#f5f3ff' : isPast ? '#f0fdf4' : '#ffffff',
                              border: isCurrent ? '1.5px solid #7c3aed' : isPast ? '1px solid #86efac' : '1px solid #cbd5e1',
                              borderRadius: 6,
                              padding: '8px 10px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <strong style={{ fontSize: 11, color: '#0f172a' }}>
                                {s.title} ({s.timing})
                              </strong>
                              <span style={{ fontSize: 9, background: isPast ? '#dcfce7' : '#ede9fe', color: isPast ? '#166534' : '#6d28d9', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                                {isPast ? '✓ Sent' : isCurrent ? '● Active' : 'Upcoming'}
                              </span>
                            </div>
                            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 6 }}>
                              <strong>Subject:</strong> {s.subject}
                            </div>
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  handleApplySequenceStep(s);
                                  setActiveDossierLead(null);
                                  setActiveTab('campaign');
                                }}
                                className="btn-secondary"
                                style={{ fontSize: 10, padding: '2px 6px' }}
                              >
                                ✉️ Compose
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdvanceLeadSequence(activeDossierLead, Math.min(3, s.step_number + 1))}
                                className="btn-primary"
                                style={{ fontSize: 10, padding: '2px 8px', background: '#7c3aed' }}
                              >
                                {s.step_number < 3 ? `Advance to Touch ${s.step_number + 1} ➔` : 'Mark Completed ✓'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ==========================================
                  2. ENGAGEMENT TIMELINE & REPLY SIMULATOR
                  ========================================== */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
                    <Flame size={14} color="#f59e0b" /> Engagement & Activity Timeline
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleSimulateReply(activeDossierLead)}
                    className="btn-secondary"
                    style={{ fontSize: 10, padding: '3px 7px', color: '#d97706', borderColor: '#fcd34d', background: '#fffbeb' }}
                    title="Simulate Inbound Lead Response"
                  >
                    <Flame size={11} color="#f59e0b" /> Simulate Reply 🔥
                  </button>
                </div>

                {(!activeDossierLead.engagement_history || activeDossierLead.engagement_history.length === 0) ? (
                  <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', padding: '6px 0' }}>
                    No recorded campaign events yet. Dispatches and interactions will stream here.
                  </div>
                ) : (
                  <div className="timeline-list" style={{ maxHeight: 180, overflowY: 'auto' }}>
                    {activeDossierLead.engagement_history.slice(-10).map((ev, i) => (
                      <div key={i} className="timeline-node">
                        <div className={`timeline-dot ${ev.channel || 'status'}`} />
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{ev.details || ev.action}</span>
                          <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>{ev.timestamp?.split(' ')[1] || ev.timestamp}</span>
                        </div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>
                          Status: <strong style={{ color: '#4f46e5' }}>{ev.status || activeDossierLead.status}</strong> via {ev.channel}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Interactive Touchpoint Logger */}
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>
                    + LOG QUICK ACTIVITY TOUCHPOINT:
                  </label>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                    {[
                      { id: 'call', label: '📞 Call' },
                      { id: 'whatsapp', label: '💬 WhatsApp' },
                      { id: 'email', label: '✉️ Email' },
                      { id: 'meeting', label: '🤝 Meeting' },
                      { id: 'note', label: '📝 Note' }
                    ].map(ch => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setNewTouchpointChannel(ch.id)}
                        style={{
                          fontSize: 10,
                          padding: '3px 6px',
                          borderRadius: 4,
                          background: (newTouchpointChannel || 'call') === ch.id ? '#4f46e5' : '#f1f5f9',
                          color: (newTouchpointChannel || 'call') === ch.id ? '#ffffff' : '#64748b',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      placeholder={`e.g. Call notes, objection, or next step...`}
                      value={newTouchpointText}
                      onChange={(e) => setNewTouchpointText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleQuickTouchpointLog(activeDossierLead);
                      }}
                      style={{ flex: 1, padding: '6px 8px', fontSize: 11, borderRadius: 6 }}
                    />
                    <button
                      type="button"
                      onClick={() => handleQuickTouchpointLog(activeDossierLead)}
                      className="btn-primary"
                      style={{ fontSize: 11, padding: '6px 10px', background: '#4f46e5' }}
                    >
                      Log
                    </button>
                  </div>
                </div>
              </div>

              {/* ==========================================
                  3. FOLLOW-UP TASKS FOR THIS LEAD
                  ========================================== */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
                    <CheckSquare size={14} color="#7c3aed" /> Follow-Up Tasks Linked to Lead
                  </h4>
                  <button
                    onClick={() => {
                      setTaskSelectedLeadId(activeDossierLead.id);
                      setShowTaskDrawer(true);
                    }}
                    style={{ background: 'transparent', color: '#7c3aed', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >
                    View All ({tasks.filter(t => t.lead_id === activeDossierLead.id).length})
                  </button>
                </div>

                {/* Quick Add Task Input */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <select
                    value={newTaskAction}
                    onChange={(e) => setNewTaskAction(e.target.value)}
                    style={{ padding: '5px 8px', fontSize: 11, borderRadius: 6, borderColor: '#cbd5e1' }}
                  >
                    <option value="call">📞 Call</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="proposal">📄 Proposal</option>
                    <option value="meeting">🤝 Meeting</option>
                  </select>
                  <input
                    type="text"
                    placeholder={`e.g. Call ${activeDossierLead.name.split(' ')[0]} back`}
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    style={{ flex: 1, padding: '5px 8px', fontSize: 11, borderRadius: 6 }}
                  />
                  <button
                    type="button"
                    onClick={() => handleCreateTask(activeDossierLead)}
                    className="btn-primary"
                    style={{ fontSize: 11, padding: '5px 10px', background: '#7c3aed' }}
                  >
                    + Add
                  </button>
                </div>

                {/* Quick Date Presets */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {[
                    { label: 'Today +3h', offset: 3 * 3600 * 1000 },
                    { label: 'Tomorrow', offset: 24 * 3600 * 1000 },
                    { label: 'In 3 Days', offset: 3 * 24 * 3600 * 1000 },
                    { label: 'Next Week', offset: 7 * 24 * 3600 * 1000 }
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setNewTaskDueDate(new Date(Date.now() + p.offset).toISOString().slice(0, 16))}
                      style={{ fontSize: 10, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4, padding: '2px 5px', color: '#475569' }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* List of Tasks for this lead */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {tasks.filter(t => t.lead_id === activeDossierLead.id).slice(0, 3).map(task => (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: task.completed ? '#f1f5f9' : '#ffffff', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: 6 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#94a3b8' : '#0f172a', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(task.id)}
                          style={{ accentColor: '#7c3aed' }}
                        />
                        <span>{task.title}</span>
                      </label>
                      <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        {task.due_date?.slice(5, 16).replace('T', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CRM Stage Picker */}
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>
                  CRM PIPELINE STAGE:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                  {['New', 'Contacted', 'Interested', 'Follow-up', 'Converted', 'Do Not Contact'].map(stage => {
                    const isCurrent = (activeDossierLead.status || 'New') === stage;
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => handleStatusChange(activeDossierLead, stage)}
                        style={{
                          padding: '5px 3px',
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          background: isCurrent ? '#4f46e5' : '#ffffff',
                          color: isCurrent ? '#ffffff' : '#475569',
                          border: isCurrent ? '1px solid #4f46e5' : '1px solid #cbd5e1'
                        }}
                      >
                        {stage}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CALENDAR SCHEDULING INTEGRATION */}
              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: 14 }}>
                <h4 style={{ fontSize: 12, fontWeight: 800, color: '#6d28d9', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
                  <Calendar size={14} color="#7c3aed" /> Schedule Follow-up Call & Calendar Sync
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 2 }}>MEETING TITLE</label>
                    <input
                      type="text"
                      defaultValue={`Follow-up with ${activeDossierLead.name}`}
                      onChange={(e) => setSchedTitle(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', fontSize: 12 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 2 }}>DATE & TIME</label>
                    <input
                      type="datetime-local"
                      defaultValue={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
                      onChange={(e) => setSchedDatetime(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', fontSize: 12 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 2 }}>AGENDA / NOTES</label>
                    <input
                      type="text"
                      placeholder="e.g. Discuss Liquid Fund cash deployment"
                      onChange={(e) => setSchedAgenda(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', fontSize: 12 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <a
                    href={makeGoogleCalendarUrl(
                      schedTitle || `Follow-up with ${activeDossierLead.name}`,
                      schedDatetime || new Date(Date.now() + 86400000).toISOString().slice(0, 16),
                      schedAgenda || 'Treasury Consultation',
                      activeDossierLead.name
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ fontSize: 11, padding: '6px', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    📅 Google Calendar
                  </a>

                  <button
                    onClick={() => downloadIcsFile(
                      schedTitle || `Follow-up with ${activeDossierLead.name}`,
                      schedDatetime || new Date(Date.now() + 86400000).toISOString().slice(0, 16),
                      schedAgenda || 'Treasury Consultation',
                      activeDossierLead.name
                    )}
                    className="btn-secondary"
                    style={{ fontSize: 11, padding: '6px', justifyContent: 'center' }}
                  >
                    📥 Download .ics
                  </button>
                </div>

                <button
                  onClick={handleSaveCalendarEvent}
                  className="btn-primary"
                  style={{ width: '100%', marginTop: 8, padding: '7px', fontSize: 12, justifyContent: 'center', background: '#7c3aed' }}
                >
                  <CalendarPlus size={13} /> Save Appointment in CRM Schedule
                </button>
              </div>

              {/* Business Intelligence Details */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>
                  Contact & Intelligence
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Email:</span>
                    <strong style={{ color: '#0f172a' }}>{activeDossierLead.email || 'None'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Phone:</span>
                    <strong style={{ color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{activeDossierLead.phone || 'None'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>WhatsApp:</span>
                    <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>
                      {activeDossierLead.wa_phone ? `+${activeDossierLead.wa_phone}` : 'None'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Rating:</span>
                    <strong style={{ color: '#d97706' }}>
                      {activeDossierLead.rating ? `★ ${activeDossierLead.rating} (${activeDossierLead.reviews || 0} reviews)` : 'Not rated'}
                    </strong>
                  </div>

                  {activeDossierLead.source_file && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Source Sheet:</span>
                      <strong style={{ color: '#4f46e5' }}>{activeDossierLead.source_file}</strong>
                    </div>
                  )}

                  {activeDossierLead.website && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Website:</span>
                      <a href={activeDossierLead.website} target="_blank" rel="noreferrer" style={{ color: '#4f46e5', fontWeight: 600 }}>
                        Visit Link ↗
                      </a>
                    </div>
                  )}

                  {activeDossierLead.maps_url && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Google Maps:</span>
                      <a href={activeDossierLead.maps_url} target="_blank" rel="noreferrer" style={{ color: '#4f46e5', fontWeight: 600 }}>
                        View Location ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Private CRM Notes */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
                    PRIVATE LEAD MEMO / NOTES:
                  </label>
                  <span style={{ fontSize: 9, color: '#b45309' }}>Auto-saved</span>
                </div>
                <textarea
                  rows={3}
                  value={leadNotes[activeDossierLead.id] || ''}
                  onChange={(e) => saveLeadNote(activeDossierLead.id, e.target.value)}
                  placeholder="e.g. Spoke with manager, interested in 50L treasury deployment. Call back next Tuesday."
                  style={{ width: '100%', background: '#ffffff', padding: '6px 8px', fontSize: 11, border: '1px solid #fcd34d', borderRadius: 6 }}
                />
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          GLOBAL FOLLOW-UP TASK & REMINDERS DRAWER
         ========================================================================= */}
      {showTaskDrawer && (
        <div className="task-drawer-overlay" onClick={() => setShowTaskDrawer(false)}>
          <div className="task-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ background: '#4f46e5', color: '#fff', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckSquare size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#0f172a' }}>Follow-Up Tasks & Reminders</h3>
                  <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: 10, background: '#e0e7ff', color: '#4338ca', padding: '1px 6px', borderRadius: 6, fontWeight: 700 }}>
                      {tasks.filter(t => !t.completed).length} Pending
                    </span>
                    {taskSummary.overdue > 0 && (
                      <span style={{ fontSize: 10, background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: 6, fontWeight: 700 }}>
                        {taskSummary.overdue} Overdue
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowTaskDrawer(false)}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '50%', width: 28, height: 28, color: '#64748b', fontSize: 14, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', padding: '8px 16px', background: '#ffffff', borderBottom: '1px solid #f1f5f9', gap: 4 }}>
              {[
                { id: 'all', label: `All (${tasks.length})` },
                { id: 'pending', label: `Pending (${tasks.filter(t => !t.completed).length})` },
                { id: 'today', label: 'Due Today' },
                { id: 'completed', label: `Completed (${tasks.filter(t => t.completed).length})` }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setTaskFilter(f.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    background: taskFilter === f.id ? '#4f46e5' : 'transparent',
                    color: taskFilter === f.id ? '#ffffff' : '#64748b',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Quick Task Creation Box */}
            <div style={{ padding: '14px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <strong style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                + Add Quick Follow-Up Task
              </strong>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Linked Lead Selector */}
                <select
                  value={taskSelectedLeadId}
                  onChange={(e) => setTaskSelectedLeadId(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: 12, borderRadius: 6, borderColor: '#cbd5e1' }}
                >
                  <option value="">Link to Lead (Optional / General)...</option>
                  {leads.slice(0, 80).map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.area || l.city})
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: 6 }}>
                  <select
                    value={newTaskAction}
                    onChange={(e) => setNewTaskAction(e.target.value)}
                    style={{ padding: '6px 8px', fontSize: 12, borderRadius: 6, borderColor: '#cbd5e1' }}
                  >
                    <option value="call">📞 Phone Call</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="proposal">📄 Proposal</option>
                    <option value="meeting">🤝 Meeting</option>
                    <option value="report">📊 Report</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Task details (e.g. Discuss Liquid Fund cash deployment)"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 6 }}
                  />
                </div>

                {/* Quick Date Presets */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[
                      { label: 'Today +3h', offset: 3 * 3600 * 1000 },
                      { label: 'Tomorrow', offset: 24 * 3600 * 1000 },
                      { label: 'In 3 Days', offset: 3 * 24 * 3600 * 1000 },
                      { label: 'Next Week', offset: 7 * 24 * 3600 * 1000 }
                    ].map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setNewTaskDueDate(new Date(Date.now() + p.offset).toISOString().slice(0, 16))}
                        style={{ fontSize: 10, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4, padding: '3px 6px', color: '#475569' }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleCreateTask()}
                    className="btn-primary"
                    style={{ fontSize: 11, padding: '5px 12px', background: '#7c3aed' }}
                  >
                    + Add Task
                  </button>
                </div>
              </div>
            </div>

            {/* Task Cards List */}
            <div style={{ padding: '16px 18px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks
                .filter(t => {
                  if (taskFilter === 'pending') return !t.completed;
                  if (taskFilter === 'completed') return t.completed;
                  if (taskFilter === 'today') {
                    const todayStr = new Date().toISOString().slice(0, 10);
                    return t.due_date && t.due_date.startsWith(todayStr);
                  }
                  return true;
                })
                .map(t => {
                  const nowStr = new Date().toISOString().slice(0, 16);
                  const isOverdue = !t.completed && t.due_date && t.due_date < nowStr;
                  const isToday = t.due_date && t.due_date.startsWith(new Date().toISOString().slice(0, 10));

                  return (
                    <div
                      key={t.id}
                      className={`task-card ${t.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${isToday && !t.completed ? 'due-today' : ''}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => handleToggleTask(t.id)}
                            style={{ accentColor: '#7c3aed', width: 16, height: 16, cursor: 'pointer' }}
                          />
                          <strong style={{ fontSize: 13, textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? '#94a3b8' : '#0f172a' }}>
                            {t.title}
                          </strong>
                        </div>

                        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, fontWeight: 700, background: isOverdue ? '#fee2e2' : '#f1f5f9', color: isOverdue ? '#b91c1c' : '#475569' }}>
                          {isOverdue ? 'OVERDUE' : (t.action_type || 'task').toUpperCase()}
                        </span>
                      </div>

                      {/* Lead Details link */}
                      {t.lead_name && (
                        <div style={{ fontSize: 11, color: '#4f46e5', fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span
                            onClick={() => {
                              const found = leads.find(l => l.id === t.lead_id || l.name === t.lead_name);
                              if (found) {
                                setActiveDossierLead(found);
                                setShowTaskDrawer(false);
                              }
                            }}
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            🔗 {t.lead_name} {t.lead_city ? `(${t.lead_city})` : ''}
                          </span>
                        </div>
                      )}

                      {/* Due date & Quick Sync */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid #f1f5f9', fontSize: 11, color: '#64748b' }}>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>
                          ⏰ Due: {t.due_date?.replace('T', ' ')}
                        </span>

                        <div style={{ display: 'flex', gap: 6 }}>
                          <a
                            href={makeGoogleCalendarUrl(t.title, t.due_date, t.notes || `CRM Task: ${t.title}`, t.lead_name || '')}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary"
                            style={{ fontSize: 10, padding: '2px 5px', textDecoration: 'none' }}
                            title="Add to Google Calendar"
                          >
                            📅 Cal
                          </a>

                          <button
                            onClick={() => downloadIcsFile(t.title, t.due_date, t.notes || `CRM Task: ${t.title}`, t.lead_name || '')}
                            className="btn-secondary"
                            style={{ fontSize: 10, padding: '2px 5px' }}
                            title="Download .ics file"
                          >
                            📥 .ics
                          </button>

                          <button
                            onClick={() => handleDeleteTask(t.id)}
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
                            title="Delete Task"
                          >
                            <Trash2 size={13} color="#ef4444" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {tasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <CheckSquare size={32} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>No follow-up tasks scheduled yet.</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 11 }}>Use the form above or the Lead Dossier to set task reminders.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          AI SPARK ICEBREAKER GENERATOR MODAL
         ========================================================================= */}
      {showAiSparkModal && aiSparkLead && (
        <div className="ai-spark-modal-backdrop" onClick={() => setShowAiSparkModal(false)}>
          <div className="ai-spark-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#7c3aed', color: '#fff', width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)' }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#4c1d95', margin: 0 }}>
                      AI Contextual Icebreaker Generator
                    </h3>
                    <span style={{ fontSize: 10, background: '#7c3aed', color: '#fff', padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>
                      GPT-4 Synthesized
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6d28d9', marginTop: 2 }}>
                    Tailored cold outreach hooks synthesized for <strong>{aiSparkLead.name}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAiSparkModal(false)}
                style={{ background: '#ffffff', border: '1px solid #c4b5fd', borderRadius: '50%', width: 28, height: 28, color: '#6d28d9', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Target Lead Context Pill Bar */}
            <div style={{ padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 11 }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Target Profile:</span>
              <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                🏢 {aiSparkLead.category || 'Commercial Enterprise'}
              </span>
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                📍 {aiSparkLead.city || 'Delhi NCR'} {aiSparkLead.area ? `(${aiSparkLead.area})` : ''}
              </span>
              {aiSparkLead.rating && (
                <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                  ★ {aiSparkLead.rating} ({aiSparkLead.reviews || 0} reviews)
                </span>
              )}
              {aiSparkLead.has_email && (
                <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                  ✉️ {aiSparkLead.email}
                </span>
              )}
            </div>

            {/* Modal Body: Loading State or Icebreaker Cards */}
            <div style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {loadingAiSpark ? (
                <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <Sparkles size={36} color="#7c3aed" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 14px auto' }} />
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                    Generating Contextual Outreach Angles...
                  </h4>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    Analyzing {aiSparkLead.name}'s industry vertical, territory ({aiSparkLead.area}), and market reputation score.
                  </p>
                </div>
              ) : aiIcebreakerData?.icebreakers ? (
                aiIcebreakerData.icebreakers.map((item) => (
                  <div key={item.id} className="icebreaker-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>
                            {item.badge}
                          </span>
                        </div>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0 0' }}>
                          {item.tagline}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => handleCopyIcebreaker(item)}
                          className="btn-secondary"
                          style={{ fontSize: 11, padding: '4px 9px', display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Copy outreach text to clipboard"
                        >
                          {copiedIcebreakerId === item.id ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                          <span>{copiedIcebreakerId === item.id ? 'Copied!' : 'Copy'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyIcebreakerToComposer(item)}
                          className="btn-primary"
                          style={{ fontSize: 11, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, background: '#6d28d9' }}
                          title="Open Campaign Email Studio with this hook preloaded"
                        >
                          <Send size={12} /> Send Email
                        </button>

                        {aiSparkLead.wa_phone && (
                          <a
                            href={`https://wa.me/${aiSparkLead.wa_phone}?text=${encodeURIComponent(item.text)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary"
                            style={{ fontSize: 11, padding: '4px 9px', background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                            title="Directly launch WhatsApp with this message"
                          >
                            💬 WA
                          </a>
                        )}
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 12, lineHeight: 1.6, color: '#1e293b' }}>
                      {item.suggested_subject && (
                        <div style={{ fontSize: 11, color: '#6d28d9', fontWeight: 700, marginBottom: 4, borderBottom: '1px dashed #e2e8f0', paddingBottom: 4 }}>
                          Suggested Subject: <span style={{ color: '#0f172a', fontWeight: 600 }}>{item.suggested_subject}</span>
                        </div>
                      )}
                      <div>{item.text}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <p>Could not generate icebreakers. Please click Regenerate.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>
                Tip: Copying or composing will link this outreach directly to <strong>{aiSparkLead.name}</strong>.
              </span>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleOpenAiSpark(aiSparkLead)}
                  disabled={loadingAiSpark}
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <RefreshCw size={12} className={loadingAiSpark ? 'animate-spin' : ''} />
                  <span>Regenerate Hooks</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAiSparkModal(false)}
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: '5px 12px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
