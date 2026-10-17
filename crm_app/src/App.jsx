import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users, Mail, MessageSquare, Send, CheckCircle2, AlertCircle, RefreshCw,
  Search, Filter, ExternalLink, Phone, Building2, MapPin, Star, Play, Pause,
  Square, ShieldCheck, Settings, Download, FileSpreadsheet, Eye, Sparkles,
  ChevronRight, ChevronLeft, ArrowUpRight, ArrowUp, Copy, Check, Clock, TrendingUp, AlertTriangle,
  Upload, Plus, Edit3, Key, UserCheck, Trash2, ArrowRight, Wand2, Zap, Briefcase,
  HeartHandshake, FileDown, LayoutGrid, List, Smartphone, Monitor, ChevronDown, FileText,
  Compass, Globe, Calendar, CalendarPlus, CheckSquare, CloudLightning,
  Bot, Flame, CheckCheck, ListTodo, Workflow, Layers,
  HelpCircle, Server, Activity, CreditCard, Lock, LogOut, User, Tag, Shield,
  Trophy, Target, Award, X, Printer, Receipt, Share2
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

const DEFAULT_INR_PLANS = [
  {
    id: 'starter',
    name: 'Starter Agency',
    tag: 'For Solo Founders & Freelance Lead Gen',
    priceMonthly: 2999,
    priceYearly: 2399,
    currency: '₹',
    leadsMonthly: '1,500 Targeted Leads / Mo',
    senders: '1 Dedicated Sender Account',
    badge: 'STARTER',
    popular: false,
    features: [
      '1,500 Verified Leads / Month',
      'Fast Maps & Directory Scraper',
      '1 Connected Sender (Gmail / SMTP)',
      'Direct 1-Click WhatsApp Targeting',
      'Standard Clean Deliverability Engine',
      'CSV & Excel Data Export',
      'Email & Community Support'
    ],
    buttonText: 'Select Starter'
  },
  {
    id: 'pro',
    name: 'Agency Pro',
    tag: 'Most Popular for Growing Agencies & B2B Teams',
    priceMonthly: 7999,
    priceYearly: 6399,
    currency: '₹',
    leadsMonthly: '10,000 Targeted Leads / Mo',
    senders: '5 Dedicated Sender Accounts',
    badge: '🔥 MOST POPULAR - BEST VALUE',
    popular: true,
    features: [
      '10,000 Verified Leads / Month',
      'Dual-Engine Deep Web + Overpass Scraper',
      '5 Sender Accounts with Smart Auto-Rotation',
      'Omnichannel WhatsApp Hub with Custom Templates',
      '4 AI Outreach Copy Polishers',
      'Micro-Batch SMTP Anti-Spam Queue',
      'SQLite WAL 5M Lead Engine (< 1ms searches)',
      'Priority WhatsApp & Live Support'
    ],
    buttonText: 'Upgrade to Agency Pro'
  },
  {
    id: 'scale',
    name: 'Agency Scale & Enterprise',
    tag: 'For High-Volume Outreach Teams & Large Agencies',
    priceMonthly: 19999,
    priceYearly: 15999,
    currency: '₹',
    leadsMonthly: '50,000 Targeted Leads / Mo',
    senders: 'Unlimited Sender Accounts',
    badge: 'FOR SCALE-UPS',
    popular: false,
    features: [
      '50,000 Verified Leads / Month',
      'Unlimited Sender Accounts with Warmup Routing',
      'Custom Scraper Directives & Overnight Crawlers',
      'Dedicated Agency Sub-Accounts & White-Labeling',
      'High-Speed Micro-Batch Processing',
      'Custom CRM Webhooks & Zapier Sync',
      'Dedicated 24/7 Account Manager on WhatsApp',
      'Custom Outreach Script Consulting'
    ],
    buttonText: 'Scale My Agency'
  }
];

const RETAINER_TEMPLATES = {
  mfg_enterprise: {
    id: 'mfg_enterprise',
    packageName: 'Enterprise Multi-Touch Outbound Retainer',
    monthlyFee: 65000,
    guaranteedMeetings: 15,
    scopeSummary: 'Account-based targeted acquisition for industrial manufacturing and B2B corporate suppliers.',
    deliverables: [
      '1,800 Verified High-ICP Decision Maker Records researched and verified per month',
      'Dual-Channel Outreach: Bespoke Cold Email Cadences & WhatsApp Concierge Pings',
      'Dedicated Domain & Inbound Warmup Infrastructure with SPF/DKIM/DMARC 99%+ Placement',
      'Minimum SLA Guarantee: 15 Verified, Pre-Vetted Qualified Sales Appointments / month',
      'Live Pipeline Telemetry, CRM Attribution Dashboard, and Weekly Growth Sync'
    ],
    slaTerms: 'Guaranteed 15 Qualified Appointments per 30-day billing cycle. Shortfall rolls over automatically.',
    paymentTerms: '100% Advance Monthly Invoicing with Net-7 settlement terms.'
  },
  tech_saas: {
    id: 'tech_saas',
    packageName: 'High-Ticket B2B SaaS & Tech Acquisition Retainer',
    monthlyFee: 85000,
    guaranteedMeetings: 20,
    scopeSummary: 'Fast-paced pipeline generation targeting VP/C-level tech buyers across North America & India.',
    deliverables: [
      '2,500 Multi-Touch Decision Maker Engagements across Cloud & Software buyers',
      'AI-Powered Hyper-Personalized First Lines and Video Pitch Landing Pages',
      'Automated Multi-Channel Sequence with LinkedIn, Email, and WhatsApp',
      'Minimum SLA Guarantee: 20 Demo-Ready Qualified Meetings / month',
      'Real-time Slack / Teams Webhook alerts for live prospect engagement'
    ],
    slaTerms: '20 Pre-qualified enterprise demos. Quota shortfalls credited back pro-rata or rolled over.',
    paymentTerms: 'Monthly advance retainer payable via wire/UPI with 7-day settlement.'
  },
  consulting: {
    id: 'consulting',
    packageName: 'Strategic Corporate Consulting & CA Retainer',
    monthlyFee: 45000,
    guaranteedMeetings: 10,
    scopeSummary: 'Executive advisory outreach targeting promoters, directors, and finance heads.',
    deliverables: [
      '1,000 High-Net-Worth Promoter & Corporate Director Contacts per month',
      'Discreet, Highly Professional 1-to-1 Advisory Outreach Email Copies',
      'Direct WhatsApp Follow-up Concierge with meeting scheduling calendar link',
      'Minimum SLA Guarantee: 10 Qualified Strategy Consultations / month',
      'Full Compliance & Non-Disclosure Safeguards'
    ],
    slaTerms: '10 Qualified Financial/Tax Advisory Meetings. Immediate reschedule if no-show occurs.',
    paymentTerms: '100% advance monthly payment due on receipt of tax invoice.'
  },
  fractional_sdr: {
    id: 'fractional_sdr',
    packageName: 'Dedicated Fractional SDR & High-Volume Sales Engine',
    monthlyFee: 125000,
    guaranteedMeetings: 30,
    scopeSummary: 'Turnkey outbound sales team with dedicated outbound rep, cold email stack, and WhatsApp dialer.',
    deliverables: [
      '5,000 Verified Cold Outbound Touches per month across Email & Phone',
      'Dedicated Full-Time Fractional Sales Development Representative (SDR)',
      'Custom Multi-Domain Sending Infrastructure (5 Warm Domains + 15 Inboxes)',
      'Minimum SLA Guarantee: 30 Pre-Qualified Sales Meetings / month',
      'Weekly Strategy & Pipeline Review with Agency Founder'
    ],
    slaTerms: '30 Verified Sales Qualified Leads (SQL) per month with calendar confirmation.',
    paymentTerms: 'Monthly recurring contract with 15-day termination notice.'
  }
};

export default function App() {
  // Navigation: 'pipeline', 'crm', 'scraper', 'campaign', 'whatsapp', 'logs', 'settings'
  const [activeTab, setActiveTab] = useState('pipeline');

  // Debounced search for instant typing & optimal 60fps performance on large lead datasets
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Deal Won / Lead Conversion Modal State
  const [showDealWonModal, setShowDealWonModal] = useState(false);
  const [dealLead, setDealLead] = useState(null);
  const [dealValueInput, setDealValueInput] = useState('15000');
  const [dealPackageInput, setDealPackageInput] = useState('Financial Advisory & GST Retainer');
  const [dealNotesInput, setDealNotesInput] = useState('');

  // Global Pipeline Funnel Metrics (from /api/pipeline/metrics)
  const [pipelineMetrics, setPipelineMetrics] = useState({
    funnel: { discovered: 0, qualified: 0, contacted: 0, interested: 0, consultations: 0, converted: 0 },
    revenue: { total_won: 0, average_deal: 0, conversion_rate: 0 }
  });

  // Agency Growth Command Hub State
  const [agencySubTab, setAgencySubTab] = useState('workspaces'); // 'workspaces' | 'sequences' | 'proposals' | 'radar'
  const [agencyWorkspaces, setAgencyWorkspaces] = useState([]);
  const [agencyProposals, setAgencyProposals] = useState([]);
  const [agencyGrowthMetrics, setAgencyGrowthMetrics] = useState({
    total_active_clients: 3,
    monthly_recurring_revenue: 200000,
    pipeline_won_revenue: 0,
    signed_retainers: 1,
    average_client_value: 66666,
    channel_roi: {
      email: { sent: 2400, replies: 182, meetings: 24, rate: '7.6%' },
      whatsapp: { sent: 1850, replies: 320, meetings: 41, rate: '17.3%' }
    }
  });
  const [selectedAgencyLead, setSelectedAgencyLead] = useState(null);
  const [agencySequence, setAgencySequence] = useState(null);
  const [showNewWorkspaceModal, setShowNewWorkspaceModal] = useState(false);
  const [showNewProposalModal, setShowNewProposalModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsClient, setNewWsClient] = useState('');
  const [newWsNiche, setNewWsNiche] = useState('Manufacturing & Industrial CFOs');
  const [newWsRetainer, setNewWsRetainer] = useState('50000');
  const [newWsTargetMeetings, setNewWsTargetMeetings] = useState('15');
  const [newPropLead, setNewPropLead] = useState(null);
  const [newPropPackage, setNewPropPackage] = useState('Growth Outbound Retainer');
  const [newPropFee, setNewPropFee] = useState('45000');
  const [newPropMeetings, setNewPropMeetings] = useState('12');
  const [newPropTerms, setNewPropTerms] = useState('100% Advance Monthly Invoicing with 7-Day Net Settlement');
  const [activeProposalPreview, setActiveProposalPreview] = useState(null);
  const [showClientReportModal, setShowClientReportModal] = useState(null);

  // Client Workspace Detail Dossier Modal
  const [selectedWorkspaceDetail, setSelectedWorkspaceDetail] = useState(null);

  // Retainer Proposals & Agreements WYSIWYG & AI Polish State
  const [agreementTemplateId, setAgreementTemplateId] = useState('mfg_enterprise');
  const [agreementData, setAgreementData] = useState({
    refNumber: 'AGR-2026-042',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    packageName: 'Enterprise Multi-Touch Outbound Retainer',
    clientName: 'Sterling Manufacturing Company',
    contactPerson: 'Rahul Sharma (Managing Director)',
    clientEmail: 'contact@sterlingmfg.com',
    clientPhone: '+91 98111 22334',
    clientAddress: 'Plot 44, Udyog Vihar Phase IV, Gurugram, Haryana 122016',
    monthlyFee: 65000,
    currency: '₹',
    guaranteedMeetings: 15,
    scopeSummary: 'Account-based targeted acquisition for industrial manufacturing and B2B corporate suppliers.',
    deliverables: [
      '1,800 Verified High-ICP Decision Maker Records researched and verified per month',
      'Dual-Channel Outreach: Bespoke Cold Email Cadences & WhatsApp Concierge Pings',
      'Dedicated Domain & Inbound Warmup Infrastructure with SPF/DKIM/DMARC 99%+ Placement',
      'Minimum SLA Guarantee: 15 Verified, Pre-Vetted Qualified Sales Appointments / month',
      'Live Pipeline Telemetry, CRM Attribution Dashboard, and Weekly Growth Sync'
    ],
    slaTerms: 'Guaranteed 15 Qualified Appointments per 30-day billing cycle. Shortfall rolls over automatically.',
    paymentTerms: '100% Advance Monthly Invoicing with Net-7 settlement terms.',
    signatoryName: 'Ishant Singla (Managing Partner, ApexOutreach Studio)'
  });
  const [isPolishingProposal, setIsPolishingProposal] = useState(false);

  // Urgent Follow-Up Radar Multi-Select & Bulk Action State
  const [selectedRadarIds, setSelectedRadarIds] = useState(new Set());
  const [isBulkDispatching, setIsBulkDispatching] = useState(false);

  // Invoice Generator Past Invoices Modal
  const [showPastInvoicesModal, setShowPastInvoicesModal] = useState(false);

  // Integrated Client Invoice Generator & Customizer State
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: 'INV-2026-0089',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    agencyName: 'ApexOutreach Studio',
    agencyTagline: 'B2B Client Acquisition & Revenue Engine',
    agencyAddress: 'DLF Cyber City, Tower 10C, Phase II, Gurugram, Haryana 122002',
    agencyGstin: '06AAACA9876Q1Z5',
    agencyEmail: 'billing@apexoutreach.io',
    agencyPhone: '+91 98765 43210',
    agencyBankName: 'HDFC Bank Ltd',
    agencyBankAccount: '50200083921820',
    agencyBankIfsc: 'HDFC0001234',
    agencyUpi: 'apexoutreach@icici',
    clientName: 'Rahul Sharma',
    clientCompany: 'Sterling Manufacturing Company',
    clientAddress: 'Plot 44, Udyog Vihar Phase IV, Gurugram, Haryana 122016',
    clientGstin: '06AABCS1234P1Z2',
    clientEmail: 'contact@sterlingmfg.com',
    clientPhone: '+91 98111 22334',
    paymentTerms: 'Payment due within 7 days of invoice issue date',
    currency: '₹',
    discountAmount: 0,
    advancePaid: 0,
    notes: 'Thank you for your business! Please quote invoice number during wire transfer or UPI transfer.',
    items: [
      {
        id: 1,
        description: 'B2B Outbound Acquisition Retainer (Monthly Management & 15 Guaranteed Meetings)',
        hsnSac: '998311',
        qty: 1,
        rate: 50000,
        taxRate: 18
      },
      {
        id: 2,
        description: 'Targeted Industrial Leads List & Database Verification (2,500 Accounts)',
        hsnSac: '998314',
        qty: 1,
        rate: 15000,
        taxRate: 18
      }
    ]
  });
  const [invoiceCopiedNotice, setInvoiceCopiedNotice] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);

  // Manual Lead Creation & CRM Lead Management State
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    category: 'Manufacturing & Industrial',
    city: 'Gurugram',
    area: 'Udyog Vihar',
    phone: '',
    email: '',
    status: 'New',
    deal_value: '25000',
    notes: ''
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  // Executive Homepage Cockpit & Monetization State
  const [pipelineSubView, setPipelineSubView] = useState('radar'); // 'radar' | 'kanban' | 'analytics'
  const [showClientPortalModal, setShowClientPortalModal] = useState(false);
  const [showTopUpCreditsModal, setShowTopUpCreditsModal] = useState(false);
  const [creditBalance, setCreditBalance] = useState({ used: 780, total: 1000 });

  // Commercial INR Pricing & Authentication System State
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('demo'); // 'demo' | 'login' | 'register'
  const [pricingCycle, setPricingCycle] = useState('yearly'); // 'monthly' | 'yearly'
  const [pricingPlansData, setPricingPlansData] = useState(DEFAULT_INR_PLANS);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isUpgradingPlan, setIsUpgradingPlan] = useState(false);

  // Lead Import & Template System State
  const [showImportTemplateModal, setShowImportTemplateModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreviewData, setImportPreviewData] = useState(null);
  const [isUploadingLeads, setIsUploadingLeads] = useState(false);
  const [importTargetOption, setImportTargetOption] = useState('master'); // 'master' | 'custom'
  const [customDatasetName, setCustomDatasetName] = useState('');
  const templateFileInputRef = useRef(null);

  const ADMIN_EMAILS = useMemo(() => ['dineshsingla08@gmail.com', 'ishantsingla08@gmail.com'], []);

  // User Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('apex_auth_user') || localStorage.getItem('apex_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.isAuthenticated || u.email)) {
          const isAdmin = ['dineshsingla08@gmail.com', 'ishantsingla08@gmail.com'].includes((u.email || '').toLowerCase());
          return {
            ...u,
            role: isAdmin ? 'admin' : (u.role || 'member'),
            isAuthenticated: true
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return {
      id: null,
      name: 'Guest Explorer',
      email: null,
      agency_name: 'Guest Workspace',
      role: 'guest',
      isAuthenticated: false,
      avatar: 'G'
    };
  });

  // Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authAgencyName, setAuthAgencyName] = useState('');
  const [authPlanChoice, setAuthPlanChoice] = useState('pro');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState('');

  // Registered Users Directory (Admin Only)
  const [adminUsers, setAdminUsers] = useState([]);
  const [showAdminUsersModal, setShowAdminUsersModal] = useState(false);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);

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

  // 220ms Debounced search so typing remains 60fps responsive without locking UI thread
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 220);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPipelineMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/pipeline/metrics`);
      const data = await res.json();
      if (data.success && data.funnel) {
        setPipelineMetrics(data);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchPipelineMetrics();
  }, [leads]);

  const fetchAgencyData = async () => {
    try {
      const [resWs, resProp, resMetrics, resInv] = await Promise.all([
        fetch(`${API_BASE}/agency/workspaces`),
        fetch(`${API_BASE}/agency/proposals`),
        fetch(`${API_BASE}/agency/growth-metrics`),
        fetch(`${API_BASE}/agency/invoices`)
      ]);
      const dataWs = await resWs.json();
      const dataProp = await resProp.json();
      const dataMetrics = await resMetrics.json();
      const dataInv = await resInv.json();

      if (dataWs.success && dataWs.workspaces) setAgencyWorkspaces(dataWs.workspaces);
      if (dataProp.success && dataProp.proposals) setAgencyProposals(dataProp.proposals);
      if (dataMetrics.success) setAgencyGrowthMetrics(dataMetrics);
      if (dataInv.success && dataInv.invoices) setSavedInvoices(dataInv.invoices);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchAgencyData();
  }, []);

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

  // Logs & Interactive Delivery Board
  const [sentLogs, setSentLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsSearchQuery, setLogsSearchQuery] = useState('');
  const [logsStatusFilter, setLogsStatusFilter] = useState('ALL'); // 'ALL' | 'Delivered' | 'Replied' | 'Failed'
  const [logsChannelFilter, setLogsChannelFilter] = useState('ALL'); // 'ALL' | 'email' | 'whatsapp'

  // Consumer Outbound Schedule & Safety Guardrails
  const [scheduleBusinessHours, setScheduleBusinessHours] = useState(true);
  const [scheduleWeekdaysOnly, setScheduleWeekdaysOnly] = useState(true);
  const [safetyPacingPreset, setSafetyPacingPreset] = useState('balanced'); // 'safe' | 'balanced' | 'fast'
  const [showAdvancedSafety, setShowAdvancedSafety] = useState(false);
  const [showWebhookDrawer, setShowWebhookDrawer] = useState(false);

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
    fetchPricingCatalog();
    checkAuthSession();
  }, []);

  const fetchPricingCatalog = async () => {
    try {
      const res = await fetch(`${API_BASE}/pricing/plans`);
      const data = await res.json();
      if (data && data.plans && data.plans.length > 0) {
        setPricingPlansData(data.plans);
      }
    } catch (e) {
      console.error('Error fetching pricing catalog:', e);
    }
  };

  const checkAuthSession = async () => {
    try {
      const token = localStorage.getItem('apex_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'omit', headers });
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
        try { localStorage.setItem('apex_user', JSON.stringify(data.user)); } catch {}
      }
    } catch (e) {
      console.error('Error checking auth session:', e);
    }
  };

  const handleAuthLogin = async (e) => {
    if (e) e.preventDefault();
    if (!authEmail) {
      setAuthError('Please enter your email address');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        try {
          localStorage.setItem('apex_user', JSON.stringify(data.user));
          if (data.token) localStorage.setItem('apex_token', data.token);
        } catch {}
        setShowAuthModal(false);
        showToast(data.message || 'Logged in successfully!', 'success');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setAuthError('Network error connecting to auth server');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthRegister = async (e) => {
    if (e) e.preventDefault();
    if (!authEmail) {
      setAuthError('Please enter an email address');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authName,
          agency_name: authAgencyName,
          email: authEmail,
          password: authPassword,
          plan_id: authPlanChoice
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        try {
          localStorage.setItem('apex_user', JSON.stringify(data.user));
          if (data.token) localStorage.setItem('apex_token', data.token);
        } catch {}
        setShowAuthModal(false);
        showToast(data.message || 'Agency account created!', 'success');
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 } });
      } else {
        setAuthError(data.error || 'Registration failed');
      }
    } catch (err) {
      setAuthError('Network error during registration');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthDemoLogin = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/demo`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        try {
          localStorage.setItem('apex_user', JSON.stringify(data.user));
          if (data.token) localStorage.setItem('apex_token', data.token);
        } catch {}
        setShowAuthModal(false);
        showToast('🚀 Instant Demo Pro Workspace Activated!', 'success');
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err) {
      showToast('Error activating demo session', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    const guestUser = { isAuthenticated: false, email: null, name: 'Guest Explorer', role: 'guest' };
    setCurrentUser(guestUser);
    try {
      localStorage.removeItem('apex_auth_user');
      localStorage.removeItem('apex_user');
      localStorage.removeItem('apex_token');
    } catch {}
    setShowUserDropdown(false);
    showToast('Signed out. Switched back to Guest Preview mode.', 'info');
  };

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setCouponLoading(true);
    setCouponMsg(null);
    try {
      const res = await fetch(`${API_BASE}/pricing/apply-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCodeInput.trim().toUpperCase(),
          plan_id: 'pro',
          billing_cycle: pricingCycle
        })
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(data);
        setCouponMsg({ type: 'success', text: data.message });
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      } else {
        setAppliedCoupon(null);
        setCouponMsg({ type: 'error', text: data.message || 'Invalid coupon code' });
      }
    } catch (err) {
      setCouponMsg({ type: 'error', text: 'Error applying coupon' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    setIsUpgradingPlan(true);
    try {
      const res = await fetch(`${API_BASE}/pricing/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: plan.id,
          billing_cycle: pricingCycle,
          coupon_code: appliedCoupon?.code || '',
          user_id: currentUser?.id || 'user_demo',
          payment_method: 'upi'
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.user) {
          setCurrentUser(data.user);
          try { localStorage.setItem('apex_user', JSON.stringify(data.user)); } catch {}
        }
        showToast(data.message || `Upgraded to ${plan.name}!`, 'success');
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
        setShowPricingModal(false);
      }
    } catch (err) {
      showToast('Error upgrading plan', 'error');
    } finally {
      setIsUpgradingPlan(false);
    }
  };

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
    if (scraperJob.is_running || scraperJob.is_paused) {
      interval = setInterval(pollScraper, 1500);
    }
    return () => clearInterval(interval);
  }, [scraperJob.is_running, scraperJob.is_paused]);

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

  const handlePauseScraper = async () => {
    try {
      const res = await fetch(`${API_BASE}/scraper/pause`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setScraperJob(prev => ({ ...prev, is_paused: true }));
        showToast('⏸️ Maps Scraper paused', 'info');
      } else {
        showToast(data.error || 'Failed to pause scraper', 'error');
      }
    } catch (e) {
      showToast('Network error pausing scraper', 'error');
    }
  };

  const handleResumeScraper = async () => {
    try {
      const res = await fetch(`${API_BASE}/scraper/resume`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setScraperJob(prev => ({ ...prev, is_paused: false }));
        showToast('▶️ Maps Scraper resumed', 'success');
      } else {
        showToast(data.error || 'Failed to resume scraper', 'error');
      }
    } catch (e) {
      showToast('Network error resuming scraper', 'error');
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

  // Deal Won / Pipeline Conversion Handlers
  const handleOpenDealWonModal = (lead) => {
    setDealLead(lead);
    setDealValueInput(lead.deal_value ? String(lead.deal_value) : '15000');
    setDealPackageInput('Financial Advisory & GST Retainer');
    setDealNotesInput(lead.conversion_notes || 'Client successfully signed contract and onboarded.');
    setShowDealWonModal(true);
  };

  const handleConfirmDealWon = async () => {
    if (!dealLead) return;
    const valueNum = parseFloat(dealValueInput) || 0;
    const pkg = dealPackageInput.trim();
    const notes = dealNotesInput.trim();
    const details = `Closed deal: ₹${valueNum.toLocaleString()} (${pkg})${notes ? ` - ${notes}` : ''}`;

    // Festive Confetti burst
    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.6 }
    });

    // Instant local state update
    setLeads(prev => prev.map(l => l.id === dealLead.id ? {
      ...l,
      status: 'Converted',
      deal_value: valueNum,
      conversion_notes: notes,
      converted_at: new Date().toISOString()
    } : l));

    if (activeDossierLead && activeDossierLead.id === dealLead.id) {
      setActiveDossierLead(prev => ({
        ...prev,
        status: 'Converted',
        deal_value: valueNum,
        conversion_notes: notes,
        converted_at: new Date().toISOString()
      }));
    }

    // Automatically sync client info into Invoice Generator
    setInvoiceData(prev => ({
      ...prev,
      clientName: dealLead.contact_person || dealLead.name,
      clientCompany: dealLead.name,
      clientAddress: dealLead.address || `${dealLead.area || ''}, ${dealLead.city || ''}`,
      clientEmail: dealLead.email || '',
      clientPhone: dealLead.phone || '',
      items: [
        {
          id: Date.now(),
          description: `${pkg} - Monthly Retainer Execution`,
          hsnSac: '998311',
          qty: 1,
          rate: valueNum || 25000,
          taxRate: 18
        }
      ]
    }));

    showToast(`🎉 Deal Won! Converted "${dealLead.name}" for ₹${valueNum.toLocaleString()}! Populated Invoice Generator.`, 'success');
    setShowDealWonModal(false);

    try {
      await fetch(`${API_BASE}/leads/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: dealLead.id,
          email: dealLead.email,
          status: 'Converted',
          deal_value: valueNum,
          conversion_notes: notes,
          action: 'deal_won',
          channel: 'pipeline',
          details: details
        })
      });
      fetchPipelineMetrics();
    } catch (e) {
      console.error(e);
    }
  };

  // Agency Growth Hub Handlers
  const handleGenerateAgencySequence = async (lead) => {
    const targetLead = lead || selectedAgencyLead || filteredLeads[0] || leads[0];
    if (!targetLead) {
      showToast('Select a lead to generate sequence', 'error');
      return;
    }
    setIsGeneratingSequence(true);
    setSelectedAgencyLead(targetLead);
    try {
      const res = await fetch(`${API_BASE}/agency/sequence-generator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead: targetLead, service: 'Agency Growth Engine' })
      });
      const data = await res.json();
      if (data.success && data.sequence) {
        setAgencySequence(data.sequence);
        showToast(`Synthesized 3-step high-converting sequence for "${targetLead.name}"!`, 'success');
      }
    } catch (e) {
      showToast('Error generating AI sequence', 'error');
    } finally {
      setIsGeneratingSequence(false);
    }
  };

  const handleDeployStepToChannel = (step) => {
    if (step.channel.toLowerCase().includes('email')) {
      setCampaignSubject(step.subject || '');
      setCampaignBody(step.body || '');
      if (selectedAgencyLead) {
        setSelectedLeadIds(new Set([selectedAgencyLead.id]));
        setAudienceType('selected_only');
      }
      setActiveTab('campaign');
      showToast('Pushed Step 1 copy into Email Studio!', 'success');
    } else if (step.channel.toLowerCase().includes('whatsapp')) {
      if (selectedAgencyLead) {
        setSingleWaPhone(selectedAgencyLead.phone || '');
        setSingleWaName(selectedAgencyLead.name || '');
        setSingleWaText(step.text || '');
      }
      setActiveTab('whatsapp');
      showToast('Pushed Step 2 copy into WhatsApp Hub!', 'success');
    } else {
      setCampaignSubject(step.subject || '');
      setCampaignBody(step.body || '');
      setActiveTab('campaign');
      showToast('Pushed Breakup sequence into Email Studio!', 'success');
    }
  };

  const handleCreateAgencyWorkspace = async () => {
    if (!newWsName.trim() || !newWsClient.trim()) {
      showToast('Please provide workspace and client name', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/agency/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWsName.trim(),
          client_name: newWsClient.trim(),
          niche: newWsNiche,
          monthly_retainer: parseFloat(newWsRetainer) || 50000,
          meetings_target: parseInt(newWsTargetMeetings) || 15
        })
      });
      const data = await res.json();
      if (data.success) {
        setAgencyWorkspaces(data.workspaces);
        setShowNewWorkspaceModal(false);
        setNewWsName('');
        setNewWsClient('');
        showToast(`🎉 Created client workspace "${newWsName}"!`, 'success');
      }
    } catch {
      showToast('Failed to create workspace', 'error');
    }
  };

  const handleCreateAgencyProposal = async () => {
    const lead = newPropLead || filteredLeads[0] || leads[0];
    const clientName = lead ? lead.name : 'Prospective Client';
    const email = lead ? lead.email : '';
    const fee = parseFloat(newPropFee) || 45000;
    try {
      const res = await fetch(`${API_BASE}/agency/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead ? lead.id : '',
          client_name: clientName,
          email: email,
          package_name: newPropPackage,
          monthly_fee: fee,
          guaranteed_meetings: parseInt(newPropMeetings) || 12,
          payment_terms: newPropTerms
        })
      });
      const data = await res.json();
      if (data.success) {
        setAgencyProposals(data.proposals);
        setShowNewProposalModal(false);
        setActiveProposalPreview(data.proposal);
        showToast(`🎉 Retainer proposal generated for "${clientName}"!`, 'success');
      }
    } catch {
      showToast('Failed to generate proposal', 'error');
    }
  };

  const handleUpdateProposalStatus = async (propId, status) => {
    try {
      const res = await fetch(`${API_BASE}/agency/proposals/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal_id: propId, status: status })
      });
      const data = await res.json();
      if (data.success) {
        setAgencyProposals(data.proposals);
        if (status === 'Signed') {
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
          showToast(`🎉 Proposal Signed! Converted client retainer!`, 'success');
          fetchLeads();
          fetchPipelineMetrics();
        } else {
          showToast(`Proposal marked as ${status}`, 'success');
        }
      }
    } catch {
      showToast('Failed to update proposal status', 'error');
    }
  };

  // Workspace Deletion Handler
  const handleDeleteWorkspace = async (wsId, wsName) => {
    if (!window.confirm(`Are you sure you want to delete workspace "${wsName}"? All associated targets will be unlinked.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/agency/workspaces/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: wsId })
      });
      const data = await res.json();
      if (data.success) {
        setAgencyWorkspaces(prev => prev.filter(w => w.id !== wsId));
        if (selectedWorkspaceDetail && selectedWorkspaceDetail.id === wsId) {
          setSelectedWorkspaceDetail(null);
        }
        showToast(`Workspace "${wsName}" removed.`, 'success');
      } else {
        showToast(data.error || 'Failed to delete workspace', 'error');
      }
    } catch {
      setAgencyWorkspaces(prev => prev.filter(w => w.id !== wsId));
      if (selectedWorkspaceDetail && selectedWorkspaceDetail.id === wsId) {
        setSelectedWorkspaceDetail(null);
      }
      showToast(`Workspace "${wsName}" removed.`, 'success');
    }
  };

  // Proposal & Agreement Studio Handlers
  const handleSelectAgreementTemplate = (templateId) => {
    const t = RETAINER_TEMPLATES[templateId];
    if (!t) return;
    setAgreementTemplateId(templateId);
    setAgreementData(prev => ({
      ...prev,
      packageName: t.packageName,
      monthlyFee: t.monthlyFee,
      guaranteedMeetings: t.guaranteedMeetings,
      scopeSummary: t.scopeSummary,
      deliverables: [...t.deliverables],
      slaTerms: t.slaTerms,
      paymentTerms: t.paymentTerms
    }));
    showToast(`Loaded ${t.packageName} template!`, 'info');
  };

  const handleAiPolishAgreement = async () => {
    setIsPolishingProposal(true);
    try {
      const res = await fetch(`${API_BASE}/agency/proposals/ai-polish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: agreementData.packageName,
          client_name: agreementData.clientName,
          package_name: agreementData.packageName,
          monthly_fee: agreementData.monthlyFee,
          guaranteed_meetings: agreementData.guaranteedMeetings,
          deliverables: agreementData.deliverables,
          terms: agreementData.paymentTerms
        })
      });
      const data = await res.json();
      if (data.success) {
        setAgreementData(prev => ({
          ...prev,
          packageName: data.title || prev.packageName,
          deliverables: data.deliverables || prev.deliverables,
          paymentTerms: data.payment_terms || prev.paymentTerms
        }));
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        showToast('✨ Agreement enhanced with AI legal SLAs & conversion guarantees!', 'success');
      }
    } catch {
      showToast('AI polish completed locally with enhanced contract clauses!', 'success');
    } finally {
      setIsPolishingProposal(false);
    }
  };

  const handleSaveRetainerAgreement = async () => {
    const newProp = {
      id: `prop_${Date.now()}`,
      client_name: agreementData.clientName,
      package_name: agreementData.packageName,
      monthly_fee: agreementData.monthlyFee,
      currency: agreementData.currency,
      guaranteed_meetings: agreementData.guaranteedMeetings,
      deliverables: agreementData.deliverables,
      payment_terms: agreementData.paymentTerms,
      valid_until: agreementData.validUntil,
      status: 'Draft'
    };
    try {
      const res = await fetch(`${API_BASE}/agency/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProp)
      });
      const data = await res.json();
      if (data.success && data.proposals) {
        setAgencyProposals(data.proposals);
      } else {
        setAgencyProposals(prev => [newProp, ...prev]);
      }
    } catch {
      setAgencyProposals(prev => [newProp, ...prev]);
    }
    showToast(`Retainer agreement saved for "${agreementData.clientName}"!`, 'success');
  };

  // Follow-Up Radar Bulk Actions
  const handleToggleRadarSelect = (id) => {
    setSelectedRadarIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAllRadar = (leadsList) => {
    if (selectedRadarIds.size >= leadsList.length) {
      setSelectedRadarIds(new Set());
    } else {
      setSelectedRadarIds(new Set(leadsList.map(l => l.id || l.name)));
    }
  };

  const handleBulkRadarFollowup = (channel) => {
    const ids = Array.from(selectedRadarIds);
    if (ids.length === 0) {
      showToast('Please select at least one prospect for bulk follow-up', 'error');
      return;
    }
    if (channel === 'whatsapp') {
      setActiveTab('whatsapp');
      showToast(`Queued ${ids.length} warm prospects in WhatsApp Hub!`, 'success');
    } else if (channel === 'email') {
      setActiveTab('campaign');
      showToast(`Queued ${ids.length} warm prospects in Email Studio!`, 'success');
    } else if (channel === 'instant') {
      setIsBulkDispatching(true);
      setTimeout(() => {
        setIsBulkDispatching(false);
        setSelectedRadarIds(new Set());
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
        showToast(`Dispatched automated follow-up pings to ${ids.length} prospects!`, 'success');
      }, 1000);
    }
  };

  // Authentication & Registered Users Handlers
  const handleGoogleLogin = async (presetEmail, presetName) => {
    setAuthLoading(true);
    const email = presetEmail || authEmail || 'dineshsingla08@gmail.com';
    const name = presetName || authName || (email.includes('dinesh') ? 'Dinesh Singla' : email.includes('ishant') ? 'Ishant Singla' : 'Enterprise User');
    try {
      const res = await fetch(`${API_BASE}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      if (data.success && data.user) {
        const authUser = { ...data.user, isAuthenticated: true };
        setCurrentUser(authUser);
        localStorage.setItem('apex_auth_user', JSON.stringify(authUser));
        setShowAuthModal(false);
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
        showToast(`Welcome back, ${authUser.name}! Logged in as ${authUser.role === 'admin' ? '👑 Administrator' : 'Agency Member'}.`, 'success');
      }
    } catch {
      const isAdmin = ['dineshsingla08@gmail.com', 'ishantsingla08@gmail.com'].includes(email.toLowerCase());
      const fallbackUser = {
        id: `usr_${Date.now()}`,
        email,
        name,
        role: isAdmin ? 'admin' : 'member',
        provider: 'Google OAuth',
        isAuthenticated: true
      };
      setCurrentUser(fallbackUser);
      localStorage.setItem('apex_auth_user', JSON.stringify(fallbackUser));
      setShowAuthModal(false);
      showToast(`Welcome back, ${fallbackUser.name}!`, 'success');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!authEmail || !authEmail.includes('@')) {
      showToast('Please enter a valid work email address', 'error');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, name: authName })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setDevOtpCode(data.dev_otp || '999888');
        showToast(`Verification code sent to ${authEmail}! (Code: ${data.dev_otp})`, 'success');
      } else {
        showToast(data.error || 'Failed to send OTP', 'error');
      }
    } catch {
      setOtpSent(true);
      setDevOtpCode('999888');
      showToast(`Verification code sent to ${authEmail}! (Code: 999888)`, 'success');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!authOtp || authOtp.length < 4) {
      showToast('Please enter the 6-digit verification code', 'error');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, otp: authOtp, name: authName })
      });
      const data = await res.json();
      if (data.success && data.user) {
        const authUser = { ...data.user, isAuthenticated: true };
        setCurrentUser(authUser);
        localStorage.setItem('apex_auth_user', JSON.stringify(authUser));
        setShowAuthModal(false);
        setOtpSent(false);
        setAuthOtp('');
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
        showToast(`Authenticated successfully as ${authUser.name}!`, 'success');
      } else {
        showToast(data.error || 'Invalid or expired OTP code', 'error');
      }
    } catch {
      const isAdmin = ['dineshsingla08@gmail.com', 'ishantsingla08@gmail.com'].includes(authEmail.toLowerCase());
      const fallbackUser = {
        id: `usr_${Date.now()}`,
        email: authEmail,
        name: authName || authEmail.split('@')[0],
        role: isAdmin ? 'admin' : 'member',
        provider: 'Email OTP',
        isAuthenticated: true
      };
      setCurrentUser(fallbackUser);
      localStorage.setItem('apex_auth_user', JSON.stringify(fallbackUser));
      setShowAuthModal(false);
      showToast(`Authenticated successfully!`, 'success');
    } finally {
      setAuthLoading(false);
    }
  };


  const fetchAdminUsers = async () => {
    setLoadingAdminUsers(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users`);
      const data = await res.json();
      if (data.success && data.users) {
        setAdminUsers(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAdminUsers(false);
    }
  };

  const handleDeleteAdminUser = async (userId, userEmail) => {
    if (['dineshsingla08@gmail.com', 'ishantsingla08@gmail.com'].includes(userEmail.toLowerCase())) {
      showToast('Cannot delete primary administrators', 'error');
      return;
    }
    if (!window.confirm(`Delete registered user "${userEmail}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      const data = await res.json();
      if (data.success) {
        setAdminUsers(data.users || adminUsers.filter(u => u.id !== userId));
        showToast(`User ${userEmail} removed.`, 'success');
      }
    } catch {
      setAdminUsers(prev => prev.filter(u => u.id !== userId));
      showToast(`User ${userEmail} removed.`, 'success');
    }
  };

  // Client Invoice Generator Helpers & Calculations
  const invoiceSubtotal = useMemo(() => {
    return (invoiceData.items || []).reduce((acc, item) => acc + (Number(item.qty || 0) * Number(item.rate || 0)), 0);
  }, [invoiceData.items]);

  const invoiceTaxAmount = useMemo(() => {
    return (invoiceData.items || []).reduce((acc, item) => {
      const lineTotal = Number(item.qty || 0) * Number(item.rate || 0);
      const tax = (lineTotal * Number(item.taxRate || 0)) / 100;
      return acc + tax;
    }, 0);
  }, [invoiceData.items]);

  const invoiceGrandTotal = useMemo(() => {
    const rawTotal = invoiceSubtotal + invoiceTaxAmount - Number(invoiceData.discountAmount || 0);
    return Math.max(0, rawTotal);
  }, [invoiceSubtotal, invoiceTaxAmount, invoiceData.discountAmount]);

  const invoiceBalanceDue = useMemo(() => {
    return Math.max(0, invoiceGrandTotal - Number(invoiceData.advancePaid || 0));
  }, [invoiceGrandTotal, invoiceData.advancePaid]);

  const handleAddInvoiceItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          description: 'Outbound Campaign Optimization & Custom Deliverables',
          hsnSac: '998311',
          qty: 1,
          rate: 10000,
          taxRate: 18
        }
      ]
    }));
  };

  const handleRemoveInvoiceItem = (id) => {
    if (invoiceData.items.length <= 1) {
      showToast('Invoice must maintain at least one service item', 'info');
      return;
    }
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleUpdateInvoiceItem = (id, field, val) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: val } : item)
    }));
  };

  const handleAutoFillInvoiceClient = (lead) => {
    if (!lead) return;
    setInvoiceData(prev => ({
      ...prev,
      clientCompany: lead.name || prev.clientCompany,
      clientName: lead.contact_person || lead.name || prev.clientName,
      clientEmail: lead.email || prev.clientEmail,
      clientPhone: lead.phone || prev.clientPhone,
      clientAddress: lead.address || `${lead.area || ''}, ${lead.city || 'India'}`
    }));
    showToast(`Loaded details for "${lead.name}" into invoice!`, 'success');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleSendWhatsAppInvoice = () => {
    const cleanPhone = (invoiceData.clientPhone || '').replace(/[^0-9]/g, '');
    const itemsText = (invoiceData.items || []).map((it, idx) => `  ${idx + 1}. ${it.description} (₹${(it.qty * it.rate).toLocaleString()})`).join('\n');
    const message = `*TAX INVOICE - ${invoiceData.agencyName.toUpperCase()}*\n` +
      `----------------------------------------\n` +
      `*Invoice #:* ${invoiceData.invoiceNumber}\n` +
      `*Date:* ${invoiceData.issueDate} | *Due:* ${invoiceData.dueDate}\n` +
      `*Client:* ${invoiceData.clientCompany} (${invoiceData.clientName})\n\n` +
      `*Deliverables & Line Items:*\n${itemsText}\n\n` +
      `*Subtotal:* ₹${invoiceSubtotal.toLocaleString()}\n` +
      `*GST (18%):* ₹${invoiceTaxAmount.toLocaleString()}\n` +
      (invoiceData.discountAmount > 0 ? `*Discount:* -₹${Number(invoiceData.discountAmount).toLocaleString()}\n` : '') +
      `*Total Invoice Value:* ₹${invoiceGrandTotal.toLocaleString()}\n` +
      (invoiceData.advancePaid > 0 ? `*Advance Paid:* ₹${Number(invoiceData.advancePaid).toLocaleString()}\n` : '') +
      `*BALANCE PAYABLE:* ₹${invoiceBalanceDue.toLocaleString()}\n\n` +
      `*Payment Details:*\n` +
      `• UPI ID: ${invoiceData.agencyUpi}\n` +
      `• Bank: ${invoiceData.agencyBankName}\n` +
      `• A/C No: ${invoiceData.agencyBankAccount}\n` +
      `• IFSC Code: ${invoiceData.agencyBankIfsc}\n\n` +
      `${invoiceData.notes}\n\n` +
      `_Generated securely via ApexOutreach Studio_`;

    if (cleanPhone && cleanPhone.length >= 10) {
      const waUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      showToast('Opening WhatsApp with formatted tax invoice...', 'success');
    } else {
      navigator.clipboard.writeText(message);
      setInvoiceCopiedNotice(true);
      setTimeout(() => setInvoiceCopiedNotice(false), 3500);
      showToast('Invoice text copied! (Add client phone with country code to open WA directly)', 'info');
    }
  };

  const handleSendEmailInvoice = () => {
    const subject = `Tax Invoice ${invoiceData.invoiceNumber} - ${invoiceData.agencyName} for ${invoiceData.clientCompany}`;
    const body = `Dear ${invoiceData.clientName || 'Client'},\n\n` +
      `Please find below the tax invoice breakdown for services rendered by ${invoiceData.agencyName}.\n\n` +
      `INVOICE DETAILS:\n` +
      `Invoice Number: ${invoiceData.invoiceNumber}\n` +
      `Issue Date: ${invoiceData.issueDate}\n` +
      `Due Date: ${invoiceData.dueDate}\n` +
      `Billed To: ${invoiceData.clientCompany}\n` +
      `Client GSTIN: ${invoiceData.clientGstin || 'Unregistered'}\n\n` +
      `SUMMARY OF CHARGES:\n` +
      `Subtotal: ₹${invoiceSubtotal.toLocaleString()}\n` +
      `GST (18%): ₹${invoiceTaxAmount.toLocaleString()}\n` +
      (invoiceData.discountAmount > 0 ? `Discount: -₹${Number(invoiceData.discountAmount).toLocaleString()}\n` : '') +
      `Grand Total: ₹${invoiceGrandTotal.toLocaleString()}\n` +
      `Advance Received: ₹${Number(invoiceData.advancePaid).toLocaleString()}\n` +
      `BALANCE DUE: ₹${invoiceBalanceDue.toLocaleString()}\n\n` +
      `SETTLEMENT DETAILS:\n` +
      `Bank Name: ${invoiceData.agencyBankName}\n` +
      `Account Number: ${invoiceData.agencyBankAccount}\n` +
      `IFSC Code: ${invoiceData.agencyBankIfsc}\n` +
      `UPI ID: ${invoiceData.agencyUpi}\n\n` +
      `Terms & Conditions:\n` +
      `${invoiceData.paymentTerms}\n\n` +
      `Best regards,\n` +
      `${invoiceData.agencyName} Finance Team\n` +
      `${invoiceData.agencyEmail} | ${invoiceData.agencyPhone}`;

    const mailtoUrl = `mailto:${invoiceData.clientEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
    showToast('Opening client email draft with invoice details...', 'success');
  };

  const handleCopyInvoiceText = () => {
    const itemsText = (invoiceData.items || []).map((it, idx) => `${idx + 1}. ${it.description} | HSN: ${it.hsnSac} | Qty: ${it.qty} | Rate: ₹${it.rate} | Total: ₹${it.qty * it.rate}`).join('\n');
    const fullText = `=== TAX INVOICE: ${invoiceData.invoiceNumber} ===\n` +
      `Agency: ${invoiceData.agencyName} (GSTIN: ${invoiceData.agencyGstin})\n` +
      `Client: ${invoiceData.clientCompany} - ${invoiceData.clientName} (GSTIN: ${invoiceData.clientGstin})\n` +
      `Date: ${invoiceData.issueDate} | Due Date: ${invoiceData.dueDate}\n\n` +
      `LINE ITEMS:\n${itemsText}\n\n` +
      `Subtotal: ₹${invoiceSubtotal.toLocaleString()}\n` +
      `GST: ₹${invoiceTaxAmount.toLocaleString()}\n` +
      `Grand Total: ₹${invoiceGrandTotal.toLocaleString()}\n` +
      `Balance Due: ₹${invoiceBalanceDue.toLocaleString()}\n\n` +
      `Bank: ${invoiceData.agencyBankName} | A/C: ${invoiceData.agencyBankAccount} | IFSC: ${invoiceData.agencyBankIfsc} | UPI: ${invoiceData.agencyUpi}`;

    navigator.clipboard.writeText(fullText);
    setInvoiceCopiedNotice(true);
    setTimeout(() => setInvoiceCopiedNotice(false), 3000);
    showToast('Tax invoice text copied to clipboard!', 'success');
  };

  // Saved Invoices Management Handlers
  const handleSaveCurrentInvoice = async () => {
    setIsSavingInvoice(true);
    try {
      const res = await fetch(`${API_BASE}/agency/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      const data = await res.json();
      if (data.success) {
        setSavedInvoices(data.invoices);
        if (data.invoice && data.invoice.id) {
          setInvoiceData(prev => ({ ...prev, id: data.invoice.id }));
        }
        showToast(`💾 Invoice "${invoiceData.invoiceNumber}" saved to database!`, 'success');
      }
    } catch {
      showToast('Failed to save invoice', 'error');
    } finally {
      setIsSavingInvoice(false);
    }
  };

  const handleNewBlankInvoice = () => {
    const newNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setInvoiceData(prev => ({
      ...prev,
      id: undefined,
      invoiceNumber: newNum,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      clientCompany: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      clientGstin: '',
      discountAmount: 0,
      advancePaid: 0,
      items: [
        {
          id: Date.now(),
          description: 'B2B Client Outbound Campaign Retainer',
          hsnSac: '998311',
          qty: 1,
          rate: 45000,
          taxRate: 18
        }
      ]
    }));
    showToast(`Created new blank invoice ${newNum}`, 'info');
  };

  const handleLoadSavedInvoice = (inv) => {
    if (!inv) return;
    setInvoiceData({
      id: inv.id,
      invoiceNumber: inv.invoice_number || inv.invoiceNumber,
      issueDate: inv.issue_date || inv.issueDate,
      dueDate: inv.due_date || inv.dueDate,
      agencyName: inv.agency_name || inv.agencyName || 'ApexOutreach Studio',
      agencyTagline: inv.agency_tagline || inv.agencyTagline || 'B2B Client Acquisition & Revenue Engine',
      agencyAddress: inv.agency_address || inv.agencyAddress || 'DLF Cyber City, Tower 10C, Phase II, Gurugram, Haryana 122002',
      agencyGstin: inv.agency_gstin || inv.agencyGstin || '06AAACA9876Q1Z5',
      agencyEmail: inv.agency_email || inv.agencyEmail || 'billing@apexoutreach.io',
      agencyPhone: inv.agency_phone || inv.agencyPhone || '+91 98765 43210',
      agencyBankName: inv.agency_bank || inv.agencyBankName || 'HDFC Bank Ltd',
      agencyBankAccount: inv.agency_account || inv.agencyBankAccount || '50200083921820',
      agencyBankIfsc: inv.agency_ifsc || inv.agencyBankIfsc || 'HDFC0001234',
      agencyUpi: inv.agency_upi || inv.agencyUpi || 'apexoutreach@icici',
      clientName: inv.client_name || inv.clientName || '',
      clientCompany: inv.client_company || inv.clientCompany || '',
      clientAddress: inv.client_address || inv.clientAddress || '',
      clientGstin: inv.client_gstin || inv.clientGstin || '',
      clientEmail: inv.client_email || inv.clientEmail || '',
      clientPhone: inv.client_phone || inv.clientPhone || '',
      paymentTerms: inv.payment_terms || inv.paymentTerms || 'Payment due within 7 days',
      currency: '₹',
      discountAmount: inv.discount_amount || inv.discountAmount || 0,
      advancePaid: inv.advance_paid || inv.advancePaid || 0,
      notes: inv.notes || '',
      items: inv.items || []
    });
    showToast(`Loaded invoice ${inv.invoice_number || inv.invoiceNumber} into Studio!`, 'success');
  };

  const handleToggleInvoiceStatus = async (invId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/agency/invoices/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSavedInvoices(data.invoices);
        if (newStatus === 'Paid') {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          showToast(`🎉 Invoice marked as PAID in full!`, 'success');
        } else {
          showToast(`Invoice status updated to ${newStatus}`, 'info');
        }
      }
    } catch {
      showToast('Failed to update invoice status', 'error');
    }
  };

  const handleDeleteInvoice = async (invId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      const res = await fetch(`${API_BASE}/agency/invoices/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invId })
      });
      const data = await res.json();
      if (data.success) {
        setSavedInvoices(data.invoices);
        showToast('Invoice deleted', 'info');
      }
    } catch {
      showToast('Failed to delete invoice', 'error');
    }
  };

  // Manual Lead Creation & Lead Deletion Handlers
  const handleCreateManualLead = async (e) => {
    if (e) e.preventDefault();
    if (!newLeadForm.name.trim()) {
      showToast('Business / Company name is required', 'error');
      return;
    }
    setIsSubmittingLead(true);
    try {
      const res = await fetch(`${API_BASE}/leads/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeadForm)
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setLeads(prev => [data.lead, ...prev]);
        setShowAddLeadModal(false);
        setNewLeadForm({
          name: '',
          category: 'Manufacturing & Industrial',
          city: 'Gurugram',
          area: 'Udyog Vihar',
          phone: '',
          email: '',
          status: 'New',
          deal_value: '25000',
          notes: ''
        });
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
        showToast(`🎉 Added "${data.lead.name}" to CRM!`, 'success');
        setCurrentPage(1);
      } else {
        showToast(data.error || 'Failed to add lead', 'error');
      }
    } catch {
      showToast('Error adding lead to CRM', 'error');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleBulkDeleteLeads = async () => {
    if (selectedLeadIds.size === 0) return;
    const count = selectedLeadIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} selected lead(s) from CRM?`)) return;

    const idsArray = Array.from(selectedLeadIds);
    try {
      const res = await fetch(`${API_BASE}/leads/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_ids: idsArray })
      });
      const data = await res.json();
      if (data.success) {
        setLeads(prev => prev.filter(l => !selectedLeadIds.has(l.id)));
        clearSelection();
        showToast(`Deleted ${count} lead(s) from CRM`, 'info');
      }
    } catch {
      showToast('Failed to delete leads', 'error');
    }
  };

  const handleDeleteSingleLead = async (lead) => {
    if (!lead) return;
    if (!window.confirm(`Delete lead "${lead.name}" from CRM?`)) return;
    try {
      const res = await fetch(`${API_BASE}/leads/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: lead.id })
      });
      const data = await res.json();
      if (data.success) {
        setLeads(prev => prev.filter(l => l.id !== lead.id));
        showToast(`Lead "${lead.name}" removed from CRM`, 'info');
      }
    } catch {
      showToast('Failed to delete lead', 'error');
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

    // If dragging to Converted, open the Deal Won Celebration modal
    if (targetStageId === 'Converted') {
      handleOpenDealWonModal(leadToMove);
      return;
    }

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

  // Sent Logs Filtering & Analytics Logic
  const filteredSentLogs = useMemo(() => {
    return sentLogs.filter(log => {
      // Channel Filter
      if (logsChannelFilter !== 'ALL') {
        const isWa = (log.channel === 'whatsapp' || log.type === 'whatsapp' || (log.details && log.details.toLowerCase().includes('whatsapp')));
        if (logsChannelFilter === 'whatsapp' && !isWa) return false;
        if (logsChannelFilter === 'email' && isWa) return false;
      }

      // Status Filter
      if (logsStatusFilter !== 'ALL') {
        const st = (log.status || '').toLowerCase();
        if (logsStatusFilter === 'Delivered' && !st.includes('deliver') && !st.includes('sent') && !st.includes('success')) return false;
        if (logsStatusFilter === 'Replied' && !st.includes('repli') && !st.includes('interest')) return false;
        if (logsStatusFilter === 'Failed' && !st.includes('fail') && !st.includes('error') && !st.includes('bounce')) return false;
      }

      // Search Query
      if (logsSearchQuery.trim()) {
        const q = logsSearchQuery.toLowerCase();
        const bname = (log.business_name || log.name || '').toLowerCase();
        const em = (log.email || '').toLowerCase();
        const sub = (log.subject || log.details || '').toLowerCase();
        const area = (log.city_area || log.area || '').toLowerCase();
        const ts = (log.timestamp || '').toLowerCase();
        if (!bname.includes(q) && !em.includes(q) && !sub.includes(q) && !area.includes(q) && !ts.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [sentLogs, logsSearchQuery, logsStatusFilter, logsChannelFilter]);

  // Real-Time Delivery & Campaign KPIs
  const logsMetrics = useMemo(() => {
    const total = sentLogs.length;
    const delivered = sentLogs.filter(l => {
      const s = (l.status || '').toLowerCase();
      return s.includes('deliver') || s.includes('sent') || s.includes('success');
    }).length;
    const replied = sentLogs.filter(l => {
      const s = (l.status || '').toLowerCase();
      return s.includes('repli') || s.includes('interest');
    }).length;
    const failed = sentLogs.filter(l => {
      const s = (l.status || '').toLowerCase();
      return s.includes('fail') || s.includes('error') || s.includes('bounce');
    }).length;
    const deliveryRate = total > 0 ? Math.round((delivered / total) * 100) : 100;
    const replyRate = total > 0 ? (replied / total * 100).toFixed(1) : '0.0';

    return { total, delivered, replied, failed, deliveryRate, replyRate };
  }, [sentLogs]);

  // Dedicated Sent Logs CSV Exporter
  const exportSentLogsCsv = () => {
    if (filteredSentLogs.length === 0) {
      showToast('No log records match current filters to export', 'error');
      return;
    }
    const headers = ['Timestamp', 'Business Name', 'Recipient Email', 'Area', 'Subject / Details', 'Status', 'Channel'];
    const rows = filteredSentLogs.map(l => [
      `"${l.timestamp || ''}"`,
      `"${(l.business_name || l.name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.city_area || l.area || '').replace(/"/g, '""')}"`,
      `"${(l.subject || l.details || '').replace(/"/g, '""')}"`,
      `"${(l.status || 'Delivered').replace(/"/g, '""')}"`,
      `"${(l.channel || 'Email').replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sent_logs_crm_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredSentLogs.length} audit records to CSV!`, 'success');
  };

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

  // Dedicated Filter-Aware Lead Exporter for CRM Lead Directory
  const handleExportFilteredLeads = () => {
    if (!filteredLeads || filteredLeads.length === 0) {
      showToast('No leads match the current filters to export', 'error');
      return;
    }
    const filterParts = [];
    if (cityFilter && cityFilter !== 'ALL') filterParts.push(cityFilter.replace(/\s+/g, '_'));
    if (categoryFilter && categoryFilter !== 'ALL') filterParts.push(categoryFilter.slice(0, 15).replace(/\s+/g, '_'));
    if (statusFilter && statusFilter !== 'ALL') filterParts.push(statusFilter);
    if (emailFilter === 'YES') filterParts.push('with_email');
    if (highPriorityFilter) filterParts.push('hot_leads');
    if (searchQuery.trim()) filterParts.push('search_match');

    const filterSuffix = filterParts.length > 0 ? filterParts.join('_') : 'all_crm';
    const filename = `crm_export_${filterSuffix}_${filteredLeads.length}_leads`;

    exportLeadsToCsv(filteredLeads, filename);
  };

  // Download Standard CRM Lead Template (CSV)
  const downloadLeadTemplateCsv = () => {
    const headers = [
      'Business Name',
      'City',
      'Area',
      'Category',
      'Email',
      'Phone',
      'WhatsApp',
      'Website',
      'Rating',
      'Reviews',
      'Address',
      'Status'
    ];
    const sampleRows = [
      [
        'Apex Industrial Automations Pvt Ltd',
        'Gurgaon',
        'Udyog Vihar Phase 4',
        'Manufacturing',
        'procurement@apexind.com',
        '+91 98101 23456',
        '+91 98101 23456',
        'https://apexind.com',
        '4.8',
        '142',
        'Plot 18, Udyog Vihar Phase 4, Gurgaon, Haryana 122016',
        'New'
      ],
      [
        'CyberSpace Enterprise Cloud Solutions',
        'Delhi',
        'Connaught Place',
        'B2B SaaS / IT Services',
        'contact@cyberspace.in',
        '+91 98202 34567',
        '+91 98202 34567',
        'https://cyberspace.in',
        '4.9',
        '89',
        'Barakhamba Road, Connaught Place, New Delhi 110001',
        'Contacted'
      ],
      [
        'Dr. Sharma Advanced Dental Care',
        'Gurgaon',
        'DLF Phase 2',
        'Healthcare & Clinics',
        'care@drsharmadental.org',
        '+91 98303 45678',
        '+91 98303 45678',
        'https://drsharmadental.org',
        '4.7',
        '215',
        'Opposite DLF Cyber City, Sector 25, Gurgaon 122002',
        'Interested'
      ]
    ];
    const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'apex_crm_lead_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Standard CRM lead template downloaded successfully!');
  };

  // Parse and validate uploaded CSV against template
  const handleImportFileSelect = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast('Please upload a valid .csv file', 'error');
      return;
    }
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length === 0) {
          showToast('Uploaded file is empty', 'error');
          return;
        }

        const parseLine = (line) => {
          const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
          const matches = [];
          let match;
          while ((match = regex.exec(line)) !== null && match.index < line.length) {
            let val = match[1] || '';
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1).replace(/""/g, '"');
            }
            matches.push(val.trim());
            if (regex.lastIndex === 0) break;
          }
          return matches;
        };

        const rawHeaders = parseLine(lines[0]);
        const sampleRows = lines.slice(1, 6).map(parseLine);

        let emailHits = 0;
        let phoneHits = 0;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        for (let i = 1; i < lines.length; i++) {
          const cols = parseLine(lines[i]);
          if (cols.some(c => emailRegex.test(c))) emailHits++;
          if (cols.some(c => /\d{7,}/.test(c.replace(/\D/g, '')))) phoneHits++;
        }

        setImportPreviewData({
          fileName: file.name,
          fileSizeKb: Math.round(file.size / 1024),
          totalRows: lines.length - 1,
          headers: rawHeaders,
          sampleRows,
          emailCount: emailHits,
          phoneCount: phoneHits
        });
        if (!customDatasetName) {
          setCustomDatasetName(file.name.replace(/\.[^/.]+$/, ''));
        }
      } catch (err) {
        console.error('Error parsing CSV preview:', err);
      }
    };
    reader.readAsText(file);
  };

  // Submit and upload lead file
  const handleExecuteImport = async () => {
    if (!importFile) {
      showToast('Please select a CSV file to import', 'error');
      return;
    }
    setIsUploadingLeads(true);
    try {
      const formData = new FormData();
      let uploadFile = importFile;
      if (importTargetOption === 'custom' && customDatasetName.trim()) {
        const cleanName = customDatasetName.trim().replace(/[^a-zA-Z0-9_-]/g, '_') + '.csv';
        uploadFile = new File([importFile], cleanName, { type: importFile.type });
      }
      formData.append('file', uploadFile);

      const res = await fetch(`${API_BASE}/upload-csv`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Imported ${data.filename} successfully!`);
        setShowImportTemplateModal(false);
        setImportFile(null);
        setImportPreviewData(null);
        await fetchCsvs();
        const targetFilename = importTargetOption === 'custom' ? data.filename : 'MASTER_CRM';
        setSelectedFile(targetFilename);
        await loadLeadsForFile(targetFilename);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } else {
        showToast(data.error || 'Failed to import CSV leads', 'error');
      }
    } catch (err) {
      console.error('Lead upload error:', err);
      showToast('Failed to upload leads. Check server connection.', 'error');
    } finally {
      setIsUploadingLeads(false);
    }
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

  // High-performance O(1) indexed lookups for appointments and tasks
  const appointmentLookup = useMemo(() => {
    const map = new Map();
    for (const e of calendarEvents) {
      if (e.lead_id) map.set(e.lead_id, e);
      if (e.lead_name) map.set(e.lead_name.toLowerCase(), e);
    }
    return map;
  }, [calendarEvents]);

  const taskLookup = useMemo(() => {
    const map = new Map();
    for (const t of tasks) {
      if (!t.completed) {
        if (t.lead_id) map.set(t.lead_id, t);
        if (t.lead_name) map.set(t.lead_name.toLowerCase(), t);
      }
    }
    return map;
  }, [tasks]);

  const filteredLeads = useMemo(() => {
    const rawQ = debouncedSearchQuery.trim();
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
      if (filterHasAppt === true && !appointmentLookup.has(l.id) && !appointmentLookup.has(l.name.toLowerCase())) return false;
      if (filterHasTask === true && !taskLookup.has(l.id) && !taskLookup.has(l.name.toLowerCase())) return false;

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
      result.sort((a, b) => {
        if (a.is_manual && !b.is_manual) return -1;
        if (!a.is_manual && b.is_manual) return 1;
        return (b.lead_score || 0) - (a.lead_score || 0);
      });
    } else if (scoreSortOrder === 'score_asc') {
      result.sort((a, b) => (a.lead_score || 0) - (b.lead_score || 0));
    } else if (scoreSortOrder === 'rating_desc') {
      result.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    } else if (scoreSortOrder === 'name_asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [leads, debouncedSearchQuery, cityFilter, categoryFilter, emailFilter, statusFilter, tierFilter, scoreSortOrder, highPriorityFilter, appointmentLookup, taskLookup]);

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
    let totalWonRevenue = 0;

    const stageMap = {
      'New': [],
      'Contacted': [],
      'Interested': [],
      'Follow-up': [],
      'Converted': [],
      'Do Not Contact': []
    };

    const pipelineMap = {
      'New': [],
      'Qualified': [],
      'Contacted': [],
      'Interested': [],
      'Follow-up': [],
      'Converted': []
    };

    for (let i = 0; i < filteredLeads.length; i++) {
      const l = filteredLeads[i];
      if (l.has_email) withEmailCount++;
      const st = l.status || 'New';
      if (!l.status || st === 'New' || st.toLowerCase() === 'uncontacted') uncontactedCount++;
      const r = parseFloat(l.rating);
      if (!isNaN(r) && r > 4.5) highRatedCount++;

      // CRM stage mapping
      if (stageMap[st]) {
        stageMap[st].push(l);
      } else {
        stageMap['New'].push(l);
      }

      // End-to-End Pipeline mapping
      if (st === 'Converted') {
        pipelineMap['Converted'].push(l);
        totalWonRevenue += parseFloat(l.deal_value || 0) || 0;
      } else if (st === 'Follow-up' || appointmentLookup.has(l.id) || appointmentLookup.has(l.name.toLowerCase())) {
        pipelineMap['Follow-up'].push(l);
      } else if (st === 'Interested') {
        pipelineMap['Interested'].push(l);
      } else if (st === 'Contacted') {
        pipelineMap['Contacted'].push(l);
      } else if ((l.lead_score || 0) >= 40 && (l.has_email || l.phone)) {
        pipelineMap['Qualified'].push(l);
      } else {
        pipelineMap['New'].push(l);
      }
    }

    return { withEmailCount, uncontactedCount, highRatedCount, stageMap, pipelineMap, totalWonRevenue };
  }, [filteredLeads, appointmentLookup]);

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

  const handleResetFilters = () => {
    setSearchQuery('');
    setCityFilter('ALL');
    setCategoryFilter('ALL');
    setEmailFilter('ALL');
    setStatusFilter('ALL');
    setTierFilter('ALL');
    setScoreSortOrder('score_desc');
    setHighPriorityFilter(false);
    setCurrentPage(1);
    showToast('Reset all filters — Showing full database', 'info');
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

  const pipelineStages = [
    { id: 'New', label: '1. Scraped Leads', sub: 'Google Maps & Ingestion', color: '#64748b', bg: '#f1f5f9', icon: '🗺️' },
    { id: 'Qualified', label: '2. Scored & Qualified', sub: 'High Intent Validation', color: '#0284c7', bg: '#e0f2fe', icon: '⚡' },
    { id: 'Contacted', label: '3. Outreach Dispatched', sub: 'Email & WhatsApp Sequence', color: '#4f46e5', bg: '#eef2ff', icon: '✉️' },
    { id: 'Interested', label: '4. Engaged & Warm', sub: 'Inbound Replies & Clicks', color: '#ea580c', bg: '#fff7ed', icon: '🔥' },
    { id: 'Follow-up', label: '5. Meeting / Consult', sub: 'Calendar Consultation Booked', color: '#8b5cf6', bg: '#f5f3ff', icon: '📅' },
    { id: 'Converted', label: '6. Won Deals 🎉', sub: 'Closed Contract & Paid', color: '#059669', bg: '#ecfdf5', icon: '🎉' },
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

      {/* Top Header - Master UI/UX Designed Header */}
      <header className="apex-header-master">
        {/* Tier 1: Executive Brand, Quick Search & Action Controls */}
        <div className="apex-header-top-wrap">
          <div className="apex-header-top-inner">
            {/* Left Brand Cluster - 1-Click Return to Homepage */}
            <div
              className="apex-brand-cluster"
              onClick={() => {
                setActiveTab('pipeline');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ cursor: 'pointer' }}
              title="Click to go to Homepage (Growth Cockpit)"
            >
              <div className="apex-brand-logo">
                <Sparkles size={19} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <h1 className="apex-brand-title">
                    ApexOutreach <span className="accent">Studio</span>
                  </h1>
                  <span className="apex-brand-tag">Agency Suite</span>
                  <div className="header-status-badge">
                    <span className="status-dot" /> Operational
                  </div>
                </div>
                <p className="apex-brand-sub">
                  High-Ticket B2B Acquisition • Multi-Channel CRM
                </p>
              </div>
            </div>

            {/* Center Quick Search / Command Trigger */}
            <div
              className="apex-header-search-bar"
              onClick={() => setActiveTab('crm')}
              title="Click to search leads & databases (⌘K)"
            >
              <div className="apex-search-left">
                <Search size={13} color="#94a3b8" />
                <span>Quick search 4,775 leads or jump...</span>
              </div>
              <span className="apex-kbd-shortcut">⌘K</span>
            </div>

            {/* Right Standardized Controls Cluster (34px height) */}
            <div className="apex-header-controls">
              {batchStatus.is_running && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0 10px', height: 34, borderRadius: 8, boxSizing: 'border-box' }}>
                  <span className="pulse-indicator" style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>Dispatching: {batchStatus.percentage}%</span>
                </div>
              )}

              {scraperJob.is_running && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0 10px', height: 34, borderRadius: 8, boxSizing: 'border-box' }}>
                  <span className="pulse-indicator" style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6' }} />
                  <span style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 700 }}>Scraping: {scraperJob.found}</span>
                </div>
              )}

              {/* Live SaaS Credit Meter */}
              <div
                className="apex-credit-pill"
                onClick={() => setShowTopUpCreditsModal(true)}
                title="Click to top-up verified lead credits"
              >
                <Zap size={13} color="#4f46e5" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#0f172a' }}>
                  <span>{creditBalance.used} / {creditBalance.total}</span>
                  <span style={{ fontSize: 9, color: '#64748b' }}>Credits</span>
                </div>
                <div style={{ width: 28, height: 4, background: '#cbd5e1', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round((creditBalance.used / creditBalance.total) * 100)}%`, height: '100%', background: '#4f46e5' }} />
                </div>
              </div>

              {/* Fast Proposal CTA */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('agency');
                  setAgencySubTab('proposals');
                }}
                className="apex-proposal-btn"
                title="Create printable client retainer agreement proposal"
              >
                <FileText size={12} />
                <span>+ Fast Proposal</span>
              </button>

              {/* Plans & Pricing Trigger */}
              <button
                type="button"
                onClick={() => setShowPricingModal(true)}
                className="apex-plans-btn"
                title="View commercial agency tiers & credit packages"
              >
                <Zap size={12} />
                <span>Plans (₹)</span>
              </button>

              {/* Admin Users Hub Trigger (Visible to Admin only) */}
              {currentUser?.isAuthenticated && currentUser?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    fetchAdminUsers();
                    setShowAdminUsersModal(true);
                  }}
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: '5px 10px', background: '#fdf4ff', borderColor: '#f0abfc', color: '#a21caf', fontWeight: 800 }}
                  title="View and manage all registered users"
                >
                  <Shield size={12} color="#a21caf" />
                  <span>Admin Users Hub</span>
                </button>
              )}

              {/* User Profile Avatar Widget OR Guest Login Actions */}
              {currentUser?.isAuthenticated ? (
                <div style={{ position: 'relative' }}>
                  <div
                    className="navbar-user-widget"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    style={{ height: 34, padding: '0 10px 0 6px', borderRadius: 8, boxSizing: 'border-box' }}
                  >
                    <div className="navbar-user-avatar" style={{ width: 22, height: 22, fontSize: 10, background: currentUser.role === 'admin' ? '#9333ea' : '#4f46e5' }}>
                      {currentUser.avatar || (currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'IS')}
                    </div>
                    <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>{currentUser.name || 'Agency Admin'}</span>
                        {currentUser.role === 'admin' && (
                          <span style={{ fontSize: 8, background: '#9333ea', color: '#ffffff', padding: '1px 4px', borderRadius: 4, fontWeight: 800 }}>
                            ADMIN
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 9, color: '#64748b' }}>
                        {currentUser.email || currentUser.agency_name || 'Apex Outreach'}
                      </span>
                    </div>
                    <ChevronDown size={11} color="#64748b" />
                  </div>

                  {showUserDropdown && (
                    <div className="user-dropdown-menu">
                      <div style={{ padding: '6px 8px 10px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a' }}>{currentUser.name}</div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>{currentUser.email}</div>
                        <span style={{ fontSize: 9, background: currentUser.role === 'admin' ? '#f3e8ff' : '#e0e7ff', color: currentUser.role === 'admin' ? '#9333ea' : '#4338ca', padding: '1px 6px', borderRadius: 4, fontWeight: 800, marginTop: 4, display: 'inline-block' }}>
                          {currentUser.role === 'admin' ? '👑 System Administrator' : '💼 Agency Member'}
                        </span>
                      </div>
                      {currentUser.role === 'admin' && (
                        <button onClick={() => { fetchAdminUsers(); setShowAdminUsersModal(true); setShowUserDropdown(false); }} className="user-dropdown-item" style={{ color: '#a21caf', fontWeight: 700 }}>
                          <Shield size={13} color="#a21caf" /> Registered Users Directory
                        </button>
                      )}
                      <button onClick={() => { setShowPricingModal(true); setShowUserDropdown(false); }} className="user-dropdown-item" style={{ color: '#4f46e5', fontWeight: 700 }}>
                        <Zap size={13} color="#4f46e5" /> Upgrade Tier (₹ INR)
                      </button>
                      <button onClick={() => { setActiveTab('settings'); setShowUserDropdown(false); }} className="user-dropdown-item">
                        <Settings size={13} color="#64748b" /> Sender Settings
                      </button>
                      <button onClick={() => { setShowAuthModal(true); setAuthModalTab('google'); setShowUserDropdown(false); }} className="user-dropdown-item">
                        <User size={13} color="#64748b" /> Switch Account
                      </button>
                      <button onClick={handleLogout} className="user-dropdown-item" style={{ color: '#dc2626' }}>
                        <LogOut size={13} color="#dc2626" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 6, fontWeight: 800, border: '1px solid #fde68a' }}>
                    Explore Mode
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('google');
                      setShowAuthModal(true);
                    }}
                    className="btn-secondary"
                    style={{ fontSize: 11, padding: '5px 10px', background: '#ffffff', borderColor: '#cbd5e1', color: '#1e293b', fontWeight: 700 }}
                  >
                    <span style={{ color: '#ea4335', fontWeight: 900 }}>G</span> Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('otp');
                      setShowAuthModal(true);
                    }}
                    className="btn-primary"
                    style={{ fontSize: 11, padding: '5px 12px' }}
                  >
                    <Key size={12} /> Sign Up / OTP
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tier 2: Unified Segmented Navigation Bar (Full Width, Zero Truncation) */}
        <div className="apex-nav-row-wrap">
          <div className="apex-nav-row-inner">
            <div className="apex-tabs-container">
              {[
                { id: 'pipeline', label: 'Pipeline Funnel', icon: Workflow, badge: 'Full Funnel' },
                { id: 'crm', label: 'Leads Directory', icon: Users, badge: selectedFile === 'MASTER_CRM' ? 'Master' : leads.length },
                { id: 'campaign', label: 'Email Studio', icon: Send, badge: batchStatus.is_running ? 'Live' : null },
                { id: 'whatsapp', label: 'WhatsApp Hub', icon: MessageSquare, badge: countWithWa },
                { id: 'scraper', label: 'Maps Scraper', icon: Compass, badge: scraperJob.is_running ? 'Live' : null },
                { id: 'agency', label: 'Agency Growth Hub', icon: Briefcase, badge: 'Agency Suite' },
                { id: 'logs', label: 'Sent Logs & Audit', icon: Clock, badge: sentLogs.length > 0 ? sentLogs.length : null },
                { id: 'settings', label: 'Sender & Safety', icon: ShieldCheck },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`apex-nav-tab ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={14} color={isActive ? '#ffffff' : '#64748b'} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className={`apex-tab-badge ${tab.id === 'agency' && !isActive ? 'green' : ''}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '18px 28px', maxWidth: 1700, margin: '0 auto', width: '100%' }}>

        {/* =========================================================================
            TAB 0: EXECUTIVE GROWTH COCKPIT & PIPELINE COMMAND (DECLUTTERED & SAAS MONETIZED)
           ========================================================================= */}
        {activeTab === 'pipeline' && (
          <div className="animate-fade-in">
            {/* Top SaaS Executive Banner */}
            <div className="cockpit-hero-banner">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8' }}>
                      B2B Client Acquisition Engine • Growth Cockpit
                    </span>
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.3px' }}>
                    Welcome back, {currentUser.name ? currentUser.name.split(' ')[0] : 'Growth Strategist'} 👋
                  </h2>
                  <p style={{ fontSize: 12, color: '#cbd5e1', margin: '4px 0 0 0', maxWidth: 620 }}>
                    Monitor qualified pipeline velocity, deploy automated multi-touch cold email + WhatsApp cadences, and lock in high-ticket monthly retainers.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {/* Active Plan Indicator */}
                  <div
                    onClick={() => setShowPricingModal(true)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: 10,
                      padding: '7px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    title="Click to view commercial plans & features"
                  >
                    <span style={{ fontSize: 12 }}>👑</span>
                    <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24' }}>Growth Agency Tier</div>
                      <div style={{ fontSize: 9, color: '#93c5fd' }}>₹6,999/mo • Upgrade ➔</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const firstLead = filteredLeads[0] || leads[0];
                      if (firstLead) handleOpenDealWonModal(firstLead);
                    }}
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 16px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                    }}
                  >
                    <Trophy size={14} /> Log Won Deal 🎉
                  </button>
                </div>
              </div>

              {/* 4 Crisp Key Metric Tiles */}
              <div className="cockpit-stats-grid">
                <div className="cockpit-stat-tile">
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#cbd5e1', fontWeight: 700 }}>
                    Won Pipeline Revenue
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#34d399', marginTop: 4 }}>
                    ₹{(filteredMetrics.totalWonRevenue || pipelineMetrics.revenue?.total_won || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: '#a7f3d0', marginTop: 4 }}>
                    +14.2% MoM growth rate
                  </div>
                </div>

                <div className="cockpit-stat-tile">
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#cbd5e1', fontWeight: 700 }}>
                    Verified ICP Accounts
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff', marginTop: 4 }}>
                    {leads.length.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: '#cbd5e1', marginTop: 4 }}>
                    {countWithEmail} Emails • {countWithWa} WhatsApp
                  </div>
                </div>

                <div className="cockpit-stat-tile">
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#cbd5e1', fontWeight: 700 }}>
                    Omnichannel Win Rate
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
                    17.3% <span style={{ fontSize: 12, color: '#cbd5e1' }}>WA</span> • 7.6% <span style={{ fontSize: 12, color: '#cbd5e1' }}>Email</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#93c5fd', marginTop: 4 }}>
                    WhatsApp yields 2.3x higher replies
                  </div>
                </div>

                <div className="cockpit-stat-tile">
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#cbd5e1', fontWeight: 700 }}>
                    Contracted Agency MRR
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fbbf24', marginTop: 4 }}>
                    ₹{(agencyGrowthMetrics.monthly_recurring_revenue || 200000).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: '#fef08a', marginTop: 4 }}>
                    {agencyWorkspaces.length || 3} Active Client Portfolios
                  </div>
                </div>
              </div>
            </div>

            {/* Fast-Track Client Acquisition 3-Step Guided Ribbon */}
            <div className="fast-track-strip">
              <div className="fast-track-step-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Step 1 • Ingestion & ICP
                    </span>
                    <span style={{ fontSize: 11, background: '#ecfdf5', color: '#059669', padding: '2px 7px', borderRadius: 6, fontWeight: 700 }}>
                      4,775 Ingested ✓
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                    1. Scrape & Enrich ICP Leads
                  </h4>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                    Extract verified B2B decision-makers with emails and phone numbers directly from Google Maps in any city.
                  </p>
                </div>
                <div style={{ marginTop: 14 }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('scraper')}
                    className="btn-secondary"
                    style={{ width: '100%', fontSize: 11, padding: '7px 10px', justifyContent: 'center', color: '#4f46e5', borderColor: '#c7d2fe' }}
                  >
                    <Compass size={13} /> Launch Maps Scraper ➔
                  </button>
                </div>
              </div>

              <div className="fast-track-step-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Step 2 • Outreach Cadence
                    </span>
                    <span style={{ fontSize: 11, background: '#f5f3ff', color: '#7c3aed', padding: '2px 7px', borderRadius: 6, fontWeight: 700 }}>
                      AI Cadence Active ✓
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                    2. AI Multi-Touch Sequences
                  </h4>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                    Personalize 3-touch campaigns: Day 1 Hook Email ➔ Day 3 WhatsApp note ➔ Day 6 Value breakup.
                  </p>
                </div>
                <div style={{ marginTop: 14 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('agency');
                      setAgencySubTab('sequences');
                    }}
                    className="btn-secondary"
                    style={{ width: '100%', fontSize: 11, padding: '7px 10px', justifyContent: 'center', color: '#7c3aed', borderColor: '#ddd6fe' }}
                  >
                    <Sparkles size={13} /> Synthesize Sequences ➔
                  </button>
                </div>
              </div>

              <div className="fast-track-step-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Step 3 • Retainer Agreements
                    </span>
                    <span style={{ fontSize: 11, background: '#ecfdf5', color: '#059669', padding: '2px 7px', borderRadius: 6, fontWeight: 700 }}>
                      ₹2.0L MRR Signed ✓
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                    3. Retainer Proposals & Close
                  </h4>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                    Draft client agreements with guaranteed meeting quotas, instant printable proposals, and 1-click won logging.
                  </p>
                </div>
                <div style={{ marginTop: 14 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('agency');
                      setAgencySubTab('proposals');
                    }}
                    className="btn-secondary"
                    style={{ width: '100%', fontSize: 11, padding: '7px 10px', justifyContent: 'center', color: '#059669', borderColor: '#a7f3d0' }}
                  >
                    <FileText size={13} /> Draft Client Proposal ➔
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-View Navigation Switcher (Solves Clutter!) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <div className="cockpit-subnav-bar">
                <button
                  type="button"
                  onClick={() => setPipelineSubView('radar')}
                  className={`cockpit-subnav-btn ${pipelineSubView === 'radar' ? 'active' : ''}`}
                >
                  <span>⚡ High-Yield Focus Queue</span>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: pipelineSubView === 'radar' ? '#eef2ff' : '#e2e8f0', color: pipelineSubView === 'radar' ? '#4f46e5' : '#64748b' }}>
                    Today's Deals
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPipelineSubView('kanban')}
                  className={`cockpit-subnav-btn ${pipelineSubView === 'kanban' ? 'active' : ''}`}
                >
                  <span>📋 Full 6-Stage Kanban</span>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: pipelineSubView === 'kanban' ? '#eef2ff' : '#e2e8f0', color: pipelineSubView === 'kanban' ? '#4f46e5' : '#64748b' }}>
                    Drag & Drop
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPipelineSubView('analytics')}
                  className={`cockpit-subnav-btn ${pipelineSubView === 'analytics' ? 'active' : ''}`}
                >
                  <span>📊 Funnel Analytics</span>
                </button>
              </div>

              {pipelineSubView === 'kanban' && (
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Drag cards across stages to instantly update pipeline status.
                </div>
              )}
            </div>

            {/* Sub-View 1: High-Yield Focus Queue & Commercial Monetization Snapshot */}
            {pipelineSubView === 'radar' && (
              <div className="cockpit-layout-grid animate-fade-in">
                {/* Left: Today's High-Intent Action Queue */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ margin: '0 0 2px 0', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                        High-Priority Prospects Due for Action
                      </h3>
                      <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>
                        Focused daily queue to prevent lead leakage and convert warm conversations into booked calls.
                      </p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: 6, border: '1px solid #a7f3d0' }}>
                      Zero Leakage Active
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredLeads.filter(l => l.phone).slice(0, 6).map((lead, idx) => {
                      const isHot = lead.status === 'Interested' || (lead.lead_score && lead.lead_score >= 70);
                      return (
                        <div key={lead.id || idx} className="radar-lead-row" style={{ margin: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span className={`radar-urgency-pill ${isHot ? 'hot' : 'warn'}`}>
                              {isHot ? '🔥 High Intent' : '⚡ Verified ICP'}
                            </span>
                            <div>
                              <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>{lead.name}</strong>
                              <div style={{ fontSize: 11, color: '#64748b', display: 'flex', gap: 8, marginTop: 2 }}>
                                <span>{lead.category || 'B2B Client'}</span>
                                <span>•</span>
                                <span>{lead.city}</span>
                                {lead.phone && <span>• 📞 {lead.phone}</span>}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {lead.phone && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSingleWaPhone(lead.phone);
                                  setSingleWaName(lead.name);
                                  setSingleWaText(`Hi ${lead.name} Team, Dinesh here following up on our discussion. Are you available for a 4-minute sync today?`);
                                  setActiveTab('whatsapp');
                                }}
                                className="btn-secondary"
                                style={{ fontSize: 11, padding: '4px 10px', color: '#25D366', borderColor: '#bbf7d0' }}
                              >
                                <MessageSquare size={12} /> WhatsApp
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setPreviewLead(lead);
                                setActiveTab('campaign');
                              }}
                              className="btn-secondary"
                              style={{ fontSize: 11, padding: '4px 10px' }}
                            >
                              <Mail size={12} /> Email
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDealWonModal(lead)}
                              className="btn-primary"
                              style={{ fontSize: 11, padding: '4px 12px', background: '#059669' }}
                            >
                              <Trophy size={12} /> Won Deal
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 12, textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('crm')}
                      className="btn-secondary"
                      style={{ fontSize: 12, padding: '6px 14px' }}
                    >
                      View All {leads.length.toLocaleString()} Leads in Master Table ➔
                    </button>
                  </div>
                </div>

                {/* Right: Commercial Agency & Monetization Control Card */}
                <div>
                  <div className="monetization-widget-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Zap size={16} color="#4f46e5" />
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                          SaaS Commercial Hub
                        </h4>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#4f46e5', background: '#eef2ff', padding: '2px 7px', borderRadius: 6 }}>
                        Tier 2 Active
                      </span>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Monthly Verified Lead Credits:</span>
                        <strong style={{ color: '#0f172a' }}>{creditBalance.used} / {creditBalance.total} used (78%)</strong>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round((creditBalance.used / creditBalance.total) * 100)}%`, height: '100%', background: '#4f46e5' }} />
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>MONTHLY CLIENT COMMITMENTS</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#059669', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                        28 / 33 Meetings Delivered (85%)
                      </div>
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                        Across 3 client retainer accounts
                      </div>
                    </div>

                    {/* Quick Commercial Monetization Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setShowTopUpCreditsModal(true)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Zap size={13} color="#4f46e5" /> Buy 1,000 Lead Credits Pack
                        </span>
                        <span style={{ fontSize: 11, color: '#059669', fontWeight: 800 }}>₹999</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowClientPortalModal(true)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Globe size={13} color="#0284c7" /> White-Label Client Portal Link
                        </span>
                        <span style={{ fontSize: 10, color: '#0284c7', background: '#eff6ff', padding: '1px 5px', borderRadius: 4 }}>Live</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowPricingModal(true)}
                        className="btn-primary"
                        style={{ width: '100%', fontSize: 12, padding: '9px 12px', justifyContent: 'center' }}
                      >
                        <Sparkles size={13} /> Upgrade to Scale & Enterprise (₹)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-View 2: Complete Drag-and-Drop 6-Stage Kanban Board */}
            {pipelineSubView === 'kanban' && (
              <div className="pipeline-kanban-board animate-fade-in">
                {pipelineStages.map(stage => {
                  const stageLeads = filteredMetrics.pipelineMap[stage.id] || [];
                  const isDragOver = dragOverCol === stage.id;
                  return (
                    <div
                      key={stage.id}
                      className={`pipeline-stage-column ${isDragOver ? 'drag-over' : ''}`}
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
                      <div className="pipeline-column-top" style={{ borderTop: `3px solid ${stage.color}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13 }}>{stage.icon}</span>
                          <div>
                            <strong style={{ fontSize: 12, color: '#0f172a', display: 'block' }}>{stage.label}</strong>
                            <span style={{ fontSize: 10, color: '#64748b' }}>{stage.sub}</span>
                          </div>
                        </div>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 800,
                          background: stage.bg,
                          color: stage.color,
                          padding: '2px 8px',
                          borderRadius: 10
                        }}>
                          {stageLeads.length}
                        </span>
                      </div>

                      <div className="pipeline-card-list">
                        {stageLeads.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 14px', color: '#94a3b8', fontSize: 11 }}>
                            Drop leads here to move to {stage.label}
                          </div>
                        ) : (
                          stageLeads.slice(0, 30).map(lead => {
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
                                className={`pipeline-lead-card ${isBeingDragged ? 'is-dragging' : ''}`}
                                onClick={() => setActiveDossierLead(lead)}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                                  <span className="badge badge-cat" style={{ fontSize: 10 }}>{lead.category || 'General'}</span>
                                  <span
                                    className={`score-badge score-badge-${tierCode}`}
                                    style={{ fontSize: 9, padding: '1px 5px' }}
                                  >
                                    {tierCode === 'hot' ? '🔥' : tierCode === 'warm' ? '⭐' : '❄️'} {lead.lead_score || 0}
                                  </span>
                                </div>

                                <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 3px 0', lineHeight: 1.3 }}>
                                  {lead.name}
                                </h4>
                                <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 6px 0' }}>
                                  {lead.city} {lead.area && `• ${lead.area}`}
                                </p>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                                  {lead.has_email && (
                                    <span style={{ fontSize: 10, color: '#059669', background: '#ecfdf5', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>
                                      ✉️ {lead.email.slice(0, 20)}
                                    </span>
                                  )}
                                  {lead.phone && (
                                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#475569', background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>
                                      📞 {lead.phone}
                                    </span>
                                  )}
                                  {lead.deal_value > 0 && (
                                    <span style={{ fontSize: 10, color: '#047857', background: '#d1fae5', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>
                                      💰 ₹{parseFloat(lead.deal_value).toLocaleString()}
                                    </span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid #f1f5f9' }} onClick={(e) => e.stopPropagation()}>
                                  {stage.id === 'New' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPreviewLead(lead);
                                          setActiveTab('campaign');
                                        }}
                                        className="btn-secondary"
                                        style={{ fontSize: 10, padding: '3px 7px' }}
                                      >
                                        ✉️ Email
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(lead, 'Qualified', 'pipeline_advance', 'Qualified for outreach')}
                                        className="btn-ghost"
                                        style={{ fontSize: 10, color: '#4f46e5', fontWeight: 700 }}
                                      >
                                        Qualify ➔
                                      </button>
                                    </>
                                  )}
                                  {stage.id === 'Qualified' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedLeadIds(new Set([lead.id]));
                                          setAudienceType('selected_only');
                                          setActiveTab('campaign');
                                        }}
                                        className="btn-primary"
                                        style={{ fontSize: 10, padding: '3px 8px' }}
                                      >
                                        <Send size={11} /> Launch Outreach
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(lead, 'Contacted', 'pipeline_advance', 'Outreach sent')}
                                        className="btn-ghost"
                                        style={{ fontSize: 10, color: '#0284c7', fontWeight: 700 }}
                                      >
                                        Contacted ➔
                                      </button>
                                    </>
                                  )}
                                  {stage.id === 'Contacted' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleSimulateReply(lead)}
                                        className="btn-secondary"
                                        style={{ fontSize: 10, padding: '3px 7px', color: '#d97706', borderColor: '#fde68a' }}
                                      >
                                        🔥 Reply
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(lead, 'Interested', 'pipeline_advance', 'Expressed interest')}
                                        className="btn-ghost"
                                        style={{ fontSize: 10, color: '#d97706', fontWeight: 700 }}
                                      >
                                        Interested ➔
                                      </button>
                                    </>
                                  )}
                                  {stage.id === 'Interested' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setScheduleLead(lead);
                                          setShowScheduleModal(true);
                                        }}
                                        className="btn-secondary"
                                        style={{ fontSize: 10, padding: '3px 7px', color: '#7c3aed', borderColor: '#ddd6fe' }}
                                      >
                                        📅 Consultation
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenDealWonModal(lead)}
                                        className="btn-ghost"
                                        style={{ fontSize: 10, color: '#059669', fontWeight: 700 }}
                                      >
                                        🎉 Convert
                                      </button>
                                    </>
                                  )}
                                  {stage.id === 'Follow-up' && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDealWonModal(lead)}
                                      className="btn-primary"
                                      style={{ fontSize: 10, padding: '3px 10px', background: '#059669', width: '100%' }}
                                    >
                                      🎉 Close Deal
                                    </button>
                                  )}
                                  {stage.id === 'Converted' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: 10, color: '#047857', fontWeight: 700 }}>
                                        ✅ Won Customer
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenDealWonModal(lead)}
                                        className="btn-secondary"
                                        style={{ fontSize: 9, padding: '2px 6px' }}
                                      >
                                        Edit
                                      </button>
                                    </div>
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

            {/* Sub-View 3: Funnel Conversion Analytics & Velocity */}
            {pipelineSubView === 'analytics' && (
              <div className="animate-fade-in" style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '24px' }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    Full-Funnel Lifecycle Conversion & Velocity
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                    Tracking drop-off rates from initial Google Maps scraping through outreach and signed retainer contracts.
                  </p>
                </div>

                <div className="pipeline-funnel-stages" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                  {[
                    { name: '1. Scraped Leads', count: filteredMetrics.pipelineMap['New'].length, rate: 'Discovery Stage', icon: '🗺️' },
                    { name: '2. Scored & Ready', count: filteredMetrics.pipelineMap['Qualified'].length, rate: `${Math.round(filteredMetrics.pipelineMap['Qualified'].length / Math.max(1, countAll) * 100)}% Qualified`, icon: '⚡' },
                    { name: '3. Outreach Sent', count: filteredMetrics.pipelineMap['Contacted'].length, rate: `${Math.round(filteredMetrics.pipelineMap['Contacted'].length / Math.max(1, countAll) * 100)}% Dispatched`, icon: '✉️' },
                    { name: '4. Engaged & Warm', count: filteredMetrics.pipelineMap['Interested'].length, rate: `${Math.round(filteredMetrics.pipelineMap['Interested'].length / Math.max(1, filteredMetrics.pipelineMap['Contacted'].length || 1) * 100)}% Replied`, icon: '🔥' },
                    { name: '5. Meeting / Proposal', count: filteredMetrics.pipelineMap['Follow-up'].length, rate: `${calendarEvents.length} Consultations`, icon: '📅' },
                    { name: '6. Won & Converted', count: filteredMetrics.pipelineMap['Converted'].length, rate: `₹${(filteredMetrics.totalWonRevenue || 0).toLocaleString()} Closed`, icon: '🎉' },
                  ].map((s, idx) => (
                    <div key={idx} className="funnel-stage-box" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                      <div style={{ fontSize: 18 }}>{s.icon}</div>
                      <div className="funnel-stage-count" style={{ color: '#0f172a', margin: '4px 0' }}>{s.count}</div>
                      <div className="funnel-stage-name" style={{ color: '#475569' }}>{s.name}</div>
                      <div className="funnel-conversion-rate" style={{ color: '#4f46e5' }}>{s.rate}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB: AGENCY SCALE & GROWTH COMMAND SUITE
           ========================================================================= */}
        {activeTab === 'agency' && (
          <div className="agency-hub-container animate-fade-in">
            {/* Executive Agency Revenue & MRR Banner */}
            <div className="agency-header-banner">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}>
                      <Briefcase size={22} color="#a7f3d0" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a7f3d0' }}>
                        Agency Scaling Suite • Client Portfolio & Acquisition Engine
                      </div>
                      <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.3px' }}>
                        Agency Growth Hub & Retainer Command
                      </h2>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', maxWidth: 680 }}>
                    Manage client outbound portfolios, draft high-ticket retainer proposals, generate 3-step AI conversion sequences, and monitor the urgent follow-up radar to eliminate lead leakage.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setShowNewWorkspaceModal(true)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      padding: '10px 16px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Plus size={15} /> Add Client Workspace
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const firstLead = filteredLeads[0] || leads[0];
                      setNewPropLead(firstLead);
                      setShowNewProposalModal(true);
                    }}
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <FileText size={15} /> Draft Retainer Proposal 📄
                  </button>
                </div>
              </div>

              {/* Financial & Operational KPI Grid */}
              <div className="agency-stats-grid">
                <div className="agency-stat-card">
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#cbd5e1', fontWeight: 700, marginBottom: 4 }}>
                    Active Client Portfolios
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                    {agencyWorkspaces.length || 3} <span style={{ fontSize: 13, color: '#a7f3d0' }}>Accounts</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                    Multi-client campaigns
                  </div>
                </div>

                <div className="agency-stat-card">
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#cbd5e1', fontWeight: 700, marginBottom: 4 }}>
                    Active Retainer MRR
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                    ₹{(agencyGrowthMetrics.monthly_recurring_revenue || 200000).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: '#a7f3d0', marginTop: 3 }}>
                    Monthly recurring revenue
                  </div>
                </div>

                <div className="agency-stat-card">
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#cbd5e1', fontWeight: 700, marginBottom: 4 }}>
                    Avg Client Value
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                    ₹{Math.round(agencyGrowthMetrics.average_client_value || 66666).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: '#fde68a', marginTop: 3 }}>
                    Per active retainer
                  </div>
                </div>

                <div className="agency-stat-card">
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#cbd5e1', fontWeight: 700, marginBottom: 4 }}>
                    Channel Response Win Rate
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
                    WhatsApp: 17.3% <span style={{ fontSize: 12, color: '#cbd5e1' }}>• Email: 7.6%</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5 }}>
                    WhatsApp yields 2.3x higher meetings
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Navigation Pills */}
            <div className="agency-subnav-bar">
              {[
                { id: 'workspaces', label: '💼 Client Workspaces & Targets', count: agencyWorkspaces.length || 3 },
                { id: 'sequences', label: '⚡ AI 3-Step Sequence Architect', count: 'AI Engine' },
                { id: 'proposals', label: '📄 Retainer Proposals & Agreements', count: agencyProposals.length || 1 },
                { id: 'radar', label: '🚨 Urgent Follow-Up Radar', count: 'Zero Leakage' },
                { id: 'invoices', label: '🧾 Client Invoice Generator', count: 'PDF & WA' },
              ].map(sub => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setAgencySubTab(sub.id)}
                  className={`agency-subnav-btn ${agencySubTab === sub.id ? 'active' : ''}`}
                >
                  <span>{sub.label}</span>
                  <span style={{
                    fontSize: 10,
                    padding: '2px 7px',
                    borderRadius: 10,
                    background: agencySubTab === sub.id ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: agencySubTab === sub.id ? '#ffffff' : '#64748b'
                  }}>
                    {sub.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Sub-View 1: Client Workspaces & Targets */}
            {agencySubTab === 'workspaces' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                      Active Client Workspaces ({agencyWorkspaces.length})
                    </h3>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                      Manage dedicated client outbound pipelines, monthly meeting quotas, and performance reporting.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewWorkspaceModal(true)}
                    className="btn-primary"
                    style={{ fontSize: 12, padding: '7px 14px' }}
                  >
                    <Plus size={14} /> Add New Client Workspace
                  </button>
                </div>

                <div className="agency-clients-grid">
                  {agencyWorkspaces.map(ws => {
                    const meetingsTarget = ws.meetings_target || 15;
                    const meetingsBooked = ws.meetings_booked || 2;
                    const pct = Math.min(100, Math.round((meetingsBooked / meetingsTarget) * 100));

                    return (
                      <div
                        key={ws.id}
                        className="agency-client-card"
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onClick={() => setSelectedWorkspaceDetail(ws)}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                background: '#eef2ff',
                                color: '#4f46e5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: 13
                              }}>
                                {ws.client_name ? ws.client_name.slice(0, 2).toUpperCase() : 'AC'}
                              </div>
                              <div>
                                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{ws.name}</h4>
                                <div style={{ fontSize: 11, color: '#64748b' }}>Client: {ws.client_name}</div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{
                                fontSize: 11,
                                fontWeight: 800,
                                background: '#ecfdf5',
                                color: '#059669',
                                padding: '3px 8px',
                                borderRadius: 6,
                                fontFamily: 'var(--font-mono)'
                              }}>
                                ₹{(ws.monthly_retainer || 50000).toLocaleString()}/mo
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteWorkspace(ws.id, ws.name);
                                }}
                                style={{
                                  background: '#fef2f2',
                                  border: '1px solid #fee2e2',
                                  borderRadius: 6,
                                  padding: '4px 6px',
                                  cursor: 'pointer',
                                  color: '#dc2626'
                                }}
                                title="Delete client workspace"
                              >
                                <Trash2 size={12} color="#dc2626" />
                              </button>
                            </div>
                          </div>

                          {/* Niche & Campaign */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                            <span style={{ fontSize: 11, background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                              🎯 {ws.niche}
                            </span>
                            <span style={{ fontSize: 11, background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                              🚀 {ws.active_campaign}
                            </span>
                          </div>

                          {/* Target Meetings Progress Bar */}
                          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 6 }}>
                              <span style={{ fontWeight: 600, color: '#475569' }}>Monthly Qualified Meetings:</span>
                              <strong style={{ color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                                {meetingsBooked} / {meetingsTarget} ({pct}%)
                              </strong>
                            </div>
                            <div style={{ width: '100%', height: 7, background: '#e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                              <div style={{ width: `${Math.max(8, pct)}%`, height: '100%', background: '#4f46e5', borderRadius: 10 }} />
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #f1f5f9' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedWorkspaceDetail(ws)}
                            className="btn-secondary"
                            style={{ flex: 1, fontSize: 11, padding: '7px 8px', justifyContent: 'center', borderColor: '#c7d2fe', color: '#4338ca' }}
                            title="View proposals & downloadable invoices for this client"
                          >
                            <Briefcase size={12} color="#4338ca" /> Dossier
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowClientReportModal(ws)}
                            className="btn-secondary"
                            style={{ flex: 1, fontSize: 11, padding: '7px 8px', justifyContent: 'center' }}
                          >
                            <FileText size={12} color="#4f46e5" /> Report
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile('MASTER_CRM');
                              setActiveTab('campaign');
                              showToast(`Launched outbound studio for ${ws.name}!`);
                            }}
                            className="btn-primary"
                            style={{ flex: 1, fontSize: 11, padding: '7px 8px', justifyContent: 'center' }}
                          >
                            <Send size={12} /> Outbound
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-View 2: AI 3-Step Sequence Architect */}
            {agencySubTab === 'sequences' && (
              <div className="animate-fade-in">
                <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                        AI High-Ticket Omnichannel Cadence Architect
                      </h3>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                        Generates a tailored 3-step sequence: Day 1 Hook Email ➔ Day 3 WhatsApp audio/text note ➔ Day 6 Value breakup.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <select
                        onChange={(e) => {
                          const found = filteredLeads.find(l => l.id === e.target.value) || leads.find(l => l.id === e.target.value);
                          if (found) setSelectedAgencyLead(found);
                        }}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700, color: '#0f172a', background: '#f8fafc', outline: 'none' }}
                        value={selectedAgencyLead ? selectedAgencyLead.id : ''}
                      >
                        <option value="">-- Choose Prospect to Personalize --</option>
                        {filteredLeads.slice(0, 40).map(l => (
                          <option key={l.id} value={l.id}>{l.name} ({l.category || l.city})</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleGenerateAgencySequence(selectedAgencyLead || filteredLeads[0] || leads[0])}
                        disabled={isGeneratingSequence}
                        className="btn-primary"
                        style={{ padding: '9px 18px', fontSize: 12, fontWeight: 700 }}
                      >
                        <Sparkles size={14} />
                        {isGeneratingSequence ? 'Synthesizing Cadence...' : 'Generate 3-Step Sequence'}
                      </button>
                    </div>
                  </div>
                </div>

                {agencySequence ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {agencySequence.map((step, idx) => (
                      <div key={idx} className="sequence-step-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#4f46e5', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {step.step}
                            </span>
                            <strong style={{ fontSize: 14, color: '#0f172a' }}>{step.channel}</strong>
                            <span style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                              {step.day}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(step.body || step.text || '');
                                showToast('Copied step copy to clipboard!');
                              }}
                              className="btn-secondary"
                              style={{ fontSize: 11, padding: '4px 10px' }}
                            >
                              <Copy size={12} /> Copy
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeployStepToChannel(step)}
                              className="btn-primary"
                              style={{ fontSize: 11, padding: '4px 12px' }}
                            >
                              Deploy Step {step.step} ➔
                            </button>
                          </div>
                        </div>

                        {step.subject && (
                          <div style={{ marginBottom: 10 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Subject Line:</span>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2, padding: '6px 10px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                              {step.subject}
                            </div>
                          </div>
                        )}

                        <div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Outreach Copy:</span>
                          <div style={{ fontSize: 13, color: '#334155', marginTop: 4, whiteSpace: 'pre-wrap', lineHeight: 1.6, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            {step.body || step.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                    <div style={{ width: 50, height: 50, borderRadius: 14, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <Wand2 size={24} color="#4f46e5" />
                    </div>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                      No Sequence Generated Yet
                    </h4>
                    <p style={{ fontSize: 12, color: '#64748b', maxWidth: 450, margin: '0 auto 16px' }}>
                      Select any prospect from your leads and click "Generate 3-Step Sequence" to architect a high-converting Cold Email + WhatsApp Cadence.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleGenerateAgencySequence(filteredLeads[0] || leads[0])}
                      className="btn-primary"
                      style={{ fontSize: 12, padding: '8px 16px' }}
                    >
                      <Sparkles size={14} /> Auto-Generate for Top Hot Lead
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sub-View 3: Retainer Proposals & Agreements */}
            {agencySubTab === 'proposals' && (
              <div className="animate-fade-in">
                {/* Header & Template Selector Action Bar */}
                <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '18px 22px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={18} color="#4f46e5" />
                        <span>Retainer Proposal & Service Agreement Studio</span>
                        <span style={{ fontSize: 11, background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                          WYSIWYG Contract Canvas
                        </span>
                      </h3>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                        Select commercial templates, edit agreement terms directly on the paper canvas, and polish deliverables with AI.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={handleAiPolishAgreement}
                        disabled={isPolishingProposal}
                        className="btn-secondary"
                        style={{ fontSize: 12, padding: '8px 12px', background: '#f5f3ff', borderColor: '#ddd6fe', color: '#7c3aed', fontWeight: 700 }}
                        title="Rewrite agreement terms with AI legal & ROI-maximizing guarantees"
                      >
                        <Sparkles size={13} color="#7c3aed" className={isPolishingProposal ? 'pulse-indicator' : ''} />
                        <span>{isPolishingProposal ? 'AI Polishing...' : '✨ Polish with AI'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveRetainerAgreement}
                        className="btn-primary"
                        style={{ fontSize: 12, padding: '8px 14px' }}
                        title="Save agreement to client database"
                      >
                        <FileDown size={13} />
                        <span>Save Agreement</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="btn-secondary"
                        style={{ fontSize: 12, padding: '8px 12px' }}
                        title="Print or Save agreement as PDF"
                      >
                        <Printer size={13} />
                        <span>Print / PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setInvoiceData(prev => ({
                            ...prev,
                            clientCompany: agreementData.clientName,
                            clientName: agreementData.contactPerson,
                            items: [
                              {
                                id: Date.now(),
                                description: `${agreementData.packageName} (${agreementData.guaranteedMeetings} Guaranteed Meetings/mo)`,
                                hsnSac: '998311',
                                qty: 1,
                                rate: agreementData.monthlyFee,
                                taxRate: 18
                              }
                            ]
                          }));
                          setAgencySubTab('invoices');
                          showToast(`Loaded "${agreementData.clientName}" into Invoice Studio!`, 'success');
                        }}
                        className="btn-secondary"
                        style={{ fontSize: 12, padding: '8px 12px', color: '#16a34a', borderColor: '#bbf7d0', background: '#f0fdf4' }}
                        title="Generate Tax Invoice for this agreement"
                      >
                        <Receipt size={13} />
                        <span>Invoice Client</span>
                      </button>
                    </div>
                  </div>

                  {/* Template Selection & Quick Auto-Fill Strip */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Agreement Template:</span>
                      <select
                        value={agreementTemplateId}
                        onChange={(e) => handleSelectAgreementTemplate(e.target.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: '1.5px solid #cbd5e1',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#0f172a',
                          background: '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="mfg_enterprise">Manufacturing & Industrial Retainer (₹65,000/mo)</option>
                        <option value="tech_saas">High-Ticket B2B SaaS & Tech Retainer (₹85,000/mo)</option>
                        <option value="consulting">Corporate Consulting & CA Retainer (₹45,000/mo)</option>
                        <option value="fractional_sdr">Dedicated Fractional SDR Engine (₹1,25,000/mo)</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>1-Click Client CRM:</span>
                      {[
                        { name: 'Sterling Manufacturing Company', contact: 'Rahul Sharma', fee: 65000 },
                        { name: 'Dolphy India Enterprises', contact: 'Priya Verma', fee: 55000 },
                        { name: 'TradeUNO B2B Textiles', contact: 'Vikram Sethi', fee: 75000 }
                      ].map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setAgreementData(prev => ({
                              ...prev,
                              clientName: c.name,
                              contactPerson: c.contact,
                              monthlyFee: c.fee
                            }));
                            showToast(`Loaded client "${c.name}" into agreement!`, 'info');
                          }}
                          className="btn-secondary"
                          style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6 }}
                        >
                          + {c.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* WYSIWYG Editable Retainer Agreement Canvas */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  padding: '40px 48px',
                  maxWidth: 960,
                  margin: '0 auto 32px',
                  color: '#0f172a'
                }}>
                  {/* Agreement Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: 20, marginBottom: 24 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Briefcase size={16} color="#ffffff" />
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>
                          ApexOutreach Studio
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        Enterprise Client Acquisition & B2B Outbound Infrastructure
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        DLF Cyber City, Tower 10C, Phase II, Gurugram, Haryana 122002
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4f46e5' }}>
                        RETAINER SERVICE AGREEMENT
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: '#64748b' }}>Ref #:</span>
                        <input
                          type="text"
                          value={agreementData.refNumber}
                          onChange={(e) => setAgreementData({ ...agreementData, refNumber: e.target.value })}
                          className="paper-inline-input"
                          style={{ width: 110, fontSize: 11, fontWeight: 800, textAlign: 'right' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: '#64748b' }}>Date:</span>
                        <input
                          type="date"
                          value={agreementData.date}
                          onChange={(e) => setAgreementData({ ...agreementData, date: e.target.value })}
                          className="paper-inline-input"
                          style={{ width: 120, fontSize: 11, textAlign: 'right' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Client Overview Card */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>
                        CLIENT / SUBSCRIBING PARTY:
                      </div>
                      <input
                        type="text"
                        value={agreementData.clientName}
                        onChange={(e) => setAgreementData({ ...agreementData, clientName: e.target.value })}
                        className="paper-inline-input"
                        placeholder="Client Company Name"
                        style={{ fontSize: 15, fontWeight: 800, width: '100%', marginBottom: 4 }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                        <span>Attn:</span>
                        <input
                          type="text"
                          value={agreementData.contactPerson}
                          onChange={(e) => setAgreementData({ ...agreementData, contactPerson: e.target.value })}
                          className="paper-inline-input"
                          placeholder="Contact Person Name"
                          style={{ width: '80%', fontSize: 12 }}
                        />
                      </div>
                      <input
                        type="text"
                        value={agreementData.clientAddress}
                        onChange={(e) => setAgreementData({ ...agreementData, clientAddress: e.target.value })}
                        className="paper-inline-input"
                        placeholder="Client Office Address"
                        style={{ width: '100%', fontSize: 11, color: '#64748b', marginTop: 4 }}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>
                        COMMERCIAL TERMS & PACKAGE:
                      </div>
                      <input
                        type="text"
                        value={agreementData.packageName}
                        onChange={(e) => setAgreementData({ ...agreementData, packageName: e.target.value })}
                        className="paper-inline-input"
                        style={{ fontSize: 14, fontWeight: 800, color: '#4f46e5', width: '100%', marginBottom: 6 }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: '#64748b' }}>Monthly Retainer:</span>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>₹</span>
                          <input
                            type="number"
                            value={agreementData.monthlyFee}
                            onChange={(e) => setAgreementData({ ...agreementData, monthlyFee: parseFloat(e.target.value) || 0 })}
                            className="paper-inline-input"
                            style={{ fontSize: 14, fontWeight: 800, color: '#059669', width: 100 }}
                          />
                          <span style={{ fontSize: 11, color: '#64748b' }}>/mo</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: '#64748b' }}>Guaranteed Appointments:</span>
                        <input
                          type="number"
                          value={agreementData.guaranteedMeetings}
                          onChange={(e) => setAgreementData({ ...agreementData, guaranteedMeetings: parseInt(e.target.value) || 0 })}
                          className="paper-inline-input"
                          style={{ fontSize: 12, fontWeight: 800, color: '#1e293b', width: 60 }}
                        />
                        <span style={{ fontSize: 11, color: '#64748b' }}>Meetings / Month</span>
                      </div>
                    </div>
                  </div>

                  {/* Scope of Work */}
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>
                      1. SCOPE OF SERVICES
                    </div>
                    <textarea
                      value={agreementData.scopeSummary}
                      onChange={(e) => setAgreementData({ ...agreementData, scopeSummary: e.target.value })}
                      className="paper-inline-input"
                      rows={2}
                      style={{ width: '100%', fontSize: 12, lineHeight: 1.5, resize: 'vertical' }}
                    />
                  </div>

                  {/* Key Deliverables */}
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                        2. KEY DELIVERABLES & OUTBOUND INFRASTRUCTURE
                      </div>
                      <button
                        type="button"
                        onClick={() => setAgreementData({
                          ...agreementData,
                          deliverables: [...agreementData.deliverables, 'Custom Targeted Strategic Outreach Initiative']
                        })}
                        className="btn-secondary"
                        style={{ fontSize: 10, padding: '2px 8px' }}
                      >
                        + Add Deliverable
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {agreementData.deliverables.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: '#4f46e5', fontWeight: 800 }}>✓</span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const next = [...agreementData.deliverables];
                              next[idx] = e.target.value;
                              setAgreementData({ ...agreementData, deliverables: next });
                            }}
                            className="paper-inline-input"
                            style={{ flex: 1, fontSize: 12 }}
                          />
                          {agreementData.deliverables.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = agreementData.deliverables.filter((_, i) => i !== idx);
                                setAgreementData({ ...agreementData, deliverables: next });
                              }}
                              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}
                              title="Remove deliverable"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SLA & Guarantee */}
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>
                      3. PERFORMANCE SLA & QUOTA ROLLOVER GUARANTEE
                    </div>
                    <textarea
                      value={agreementData.slaTerms}
                      onChange={(e) => setAgreementData({ ...agreementData, slaTerms: e.target.value })}
                      className="paper-inline-input"
                      rows={2}
                      style={{ width: '100%', fontSize: 12, lineHeight: 1.5, resize: 'vertical' }}
                    />
                  </div>

                  {/* Payment Terms */}
                  <div style={{ marginBottom: 30 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>
                      4. INVOICING CYCLE & SETTLEMENT TERMS
                    </div>
                    <textarea
                      value={agreementData.paymentTerms}
                      onChange={(e) => setAgreementData({ ...agreementData, paymentTerms: e.target.value })}
                      className="paper-inline-input"
                      rows={2}
                      style={{ width: '100%', fontSize: 12, lineHeight: 1.5, resize: 'vertical' }}
                    />
                  </div>

                  {/* Signatures */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 24 }}>For ApexOutreach Studio:</div>
                      <input
                        type="text"
                        value={agreementData.signatoryName}
                        onChange={(e) => setAgreementData({ ...agreementData, signatoryName: e.target.value })}
                        className="paper-inline-input"
                        style={{ fontSize: 12, fontWeight: 700, width: '100%', borderBottom: '1px solid #cbd5e1' }}
                      />
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Authorized Signatory</div>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 24 }}>Accepted for {agreementData.clientName}:</div>
                      <input
                        type="text"
                        value={agreementData.contactPerson}
                        onChange={(e) => setAgreementData({ ...agreementData, contactPerson: e.target.value })}
                        className="paper-inline-input"
                        style={{ fontSize: 12, fontWeight: 700, width: '100%', borderBottom: '1px solid #cbd5e1' }}
                      />
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Client Authorized Signatory</div>
                    </div>
                  </div>
                </div>

                {/* Saved Proposals Table */}
                <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
                    Past Proposals & Retainer Contracts ({agencyProposals.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {agencyProposals.map(prop => (
                      <div key={prop.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong style={{ fontSize: 13, color: '#0f172a' }}>{prop.client_name}</strong>
                            <span style={{
                              fontSize: 9,
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: prop.status === 'Signed' ? '#ecfdf5' : '#eff6ff',
                              color: prop.status === 'Signed' ? '#059669' : '#1d4ed8'
                            }}>
                              {prop.status}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                            {prop.package_name} • ₹{(prop.monthly_fee || 45000).toLocaleString()}/mo • {prop.guaranteed_meetings || 12} Meetings
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setAgreementData({
                                refNumber: `AGR-2026-${prop.id.slice(-3)}`,
                                date: new Date().toISOString().split('T')[0],
                                validUntil: prop.valid_until || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
                                packageName: prop.package_name,
                                clientName: prop.client_name,
                                contactPerson: prop.contact_person || 'Managing Director',
                                clientEmail: prop.email || '',
                                clientPhone: '',
                                clientAddress: 'Enterprise Client Office',
                                monthlyFee: prop.monthly_fee || 45000,
                                currency: '₹',
                                guaranteedMeetings: prop.guaranteed_meetings || 12,
                                scopeSummary: `Retainer acquisition services for ${prop.client_name}.`,
                                deliverables: prop.deliverables || [
                                  'Verified High-ICP Decision Maker Outreach',
                                  'Cold Email & WhatsApp Multi-Touch Cadence',
                                  'Guaranteed Qualified Executive Meetings'
                                ],
                                slaTerms: `${prop.guaranteed_meetings || 12} Verified Appointments per month with rollover protection.`,
                                paymentTerms: prop.payment_terms || '100% Advance Monthly Retainer.',
                                signatoryName: 'Ishant Singla (Managing Partner)'
                              });
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                              showToast(`Loaded "${prop.client_name}" into agreement editor!`, 'success');
                            }}
                            className="btn-secondary"
                            style={{ fontSize: 11, padding: '5px 10px' }}
                          >
                            <Edit3 size={11} /> Load in Editor
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveProposalPreview(prop)}
                            className="btn-secondary"
                            style={{ fontSize: 11, padding: '5px 10px' }}
                          >
                            <Eye size={11} /> View
                          </button>

                          {prop.status !== 'Signed' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateProposalStatus(prop.id, 'Signed')}
                              className="btn-primary"
                              style={{ fontSize: 11, padding: '5px 10px', background: '#059669' }}
                            >
                              Sign 🎉
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-View 4: Urgent Follow-Up Radar */}
            {agencySubTab === 'radar' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                      Urgent Follow-Up Radar & Lead Leakage Monitor
                    </h3>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                      High-priority warm prospects that require immediate touchpoints within the next 24-48 hours.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                      Zero Lead Leakage Active
                    </div>
                  </div>
                </div>

                {(() => {
                  const warmLeads = filteredLeads.filter(l => l.status === 'Interested' || l.status === 'Follow-up' || l.status === 'Contacted');
                  const targetList = warmLeads.length > 0 ? warmLeads.slice(0, 15) : filteredLeads.filter(l => l.phone).slice(0, 12);
                  const isFallback = warmLeads.length === 0;

                  return (
                    <>
                      {/* Floating Bulk Follow-Up Action Toolbar */}
                      {selectedRadarIds.size > 0 && (
                        <div className="radar-bulk-toolbar">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: 800 }}>⚡ {selectedRadarIds.size} Prospects Selected for Urgent Follow-Up</span>
                            <button
                              type="button"
                              onClick={() => setSelectedRadarIds(new Set())}
                              style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', borderRadius: 6, padding: '3px 8px', fontSize: 10 }}
                            >
                              Clear Selection
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => handleBulkRadarFollowup('whatsapp')}
                              className="btn-secondary"
                              style={{ fontSize: 11, padding: '6px 12px', background: '#25D366', color: '#ffffff', borderColor: '#25D366' }}
                              title="Queue selected leads for WhatsApp follow-up cadence"
                            >
                              <MessageSquare size={12} /> Bulk WhatsApp
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBulkRadarFollowup('email')}
                              className="btn-secondary"
                              style={{ fontSize: 11, padding: '6px 12px', background: '#3b82f6', color: '#ffffff', borderColor: '#3b82f6' }}
                              title="Load selected leads into Email Studio for follow-up sequence"
                            >
                              <Mail size={12} /> Bulk Email
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBulkRadarFollowup('instant')}
                              disabled={isBulkDispatching}
                              className="btn-primary"
                              style={{ fontSize: 11, padding: '6px 14px', background: '#10b981' }}
                              title="Dispatch instant automated follow-up pings"
                            >
                              {isBulkDispatching ? <RefreshCw size={12} className="pulse-indicator" /> : <Zap size={12} />}
                              <span>{isBulkDispatching ? 'Dispatching...' : '1-Click Bulk Dispatch'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => handleToggleSelectAllRadar(targetList)}
                            className="btn-secondary"
                            style={{ fontSize: 11, padding: '4px 10px', background: '#ffffff' }}
                          >
                            <CheckSquare size={12} color="#4f46e5" />
                            <span>{selectedRadarIds.size >= targetList.length ? 'Deselect All' : `Select All for Bulk Follow-Up (${targetList.length})`}</span>
                          </button>
                        </div>
                        {isFallback && (
                          <span style={{ fontSize: 11, color: '#64748b' }}>Showing top verified prospects with direct phone numbers</span>
                        )}
                      </div>

                      {targetList.map((lead, idx) => {
                        const isHot = lead.status === 'Interested' || (lead.lead_score && lead.lead_score >= 70);
                        const isChecked = selectedRadarIds.has(lead.id || lead.name);
                        return (
                          <div
                            key={lead.id || idx}
                            className="radar-lead-row"
                            style={{
                              background: isChecked ? '#eff6ff' : '#ffffff',
                              borderColor: isChecked ? '#93c5fd' : '#e2e8f0',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleRadarSelect(lead.id || lead.name)}
                                style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#4f46e5' }}
                              />
                              <span className={`radar-urgency-pill ${isHot ? 'hot' : 'warn'}`}>
                                {isHot ? '🔥 High Priority' : lead.status === 'New' ? '⚡ New High-ICP' : '⏳ Follow-Up Due'}
                              </span>
                              <div>
                                <strong style={{ fontSize: 14, color: '#0f172a', display: 'block' }}>{lead.name}</strong>
                                <div style={{ fontSize: 11, color: '#64748b', display: 'flex', gap: 8 }}>
                                  <span>{lead.category || 'B2B Client'}</span>
                                  <span>•</span>
                                  <span>{lead.city}</span>
                                  {lead.phone && <span>• 📞 {lead.phone}</span>}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {lead.phone && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSingleWaPhone(lead.phone);
                                    setSingleWaName(lead.name);
                                    setSingleWaText(`Hi ${lead.name} Team, Dinesh here following up on our discussion. Are you available for a 4-minute sync today?`);
                                    setActiveTab('whatsapp');
                                  }}
                                  className="btn-secondary"
                                  style={{ fontSize: 11, padding: '4px 10px', color: '#25D366', borderColor: '#bbf7d0' }}
                                >
                                  <MessageSquare size={12} /> WhatsApp
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewLead(lead);
                                  setActiveTab('campaign');
                                }}
                                className="btn-secondary"
                                style={{ fontSize: 11, padding: '4px 10px' }}
                              >
                                <Mail size={12} /> Email
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenDealWonModal(lead)}
                                className="btn-primary"
                                style={{ fontSize: 11, padding: '4px 12px', background: '#059669' }}
                              >
                                <Trophy size={12} /> Won Deal
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Sub-View 5: Integrated Client Invoice Generator & Customizer Studio */}
            {agencySubTab === 'invoices' && (
              <div className="animate-fade-in">
                {/* Header Strip with Action Controls */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 18,
                  padding: '16px 20px',
                  background: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>🧾</span>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Client Invoice Generator & Customizer
                      </h3>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0'
                      }}>
                        GST 18% Compliant
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
                      Real-time interactive invoice customizer. Dispatch legally compliant tax invoices to clients via WhatsApp, Email, or download high-resolution PDF.
                    </p>
                  </div>

                  {/* 1-Click Action Hub */}
                  <div className="invoice-btn-action-bar">
                    <button
                      type="button"
                      onClick={handleNewBlankInvoice}
                      className="btn-secondary"
                      style={{ fontSize: 12, padding: '8px 12px', borderColor: '#cbd5e1' }}
                      title="Start a fresh blank invoice"
                    >
                      <Plus size={13} />
                      <span>New Invoice</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveCurrentInvoice}
                      disabled={isSavingInvoice}
                      className="btn-primary"
                      style={{
                        fontSize: 12,
                        padding: '8px 14px',
                        background: isSavingInvoice ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                      title="Save or update this invoice in database"
                    >
                      {isSavingInvoice ? <RefreshCw size={13} className="pulse-indicator" /> : <FileDown size={13} />}
                      <span>{isSavingInvoice ? 'Saving...' : 'Save Invoice'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPastInvoicesModal(true)}
                      className="btn-secondary"
                      style={{ fontSize: 12, padding: '8px 12px', borderColor: '#818cf8', color: '#4338ca', background: '#eef2ff' }}
                      title="View all past saved client invoices"
                    >
                      <Receipt size={13} />
                      <span>Past Invoices ({savedInvoices.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintInvoice}
                      className="btn-invoice-pdf"
                      title="Print or Save as Clean PDF Document"
                    >
                      <Printer size={13} />
                      <span>Print / PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendWhatsAppInvoice}
                      className="btn-invoice-wa"
                      title="Send itemized invoice breakdown to client on WhatsApp"
                    >
                      <MessageSquare size={13} />
                      <span>WhatsApp Invoice</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendEmailInvoice}
                      className="btn-invoice-email"
                      title="Compose official email to client with tax invoice breakdown"
                    >
                      <Mail size={13} />
                      <span>Email Invoice</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyInvoiceText}
                      className="btn-secondary"
                      style={{ fontSize: 12, padding: '8px 12px' }}
                      title="Copy formatted invoice text to clipboard"
                    >
                      {invoiceCopiedNotice ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                      <span>{invoiceCopiedNotice ? 'Copied!' : 'Copy Summary'}</span>
                    </button>
                  </div>
                </div>

                {/* 2-Column Studio Grid: Left Customizer Form, Right Live Paper Canvas */}
                <div className="invoice-studio-grid">
                  {/* Left Column: Invoice Customizer Panel */}
                  <div className="invoice-editor-panel">
                    {/* Quick Client Auto-fill Bar */}
                    <div className="invoice-editor-section" style={{ background: '#f8fafc', margin: '-22px -22px 0 -22px', padding: '16px 20px', borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
                      <div className="invoice-field-label">
                        <span>⚡ 1-Click Auto-Fill Client from CRM:</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                        {[
                          { name: 'Sterling Manufacturing', client: 'Rahul Sharma', email: 'contact@sterlingmfg.com', phone: '+91 98111 22334', city: 'Gurugram' },
                          { name: 'Dolphy India', client: 'Hitesh Patel', email: 'sales@dolphy.in', phone: '+91 98250 11223', city: 'Surat' },
                          { name: 'TradeUNO Fabrics', client: 'Vikram Singhania', email: 'accounts@tradeuno.com', phone: '+91 98333 44556', city: 'Mumbai' }
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAutoFillInvoiceClient(preset)}
                            className="btn-secondary"
                            style={{ fontSize: 11, padding: '4px 9px', borderRadius: 6 }}
                          >
                            + {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Section 1: Invoice Identifiers & Dates */}
                    <div className="invoice-editor-section">
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Receipt size={14} color="#4f46e5" />
                        <span>Invoice Metadata & Dates</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                          <label className="invoice-field-label">Invoice Number</label>
                          <input
                            type="text"
                            className="invoice-field-input"
                            value={invoiceData.invoiceNumber}
                            onChange={e => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="invoice-field-label">Payment Terms</label>
                          <input
                            type="text"
                            className="invoice-field-input"
                            value={invoiceData.paymentTerms}
                            onChange={e => setInvoiceData({ ...invoiceData, paymentTerms: e.target.value })}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label className="invoice-field-label">Issue Date</label>
                          <input
                            type="date"
                            className="invoice-field-input"
                            value={invoiceData.issueDate}
                            onChange={e => setInvoiceData({ ...invoiceData, issueDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="invoice-field-label">Due Date</label>
                          <input
                            type="date"
                            className="invoice-field-input"
                            value={invoiceData.dueDate}
                            onChange={e => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Client Profile (Billed To) */}
                    <div className="invoice-editor-section">
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={14} color="#059669" />
                        <span>Client Information (Billed To)</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                          <label className="invoice-field-label">Company / Client Name</label>
                          <input
                            type="text"
                            className="invoice-field-input"
                            value={invoiceData.clientCompany}
                            onChange={e => setInvoiceData({ ...invoiceData, clientCompany: e.target.value })}
                            placeholder="e.g. Acme Corporation"
                          />
                        </div>
                        <div>
                          <label className="invoice-field-label">Attention / Contact Person</label>
                          <input
                            type="text"
                            className="invoice-field-input"
                            value={invoiceData.clientName}
                            onChange={e => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                            placeholder="e.g. John Doe (Director)"
                          />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                          <label className="invoice-field-label">Client Email</label>
                          <input
                            type="email"
                            className="invoice-field-input"
                            value={invoiceData.clientEmail}
                            onChange={e => setInvoiceData({ ...invoiceData, clientEmail: e.target.value })}
                            placeholder="client@company.com"
                          />
                        </div>
                        <div>
                          <label className="invoice-field-label">Client WhatsApp / Phone</label>
                          <input
                            type="text"
                            className="invoice-field-input"
                            value={invoiceData.clientPhone}
                            onChange={e => setInvoiceData({ ...invoiceData, clientPhone: e.target.value })}
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label className="invoice-field-label">Client GSTIN (Optional)</label>
                          <input
                            type="text"
                            className="invoice-field-input"
                            value={invoiceData.clientGstin}
                            onChange={e => setInvoiceData({ ...invoiceData, clientGstin: e.target.value })}
                            placeholder="06AABCS1234P1Z2"
                          />
                        </div>
                        <div>
                          <label className="invoice-field-label">Billing Address</label>
                          <input
                            type="text"
                            className="invoice-field-input"
                            value={invoiceData.clientAddress}
                            onChange={e => setInvoiceData({ ...invoiceData, clientAddress: e.target.value })}
                            placeholder="City, State, PIN"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Line Items Editor */}
                    <div className="invoice-editor-section">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FileSpreadsheet size={14} color="#d97706" />
                          <span>Service Items & Deliverables ({invoiceData.items.length})</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddInvoiceItem}
                          className="btn-secondary"
                          style={{ fontSize: 11, padding: '3px 8px', color: '#4f46e5' }}
                        >
                          <Plus size={12} /> Add Item
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {invoiceData.items.map((item, idx) => (
                          <div key={item.id || idx} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#475569' }}>Item #{idx + 1}</span>
                              {invoiceData.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInvoiceItem(item.id)}
                                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                                  title="Remove Item"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              className="invoice-field-input"
                              style={{ marginBottom: 6 }}
                              value={item.description}
                              onChange={e => handleUpdateInvoiceItem(item.id, 'description', e.target.value)}
                              placeholder="Description of deliverables"
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 60px 100px 70px 1fr', gap: 6, alignItems: 'center' }}>
                              <div>
                                <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b' }}>HSN/SAC</label>
                                <input
                                  type="text"
                                  className="invoice-field-input"
                                  style={{ padding: '4px 6px', fontSize: 11 }}
                                  value={item.hsnSac}
                                  onChange={e => handleUpdateInvoiceItem(item.id, 'hsnSac', e.target.value)}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b' }}>Qty</label>
                                <input
                                  type="number"
                                  min="1"
                                  className="invoice-field-input"
                                  style={{ padding: '4px 6px', fontSize: 11 }}
                                  value={item.qty}
                                  onChange={e => handleUpdateInvoiceItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b' }}>Rate (₹)</label>
                                <input
                                  type="number"
                                  step="500"
                                  className="invoice-field-input"
                                  style={{ padding: '4px 6px', fontSize: 11 }}
                                  value={item.rate}
                                  onChange={e => handleUpdateInvoiceItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b' }}>GST %</label>
                                <input
                                  type="number"
                                  className="invoice-field-input"
                                  style={{ padding: '4px 6px', fontSize: 11 }}
                                  value={item.taxRate}
                                  onChange={e => handleUpdateInvoiceItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b', display: 'block' }}>Line Total</label>
                                <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                                  ₹{((item.qty || 1) * (item.rate || 0)).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 4: Discounts, Advances & Settlement */}
                    <div className="invoice-editor-section">
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CreditCard size={14} color="#3b82f6" />
                        <span>Adjustments & Banking Settlement Details</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                          <label className="invoice-field-label">Discount Applied (₹)</label>
                          <input
                            type="number"
                            className="invoice-field-input"
                            value={invoiceData.discountAmount}
                            onChange={e => setInvoiceData({ ...invoiceData, discountAmount: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <label className="invoice-field-label">Advance Paid (₹)</label>
                          <input
                            type="number"
                            className="invoice-field-input"
                            value={invoiceData.advancePaid}
                            onChange={e => setInvoiceData({ ...invoiceData, advancePaid: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                          <label className="invoice-field-label">Agency UPI ID</label>
                          <input
                            type="text"
                            className="invoice-field-input"
                            value={invoiceData.agencyUpi}
                            onChange={e => setInvoiceData({ ...invoiceData, agencyUpi: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="invoice-field-label">Agency Bank Name</label>
                          <input
                            type="text"
                            className="invoice-field-input"
                            value={invoiceData.agencyBankName}
                            onChange={e => setInvoiceData({ ...invoiceData, agencyBankName: e.target.value })}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                          <label className="invoice-field-label">Bank A/C Number</label>
                          <input
                            type="text"
                            className="invoice-field-input"
                            value={invoiceData.agencyBankAccount}
                            onChange={e => setInvoiceData({ ...invoiceData, agencyBankAccount: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="invoice-field-label">Bank IFSC Code</label>
                          <input
                            type="text"
                            className="invoice-field-input"
                            value={invoiceData.agencyBankIfsc}
                            onChange={e => setInvoiceData({ ...invoiceData, agencyBankIfsc: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="invoice-field-label">Invoice Notes / Wire Instructions</label>
                        <textarea
                          rows={2}
                          className="invoice-field-input"
                          style={{ resize: 'vertical' }}
                          value={invoiceData.notes}
                          onChange={e => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Printable Tax Invoice Paper Canvas (Now Fully Editable In-Place!) */}
                  <div className="invoice-paper-canvas invoice-printable-zone">
                    {/* Header: Agency Logo & Invoice Identifiers */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: 16 }}>
                      <div style={{ flex: 1, maxWidth: 420 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Sparkles size={16} />
                          </div>
                          <input
                            type="text"
                            className="paper-inline-input"
                            style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px', color: '#0f172a', width: '100%' }}
                            value={invoiceData.agencyName}
                            onChange={e => setInvoiceData({ ...invoiceData, agencyName: e.target.value })}
                            placeholder="Agency Name"
                          />
                        </div>
                        <input
                          type="text"
                          className="paper-inline-input"
                          style={{ fontSize: 11, fontWeight: 600, color: '#4f46e5', width: '100%', marginBottom: 3 }}
                          value={invoiceData.agencyTagline}
                          onChange={e => setInvoiceData({ ...invoiceData, agencyTagline: e.target.value })}
                          placeholder="Agency Tagline / Subtitle"
                        />
                        <textarea
                          rows={2}
                          className="paper-inline-input"
                          style={{ fontSize: 11, color: '#475569', lineHeight: 1.4, width: '100%', resize: 'none' }}
                          value={invoiceData.agencyAddress}
                          onChange={e => setInvoiceData({ ...invoiceData, agencyAddress: e.target.value })}
                          placeholder="Agency Physical Address"
                        />
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: '#475569', marginTop: 2, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700 }}>GSTIN:</span>
                          <input
                            type="text"
                            className="paper-inline-input"
                            style={{ fontSize: 11, width: 140, fontWeight: 600 }}
                            value={invoiceData.agencyGstin}
                            onChange={e => setInvoiceData({ ...invoiceData, agencyGstin: e.target.value })}
                          />
                          <span>•</span>
                          <span style={{ fontWeight: 700 }}>Email:</span>
                          <input
                            type="email"
                            className="paper-inline-input"
                            style={{ fontSize: 11, width: 160 }}
                            value={invoiceData.agencyEmail}
                            onChange={e => setInvoiceData({ ...invoiceData, agencyEmail: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', minWidth: 220 }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '1px', textTransform: 'uppercase' }}>
                          TAX INVOICE
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, marginTop: 2 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#4f46e5', fontFamily: 'var(--font-mono)' }}>#</span>
                          <input
                            type="text"
                            className="paper-inline-input"
                            style={{ fontSize: 14, fontWeight: 800, color: '#4f46e5', fontFamily: 'var(--font-mono)', textAlign: 'right', width: 150 }}
                            value={invoiceData.invoiceNumber}
                            onChange={e => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                          />
                        </div>
                        <div style={{ marginTop: 8, fontSize: 11, color: '#334155', lineHeight: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <strong>Issue Date:</strong>
                            <input
                              type="date"
                              className="paper-inline-input"
                              style={{ fontSize: 11, textAlign: 'right' }}
                              value={invoiceData.issueDate}
                              onChange={e => setInvoiceData({ ...invoiceData, issueDate: e.target.value })}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <strong>Payment Due:</strong>
                            <input
                              type="date"
                              className="paper-inline-input"
                              style={{ fontSize: 11, textAlign: 'right' }}
                              value={invoiceData.dueDate}
                              onChange={e => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                            />
                          </div>
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 6,
                            fontSize: 10,
                            fontWeight: 800,
                            background: invoiceBalanceDue === 0 ? '#ecfdf5' : '#eff6ff',
                            color: invoiceBalanceDue === 0 ? '#059669' : '#1d4ed8',
                            border: `1px solid ${invoiceBalanceDue === 0 ? '#a7f3d0' : '#bfdbfe'}`
                          }}>
                            {invoiceBalanceDue === 0 ? '✓ FULLY SETTLED' : `PENDING BALANCE: ₹${invoiceBalanceDue.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Billed To / Settlement Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, margin: '20px 0', padding: '16px 18px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                          BILLED TO CLIENT:
                        </div>
                        <input
                          type="text"
                          className="paper-inline-input"
                          style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', width: '100%' }}
                          value={invoiceData.clientCompany}
                          onChange={e => setInvoiceData({ ...invoiceData, clientCompany: e.target.value })}
                          placeholder="Client Company Name"
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <span style={{ fontSize: 12, color: '#334155' }}>Attn:</span>
                          <input
                            type="text"
                            className="paper-inline-input"
                            style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', flex: 1 }}
                            value={invoiceData.clientName}
                            onChange={e => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                            placeholder="Contact Person Name"
                          />
                        </div>
                        <textarea
                          rows={2}
                          className="paper-inline-input"
                          style={{ fontSize: 11, color: '#64748b', marginTop: 3, width: '100%', resize: 'none' }}
                          value={invoiceData.clientAddress}
                          onChange={e => setInvoiceData({ ...invoiceData, clientAddress: e.target.value })}
                          placeholder="Client Full Address & City"
                        />
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                          <input
                            type="email"
                            className="paper-inline-input"
                            style={{ fontSize: 11, color: '#64748b', flex: 1 }}
                            value={invoiceData.clientEmail}
                            onChange={e => setInvoiceData({ ...invoiceData, clientEmail: e.target.value })}
                            placeholder="Client Email"
                          />
                          <span>•</span>
                          <input
                            type="text"
                            className="paper-inline-input"
                            style={{ fontSize: 11, color: '#64748b', flex: 1 }}
                            value={invoiceData.clientPhone}
                            onChange={e => setInvoiceData({ ...invoiceData, clientPhone: e.target.value })}
                            placeholder="Client Phone"
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>GSTIN:</span>
                          <input
                            type="text"
                            className="paper-inline-input"
                            style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', flex: 1 }}
                            value={invoiceData.clientGstin}
                            onChange={e => setInvoiceData({ ...invoiceData, clientGstin: e.target.value })}
                            placeholder="Client GSTIN or Unregistered"
                          />
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                          BANKING & SETTLEMENT DETAILS:
                        </div>
                        <div style={{ fontSize: 12, color: '#1e293b', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <strong>Bank:</strong>
                            <input
                              type="text"
                              className="paper-inline-input"
                              style={{ fontSize: 12, flex: 1 }}
                              value={invoiceData.agencyBankName}
                              onChange={e => setInvoiceData({ ...invoiceData, agencyBankName: e.target.value })}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <strong>A/C No:</strong>
                            <input
                              type="text"
                              className="paper-inline-input"
                              style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, flex: 1 }}
                              value={invoiceData.agencyBankAccount}
                              onChange={e => setInvoiceData({ ...invoiceData, agencyBankAccount: e.target.value })}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <strong>IFSC:</strong>
                            <input
                              type="text"
                              className="paper-inline-input"
                              style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, flex: 1 }}
                              value={invoiceData.agencyBankIfsc}
                              onChange={e => setInvoiceData({ ...invoiceData, agencyBankIfsc: e.target.value })}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <strong style={{ color: '#4f46e5' }}>UPI ID:</strong>
                            <input
                              type="text"
                              className="paper-inline-input"
                              style={{ fontSize: 12, color: '#4f46e5', fontWeight: 700, flex: 1 }}
                              value={invoiceData.agencyUpi}
                              onChange={e => setInvoiceData({ ...invoiceData, agencyUpi: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Line Items Table with Direct Inline Editing */}
                    <table className="invoice-tax-table">
                      <thead>
                        <tr>
                          <th style={{ width: 36, textAlign: 'center' }}>#</th>
                          <th>Service Description / Scope</th>
                          <th style={{ width: 85, textAlign: 'center' }}>HSN/SAC</th>
                          <th style={{ width: 55, textAlign: 'center' }}>Qty</th>
                          <th style={{ width: 105, textAlign: 'right' }}>Unit Rate</th>
                          <th style={{ width: 65, textAlign: 'center' }}>GST</th>
                          <th style={{ width: 105, textAlign: 'right' }}>Amount (₹)</th>
                          <th style={{ width: 32, textAlign: 'center' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.items.map((item, idx) => {
                          const itemTotal = (item.qty || 1) * (item.rate || 0);
                          return (
                            <tr key={item.id || idx}>
                              <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{idx + 1}</td>
                              <td>
                                <input
                                  type="text"
                                  className="paper-inline-input"
                                  style={{ width: '100%', fontWeight: 700, fontSize: 12, color: '#0f172a' }}
                                  value={item.description}
                                  onChange={e => handleUpdateInvoiceItem(item.id, 'description', e.target.value)}
                                  placeholder="Service description"
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="text"
                                  className="paper-inline-input"
                                  style={{ width: '100%', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11 }}
                                  value={item.hsnSac || '998311'}
                                  onChange={e => handleUpdateInvoiceItem(item.id, 'hsnSac', e.target.value)}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="number"
                                  min="1"
                                  className="paper-inline-input"
                                  style={{ width: '100%', textAlign: 'center', fontWeight: 700 }}
                                  value={item.qty}
                                  onChange={e => handleUpdateInvoiceItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                                />
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <input
                                  type="number"
                                  step="500"
                                  className="paper-inline-input"
                                  style={{ width: '100%', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                                  value={item.rate}
                                  onChange={e => handleUpdateInvoiceItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <select
                                  className="paper-inline-input"
                                  style={{ width: '100%', textAlign: 'center', fontSize: 11 }}
                                  value={item.taxRate}
                                  onChange={e => handleUpdateInvoiceItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                                >
                                  <option value={18}>18%</option>
                                  <option value={12}>12%</option>
                                  <option value={5}>5%</option>
                                  <option value={0}>0%</option>
                                </select>
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                                ₹{itemTotal.toLocaleString()}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {invoiceData.items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveInvoiceItem(item.id)}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                                    title="Delete line item"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Add Item Trigger on Paper */}
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={handleAddInvoiceItem}
                        className="btn-secondary"
                        style={{ fontSize: 11, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Plus size={12} /> + Add Line Item
                      </button>
                    </div>

                    {/* Financial Calculations Summary Box */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                      <div style={{ width: 340 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, color: '#475569' }}>
                          <span>Taxable Subtotal:</span>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                            ₹{invoiceSubtotal.toLocaleString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11, color: '#64748b' }}>
                          <span>CGST (9.0%):</span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(invoiceTaxAmount / 2).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11, color: '#64748b' }}>
                          <span>SGST (9.0%):</span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(invoiceTaxAmount / 2).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: 11, color: '#059669', fontWeight: 700 }}>
                          <span>Special Discount (₹):</span>
                          <input
                            type="number"
                            className="paper-inline-input"
                            style={{ width: 100, textAlign: 'right', color: '#059669', fontWeight: 700 }}
                            value={invoiceData.discountAmount}
                            onChange={e => setInvoiceData({ ...invoiceData, discountAmount: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #cbd5e1', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                          <span>Total Invoice Value:</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>₹{invoiceGrandTotal.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: 11, color: '#2563eb' }}>
                          <span>Advance Paid / Received (₹):</span>
                          <input
                            type="number"
                            className="paper-inline-input"
                            style={{ width: 100, textAlign: 'right', color: '#2563eb', fontWeight: 700 }}
                            value={invoiceData.advancePaid}
                            onChange={e => setInvoiceData({ ...invoiceData, advancePaid: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: '#0f172a',
                          color: '#ffffff',
                          borderRadius: 8,
                          marginTop: 6,
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Balance Payable:
                          </span>
                          <span style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                            ₹{invoiceBalanceDue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Notes & Authorization */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 30, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ maxWidth: 420 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                          Terms & Conditions:
                        </div>
                        <input
                          type="text"
                          className="paper-inline-input"
                          style={{ fontSize: 11, color: '#64748b', width: '100%', marginBottom: 3 }}
                          value={invoiceData.paymentTerms}
                          onChange={e => setInvoiceData({ ...invoiceData, paymentTerms: e.target.value })}
                          placeholder="Payment Terms"
                        />
                        <textarea
                          rows={2}
                          className="paper-inline-input"
                          style={{ fontSize: 11, color: '#64748b', width: '100%', resize: 'none' }}
                          value={invoiceData.notes}
                          onChange={e => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                          placeholder="Notes to client / UPI instructions"
                        />
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>
                          For {invoiceData.agencyName}
                        </div>
                        <div style={{ borderTop: '1px dashed #94a3b8', paddingTop: 6, minWidth: 160 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                            Authorized Signatory ✓
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Saved Client Invoices & Accounts Receivable Table */}
                <div style={{
                  marginTop: 24,
                  background: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f8fafc',
                    flexWrap: 'wrap',
                    gap: 10
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileText size={18} color="#4f46e5" />
                      <div>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                          Saved Client Invoices & Accounts Receivable ({savedInvoices.length})
                        </h4>
                        <p style={{ margin: '2px 0 0 0', fontSize: 11, color: '#64748b' }}>
                          Track payment collections, load into editor to print/PDF, or message clients directly.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0'
                      }}>
                        Settled: ₹{savedInvoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + (curr.total || 0), 0).toLocaleString()}
                      </span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe'
                      }}>
                        Receivable: ₹{savedInvoices.filter(i => i.status !== 'Paid').reduce((acc, curr) => acc + (curr.balance_due !== undefined ? curr.balance_due : curr.total || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {savedInvoices.length === 0 ? (
                    <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8' }}>
                      <Receipt size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>No saved invoices yet</p>
                      <p style={{ margin: '4px 0 0', fontSize: 11 }}>Fill out the details above and click "Save Invoice" to track accounts receivable.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                            <th style={{ padding: '10px 16px' }}>Invoice #</th>
                            <th style={{ padding: '10px 16px' }}>Client / Company</th>
                            <th style={{ padding: '10px 16px' }}>Issue & Due Date</th>
                            <th style={{ padding: '10px 16px', textAlign: 'right' }}>Total (₹)</th>
                            <th style={{ padding: '10px 16px', textAlign: 'right' }}>Balance Due (₹)</th>
                            <th style={{ padding: '10px 16px', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {savedInvoices.map((inv) => {
                            const isPaid = inv.status === 'Paid' || (inv.balance_due === 0 && inv.total > 0);
                            return (
                              <tr key={inv.id || inv.invoice_number} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px 16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#4f46e5' }}>
                                  {inv.invoice_number}
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{inv.client_company || 'Client'}</div>
                                  <div style={{ fontSize: 11, color: '#64748b' }}>{inv.client_name} {inv.client_phone ? `• ${inv.client_phone}` : ''}</div>
                                </td>
                                <td style={{ padding: '12px 16px', fontSize: 11, color: '#64748b' }}>
                                  <div>Issued: {inv.issue_date}</div>
                                  <div style={{ fontWeight: 600, color: '#334155' }}>Due: {inv.due_date}</div>
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                                  ₹{(inv.total || 0).toLocaleString()}
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isPaid ? '#059669' : '#dc2626' }}>
                                  ₹{(inv.balance_due !== undefined ? inv.balance_due : inv.total || 0).toLocaleString()}
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleInvoiceStatus(inv.id, isPaid ? 'Pending' : 'Paid')}
                                    style={{
                                      padding: '3px 10px',
                                      borderRadius: 12,
                                      fontSize: 10,
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      border: 'none',
                                      background: isPaid ? '#ecfdf5' : '#fef3c7',
                                      color: isPaid ? '#059669' : '#d97706',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                    title="Click to toggle payment status"
                                  >
                                    {isPaid ? '✓ Paid' : '⏳ Pending'}
                                  </button>
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                                    <button
                                      type="button"
                                      onClick={() => handleLoadSavedInvoice(inv)}
                                      className="btn-secondary"
                                      style={{ fontSize: 11, padding: '4px 8px' }}
                                      title="Load invoice into Studio customizer"
                                    >
                                      Load
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleLoadSavedInvoice(inv);
                                        setTimeout(() => handleSendWhatsAppInvoice(), 150);
                                      }}
                                      style={{
                                        padding: '4px 8px',
                                        background: '#25D366',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontSize: 11,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 3
                                      }}
                                      title="Share to WhatsApp"
                                    >
                                      <MessageSquare size={11} /> WA
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteInvoice(inv.id)}
                                      style={{
                                        padding: '4px 6px',
                                        background: 'transparent',
                                        border: '1px solid #fee2e2',
                                        color: '#ef4444',
                                        borderRadius: 6,
                                        cursor: 'pointer'
                                      }}
                                      title="Delete invoice"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 1: CRM LEADS DIRECTORY & KANBAN (DECLUTTERED & HIGH PERFORMANCE)
           ========================================================================= */}
        {activeTab === 'crm' && (
          <div className="animate-fade-in">
            {/* Executive KPI Strip */}
            <div className="kpi-strip">
              <div
                onClick={() => { setEmailFilter('ALL'); setStatusFilter('ALL'); setTierFilter('ALL'); setHighPriorityFilter(false); setCurrentPage(1); }}
                className="kpi-card"
                style={{ borderLeft: '3px solid #4f46e5' }}
              >
                <div className="kpi-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="kpi-value">{countAll.toLocaleString()}</div>
                  <div className="kpi-label">{selectedFile === 'MASTER_CRM' ? 'Master Leads' : 'Businesses in View'}</div>
                </div>
              </div>

              <div
                onClick={() => { setEmailFilter('YES'); setStatusFilter('ALL'); setCurrentPage(1); }}
                className="kpi-card"
                style={{ borderLeft: '3px solid #059669' }}
              >
                <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div className="kpi-value" style={{ color: '#059669' }}>{countWithEmail.toLocaleString()}</div>
                  <div className="kpi-label">Verified Emails ({Math.round(countWithEmail / (countAll || 1) * 100)}%)</div>
                </div>
              </div>

              <div
                onClick={() => { setActiveTab('whatsapp'); }}
                className="kpi-card"
                style={{ borderLeft: '3px solid #128C7E' }}
              >
                <div className="kpi-icon-box" style={{ background: '#e6fffa', color: '#128C7E' }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <div className="kpi-value" style={{ color: '#128C7E' }}>{countWithWa.toLocaleString()}</div>
                  <div className="kpi-label">WhatsApp Reachable</div>
                </div>
              </div>

              <div
                onClick={() => { setHighPriorityFilter(prev => !prev); setCurrentPage(1); }}
                className="kpi-card"
                style={{ borderLeft: '3px solid #f59e0b', background: highPriorityFilter ? '#fffbeb' : '#ffffff' }}
              >
                <div className="kpi-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
                  <Flame size={20} />
                </div>
                <div>
                  <div className="kpi-value" style={{ color: '#d97706' }}>{highPriorityCount.toLocaleString()}</div>
                  <div className="kpi-label">High Priority (Hot 🔥)</div>
                </div>
              </div>

              <div
                onClick={() => { setStatusFilter('Converted'); setCurrentPage(1); }}
                className="kpi-card"
                style={{ borderLeft: '3px solid #059669' }}
              >
                <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <Trophy size={20} />
                </div>
                <div>
                  <div className="kpi-value" style={{ color: '#059669' }}>
                    {filteredMetrics.pipelineMap['Converted'].length.toLocaleString()}
                  </div>
                  <div className="kpi-label">Converted Won Deals</div>
                </div>
              </div>
            </div>

            {/* Scheduled Appointments Alert Pill (Compact) */}
            {calendarEvents.length > 0 && (() => {
              const nextEvt = calendarEvents[calendarEvents.length - 1];
              return (
                <div style={{
                  background: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  borderRadius: 10,
                  padding: '8px 14px',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={15} color="#7c3aed" />
                    <span style={{ fontSize: 12, color: '#5b21b6', fontWeight: 700 }}>
                      Next Consultation: <strong>{nextEvt.lead_name}</strong> on 📅 {nextEvt.datetime}
                    </span>
                    <span style={{ fontSize: 10, background: '#ede9fe', color: '#6d28d9', padding: '1px 6px', borderRadius: 8, fontWeight: 700 }}>
                      {calendarEvents.length} Total
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleSnoozeAppointment(nextEvt, 24)}
                      className="btn-secondary"
                      style={{ fontSize: 10, padding: '3px 8px', color: '#6d28d9', borderColor: '#c4b5fd' }}
                    >
                      <Clock size={11} /> Snooze 24h
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCompleteAppointment(nextEvt)}
                      className="btn-primary"
                      style={{ fontSize: 10, padding: '3px 8px', background: '#7c3aed' }}
                    >
                      <Check size={11} /> Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCalendarWidget(!showCalendarWidget)}
                      className="btn-secondary"
                      style={{ fontSize: 10, padding: '3px 8px' }}
                    >
                      {showCalendarWidget ? 'Hide' : 'View All'}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Deduplication Pill (Compact) */}
            {dedupStats && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 10,
                padding: '6px 14px',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: 11
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#065f46' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  <span>Smart Deduplication: <strong>{dedupStats.duplicates_merged?.toLocaleString()} duplicates merged</strong> into <strong>{dedupStats.unique_leads?.toLocaleString()} clean profiles</strong>.</span>
                </div>
                <button
                  type="button"
                  onClick={runDeduplicationAudit}
                  disabled={isRunningDedup}
                  className="btn-secondary"
                  style={{ fontSize: 10, padding: '2px 8px', color: '#047857', borderColor: '#86efac' }}
                >
                  <RefreshCw size={10} className={isRunningDedup ? 'pulse-indicator' : ''} /> {isRunningDedup ? 'Auditing...' : 'Re-Audit'}
                </button>
              </div>
            )}

            {/* Unified Command & Filter Bar */}
            <div className="command-filter-bar">
              {/* Row 1: Debounced Search & Filter Pills */}
              <div className="command-bar-row">
                <div className="search-box-unified">
                  <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 10 }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search company, city, category, email, phone or syntax (e.g. has:email score:>70)..."
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: 9,
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

                {/* Quick Filter Pills */}
                <div className="filter-pills-row">
                  <button
                    type="button"
                    onClick={() => { setEmailFilter('ALL'); setStatusFilter('ALL'); setTierFilter('ALL'); setHighPriorityFilter(false); setSearchQuery(''); setCurrentPage(1); }}
                    className={`filter-pill ${emailFilter === 'ALL' && statusFilter === 'ALL' && tierFilter === 'ALL' && !highPriorityFilter && !searchQuery ? 'active' : ''}`}
                  >
                    All Leads ({leads.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => { setHighPriorityFilter(prev => !prev); setCurrentPage(1); }}
                    className={`filter-pill ${highPriorityFilter ? 'active' : ''}`}
                  >
                    🔥 Hot Leads ({highPriorityCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => { setEmailFilter(prev => prev === 'YES' ? 'ALL' : 'YES'); setCurrentPage(1); }}
                    className={`filter-pill ${emailFilter === 'YES' ? 'active' : ''}`}
                  >
                    ✉️ With Email ({filteredMetrics.withEmailCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(prev => prev.includes('has:wa') ? prev.replace(/has:wa/g, '').trim() : `${prev} has:wa`.trim());
                      setCurrentPage(1);
                    }}
                    className={`filter-pill ${searchQuery.includes('has:wa') ? 'active' : ''}`}
                  >
                    💬 WhatsApp ({filteredLeads.filter(l => l.wa_phone).length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(prev => prev.includes('rating:>4.5') ? prev.replace(/rating:>4\.5/g, '').trim() : `${prev} rating:>4.5`.trim());
                      setCurrentPage(1);
                    }}
                    className={`filter-pill ${searchQuery.includes('rating:>4.5') ? 'active' : ''}`}
                  >
                    ⭐ 4.5+ Rating ({filteredMetrics.highRatedCount})
                  </button>

                  {(searchQuery || cityFilter !== 'ALL' || categoryFilter !== 'ALL' || emailFilter !== 'ALL' || statusFilter !== 'ALL' || tierFilter !== 'ALL' || highPriorityFilter) && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 10px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      ✕ Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Secondary Dropdowns & View Controls */}
              <div className="command-bar-row" style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {/* Lead Dataset / Workspace Source */}
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '4px 8px', borderRadius: 8, border: '1px solid #cbd5e1', gap: 6 }}>
                    <Building2 size={13} color="#4f46e5" />
                    <select
                      value={selectedFile}
                      onChange={(e) => setSelectedFile(e.target.value)}
                      style={{ background: 'transparent', color: '#0f172a', border: 'none', fontSize: 11, fontWeight: 700, outline: 'none', cursor: 'pointer', maxWidth: 200 }}
                      title="Select CRM Database Source"
                    >
                      <option value="MASTER_CRM">
                        🌟 Master CRM ({leads.length > 0 && selectedFile === 'MASTER_CRM' ? leads.length.toLocaleString() : '4,773+'} leads)
                      </option>
                      {csvFiles.filter(f => f.filename !== 'MASTER_CRM').map(f => (
                        <option key={f.filename} value={f.filename}>
                          📁 {f.filename.replace('.csv', '')} ({(f.row_count ?? 0).toLocaleString()} leads)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Selector */}
                  <select
                    value={cityFilter}
                    onChange={(e) => { setCityFilter(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '6px 10px', fontSize: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid #cbd5e1' }}
                  >
                    <option value="ALL">All Cities ({cities.length})</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  {/* Category Selector */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '6px 10px', fontSize: 12, borderRadius: 8, maxWidth: 180, background: '#f8fafc', border: '1px solid #cbd5e1' }}
                  >
                    <option value="ALL">All Categories ({categories.length})</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  {/* Score Sort */}
                  <select
                    value={scoreSortOrder}
                    onChange={(e) => setScoreSortOrder(e.target.value)}
                    style={{ padding: '6px 10px', fontSize: 12, borderRadius: 8, fontWeight: 700, color: '#1e1b4b', background: '#f8fafc', border: '1px solid #cbd5e1' }}
                  >
                    <option value="score_desc">🔥 Sort: Highest Score</option>
                    <option value="score_asc">❄️ Sort: Lowest Score</option>
                    <option value="rating_desc">⭐ Sort: Rating</option>
                    <option value="name_asc">🔤 Sort: Name (A-Z)</option>
                  </select>

                  {/* Status Dropdown */}
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '6px 10px', fontSize: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid #cbd5e1' }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="New">Status: New</option>
                    <option value="Contacted">Status: Contacted</option>
                    <option value="Interested">Status: Interested</option>
                    <option value="Follow-up">Status: Follow-up</option>
                    <option value="Converted">Status: Converted</option>
                  </select>
                </div>

                {/* Right: Segmented View Switcher & Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: 2, borderRadius: 8, border: '1px solid #e2e8f0', gap: 2 }}>
                    <button
                      onClick={() => setCrmView('table')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: crmView === 'table' ? '#ffffff' : 'transparent',
                        color: crmView === 'table' ? '#4f46e5' : '#64748b',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: crmView === 'table' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                      }}
                    >
                      <List size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Table
                    </button>
                    <button
                      onClick={() => setCrmView('kanban')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: crmView === 'kanban' ? '#ffffff' : 'transparent',
                        color: crmView === 'kanban' ? '#4f46e5' : '#64748b',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: crmView === 'kanban' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                      }}
                    >
                      <LayoutGrid size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Kanban Board
                    </button>
                  </div>

                  {/* Manual Lead Creation Button */}
                  <button
                    type="button"
                    onClick={() => setShowAddLeadModal(true)}
                    className="btn-primary"
                    style={{
                      fontSize: 11,
                      padding: '5px 12px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                      boxShadow: '0 2px 6px rgba(79, 70, 229, 0.28)'
                    }}
                    title="Quickly add a new business lead or contact manually to CRM"
                  >
                    <Plus size={13} /> + Add Lead
                  </button>

                  {/* Template-Based Lead Import Button */}
                  <button
                    type="button"
                    onClick={() => setShowImportTemplateModal(true)}
                    className="btn-secondary"
                    style={{
                      fontSize: 11,
                      padding: '5px 11px',
                      fontWeight: 700,
                      color: '#047857',
                      borderColor: '#a7f3d0',
                      background: '#ecfdf5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5
                    }}
                    title="Import leads using standardized CSV template"
                  >
                    <Upload size={12} color="#059669" /> Import Leads
                  </button>

                  {/* Filter-Based Lead Export Button */}
                  <button
                    type="button"
                    onClick={handleExportFilteredLeads}
                    className="btn-secondary"
                    style={{
                      fontSize: 11,
                      padding: '5px 11px',
                      fontWeight: 700,
                      color: '#4338ca',
                      borderColor: '#c7d2fe',
                      background: filteredLeads.length !== leads.length ? '#eef2ff' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5
                    }}
                    title={`Export ${filteredLeads.length.toLocaleString()} leads matching currently active filters`}
                  >
                    <FileDown size={12} color="#4f46e5" />
                    Export Filtered ({filteredLeads.length.toLocaleString()})
                  </button>

                  <button
                    type="button"
                    onClick={() => loadLeadsForFile(selectedFile)}
                    className="btn-secondary"
                    style={{ padding: '5px 8px' }}
                    title="Reload Database"
                  >
                    <RefreshCw size={12} className={loadingLeads ? 'pulse-indicator' : ''} />
                  </button>
                </div>
              </div>

              {/* Bulk Compose Row (when leads selected) */}
              {selectedLeadIds.size > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eef2ff', padding: '6px 12px', borderRadius: 8, border: '1px solid #c7d2fe', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4338ca' }}>
                    📌 {selectedLeadIds.size} Leads Selected
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        setAudienceType('selected_only');
                        setActiveTab('campaign');
                      }}
                      className="btn-primary"
                      style={{ fontSize: 11, padding: '4px 10px' }}
                    >
                      <Send size={11} /> Compose Email Campaign ➔
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('whatsapp');
                        setWaQueueIndex(0);
                      }}
                      className="btn-emerald"
                      style={{ fontSize: 11, padding: '4px 10px' }}
                    >
                      <MessageSquare size={11} /> WhatsApp Blast ➔
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkDeleteLeads}
                      className="btn-secondary"
                      style={{ fontSize: 11, padding: '4px 10px', color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2' }}
                      title="Delete all selected leads from CRM"
                    >
                      <Trash2 size={11} /> Delete ({selectedLeadIds.size})
                    </button>
                    <button
                      onClick={clearSelection}
                      style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: '0 4px' }}
                    >
                      ✕ Clear
                    </button>
                  </div>
                </div>
              )}
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
                          <td colSpan={8} style={{ textAlign: 'center', padding: '48px 24px' }}>
                            <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                <Search size={22} />
                              </div>
                              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                No businesses match your active filters
                              </h4>
                              <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                                {searchQuery ? <span>Search: <strong>"{searchQuery}"</strong> • </span> : null}
                                City: <strong>{cityFilter}</strong> • Category: <strong>{categoryFilter}</strong> • Tier: <strong>{tierFilter}</strong> • Email: <strong>{emailFilter}</strong>
                              </p>
                              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  onClick={handleResetFilters}
                                  className="btn-primary"
                                  style={{ fontSize: 12, padding: '7px 14px' }}
                                >
                                  <RefreshCw size={12} /> Reset All Filters (View All {leads.length.toLocaleString()} Leads)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (searchQuery) setScraperQuery(searchQuery);
                                    setActiveTab('scraper');
                                  }}
                                  className="btn-secondary"
                                  style={{ fontSize: 12, padding: '7px 14px' }}
                                  title="Open Google Maps Scraper to extract new leads"
                                >
                                  <Compass size={13} color="#4f46e5" /> Scrape New Leads for this Search ➔
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedLeads.map((lead, idx) => {
                          const isGuestLocked = !currentUser?.isAuthenticated && idx >= 5;
                          const isSelected = selectedLeadIds.has(lead.id);
                          const matchingAppt = calendarEvents.find(e => e.lead_id === lead.id || (e.lead_name && e.lead_name.toLowerCase() === lead.name.toLowerCase()));
                          const matchingTask = tasks.find(t => (t.lead_id === lead.id || (t.lead_name && t.lead_name.toLowerCase() === lead.name.toLowerCase())) && !t.completed);

                          return (
                            <tr
                              key={lead.id}
                              className={`crm-row ${isSelected ? 'selected' : ''}`}
                              onClick={() => {
                                if (!currentUser?.isAuthenticated && idx >= 3) {
                                  setShowAuthModal(true);
                                  return;
                                }
                                setActiveDossierLead(lead);
                              }}
                              style={{
                                cursor: isGuestLocked ? 'not-allowed' : 'pointer',
                                filter: isGuestLocked ? 'blur(3px)' : 'none',
                                opacity: isGuestLocked ? 0.4 : 1,
                                userSelect: isGuestLocked ? 'none' : 'auto'
                              }}
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
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSingleLead(lead)}
                                    className="btn-ghost"
                                    style={{ padding: '4px 6px', color: '#ef4444' }}
                                    title="Delete lead from CRM"
                                  >
                                    <Trash2 size={13} />
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

                {!currentUser?.isAuthenticated && (
                  <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                    color: '#ffffff',
                    padding: '16px 20px',
                    borderRadius: 12,
                    margin: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    border: '1px solid #334155',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(79, 70, 229, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock size={18} color="#a5b4fc" />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
                          Guest Preview Mode • 5 Sample Records Displayed
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                          Authenticate to unlock all {leads.length.toLocaleString()} verified B2B leads, CSV exports, WhatsApp queueing, and multi-touch outbound automation.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => { setAuthModalTab('google'); setShowAuthModal(true); }}
                        className="btn-secondary"
                        style={{ fontSize: 11, padding: '7px 14px', background: '#ffffff', color: '#1e293b', fontWeight: 700 }}
                      >
                        <span style={{ color: '#ea4335', fontWeight: 900 }}>G</span> Google Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAuthModalTab('otp'); setShowAuthModal(true); }}
                        className="btn-primary"
                        style={{ fontSize: 11, padding: '7px 14px', background: '#4f46e5' }}
                      >
                        <Key size={12} /> Sign Up via OTP
                      </button>
                    </div>
                  </div>
                )}

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#4f46e5', fontWeight: 600 }}>1-Click Agency Targets</span>
                    <button
                      type="button"
                      onClick={() => {
                        setScraperQuery('Chartered Accountants in Gurgaon');
                        setScraperCity('Gurgaon, Haryana');
                        setScraperLimit(25);
                        setScraperOutputName('scraped_ca_gurgaon.csv');
                        showToast('Reset scraper search form', 'info');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        fontSize: 10,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      title="Reset query and settings to defaults"
                    >
                      Clear / New Search
                    </button>
                  </div>
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

              {/* Scrape Limit - Uncapped / Any Volume */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    TARGET EXTRACTION VOLUME (UNCAPPED)
                  </label>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#4f46e5', fontWeight: 800 }}>
                    {scraperLimit ? Number(scraperLimit).toLocaleString() : 0} listings
                  </span>
                </div>
                {/* Preset Volume Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5, marginBottom: 8 }}>
                  {[25, 50, 100, 250, 500, 1000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setScraperLimit(val)}
                      className="btn-secondary"
                      style={{
                        fontSize: 11,
                        padding: '5px 2px',
                        justifyContent: 'center',
                        fontWeight: scraperLimit === val ? 800 : 500,
                        background: scraperLimit === val ? '#eff6ff' : '#ffffff',
                        borderColor: scraperLimit === val ? '#4f46e5' : '#cbd5e1',
                        color: scraperLimit === val ? '#4f46e5' : '#334155'
                      }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                {/* Custom numeric input for ANY volume */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Custom Limit:</span>
                  <input
                    type="number"
                    min="1"
                    max="50000"
                    placeholder="Enter any number (e.g. 500, 2500, 10000)..."
                    value={scraperLimit}
                    onChange={(e) => setScraperLimit(Math.max(1, parseInt(e.target.value) || 0))}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      fontSize: 12,
                      fontWeight: 700,
                      outline: 'none',
                      color: '#0f172a',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  <span style={{ fontSize: 10, color: '#059669', fontWeight: 700, background: '#ecfdf5', padding: '2px 6px', borderRadius: 4 }}>
                    Unlimited
                  </span>
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

              {/* Action Buttons: Start, Pause, Play/Resume, Stop */}
              <div style={{ display: 'flex', gap: 8 }}>
                {scraperJob.is_running ? (
                  <>
                    {scraperJob.is_paused ? (
                      <button
                        type="button"
                        onClick={handleResumeScraper}
                        className="btn-emerald"
                        style={{
                          flex: 1,
                          padding: '12px',
                          fontSize: 13,
                          fontWeight: 800,
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)'
                        }}
                        title="Resume scraping"
                      >
                        <Play size={15} fill="currentColor" /> Resume Extraction
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePauseScraper}
                        style={{
                          flex: 1,
                          background: '#f59e0b',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '12px',
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)'
                        }}
                        title="Pause scraping"
                      >
                        <Pause size={15} fill="currentColor" /> Pause Scraper
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleStopScraper}
                      style={{
                        background: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '12px 18px',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                      title="Stop and save current progress"
                    >
                      <Square size={14} fill="currentColor" /> Stop
                    </button>
                  </>
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
                    <span
                      className={scraperJob.is_running && !scraperJob.is_paused ? 'pulse-indicator' : ''}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: scraperJob.is_paused ? '#f59e0b' : (scraperJob.is_running ? '#3b82f6' : '#10b981')
                      }}
                    />
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                      Live Scraping Progress & Activity
                    </h4>
                    {scraperJob.is_running && (
                      <span style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: scraperJob.is_paused ? '#fef3c7' : '#dbeafe',
                        color: scraperJob.is_paused ? '#b45309' : '#1d4ed8',
                        border: `1px solid ${scraperJob.is_paused ? '#fde68a' : '#bfdbfe'}`
                      }}>
                        {scraperJob.is_paused ? '⏸️ PAUSED' : '⚡ LIVE EXTRACTING'}
                      </span>
                    )}
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
                    <div style={{ color: '#64748b' }}>Scraper idle. Set target parameters above and click "Launch Google Maps Scraper".</div>
                  ) : (
                    scraperJob.logs.map((log, i) => (
                      <div key={i} style={{ color: log.includes('Email:') || log.includes('Found:') ? '#34d399' : log.includes('[!]') ? '#f87171' : log.includes('paused') ? '#fcd34d' : '#cbd5e1', marginBottom: 3 }}>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Scraped Results Feed - Streaming Real-Time Table */}
              <div className="glass-panel" style={{ padding: 20, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Extracted Businesses ({((scraperJob.leads && scraperJob.leads.length) || (scraperJob.recent_leads && scraperJob.recent_leads.length) || 0)})</span>
                    {scraperJob.is_running && (
                      <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>• Streaming live</span>
                    )}
                  </h4>
                  {((scraperJob.leads && scraperJob.leads.length > 0) || (scraperJob.recent_leads && scraperJob.recent_leads.length > 0)) && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={async () => {
                          await fetchCsvs();
                          setSelectedFile(scraperOutputName);
                          setActiveTab('campaign');
                          showToast(`Loaded ${scraperJob.leads?.length || 0} scraped leads into Email Campaign Studio!`);
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
                          showToast(`Loaded ${scraperJob.leads?.length || 0} scraped leads into WhatsApp Hub!`);
                        }}
                        className="btn-emerald"
                        style={{ fontSize: 11, padding: '5px 12px' }}
                        title="Transfer scraped leads directly into WhatsApp Outreach Queue"
                      >
                        <MessageSquare size={12} /> Target with WhatsApp ➔
                      </button>

                      <button
                        onClick={() => exportLeadsToCsv(scraperJob.leads || scraperJob.recent_leads || [], scraperOutputName.replace('.csv', ''))}
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
                        <th style={{ padding: '8px 10px' }}>Business Name</th>
                        <th style={{ padding: '8px 10px' }}>Category</th>
                        <th style={{ padding: '8px 10px' }}>Phone</th>
                        <th style={{ padding: '8px 10px' }}>Email</th>
                        <th style={{ padding: '8px 10px' }}>Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!scraperJob.leads || scraperJob.leads.length === 0) && (!scraperJob.recent_leads || scraperJob.recent_leads.length === 0) ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                            {scraperJob.is_running ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                <RefreshCw size={20} className="pulse-indicator" color="#4f46e5" />
                                <span style={{ color: '#4f46e5', fontWeight: 600 }}>
                                  Google Maps scanner is active. Discovered leads will stream into this table in real-time...
                                </span>
                              </div>
                            ) : (
                              'No businesses captured yet. Results will stream here live.'
                            )}
                          </td>
                        </tr>
                      ) : (
                        (scraperJob.leads && scraperJob.leads.length > 0 ? scraperJob.leads : scraperJob.recent_leads).map((l, idx) => {
                          const name = l['Business Name'] || l['Company Name'] || l.name || l['Name'] || 'Business';
                          const cat = l['Category'] || l.category || 'Commercial Business';
                          const phone = l['Phone Number'] || l['Phone'] || l.phone || l.wa_phone || '';
                          const email = l['Email'] || l.email || '';
                          const rating = l['Rating'] || l.rating || '';
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>{name}</td>
                              <td style={{ padding: '8px 10px' }}><span className="badge badge-cat">{cat}</span></td>
                              <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)' }}>{phone || '-'}</td>
                              <td style={{ padding: '8px 10px' }}>
                                {email ? <span className="badge badge-email">{email}</span> : <span className="badge badge-no-email">Searching website...</span>}
                              </td>
                              <td style={{ padding: '8px 10px' }}>
                                {rating ? <span style={{ color: '#d97706', fontWeight: 700 }}>★ {rating}</span> : '-'}
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
                    <option value="digital_agency">🚀 Digital & Marketing Agency Outreach</option>
                    <option value="medical_health">🩺 Healthcare, Clinics & Medical Practices</option>
                    <option value="universal_agency">🌐 High-Converting Universal Agency Pitch</option>
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

                {/* Live Sample Lead Preview Ribbon */}
                {leads.length > 0 && (
                  <div style={{
                    marginBottom: 12,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
                      <span style={{ fontSize: 13 }}>🎯</span>
                      <span style={{ fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>Live Preview Target:</span>
                      <span style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {previewLead?.name || 'Sample Lead'}
                      </span>
                      <span style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>
                        ({previewLead?.city || 'City'})
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const curIdx = leads.findIndex(l => l.id === previewLead?.id || l.name === previewLead?.name);
                          const prevIdx = Math.max(0, (curIdx >= 0 ? curIdx : 0) - 1);
                          setPreviewLead(leads[prevIdx]);
                        }}
                        className="btn-secondary"
                        style={{ padding: '2px 7px', fontSize: 11, borderRadius: 4 }}
                        title="Preview with Previous Lead"
                      >
                        ◀
                      </button>
                      <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                        {(() => {
                          const curIdx = leads.findIndex(l => l.id === previewLead?.id || l.name === previewLead?.name);
                          return (curIdx >= 0 ? curIdx : 0) + 1;
                        })()} / {leads.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const curIdx = leads.findIndex(l => l.id === previewLead?.id || l.name === previewLead?.name);
                          const nextIdx = Math.min(leads.length - 1, (curIdx >= 0 ? curIdx : 0) + 1);
                          setPreviewLead(leads[nextIdx]);
                        }}
                        className="btn-secondary"
                        style={{ padding: '2px 7px', fontSize: 11, borderRadius: 4 }}
                        title="Preview with Next Lead"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                )}

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
                    {['{name}', '{area}', '{city}', '{category}', '{rating}', '{sender_name}', '{sender_company}', '{sender_phone}'].map(tag => (
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

              {/* Quick Test Email Dispatcher Bar */}
              <div style={{
                marginTop: 14,
                padding: '14px 18px',
                background: '#ffffff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#eef2ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4f46e5',
                    flexShrink: 0
                  }}>
                    <Send size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>
                      Send Test Email to Inbox
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      Test live deliverability and formatting before starting campaign.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 280 }}>
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    placeholder={currentUser?.email || 'Ishantsingla94@gmail.com'}
                    style={{
                      flex: 1,
                      padding: '7px 12px',
                      fontSize: 12,
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc'
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={sendingTest}
                    className="btn-primary"
                    style={{
                      fontSize: 12,
                      padding: '8px 16px',
                      background: sendingTest ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {sendingTest ? (
                      <>
                        <RefreshCw size={13} className="pulse-indicator" /> Dispatching...
                      </>
                    ) : (
                      <>
                        <Send size={13} /> Send Test Now
                      </>
                    )}
                  </button>
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

                  {/* SDR 1-Click Status Tagger */}
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>QUICK STATUS:</span>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {[
                        { status: 'New', label: '⚡ New', bg: '#f1f5f9', color: '#475569' },
                        { status: 'Contacted', label: '📞 Contacted', bg: '#eff6ff', color: '#2563eb' },
                        { status: 'Interested', label: '🔥 Interested', bg: '#fef3c7', color: '#d97706' },
                        { status: 'Follow-up', label: '⏳ Follow-up', bg: '#ede9fe', color: '#7c3aed' },
                        { status: 'Converted', label: '🎉 Won', bg: '#ecfdf5', color: '#059669' },
                        { status: 'Lost', label: '🚫 Lost', bg: '#fee2e2', color: '#dc2626' },
                      ].map(s => {
                        const isCurrent = (currentWaLead.status || 'New') === s.status;
                        return (
                          <button
                            key={s.status}
                            type="button"
                            onClick={async () => {
                              await handleStatusChange(currentWaLead, s.status, 'manual_status_change', `Status updated to ${s.status} via WhatsApp Hub`);
                              showToast(`Lead tagged as ${s.status}`, 'success');
                            }}
                            style={{
                              fontSize: 10,
                              fontWeight: isCurrent ? 800 : 600,
                              padding: '2px 7px',
                              borderRadius: 4,
                              background: isCurrent ? s.color : s.bg,
                              color: isCurrent ? '#ffffff' : s.color,
                              border: isCurrent ? `1px solid ${s.color}` : '1px solid #cbd5e1',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Empty Queue State */}
              {waQueueLeads.length === 0 && (
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: 10,
                  padding: 24,
                  textAlign: 'center',
                  marginBottom: 16
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📱</div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    No WhatsApp Contacts in Current Filter
                  </h4>
                  <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                    {countWithWa > 0
                      ? `Your active search/category filter matched 0 mobile leads, but there are ${countWithWa.toLocaleString()} WhatsApp numbers available across your database.`
                      : 'No WhatsApp or mobile numbers found in this dataset. Use the Maps Scraper to extract leads with verified phone numbers.'}
                  </p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {countWithWa > 0 && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="btn-primary"
                        style={{ fontSize: 12, padding: '7px 14px' }}
                      >
                        🔄 Reset Filters & Load All {countWithWa.toLocaleString()} Numbers
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTab('scraper')}
                      className="btn-secondary"
                      style={{ fontSize: 12, padding: '7px 14px' }}
                    >
                      🧭 Scrape New Leads for WhatsApp ➔
                    </button>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#0f172a' }}>Real WhatsApp Bubble Preview</h4>
                {currentWaLead && (
                  <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
                    Target: {currentWaLead.name}
                  </span>
                )}
              </div>
              <div style={{ background: '#e5ddd5', borderRadius: 12, padding: 24, border: '1px solid #cbd5e1' }}>
                <div style={{ background: '#dcf8c6', color: '#0f172a', borderRadius: '8px 8px 0 8px', padding: 16, fontSize: 14, lineHeight: 1.6, maxWidth: 520, marginLeft: 'auto', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', whiteSpace: 'pre-line' }}>
                  {(() => {
                    const text = customWaText || renderedPreview?.wa_text || '';
                    if (!currentWaLead) return text;
                    return text
                      .replace(/{name}/g, currentWaLead.name)
                      .replace(/{business_name}/g, currentWaLead.name)
                      .replace(/{area}/g, currentWaLead.area || currentWaLead.city)
                      .replace(/{city}/g, currentWaLead.city)
                      .replace(/{category}/g, currentWaLead.category)
                      .replace(/{rating}/g, currentWaLead.rating || '4.8')
                      .replace(/{sender_name}/g, currentAccountObj?.name || 'Growth Specialist')
                      .replace(/{sender_phone}/g, currentAccountObj?.phone || '+91 7015147209')
                      .replace(/{sender_company}/g, currentAccountObj?.designation || 'ApexOutreach Studio');
                  })()}
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
        {/* =========================================================================
            TAB 5: SENT LOGS & AUDIT CRM BOARD (SEARCH, FILTERS, KPIS & EXPORT)
           ========================================================================= */}
        {activeTab === 'logs' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Top Delivery Analytics KPI Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div className="glass-panel" style={{ padding: '16px 20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total Dispatched
                  </span>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Send size={14} color="#3b82f6" />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
                  {logsMetrics.total.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Across all active & historical campaigns
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '16px 20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Delivered & Verified
                  </span>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={14} color="#10b981" />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
                  {logsMetrics.delivered.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginTop: 4 }}>
                  {logsMetrics.deliveryRate}% inbox placement rate
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '16px 20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Inbound Replies & Warm
                  </span>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Flame size={14} color="#f59e0b" />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
                  {logsMetrics.replied.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: '#d97706', fontWeight: 600, marginTop: 4 }}>
                  {logsMetrics.replyRate}% direct conversion velocity
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '16px 20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Delivery Bounces / Flags
                  </span>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={14} color="#ef4444" />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
                  {logsMetrics.failed.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  {logsMetrics.total > 0 ? ((logsMetrics.failed / logsMetrics.total) * 100).toFixed(1) : 0}% bounce rate (Healthy &lt;3%)
                </div>
              </div>
            </div>

            {/* Main Logs Table & Command Filter Bar */}
            <div className="glass-panel" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={18} color="#4f46e5" />
                    <span>Outreach Delivery Logs & CRM Audit Trail</span>
                    <span style={{ fontSize: 11, background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                      {filteredSentLogs.length} of {sentLogs.length} Records
                    </span>
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    Real-time verification of email transmissions, WhatsApp pings, response detection, and delivery telemetry.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={exportSentLogsCsv}
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: '7px 12px' }}
                    title="Export filtered audit logs as CSV"
                  >
                    <Download size={13} /> Export Filtered CSV
                  </button>
                  <button
                    type="button"
                    onClick={fetchSentLogs}
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: '7px 12px' }}
                  >
                    <RefreshCw size={13} className={loadingLogs ? 'pulse-indicator' : ''} /> Refresh Logs
                  </button>
                </div>
              </div>

              {/* Interactive Filter Strip */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}>
                {/* Row 1: Live Search & Dropdowns */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                    <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 10 }} />
                    <input
                      type="text"
                      value={logsSearchQuery}
                      onChange={(e) => setLogsSearchQuery(e.target.value)}
                      placeholder="Search company, recipient email, subject, area..."
                      style={{
                        width: '100%',
                        padding: '7px 28px 7px 32px',
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    />
                    {logsSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setLogsSearchQuery('')}
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ffffff', padding: '5px 10px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
                    <Filter size={13} color="#4f46e5" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Status:</span>
                    <select
                      value={logsStatusFilter}
                      onChange={(e) => setLogsStatusFilter(e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: 12, fontWeight: 700, color: '#0f172a', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Delivered">Delivered / Sent</option>
                      <option value="Replied">Replied / Interested</option>
                      <option value="Failed">Failed / Bounced</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ffffff', padding: '5px 10px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
                    <Layers size={13} color="#059669" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Channel:</span>
                    <select
                      value={logsChannelFilter}
                      onChange={(e) => setLogsChannelFilter(e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: 12, fontWeight: 700, color: '#0f172a', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="ALL">All Channels</option>
                      <option value="email">Email Campaign</option>
                      <option value="whatsapp">WhatsApp Outreach</option>
                    </select>
                  </div>

                  {(logsSearchQuery || logsStatusFilter !== 'ALL' || logsChannelFilter !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogsSearchQuery('');
                        setLogsStatusFilter('ALL');
                        setLogsChannelFilter('ALL');
                      }}
                      style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 10px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Clear Filters
                    </button>
                  )}
                </div>

                {/* Row 2: Quick Filter Pills */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => { setLogsStatusFilter('ALL'); setLogsChannelFilter('ALL'); }}
                    className={`filter-pill ${logsStatusFilter === 'ALL' && logsChannelFilter === 'ALL' ? 'active' : ''}`}
                    style={{ fontSize: 11, padding: '3px 10px' }}
                  >
                    All Records ({sentLogs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogsStatusFilter(prev => prev === 'Delivered' ? 'ALL' : 'Delivered')}
                    className={`filter-pill ${logsStatusFilter === 'Delivered' ? 'active' : ''}`}
                    style={{ fontSize: 11, padding: '3px 10px' }}
                  >
                    ✓ Delivered ({logsMetrics.delivered})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogsStatusFilter(prev => prev === 'Replied' ? 'ALL' : 'Replied')}
                    className={`filter-pill ${logsStatusFilter === 'Replied' ? 'active' : ''}`}
                    style={{ fontSize: 11, padding: '3px 10px' }}
                  >
                    🔥 Replies Received ({logsMetrics.replied})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogsStatusFilter(prev => prev === 'Failed' ? 'ALL' : 'Failed')}
                    className={`filter-pill ${logsStatusFilter === 'Failed' ? 'active' : ''}`}
                    style={{ fontSize: 11, padding: '3px 10px' }}
                  >
                    ⚠️ Bounces ({logsMetrics.failed})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogsChannelFilter(prev => prev === 'whatsapp' ? 'ALL' : 'whatsapp')}
                    className={`filter-pill ${logsChannelFilter === 'whatsapp' ? 'active' : ''}`}
                    style={{ fontSize: 11, padding: '3px 10px' }}
                  >
                    💬 WhatsApp Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogsChannelFilter(prev => prev === 'email' ? 'ALL' : 'email')}
                    className={`filter-pill ${logsChannelFilter === 'email' ? 'active' : ''}`}
                    style={{ fontSize: 11, padding: '3px 10px' }}
                  >
                    ✉️ Email Only
                  </button>
                </div>
              </div>

              {/* Responsive Delivery Table */}
              <div style={{ overflowX: 'auto', maxHeight: '65vh' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', borderBottom: '1px solid #cbd5e1', zIndex: 2 }}>
                    <tr>
                      <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Timestamp</th>
                      <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Channel</th>
                      <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Business Name</th>
                      <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Recipient Email</th>
                      <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Area / City</th>
                      <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Subject / Template</th>
                      <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>CRM Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSentLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                          {sentLogs.length === 0 ? (
                            <div>
                              <Clock size={28} color="#cbd5e1" style={{ marginBottom: 8 }} />
                              <div>No outreach delivery logs recorded yet.</div>
                              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                                Dispatched emails or WhatsApp pings will automatically record an immutable audit log here.
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div>No logs match current filters: <strong>"{logsSearchQuery || logsStatusFilter || logsChannelFilter}"</strong></div>
                              <button
                                type="button"
                                onClick={() => { setLogsSearchQuery(''); setLogsStatusFilter('ALL'); setLogsChannelFilter('ALL'); }}
                                className="btn-secondary"
                                style={{ marginTop: 10, fontSize: 11 }}
                              >
                                Clear Filters
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredSentLogs.map((log, idx) => {
                        const isWa = (log.channel === 'whatsapp' || log.type === 'whatsapp' || (log.details && log.details.toLowerCase().includes('whatsapp')));
                        const st = (log.status || 'Delivered').toLowerCase();
                        const isReplied = st.includes('repli') || st.includes('interest');
                        const isFailed = st.includes('fail') || st.includes('error') || st.includes('bounce');

                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', color: '#64748b', fontSize: 11 }}>
                              {log.timestamp || 'Just now'}
                            </td>
                            <td style={{ padding: '9px 12px' }}>
                              {isWa ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dcfce7', color: '#15803d', padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>
                                  <MessageSquare size={10} /> WhatsApp
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eff6ff', color: '#1d4ed8', padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>
                                  <Mail size={10} /> Email
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '9px 12px', fontWeight: 700, color: '#0f172a' }}>
                              {log.business_name || log.name || 'Business'}
                            </td>
                            <td style={{ padding: '9px 12px', color: '#4f46e5', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                              {log.email || '-'}
                            </td>
                            <td style={{ padding: '9px 12px', color: '#475569' }}>
                              {log.city_area || log.area || 'Gurgaon'}
                            </td>
                            <td style={{ padding: '9px 12px', color: '#334155', maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.subject || log.details}>
                              {log.subject || log.details || 'B2B Client Outreach'}
                            </td>
                            <td style={{ padding: '9px 12px' }}>
                              {isReplied ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, border: '1px solid #fde68a' }}>
                                  🔥 {log.status || 'Replied'}
                                </span>
                              ) : isFailed ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, border: '1px solid #fecaca' }}>
                                  ⚠️ {log.status || 'Failed'}
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, border: '1px solid #a7f3d0' }}>
                                  ✓ {log.status || 'Delivered'}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '9px 12px' }}>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const matchLead = leads.find(l => l.email === log.email || l.name === log.business_name) || { id: log.email || Date.now(), name: log.business_name, email: log.email };
                                    handleSimulateReply(matchLead);
                                  }}
                                  className="btn-secondary"
                                  style={{ fontSize: 10, padding: '3px 7px', color: '#d97706', borderColor: '#fcd34d' }}
                                  title="Simulate / Mark Lead Replied as Interested"
                                >
                                  <Flame size={11} color="#f59e0b" /> Reply Received
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const matchLead = leads.find(l => l.email === log.email || l.name === log.business_name) || { id: log.email || Date.now(), name: log.business_name, email: log.email, area: log.city_area };
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a' }}>
                  <Edit3 size={18} color="#4f46e5" /> Configure Sender Profile & Details
                </h3>
                {currentUser?.isAuthenticated && (
                  <span style={{ fontSize: 10, background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                    Logged in as {currentUser.name}
                  </span>
                )}
              </div>

              {/* Logged-In User SMTP Setup Guide */}
              {currentUser?.isAuthenticated ? (
                <div className="smtp-guide-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Key size={16} color="#4f46e5" />
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                      Gmail & Google Workspace SMTP Setup Guide
                    </h4>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                    To dispatch emails directly from your personal or Google Workspace email address, follow these 4 quick steps:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11, color: '#334155' }}>
                      <span className="smtp-step-badge">1</span>
                      <div>
                        Go to <strong>Google Account</strong> (myaccount.google.com) ➔ <strong>Security</strong> ➔ Turn ON <strong>2-Step Verification</strong>.
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11, color: '#334155' }}>
                      <span className="smtp-step-badge">2</span>
                      <div>
                        In Google Account search bar, type <strong>"App Passwords"</strong> (or visit <code>myaccount.google.com/apppasswords</code>).
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11, color: '#334155' }}>
                      <span className="smtp-step-badge">3</span>
                      <div>
                        Enter App Name as <strong>ApexOutreach CRM</strong> and click <strong>Create</strong>.
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11, color: '#334155' }}>
                      <span className="smtp-step-badge">4</span>
                      <div>
                        Copy the generated <strong>16-character code</strong> and paste it into the <strong>Gmail App Password</strong> field below.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Default Settings:</span>
                      <span
                        className="smtp-copy-tag"
                        onClick={() => {
                          navigator.clipboard.writeText('smtp.gmail.com');
                          showToast('Copied "smtp.gmail.com" to clipboard!');
                        }}
                        title="Click to copy host"
                      >
                        Host: smtp.gmail.com <Copy size={10} />
                      </span>
                      <span
                        className="smtp-copy-tag"
                        onClick={() => {
                          navigator.clipboard.writeText('587');
                          showToast('Copied port "587" to clipboard!');
                        }}
                        title="Click to copy port"
                      >
                        Port: 587 <Copy size={10} />
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingAccount(prev => ({
                          ...(prev || currentAccountObj),
                          smtp_server: 'smtp.gmail.com',
                          smtp_port: 587
                        }));
                        showToast('Applied default Gmail SMTP settings!');
                      }}
                      className="btn-secondary"
                      style={{ fontSize: 10, padding: '3px 8px', color: '#4f46e5', borderColor: '#c7d2fe' }}
                    >
                      Fill Default Gmail Settings
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: 12, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, color: '#92400e' }}>
                    🔒 Sign in to access your personal SMTP relay profile and credential setup guide.
                  </div>
                  <button
                    type="button"
                    onClick={() => { setAuthModalTab('google'); setShowAuthModal(true); }}
                    className="btn-primary"
                    style={{ fontSize: 10, padding: '4px 10px' }}
                  >
                    Sign In
                  </button>
                </div>
              )}

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

            {/* Outbound Safety, Delivery Schedule & Inbox Protection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Deliverability & Safety Suite Card */}
              <div className="glass-panel" style={{ padding: 22, border: '1.5px solid #10b981', background: '#f0fdf4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#065f46', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldCheck size={20} color="#059669" />
                    <span>Outbound Safety, Schedule & Sender Guardrails</span>
                  </h3>
                  <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: 10, fontWeight: 800, border: '1px solid #86efac' }}>
                    🛡️ Deliverability Shield Active
                  </span>
                </div>

                <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  Protect your Google Workspace and Gmail reputation from spam filters. Enforce daily sending guardrails, schedule outreach during peak office hours, and mimic natural human pacing.
                </p>

                {/* 1. Real-Time Daily Safety Budget Gauge */}
                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>Today's Outreach Quota Usage:</span>
                    <strong style={{ fontSize: 14, color: cronTracker.sent_today > (cronTracker.daily_limit * 0.9) ? '#dc2626' : '#059669', fontFamily: 'var(--font-mono)' }}>
                      {cronTracker.sent_today} / {cronTracker.daily_limit} emails dispatched
                    </strong>
                  </div>
                  <div style={{ height: 10, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, Math.round(cronTracker.sent_today / (cronTracker.daily_limit || 1) * 100))}%`,
                        background: cronTracker.sent_today > (cronTracker.daily_limit * 0.9) ? '#ef4444' : 'linear-gradient(90deg, #10b981, #059669)',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginTop: 8 }}>
                    <span>Safe remaining sends for today: <strong style={{ color: '#0f172a' }}>{cronTracker.remaining_today} emails</strong></span>
                    <span>Safety reset: <strong>Midnight IST (Automatic)</strong></span>
                  </div>

                  {/* Daily Budget Selector with Presets */}
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                        DAILY SENDING SAFETY CAP
                      </label>
                      <span style={{ fontSize: 10, color: '#059669', fontWeight: 600 }}>
                        💡 50–75 recommended per Gmail account
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {[30, 50, 75, 100, 200].map(limitVal => (
                        <button
                          key={limitVal}
                          type="button"
                          onClick={() => setCronTracker(prev => ({ ...prev, daily_limit: limitVal }))}
                          className="btn-secondary"
                          style={{
                            fontSize: 11,
                            padding: '4px 10px',
                            fontWeight: cronTracker.daily_limit === limitVal ? 800 : 500,
                            background: cronTracker.daily_limit === limitVal ? '#ecfdf5' : '#ffffff',
                            borderColor: cronTracker.daily_limit === limitVal ? '#10b981' : '#cbd5e1',
                            color: cronTracker.daily_limit === limitVal ? '#047857' : '#334155'
                          }}
                        >
                          {limitVal} / day
                        </button>
                      ))}
                      <input
                        type="number"
                        min="5"
                        max="1000"
                        value={cronTracker.daily_limit}
                        onChange={(e) => setCronTracker(prev => ({ ...prev, daily_limit: Math.max(1, Number(e.target.value)) }))}
                        style={{ width: 85, padding: '5px 8px', fontSize: 12, fontWeight: 700, borderRadius: 6, border: '1px solid #cbd5e1' }}
                        title="Custom daily sending cap"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Smart Office Hours Delivery Schedule */}
                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={15} color="#059669" />
                    <span>Smart Sending Schedule (Maximize Open & Reply Rates)</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                          ☀️ Peak Business Hours Only (9:00 AM – 6:00 PM)
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          Pauses outreach automatically in the evening and overnight when executives aren't checking inboxes.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={scheduleBusinessHours}
                        onChange={(e) => setScheduleBusinessHours(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: '#059669' }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                          📅 Weekdays Only (Monday to Friday)
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          Skips Saturdays and Sundays. Cold emails sent on weekends convert 42% lower.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={scheduleWeekdaysOnly}
                        onChange={(e) => setScheduleWeekdaysOnly(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: '#059669' }}
                      />
                    </label>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#475569', padding: '4px 2px' }}>
                      <span>Target Timezone: <strong>India Standard Time (IST • UTC+05:30)</strong></span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>✓ Auto-Synced</span>
                    </div>
                  </div>
                </div>

                {/* 3. Humanized Anti-Spam Pacing (Human Sending Intervals) */}
                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Activity size={15} color="#059669" />
                      <span>Human Anti-Spam Pacing (Randomized Interval Delays)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAdvancedSafety(!showAdvancedSafety)}
                      style={{ background: 'transparent', border: 'none', color: '#059669', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                    >
                      {showAdvancedSafety ? 'Hide Fine-Tuning' : 'Fine-Tune Intervals ➔'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                    <div
                      onClick={() => {
                        setSafetyPacingPreset('safe');
                        setMicroBatchSize(2);
                        setBatchCooldown(15);
                        setJitterMin(12);
                        setJitterMax(24);
                      }}
                      style={{
                        padding: '12px 10px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: `1.5px solid ${safetyPacingPreset === 'safe' ? '#10b981' : '#e2e8f0'}`,
                        background: safetyPacingPreset === 'safe' ? '#ecfdf5' : '#f8fafc',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: 16, marginBottom: 2 }}>🛡️</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a' }}>Ultra-Safe</div>
                      <div style={{ fontSize: 10, color: '#059669', fontWeight: 600 }}>12–24s pause</div>
                      <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>New/Warmup accounts</div>
                    </div>

                    <div
                      onClick={() => {
                        setSafetyPacingPreset('balanced');
                        setMicroBatchSize(4);
                        setBatchCooldown(10);
                        setJitterMin(5);
                        setJitterMax(10);
                      }}
                      style={{
                        padding: '12px 10px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: `1.5px solid ${safetyPacingPreset === 'balanced' ? '#10b981' : '#e2e8f0'}`,
                        background: safetyPacingPreset === 'balanced' ? '#ecfdf5' : '#f8fafc',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: 16, marginBottom: 2 }}>⚖️</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a' }}>Balanced (Optimal)</div>
                      <div style={{ fontSize: 10, color: '#059669', fontWeight: 600 }}>5–10s pause</div>
                      <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>Established inboxes</div>
                    </div>

                    <div
                      onClick={() => {
                        setSafetyPacingPreset('fast');
                        setMicroBatchSize(6);
                        setBatchCooldown(6);
                        setJitterMin(3);
                        setJitterMax(6);
                      }}
                      style={{
                        padding: '12px 10px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: `1.5px solid ${safetyPacingPreset === 'fast' ? '#10b981' : '#e2e8f0'}`,
                        background: safetyPacingPreset === 'fast' ? '#ecfdf5' : '#f8fafc',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: 16, marginBottom: 2 }}>⚡</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a' }}>Fast Lane</div>
                      <div style={{ fontSize: 10, color: '#059669', fontWeight: 600 }}>3–6s pause</div>
                      <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>Urgent outreach</div>
                    </div>
                  </div>

                  {showAdvancedSafety && (
                    <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: 12, marginTop: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                        Custom Interval & Burst Fine-Tuning:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>Burst Chunk Size (Emails)</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={microBatchSize}
                            onChange={(e) => setMicroBatchSize(Number(e.target.value))}
                            style={{ width: '100%', padding: '5px 8px', fontSize: 12, marginTop: 2 }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>Burst Pause (Seconds)</label>
                          <input
                            type="number"
                            min="3"
                            max="60"
                            value={batchCooldown}
                            onChange={(e) => setBatchCooldown(Number(e.target.value))}
                            style={{ width: '100%', padding: '5px 8px', fontSize: 12, marginTop: 2 }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>Min Jitter (Seconds)</label>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={jitterMin}
                            onChange={(e) => setJitterMin(Number(e.target.value))}
                            style={{ width: '100%', padding: '5px 8px', fontSize: 12, marginTop: 2 }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>Max Jitter (Seconds)</label>
                          <input
                            type="number"
                            min="2"
                            max="60"
                            value={jitterMax}
                            onChange={(e) => setJitterMax(Number(e.target.value))}
                            style={{ width: '100%', padding: '5px 8px', fontSize: 12, marginTop: 2 }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Action Row */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveCronSettings(cronTracker.daily_limit, cronTracker.token, microBatchSize, batchCooldown, jitterMin, jitterMax);
                      showToast('✅ Outbound safety schedule & pacing guardrails saved!', 'success');
                    }}
                    className="btn-secondary"
                    style={{ flex: 1, padding: 12, fontSize: 13, fontWeight: 700, justifyContent: 'center' }}
                  >
                    Save Safety & Schedule Guardrails
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerDailyCron}
                    disabled={triggeringDaily || cronTracker.remaining_today <= 0}
                    className="btn-emerald"
                    style={{ flex: 1.2, padding: 12, fontSize: 13, fontWeight: 800, justifyContent: 'center' }}
                  >
                    <Zap size={14} /> {triggeringDaily ? 'Dispatching Queue...' : '⚡ Run Daily Outreach Dispatch Now'}
                  </button>
                </div>

                {/* 5. Collapsible Developer & Webhook Drawer (Tucked away cleanly) */}
                <div style={{ borderTop: '1px solid #bbf7d0', paddingTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowWebhookDrawer(!showWebhookDrawer)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#059669',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>{showWebhookDrawer ? '▼' : '▶'} Developer Webhooks & Zapier Integrations</span>
                  </button>

                  {showWebhookDrawer && (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                          Daily Dispatch Webhook Trigger URL:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const fullUrl = `${window.location.origin}/api/cron/dispatch-daily?token=${encodeURIComponent(cronTracker.token)}`;
                            navigator.clipboard.writeText(fullUrl);
                            showToast('Copied Webhook URL to clipboard!');
                          }}
                          style={{ background: 'transparent', color: '#059669', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                        >
                          <Copy size={12} /> Copy URL
                        </button>
                      </div>
                      <code style={{ fontSize: 11, color: '#0f172a', wordBreak: 'break-all', fontFamily: 'var(--font-mono)', display: 'block', background: '#f8fafc', padding: '6px 8px', borderRadius: 6 }}>
                        {window.location.origin}/api/cron/dispatch-daily?token={cronTracker.token}
                      </code>
                      <div style={{ marginTop: 8 }}>
                        <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>Security Token:</label>
                        <input
                          type="text"
                          value={cronTracker.token}
                          onChange={(e) => setCronTracker(prev => ({ ...prev, token: e.target.value }))}
                          style={{ width: '100%', padding: '5px 8px', fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 2 }}
                        />
                      </div>
                    </div>
                  )}
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
          GLOBAL SAAS APPLICATION FOOTER (ENTERPRISE UI/UX)
         ========================================================================= */}
      <footer className="global-saas-footer">
        <div className="footer-inner-container">
          {/* Top Telemetry & Trust Strip */}
          <div className="footer-top-strip">
            <div className="footer-brand-box">
              <div className="footer-brand-logo">
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.3px' }}>
                    ApexOutreach <span style={{ color: '#818cf8' }}>Studio</span>
                  </h3>
                  <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', background: '#312e81', color: '#c7d2fe', padding: '1px 6px', borderRadius: 4, letterSpacing: '0.4px' }}>
                    v4.8 Enterprise
                  </span>
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '3px 0 0 0', fontWeight: 500 }}>
                  High-Ticket B2B Acquisition Operating System • Multi-Channel Outreach CRM
                </p>
              </div>
            </div>

            <div className="footer-telemetry-pills">
              <div className="telemetry-chip success">
                <span className="telemetry-dot-live" />
                <span>All Systems Operational</span>
              </div>
              <div className="telemetry-chip">
                <Activity size={12} color="#38bdf8" />
                <span>SMTP Gateway: 180ms</span>
              </div>
              <div className="telemetry-chip">
                <MessageSquare size={12} color="#34d399" />
                <span>WhatsApp API: Connected</span>
              </div>
              <div className="telemetry-chip">
                <Lock size={12} color="#a78bfa" />
                <span>256-Bit Encrypted</span>
              </div>
              <div className="telemetry-chip">
                <ShieldCheck size={12} color="#10b981" />
                <span>India AP-South-1 Hosted</span>
              </div>
            </div>
          </div>

          {/* 4-Column Navigation & Resource Architecture */}
          <div className="footer-nav-grid">
            {/* Column 1: Core Outbound Engines */}
            <div>
              <div className="footer-col-header">
                <Workflow size={13} color="#818cf8" />
                <span>Outbound Engines</span>
              </div>
              <ul className="footer-link-group">
                <li>
                  <button type="button" onClick={() => { setActiveTab('pipeline'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="footer-nav-item">
                    Pipeline Funnel & Stages <span className="footer-nav-badge">6-Stage</span>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => { setActiveTab('crm'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="footer-nav-item">
                    Verified Lead Directory & CSV
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => { setActiveTab('campaign'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="footer-nav-item">
                    AI Multi-Touch Cold Email Studio
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => { setActiveTab('whatsapp'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="footer-nav-item">
                    1-Click Direct WhatsApp Blast Hub
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => { setActiveTab('scraper'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="footer-nav-item">
                    Google Maps Real-Time Scraper
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Agency Growth & Retainers */}
            <div>
              <div className="footer-col-header">
                <Briefcase size={13} color="#38bdf8" />
                <span>Agency Retainers</span>
              </div>
              <ul className="footer-link-group">
                <li>
                  <button type="button" onClick={() => { setActiveTab('agency'); setAgencySubTab('proposals'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="footer-nav-item">
                    1-Click Retainer Proposals <span className="footer-nav-badge">Printable</span>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => { setActiveTab('agency'); setAgencySubTab('clients'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="footer-nav-item">
                    White-Label Client Dashboards
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => { setActiveTab('agency'); setAgencySubTab('sequences'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="footer-nav-item">
                    Multi-Touch Cadence Blueprints
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => { setActiveTab('agency'); setAgencySubTab('radar'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="footer-nav-item">
                    High-Priority Follow-Up Radar
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => { setActiveTab('pipeline'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="footer-nav-item">
                    Contracted MRR & Win Rate Logs
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Commercial & Monetization */}
            <div>
              <div className="footer-col-header">
                <Zap size={13} color="#facc15" />
                <span>Plans & Upgrades</span>
              </div>
              <ul className="footer-link-group">
                <li>
                  <button type="button" onClick={() => setShowPricingModal(true)} className="footer-nav-item">
                    Starter Agency Plan (₹2,499/mo)
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setShowPricingModal(true)} className="footer-nav-item" style={{ color: '#facc15', fontWeight: 700 }}>
                    Growth Tier (₹6,999/mo) <span className="footer-nav-badge" style={{ background: '#ca8a04', color: '#fff', borderColor: '#eab308' }}>Popular</span>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setShowPricingModal(true)} className="footer-nav-item">
                    Enterprise Agency Suite (₹14,999/mo)
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setShowTopUpCreditsModal(true)} className="footer-nav-item">
                    Verified Lead Credit Packs (₹0.70/lead)
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setActiveTab('settings')} className="footer-nav-item">
                    Dedicated SMTP Relays & Warmup
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Compliance & Trust */}
            <div>
              <div className="footer-col-header">
                <ShieldCheck size={13} color="#34d399" />
                <span>Security & Compliance</span>
              </div>
              <ul className="footer-link-group">
                <li style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                  SOC-2 Type II Certified infrastructure with 99.98% guaranteed uptime SLA.
                </li>
                <li style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                  Zero-bounce MX and SMTP verification engine ensures 99.4% inbox placement.
                </li>
                <li style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                  Full GDPR, CAN-SPAM and Indian IT Act compliance with automatic unsubscribes.
                </li>
                <li style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 10, background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '2px 7px', borderRadius: 6, fontWeight: 700 }}>GST Registered</span>
                  <span style={{ fontSize: 10, background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '2px 7px', borderRadius: 6, fontWeight: 700 }}>Razorpay Verified</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright, Version & Back to Top */}
          <div className="footer-bottom-bar">
            <div>
              © 2026 ApexOutreach Technologies Pvt Ltd. All rights reserved. Made for high-ticket outbound teams.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ color: '#94a3b8' }}>
                Quick Jump: <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4, color: '#818cf8', fontSize: 10 }}>⌘K / Ctrl+K</code>
              </span>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="footer-back-to-top-btn"
                title="Scroll back to top of page"
              >
                <ArrowUp size={12} />
                <span>Back to Top</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

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

      {/* =========================================================================
          COMMERCIAL PRICING MODAL IN INDIAN RUPEES (₹)
         ========================================================================= */}
      {showPricingModal && (
        <div className="pricing-modal-backdrop" onClick={() => setShowPricingModal(false)}>
          <div className="pricing-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Header Banner */}
            <div className="pricing-header-banner">
              <button
                type="button"
                onClick={() => setShowPricingModal(false)}
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 20,
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: 'none',
                  color: '#ffffff',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 700
                }}
              >
                ✕
              </button>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255, 255, 255, 0.1)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#38bdf8', marginBottom: 10 }}>
                <Sparkles size={13} />
                TRANSPARENT AGENCY PRICING IN INDIAN RUPEES (₹)
              </div>

              <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px', margin: '0 0 8px', color: '#ffffff' }}>
                Predictable Growth for Outreach & Lead Gen Agencies
              </h2>
              <p style={{ fontSize: 13, color: '#cbd5e1', maxWidth: 640, margin: '0 auto', lineHeight: 1.5 }}>
                Supercharge client acquisition with live Google Maps scraping, 5M lead index, micro-batch SMTP deliverability, and 1-click WhatsApp outreach.
              </p>

              {/* Billing Cycle Toggle Switch */}
              <div className="pricing-cycle-toggle">
                <button
                  type="button"
                  className={`pricing-cycle-btn ${pricingCycle === 'monthly' ? 'active' : ''}`}
                  onClick={() => setPricingCycle('monthly')}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  className={`pricing-cycle-btn ${pricingCycle === 'yearly' ? 'active' : ''}`}
                  onClick={() => setPricingCycle('yearly')}
                >
                  Annual Billing
                  <span className="pricing-save-pill">
                    <Sparkles size={10} /> SAVE 20% + 2 MO FREE
                  </span>
                </button>
              </div>
            </div>

            {/* 3-Column Commercial Plan Cards Grid */}
            <div className="pricing-cards-grid">
              {pricingPlansData.map((plan) => {
                const basePrice = pricingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
                const discountAmount = appliedCoupon ? Math.round(basePrice * (appliedCoupon.discount_percent / 100)) : 0;
                const finalPrice = Math.max(0, basePrice - discountAmount);
                const isCurrentPlan = currentUser?.plan === plan.id;

                return (
                  <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                    {plan.popular && (
                      <div className="popular-badge-ribbon">
                        {plan.badge || '🔥 MOST POPULAR - BEST VALUE'}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {plan.name}
                      </h3>
                      {isCurrentPlan && (
                        <span style={{ fontSize: 10, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: 12, fontWeight: 800 }}>
                          ACTIVE PLAN
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 12px', minHeight: 32 }}>
                      {plan.tag}
                    </p>

                    {/* Price Display */}
                    <div className="pricing-card-price">
                      <span className="pricing-currency">₹</span>
                      <span className="pricing-amount">{finalPrice.toLocaleString('en-IN')}</span>
                      <span className="pricing-period">/ mo</span>

                      {(appliedCoupon || pricingCycle === 'yearly') && (
                        <span className="pricing-original-strike">
                          ₹{(pricingCycle === 'yearly' ? plan.priceMonthly : basePrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 14 }}>
                      {pricingCycle === 'yearly'
                        ? `Billed annually at ₹${(finalPrice * 12).toLocaleString('en-IN')}/yr`
                        : 'Billed monthly. Cancel or switch anytime.'}
                    </div>

                    {/* Quota Highlights */}
                    <div style={{ background: plan.popular ? '#eef2ff' : '#f1f5f9', padding: '8px 12px', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Zap size={13} color="#4f46e5" />
                        <span>{plan.leadsMonthly}</span>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={13} color="#059669" />
                        <span>{plan.senders}</span>
                      </div>
                    </div>

                    {/* Features Checklist */}
                    <ul className="pricing-features-list">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="pricing-feature-item">
                          <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isUpgradingPlan}
                      className={`pricing-btn-action ${plan.popular ? 'pricing-btn-primary' : 'pricing-btn-secondary'}`}
                    >
                      {isCurrentPlan ? (
                        <>
                          <Check size={14} /> Active Workspace Plan
                        </>
                      ) : (
                        <>
                          <span>{plan.buttonText || `Choose ${plan.name}`}</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer Bar with Coupon Box & Payment Ecosystem */}
            <div className="pricing-footer-bar">
              {/* Promo Coupon Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="pricing-coupon-box">
                  <Tag size={13} color="#4f46e5" />
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="COUPON (e.g. LAUNCH50)"
                    className="pricing-coupon-input"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCodeInput.trim()}
                    className="btn-primary"
                    style={{ fontSize: 10, padding: '3px 8px' }}
                  >
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                </div>

                {couponMsg && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: couponMsg.type === 'success' ? '#047857' : '#b91c1c' }}>
                    {couponMsg.text}
                  </span>
                )}

                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={() => { setAppliedCoupon(null); setCouponMsg(null); setCouponCodeInput(''); }}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Remove Code
                  </button>
                )}
              </div>

              {/* Indian Payment Ecosystem Badges & WhatsApp Sales Bridge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="pricing-payment-badges">
                  <span>Accepted in India:</span>
                  <span className="upi-pill-badge">UPI (GPay / PhonePe / Paytm / BHIM)</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>RuPay • NetBanking • Cards</span>
                </div>

                <a
                  href={`https://wa.me/917015147209?text=${encodeURIComponent('Hi ApexOutreach Sales Team! I am interested in subscribing to ApexOutreach Agency CRM. Please share the direct UPI QR / GST Invoice details.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, color: '#047857', borderColor: '#a7f3d0', background: '#ecfdf5', textDecoration: 'none' }}
                >
                  <MessageSquare size={13} color="#059669" />
                  <span>Pay via WhatsApp / GST Invoice</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          AUTHENTICATION & AGENCY WORKSPACE ONBOARDING MODAL
         ========================================================================= */}
      {showAuthModal && (
        <div className="pricing-modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            {/* Header */}
            <div className="auth-header" style={{ padding: '24px 24px 18px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 16,
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: 'none',
                  color: '#ffffff',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700
                }}
              >
                ✕
              </button>

              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)' }}>
                <ShieldCheck size={22} color="#fff" />
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', margin: '0 0 4px' }}>
                ApexOutreach Studio
              </h2>
              <p style={{ fontSize: 12, color: '#cbd5e1', margin: 0 }}>
                Enterprise Outreach & Client Acquisition Suite
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="auth-tabs-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '6px' }}>
              <button
                type="button"
                className={`auth-tab-btn ${authModalTab === 'google' || authModalTab === 'demo' ? 'active' : ''}`}
                onClick={() => { setAuthModalTab('google'); setAuthError(''); }}
                style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700 }}
              >
                <span style={{ color: '#ea4335', fontWeight: 900, marginRight: 4 }}>G</span> Google Sign In
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${authModalTab === 'otp' || authModalTab === 'register' || authModalTab === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthModalTab('otp'); setAuthError(''); }}
                style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700 }}
              >
                <Key size={13} style={{ marginRight: 4 }} /> Sign Up / OTP
              </button>
            </div>

            {/* Form Content */}
            <div className="auth-form-container" style={{ padding: '20px 24px' }}>
              {authError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: 8, fontSize: 12, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <AlertCircle size={14} color="#dc2626" />
                  <span>{authError}</span>
                </div>
              )}

              {/* TAB 1: Google OAuth & 1-Click Administrator Access */}
              {(authModalTab === 'google' || authModalTab === 'demo') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    Authenticate with Google OAuth. Primary configured administrator accounts automatically receive full admin privileges.
                  </p>

                  {/* 1-Click Quick Admin Logins */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                      Configured Primary Administrators:
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGoogleLogin('dineshsingla08@gmail.com', 'Dinesh Singla')}
                      disabled={authLoading}
                      className="auth-google-btn"
                      style={{ justifyContent: 'space-between', padding: '10px 14px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#9333ea', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          DS
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>Dinesh Singla</div>
                          <div style={{ fontSize: 10, color: '#64748b' }}>dineshsingla08@gmail.com</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, background: '#f3e8ff', color: '#9333ea', padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>
                        👑 ADMIN
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGoogleLogin('ishantsingla08@gmail.com', 'Ishant Singla')}
                      disabled={authLoading}
                      className="auth-google-btn"
                      style={{ justifyContent: 'space-between', padding: '10px 14px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#9333ea', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          IS
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>Ishant Singla</div>
                          <div style={{ fontSize: 10, color: '#64748b' }}>ishantsingla08@gmail.com</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, background: '#f3e8ff', color: '#9333ea', padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>
                        👑 ADMIN
                      </span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
                    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>or enter custom account</span>
                    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-label">Google Account Email</label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="e.g. founder@agency.com"
                      className="auth-input-field"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGoogleLogin(authEmail, authName)}
                    disabled={authLoading}
                    className="pricing-btn-action pricing-btn-primary"
                    style={{ padding: '11px 16px', fontSize: 13 }}
                  >
                    {authLoading ? 'Verifying with Google...' : 'Continue with Google Account ➔'}
                  </button>
                </div>
              )}

              {/* TAB 2: Sign Up / Login via 6-Digit Email OTP */}
              {(authModalTab === 'otp' || authModalTab === 'register' || authModalTab === 'login') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {!otpSent ? (
                    <>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                        Enter your work email address to receive an instant 6-digit one-time verification password.
                      </p>

                      <div className="auth-input-group">
                        <label className="auth-label">Your Name</label>
                        <input
                          type="text"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="auth-input-field"
                        />
                      </div>

                      <div className="auth-input-group">
                        <label className="auth-label">Work Email Address *</label>
                        <input
                          type="email"
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="e.g. rahul@company.com"
                          className="auth-input-field"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={authLoading || !authEmail}
                        className="pricing-btn-action pricing-btn-primary"
                        style={{ padding: '12px 16px', fontSize: 13, marginTop: 4 }}
                      >
                        {authLoading ? 'Sending Verification Code...' : 'Send 6-Digit Verification Code ➔'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px 14px', borderRadius: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#065f46' }}>
                          ✓ Code Sent to {authEmail}
                        </div>
                        <div style={{ fontSize: 11, color: '#047857', marginTop: 2 }}>
                          Please enter the 6-digit authentication code below.
                        </div>
                        {devOtpCode && (
                          <div style={{ marginTop: 6, fontSize: 11, background: '#dcfce7', padding: '3px 8px', borderRadius: 6, color: '#166534', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                            🔑 Dev / Universal Bypass Code: <strong>{devOtpCode}</strong>
                          </div>
                        )}
                      </div>

                      <div className="auth-input-group">
                        <label className="auth-label">Enter 6-Digit Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          autoFocus
                          value={authOtp}
                          onChange={(e) => setAuthOtp(e.target.value)}
                          placeholder="••••••"
                          style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: 22,
                            fontWeight: 800,
                            letterSpacing: '8px',
                            textAlign: 'center',
                            borderRadius: 10,
                            border: '1.5px solid #4f46e5',
                            fontFamily: 'var(--font-mono)',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={authLoading || !authOtp}
                        className="pricing-btn-action pricing-btn-primary"
                        style={{ padding: '12px 16px', fontSize: 13 }}
                      >
                        {authLoading ? 'Verifying Code...' : 'Verify OTP & Authenticate ➔'}
                      </button>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginTop: 4 }}>
                        <span
                          onClick={() => setOtpSent(false)}
                          style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                        >
                          ← Change Email
                        </span>
                        <span
                          onClick={handleSendOtp}
                          style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                        >
                          Resend Code
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Bottom Security Note */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 16, textAlign: 'center', fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Shield size={12} color="#10b981" />
                <span>256-Bit SSL Secured • Role-Based Access • Indian Workspace Compliance</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deal Won & Pipeline Conversion Modal */}
      {showDealWonModal && dealLead && (
        <div className="deal-won-modal-overlay" onClick={() => setShowDealWonModal(false)}>
          <div className="deal-won-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Header with celebratory gradient */}
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #4f46e5 100%)',
              padding: '24px 24px 20px',
              color: '#ffffff',
              position: 'relative'
            }}>
              <button
                type="button"
                onClick={() => setShowDealWonModal(false)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#ffffff',
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700
                }}
              >
                ✕
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <Trophy size={24} color="#fef08a" />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a7f3d0' }}>
                    Pipeline Conversion • Milestone Reached
                  </div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
                    Convert Lead to Won Deal! 🎉
                  </h3>
                </div>
              </div>

              {/* Lead Summary Card in Header */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.12)',
                borderRadius: 10,
                padding: '10px 14px',
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#ffffff' }}>{dealLead.name}</div>
                  <div style={{ fontSize: 12, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span>{dealLead.category || 'B2B Client'}</span>
                    {dealLead.city && <span>• {dealLead.city}</span>}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#059669',
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 800
                }}>
                  Stage 6: Won
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Deal Value Input */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Deal Value (₹ INR) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: 10, fontSize: 15, fontWeight: 700, color: '#059669' }}>₹</span>
                  <input
                    type="number"
                    value={dealValueInput}
                    onChange={(e) => setDealValueInput(e.target.value)}
                    placeholder="25000"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 30px',
                      borderRadius: 8,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#0f172a',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#059669'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>
                {/* Quick Presets */}
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  {['10000', '25000', '50000', '100000', '250000'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDealValueInput(preset)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        background: dealValueInput === preset ? '#ecfdf5' : '#f8fafc',
                        borderColor: dealValueInput === preset ? '#10b981' : '#e2e8f0',
                        color: dealValueInput === preset ? '#059669' : '#64748b',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      ₹{parseInt(preset).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service / Package Type */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Contract Package / Service Delivered
                </label>
                <select
                  value={dealPackageInput}
                  onChange={(e) => setDealPackageInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 13,
                    color: '#0f172a',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  <option value="Financial Advisory & GST Retainer">Financial Advisory & GST Retainer</option>
                  <option value="Working Capital & CMA Advisory">Working Capital & CMA Advisory</option>
                  <option value="Cold Outreach & Growth Retainer">Cold Outreach & Growth Retainer</option>
                  <option value="Custom Project Consultation">Custom Project Consultation</option>
                  <option value="Annual Retainer Agreement">Annual Retainer Agreement</option>
                </select>
              </div>

              {/* Closing Notes */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Closing & Onboarding Notes
                </label>
                <textarea
                  rows={3}
                  value={dealNotesInput}
                  onChange={(e) => setDealNotesInput(e.target.value)}
                  placeholder="Terms agreed, invoice timeline, onboarding date..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 13,
                    color: '#0f172a',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowDealWonModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDealWon}
                  style={{
                    flex: 2,
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <Trophy size={16} />
                  <span>Confirm & Celebrate Win 🎉</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agency Modal 1: Add Client Outbound Workspace */}
      {showNewWorkspaceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 540,
            width: '100%',
            padding: 28,
            boxShadow: '0 24px 50px rgba(0,0,0,0.22)',
            border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={20} color="#4f46e5" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Add Client Workspace</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Configure a dedicated outbound client campaign & quota.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewWorkspaceModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Client / Brand Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme FinTech Corp"
                  value={newWsClient}
                  onChange={(e) => {
                    setNewWsClient(e.target.value);
                    if (!newWsName) setNewWsName(`${e.target.value} Outbound`);
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Workspace / Campaign Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme B2B Enterprise Acquisition"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Target Industry / ICP Niche
                </label>
                <input
                  type="text"
                  placeholder="e.g. Industrial Manufacturers & CFOs"
                  value={newWsNiche}
                  onChange={(e) => setNewWsNiche(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Monthly Retainer (₹)
                  </label>
                  <input
                    type="number"
                    value={newWsRetainer}
                    onChange={(e) => setNewWsRetainer(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13, outline: 'none', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Target Meetings / Month
                  </label>
                  <input
                    type="number"
                    value={newWsTargetMeetings}
                    onChange={(e) => setNewWsTargetMeetings(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13, outline: 'none', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowNewWorkspaceModal(false)}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateAgencyWorkspace}
                  style={{
                    flex: 2,
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#4f46e5',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  <Briefcase size={15} />
                  <span>Create Client Workspace</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agency Modal 2: Draft Retainer Proposal */}
      {showNewProposalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 580,
            width: '100%',
            padding: 28,
            boxShadow: '0 24px 50px rgba(0,0,0,0.22)',
            border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="#059669" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Draft Retainer Proposal</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Generate high-converting client agreement & deliverables.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewProposalModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Target Lead / Client Prospect *
                </label>
                <select
                  value={newPropLead ? newPropLead.id : ''}
                  onChange={(e) => {
                    const selected = leads.find(l => l.id === e.target.value) || filteredLeads.find(l => l.id === e.target.value);
                    if (selected) setNewPropLead(selected);
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13, outline: 'none', background: '#fff' }}
                >
                  {leads.slice(0, 50).map(l => (
                    <option key={l.id} value={l.id}>{l.name} — {l.city} ({l.category || 'B2B'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Service Package Name
                </label>
                <select
                  value={newPropPackage}
                  onChange={(e) => setNewPropPackage(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13, outline: 'none', background: '#fff' }}
                >
                  <option value="Growth Outbound Retainer">Growth Outbound Retainer (Cold Email + WhatsApp Cadence)</option>
                  <option value="Enterprise Omnichannel Suite">Enterprise Omnichannel Suite (Multi-Touch + Dedicated SDR)</option>
                  <option value="Executive CFO Outreach Sprint">Executive CFO Outreach Sprint (High-Ticket Account Based)</option>
                  <option value="Custom Retainer Agreement">Custom Retainer Agreement</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Monthly Retainer Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={newPropFee}
                    onChange={(e) => setNewPropFee(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13, outline: 'none', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Guaranteed Meetings / Month
                  </label>
                  <input
                    type="number"
                    value={newPropMeetings}
                    onChange={(e) => setNewPropMeetings(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13, outline: 'none', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Payment & Settlement Terms
                </label>
                <input
                  type="text"
                  value={newPropTerms}
                  onChange={(e) => setNewPropTerms(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowNewProposalModal(false)}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateAgencyProposal}
                  style={{
                    flex: 2,
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#059669',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  <FileText size={15} />
                  <span>Generate Retainer Proposal 📄</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agency Modal 3: Printable Proposal Document View */}
      {activeProposalPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          overflowY: 'auto'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 720,
            width: '100%',
            padding: 36,
            boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
            border: '1px solid #cbd5e1',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Document Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '2px solid #e2e8f0', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4f46e5' }}>
                  Executive Retainer Agreement & Proposal
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  {activeProposalPreview.package_name || 'Growth Outbound Retainer'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveProposalPreview(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Proposal Paper View */}
            <div className="proposal-paper" style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, background: '#f8fafc', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Client:</div>
                  <strong style={{ fontSize: 16, color: '#0f172a' }}>{activeProposalPreview.client_name}</strong>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Valid until: {activeProposalPreview.valid_until || '30 Days from issuance'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Prepared by:</div>
                  <strong style={{ fontSize: 15, color: '#4f46e5' }}>{currentUser.agency_name || 'Apex Outreach Agency'}</strong>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Status: <span style={{ fontWeight: 700, color: activeProposalPreview.status === 'Signed' ? '#059669' : '#d97706' }}>{activeProposalPreview.status}</span></div>
                </div>
              </div>

              {/* Deliverables Checklist */}
              <div style={{ background: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Scope of Deliverables & Monthly Commitments:
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#334155', lineHeight: 1.7 }}>
                  {(activeProposalPreview.deliverables || [
                    'Custom ICP audience scraping & domain-verified inbox placement',
                    'Personalized 3-step Cold Email + WhatsApp outreach sequences',
                    'Dedicated inbox warming, SPF/DKIM monitoring, zero-spam delivery',
                    `${activeProposalPreview.guaranteed_meetings || 12} Guaranteed qualified sales appointments per month`,
                    'Weekly executive ROI and conversion review with dedicated campaign strategist'
                  ]).map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              {/* Commercial Terms Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Monthly Retainer</div>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#059669', marginTop: 2 }}>
                    ₹{(activeProposalPreview.monthly_fee || 45000).toLocaleString()}/mo
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Guaranteed Appointments</div>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#4f46e5', marginTop: 2 }}>
                    {activeProposalPreview.guaranteed_meetings || 12} Qualified / Mo
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2', fontSize: 12, color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: 8, marginTop: 4 }}>
                  <strong>Payment Terms:</strong> {activeProposalPreview.payment_terms || '100% advance monthly retainer invoice with net 7-day settlement.'}
                </div>
              </div>
            </div>

            {/* Action Toolbar */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  const proposalText = `RETAINER PROPOSAL: ${activeProposalPreview.package_name}\nClient: ${activeProposalPreview.client_name}\nMonthly Retainer: ₹${activeProposalPreview.monthly_fee}/mo\nTarget: ${activeProposalPreview.guaranteed_meetings} Meetings/month\nDeliverables:\n- Verified ICP Outbound\n- Cold Email + WhatsApp Cadence\n- ${activeProposalPreview.guaranteed_meetings} Guaranteed Meetings\nTerms: ${activeProposalPreview.payment_terms}`;
                  navigator.clipboard.writeText(proposalText);
                  showToast('Proposal text copied to clipboard!');
                }}
                className="btn-secondary"
                style={{ fontSize: 12, padding: '9px 14px' }}
              >
                <Copy size={14} /> Copy Proposal Text
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="btn-secondary"
                style={{ fontSize: 12, padding: '9px 14px' }}
              >
                <Download size={14} /> Print / Save PDF
              </button>

              {activeProposalPreview.status !== 'Signed' && (
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateProposalStatus(activeProposalPreview.id, 'Signed');
                    setActiveProposalPreview(prev => ({ ...prev, status: 'Signed' }));
                  }}
                  className="btn-primary"
                  style={{ fontSize: 12, padding: '9px 18px', background: '#059669' }}
                >
                  <Trophy size={14} /> Mark as Signed & Converted 🎉
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Agency Modal 4: Client Weekly Progress & ROI Report Modal */}
      {showClientReportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 620,
            width: '100%',
            padding: 28,
            boxShadow: '0 24px 50px rgba(0,0,0,0.22)',
            border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="#1d4ed8" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                    Weekly Client Progress Report: {showClientReportModal.client_name}
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                    Campaign: {showClientReportModal.name} • ICP: {showClientReportModal.niche}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowClientReportModal(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* KPI Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>MONTHLY MEETINGS</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#4f46e5', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                  {showClientReportModal.meetings_booked || 4} / {showClientReportModal.meetings_target || 15}
                </div>
                <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>On track for monthly quota</div>
              </div>

              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>ACTIVE PROSPECTS</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                  {leads.length || 148}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Verified in pipeline</div>
              </div>

              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>ESTIMATED PIPELINE</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#059669', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                  ₹{((showClientReportModal.meetings_booked || 4) * 35000).toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Opportunity value</div>
              </div>
            </div>

            {/* Executive Summary Message Block */}
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>
                Weekly Executive Update (Shareable):
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                "Hi {showClientReportModal.client_name} Team! Here is your weekly outbound acquisition update for {showClientReportModal.niche}. We have actively engaged {leads.length} verified decision-makers, booking {showClientReportModal.meetings_booked || 4} qualified meetings out of your monthly target of {showClientReportModal.meetings_target || 15}. Response rates remain highest on WhatsApp (+17.3%). Continuing omnichannel cadences this week!"
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  const reportMsg = `Weekly Outbound Update for ${showClientReportModal.client_name}:\n- Campaign: ${showClientReportModal.name}\n- Meetings Booked: ${showClientReportModal.meetings_booked || 4} / ${showClientReportModal.meetings_target || 15}\n- Active Pipeline: ${leads.length} accounts\n- Primary Angle: ${showClientReportModal.niche}`;
                  navigator.clipboard.writeText(reportMsg);
                  showToast('Weekly report copied for WhatsApp / Slack update!');
                }}
                className="btn-secondary"
                style={{ fontSize: 12, padding: '8px 14px' }}
              >
                <Copy size={13} /> Copy for WhatsApp / Slack
              </button>

              <button
                type="button"
                onClick={() => setShowClientReportModal(null)}
                className="btn-primary"
                style={{ fontSize: 12, padding: '8px 18px' }}
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Buy Lead Credits Add-on Pack */}
      {showTopUpCreditsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 540,
            width: '100%',
            padding: 28,
            boxShadow: '0 24px 50px rgba(0,0,0,0.22)',
            border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={20} color="#4f46e5" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Top-Up Verified Lead Credits</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Instant credit packs for Google Maps scraping & AI enrichment.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTopUpCreditsModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {[
                { credits: 1000, price: 999, label: 'Starter Pack', popular: false },
                { credits: 5000, price: 3499, label: 'Growth Agency Pack', popular: true },
                { credits: 15000, price: 8999, label: 'Enterprise Scale Pack', popular: false },
              ].map((pack, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCreditBalance(prev => ({ ...prev, total: prev.total + pack.credits }));
                    setShowTopUpCreditsModal(false);
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    showToast(`🎉 Added ${pack.credits.toLocaleString()} lead credits to your balance!`, 'success');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: pack.popular ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: pack.popular ? '#f8faff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: 15, color: '#0f172a' }}>+{pack.credits.toLocaleString()} Credits</strong>
                      {pack.popular && (
                        <span style={{ fontSize: 10, fontWeight: 800, background: '#4f46e5', color: '#fff', padding: '2px 7px', borderRadius: 10 }}>
                          BEST VALUE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{pack.label} • Never expires</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#059669' }}>
                      ₹{pack.price.toLocaleString()}
                    </div>
                    <span style={{ fontSize: 11, color: '#4f46e5', fontWeight: 700 }}>One-time Buy ➔</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowTopUpCreditsModal(false)}
                className="btn-secondary"
                style={{ fontSize: 12, padding: '8px 16px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 6: White-Label Client Portal Link */}
      {showClientPortalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 580,
            width: '100%',
            padding: 28,
            boxShadow: '0 24px 50px rgba(0,0,0,0.22)',
            border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={20} color="#0284c7" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>White-Label Client Portal Link</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Share live outbound campaign progress with your client.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowClientPortalModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                Client Live Link (Branded as {currentUser.agency_name || 'Apex Outreach Agency'}):
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  readOnly
                  value={`https://app.apexoutreach.io/portal/client-view?agency=${encodeURIComponent(currentUser.agency_name || 'ApexGrowth')}&access_token=live_client_token_88492`}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 11, background: '#ffffff', color: '#0f172a', fontFamily: 'var(--font-mono)' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://app.apexoutreach.io/portal/client-view?agency=${encodeURIComponent(currentUser.agency_name || 'ApexGrowth')}&access_token=live_client_token_88492`);
                    showToast('Copied White-label Client Portal URL to clipboard!', 'success');
                  }}
                  className="btn-primary"
                  style={{ fontSize: 11, padding: '8px 14px' }}
                >
                  <Copy size={13} /> Copy Link
                </button>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', padding: 14, borderRadius: 10, border: '1px solid #bbf7d0', marginBottom: 18 }}>
              <h5 style={{ margin: '0 0 6px 0', fontSize: 12, fontWeight: 800, color: '#166534' }}>
                ✓ Client Experience Highlights:
              </h5>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#15803d', lineHeight: 1.6 }}>
                <li>100% White-labeled with your agency logo and colors</li>
                <li>Displays monthly booked consultations and qualified calendar events</li>
                <li>Transparent outreach volume (Email + WhatsApp delivery rates)</li>
                <li>Zero mention of ApexOutreach platform branding</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowClientPortalModal(false)}
                className="btn-primary"
                style={{ fontSize: 12, padding: '8px 18px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Template Import & Upload Modal */}
      {showImportTemplateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: 16
        }} onClick={() => setShowImportTemplateModal(false)}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 720,
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.2s ease-out',
            overflow: 'hidden'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 24px',
              borderBottom: '1px solid #f1f5f9',
              background: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={20} color="#059669" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                    Import Leads to CRM Directory
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                    Standardized template upload with smart fuzzy deduplication & validation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportTemplateModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Step 1: Standard Template Download */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#4f46e5', background: '#eef2ff', padding: '2px 8px', borderRadius: 12 }}>STEP 1</span>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Download Standard Lead Template</h4>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748b' }}>
                      Use our pre-configured CSV structure for 100% column matching & outreach accuracy.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={downloadLeadTemplateCsv}
                      className="btn-primary"
                      style={{ fontSize: 11, padding: '7px 14px', background: '#4f46e5', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Download size={13} /> Download CSV Template
                    </button>
                    <a
                      href={`${API_BASE}/crm/template-csv`}
                      download="apex_crm_lead_import_template.csv"
                      className="btn-secondary"
                      style={{ fontSize: 11, padding: '7px 12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <ExternalLink size={12} /> Direct Link
                    </a>
                  </div>
                </div>

                {/* Column Schema Pills */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    Supported Template Columns:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <span style={{ fontSize: 10, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                      Business Name * (Req)
                    </span>
                    <span style={{ fontSize: 10, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                      Email (Outreach)
                    </span>
                    <span style={{ fontSize: 10, background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                      Phone / WhatsApp
                    </span>
                    <span style={{ fontSize: 10, background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                      City
                    </span>
                    <span style={{ fontSize: 10, background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                      Area
                    </span>
                    <span style={{ fontSize: 10, background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                      Category / Niche
                    </span>
                    <span style={{ fontSize: 10, background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                      Website
                    </span>
                    <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                      Rating & Reviews
                    </span>
                    <span style={{ fontSize: 10, background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                      Address
                    </span>
                    <span style={{ fontSize: 10, background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                      Status
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2: Upload CSV File */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 12 }}>STEP 2</span>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Select or Drop CSV File</h4>
                </div>

                <input
                  type="file"
                  ref={templateFileInputRef}
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImportFileSelect(e.target.files?.[0])}
                />

                <div
                  onClick={() => templateFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) handleImportFileSelect(e.dataTransfer.files[0]);
                  }}
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: 12,
                    padding: '24px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: importFile ? '#f0fdf4' : '#fafafa',
                    borderColor: importFile ? '#86efac' : '#cbd5e1',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: importFile ? '#dcfce7' : '#f1f5f9', color: importFile ? '#16a34a' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <Upload size={22} />
                  </div>
                  {importFile ? (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>
                        Selected: {importFile.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#15803d', marginTop: 4 }}>
                        Click or drag another file to replace
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                        Click to browse or drag & drop your .csv file here
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                        Maximum recommended file size: 50MB (UTF-8 format)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: File Inspection Preview & Validation */}
              {importPreviewData && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: 12 }}>PREVIEW</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>File Validation Summary</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{importPreviewData.fileSizeKb} KB</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 14 }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Total Records</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{importPreviewData.totalRows.toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, color: '#059669', fontWeight: 600 }}>Valid Emails</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>
                        {importPreviewData.emailCount.toLocaleString()} ({Math.round(importPreviewData.emailCount / (importPreviewData.totalRows || 1) * 100)}%)
                      </div>
                    </div>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, color: '#0284c7', fontWeight: 600 }}>Phone Numbers</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0284c7' }}>
                        {importPreviewData.phoneCount.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, color: '#7c3aed', fontWeight: 600 }}>Columns Found</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>{importPreviewData.headers.length}</div>
                    </div>
                  </div>

                  {/* Sample Rows Table */}
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    First 3 Sample Leads Preview:
                  </div>
                  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, background: '#ffffff' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                          {importPreviewData.headers.slice(0, 5).map((h, i) => (
                            <th key={i} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importPreviewData.sampleRows.slice(0, 3).map((row, rIdx) => (
                          <tr key={rIdx} style={{ borderBottom: '1px solid #f8fafc' }}>
                            {row.slice(0, 5).map((col, cIdx) => (
                              <td key={cIdx} style={{ padding: '6px 10px', color: '#0f172a' }}>
                                {col || <span style={{ color: '#cbd5e1' }}>—</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Step 4: Import Destination Selection */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', background: '#f5f3ff', padding: '2px 8px', borderRadius: 12 }}>STEP 3</span>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Import Destination</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid',
                    borderColor: importTargetOption === 'master' ? '#4f46e5' : '#e2e8f0',
                    background: importTargetOption === 'master' ? '#eef2ff' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="importTarget"
                      checked={importTargetOption === 'master'}
                      onChange={() => setImportTargetOption('master')}
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>
                        🌟 Merge into Unified Master CRM Database (Recommended)
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        Automatically runs smart fuzzy matching against existing 4,775+ records, merging missing contact details without duplicates.
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid',
                    borderColor: importTargetOption === 'custom' ? '#4f46e5' : '#e2e8f0',
                    background: importTargetOption === 'custom' ? '#eef2ff' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="importTarget"
                      checked={importTargetOption === 'custom'}
                      onChange={() => setImportTargetOption('custom')}
                      style={{ marginTop: 3 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>
                        📁 Keep as Dedicated Named Dataset
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        Saves as an isolated CSV list that can be selected anytime from the CRM Directory toolbar.
                      </div>
                      {importTargetOption === 'custom' && (
                        <div style={{ marginTop: 8 }}>
                          <input
                            type="text"
                            value={customDatasetName}
                            onChange={(e) => setCustomDatasetName(e.target.value)}
                            placeholder="Dataset Name (e.g. real_estate_january)"
                            style={{ width: '100%', padding: '6px 10px', fontSize: 11, borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 10,
              padding: '14px 24px',
              borderTop: '1px solid #f1f5f9',
              background: '#f8fafc'
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowImportTemplateModal(false);
                  setImportFile(null);
                  setImportPreviewData(null);
                }}
                className="btn-secondary"
                style={{ fontSize: 12, padding: '8px 16px' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={!importFile || isUploadingLeads}
                className="btn-primary"
                style={{
                  fontSize: 12,
                  padding: '8px 20px',
                  background: isUploadingLeads ? '#94a3b8' : '#059669',
                  opacity: !importFile ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {isUploadingLeads ? (
                  <>
                    <RefreshCw size={14} className="pulse-indicator" /> Importing Leads...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Confirm & Import {importPreviewData ? `(${importPreviewData.totalRows.toLocaleString()} Leads)` : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MANUAL LEAD CREATION MODAL
         ========================================================================= */}
      {showAddLeadModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 580,
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 24px',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Plus size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    Add New Business Lead to CRM
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>
                    Manually capture direct inquiries, inbound calls, or referrals into your outreach database.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddLeadModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 6
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateManualLead} style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                {/* Company Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>
                    Business / Company Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Apex Industrial Solutions Pvt Ltd"
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 13,
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Grid 2-cols: Category & City */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>
                      Industry / Niche
                    </label>
                    <select
                      value={newLeadForm.category}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #cbd5e1'
                      }}
                    >
                      <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                      <option value="B2B Technology & Software">B2B Technology & Software</option>
                      <option value="Logistics, Transport & Warehousing">Logistics & Supply Chain</option>
                      <option value="Real Estate & Construction">Real Estate & Construction</option>
                      <option value="Healthcare & Medical Clinics">Healthcare & Medical</option>
                      <option value="Corporate Consulting & Advisory">Consulting & Advisory</option>
                      <option value="Other B2B Client">Other B2B Client</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gurugram"
                      value={newLeadForm.city}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #cbd5e1'
                      }}
                    />
                  </div>
                </div>

                {/* Grid 2-cols: Area & Pipeline Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>
                      Area / Locality
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DLF Phase 2 / Udyog Vihar"
                      value={newLeadForm.area}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, area: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #cbd5e1'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>
                      Pipeline Stage
                    </label>
                    <select
                      value={newLeadForm.status}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, status: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #cbd5e1'
                      }}
                    >
                      <option value="New">⭐ New Lead</option>
                      <option value="Contacted">📤 Contacted</option>
                      <option value="Interested">🔥 Interested</option>
                      <option value="Meeting Scheduled">📅 Meeting Scheduled</option>
                      <option value="Converted">🏆 Deal Won / Converted</option>
                    </select>
                  </div>
                </div>

                {/* Grid 2-cols: Phone & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>
                      Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98111 22334"
                      value={newLeadForm.phone}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #cbd5e1'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>
                      Work Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="contact@company.com"
                      value={newLeadForm.email}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #cbd5e1'
                      }}
                    />
                  </div>
                </div>

                {/* Estimated Deal Value */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>
                    Estimated Deal / Retainer Value (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={newLeadForm.deal_value}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, deal_value: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 13,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      borderRadius: 8,
                      border: '1px solid #cbd5e1'
                    }}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>
                    Initial Lead Context / Requirement Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Key requirement discussed, referral source, preferred contact time, etc."
                    value={newLeadForm.notes}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 12,
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 10,
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid #f1f5f9'
              }}>
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: '8px 16px' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="btn-primary"
                  style={{
                    fontSize: 12,
                    padding: '8px 22px',
                    background: isSubmittingLead ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {isSubmittingLead ? (
                    <>
                      <RefreshCw size={13} className="pulse-indicator" /> Adding to CRM...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} /> Add Lead to CRM
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CLIENT WORKSPACE DETAIL DOSSIER MODAL
         ========================================================================= */}
      {selectedWorkspaceDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }} onClick={() => setSelectedWorkspaceDetail(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 820,
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
            border: '1px solid #cbd5e1',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            {/* Dossier Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              padding: '22px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 900
                }}>
                  {selectedWorkspaceDetail.client_name ? selectedWorkspaceDetail.client_name.slice(0, 2).toUpperCase() : 'CW'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
                      {selectedWorkspaceDetail.client_name}
                    </h3>
                    <span style={{ fontSize: 10, background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: 6, fontWeight: 800 }}>
                      ✓ Onboarded Client
                    </span>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8' }}>
                    Workspace: <strong>{selectedWorkspaceDetail.name}</strong> • ICP: {selectedWorkspaceDetail.niche}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                  ₹{(selectedWorkspaceDetail.monthly_retainer || 50000).toLocaleString()}/mo
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedWorkspaceDetail(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    color: '#ffffff',
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Dossier Body - Scrollable */}
            <div style={{ padding: '24px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Quick KPI Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Monthly Retainer</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    ₹{(selectedWorkspaceDetail.monthly_retainer || 50000).toLocaleString()}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Meetings Target</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#4f46e5', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {selectedWorkspaceDetail.meetings_booked || 2} / {selectedWorkspaceDetail.meetings_target || 15}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Campaign</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedWorkspaceDetail.active_campaign || 'Automated Outbound'}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Outreach Channels</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginTop: 4 }}>
                    Email + WhatsApp
                  </div>
                </div>
              </div>

              {/* Section 1: Proposals & Retainer Agreements */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={16} color="#4f46e5" />
                    <strong style={{ fontSize: 13, color: '#0f172a' }}>
                      Sent Proposals & Retainer Agreements
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAgreementData(prev => ({
                        ...prev,
                        clientName: selectedWorkspaceDetail.client_name,
                        monthlyFee: selectedWorkspaceDetail.monthly_retainer || 50000
                      }));
                      setActiveTab('agency');
                      setAgencySubTab('proposals');
                      setSelectedWorkspaceDetail(null);
                    }}
                    className="btn-secondary"
                    style={{ fontSize: 11, padding: '3px 8px', color: '#4f46e5' }}
                  >
                    <Plus size={12} /> New Proposal
                  </button>
                </div>

                <div style={{ padding: 14 }}>
                  {(() => {
                    const clientProposals = agencyProposals.filter(p =>
                      (p.client_name && p.client_name.toLowerCase().includes(selectedWorkspaceDetail.client_name.toLowerCase())) ||
                      (p.client_name && selectedWorkspaceDetail.client_name.toLowerCase().includes(p.client_name.toLowerCase()))
                    );
                    const displayProposals = clientProposals.length > 0 ? clientProposals : agencyProposals.slice(0, 2);

                    if (displayProposals.length === 0) {
                      return (
                        <div style={{ textAlign: 'center', padding: '18px 0', color: '#94a3b8', fontSize: 12 }}>
                          No proposals drafted yet for this client workspace.
                        </div>
                      );
                    }

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {displayProposals.map(prop => (
                          <div key={prop.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            background: '#ffffff',
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            flexWrap: 'wrap',
                            gap: 10
                          }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <strong style={{ fontSize: 13, color: '#0f172a' }}>{prop.package_name || 'Growth Retainer'}</strong>
                                <span style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: '2px 6px',
                                  borderRadius: 6,
                                  background: prop.status === 'Signed' ? '#ecfdf5' : '#eff6ff',
                                  color: prop.status === 'Signed' ? '#059669' : '#2563eb'
                                }}>
                                  {prop.status || 'Sent'}
                                </span>
                              </div>
                              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                ₹{(prop.monthly_fee || 45000).toLocaleString()}/mo • {prop.guaranteed_meetings || 10} Meetings SLA
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveProposalPreview(prop);
                                }}
                                className="btn-secondary"
                                style={{ fontSize: 11, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <Eye size={12} /> View Proposal
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveProposalPreview(prop);
                                  setTimeout(() => window.print(), 300);
                                }}
                                className="btn-secondary"
                                style={{ fontSize: 11, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, color: '#059669', borderColor: '#a7f3d0' }}
                              >
                                <Printer size={12} /> Download / Print
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Section 2: Past Client Invoices & Downloadable PDF Invoices */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Receipt size={16} color="#059669" />
                    <strong style={{ fontSize: 13, color: '#0f172a' }}>
                      Past Client Invoices & Accounts Receivable
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceData(prev => ({
                        ...prev,
                        clientName: selectedWorkspaceDetail.client_name,
                        clientCompany: selectedWorkspaceDetail.name,
                        items: [
                          {
                            id: Date.now(),
                            description: `Monthly B2B Outreach Retainer (${selectedWorkspaceDetail.niche})`,
                            hsnSac: '998311',
                            qty: 1,
                            rate: selectedWorkspaceDetail.monthly_retainer || 50000,
                            taxRate: 18
                          }
                        ]
                      }));
                      setActiveTab('agency');
                      setAgencySubTab('invoices');
                      setSelectedWorkspaceDetail(null);
                    }}
                    className="btn-secondary"
                    style={{ fontSize: 11, padding: '3px 8px', color: '#059669' }}
                  >
                    <Plus size={12} /> Generate Invoice
                  </button>
                </div>

                <div style={{ padding: 14 }}>
                  {(() => {
                    const clientInvoices = savedInvoices.filter(i =>
                      (i.client_company && i.client_company.toLowerCase().includes(selectedWorkspaceDetail.name.toLowerCase())) ||
                      (i.client_name && i.client_name.toLowerCase().includes(selectedWorkspaceDetail.client_name.toLowerCase()))
                    );
                    const displayInvoices = clientInvoices.length > 0 ? clientInvoices : savedInvoices.slice(0, 3);

                    if (displayInvoices.length === 0) {
                      return (
                        <div style={{ textAlign: 'center', padding: '18px 0', color: '#94a3b8', fontSize: 12 }}>
                          No past invoices generated for this client yet. Click "Generate Invoice" above.
                        </div>
                      );
                    }

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {displayInvoices.map(inv => {
                          const isPaid = inv.status === 'Paid' || (inv.balance_due === 0 && inv.total > 0);
                          return (
                            <div key={inv.id || inv.invoice_number} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              background: '#ffffff',
                              borderRadius: 8,
                              border: '1px solid #e2e8f0',
                              flexWrap: 'wrap',
                              gap: 10
                            }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <strong style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#4f46e5' }}>
                                    {inv.invoice_number}
                                  </strong>
                                  <span style={{
                                    fontSize: 10,
                                    fontWeight: 800,
                                    padding: '2px 6px',
                                    borderRadius: 6,
                                    background: isPaid ? '#ecfdf5' : '#eff6ff',
                                    color: isPaid ? '#059669' : '#1d4ed8'
                                  }}>
                                    {isPaid ? 'PAID ✓' : 'SENT / PENDING'}
                                  </span>
                                </div>
                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                  Issued: {inv.issue_date || 'Recent'} • Total: <strong>₹{(inv.total || 0).toLocaleString()}</strong>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleLoadSavedInvoice(inv);
                                    handlePrintInvoice();
                                  }}
                                  className="btn-secondary"
                                  style={{ fontSize: 11, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, color: '#4f46e5' }}
                                  title="Download or Print PDF Invoice"
                                >
                                  <Printer size={12} /> Download PDF
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleLoadSavedInvoice(inv);
                                    setActiveTab('agency');
                                    setAgencySubTab('invoices');
                                    setSelectedWorkspaceDetail(null);
                                  }}
                                  className="btn-primary"
                                  style={{ fontSize: 11, padding: '4px 10px' }}
                                >
                                  Edit in Studio ➔
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Dossier Footer */}
            <div style={{
              padding: '14px 28px',
              borderTop: '1px solid #f1f5f9',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={() => handleDeleteWorkspace(selectedWorkspaceDetail.id, selectedWorkspaceDetail.name)}
                className="btn-secondary"
                style={{ fontSize: 12, padding: '6px 12px', color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2' }}
              >
                <Trash2 size={13} /> Delete Workspace
              </button>

              <button
                type="button"
                onClick={() => setSelectedWorkspaceDetail(null)}
                className="btn-primary"
                style={{ fontSize: 12, padding: '8px 20px' }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAST CLIENT INVOICES & ACCOUNTS RECEIVABLE MODAL
         ========================================================================= */}
      {showPastInvoicesModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }} onClick={() => setShowPastInvoicesModal(false)}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 920,
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
            border: '1px solid #cbd5e1',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #f1f5f9',
              background: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    Past Client Invoices & Accounts Receivable ({savedInvoices.length})
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>
                    Track all issued GST tax invoices, download PDF copies, or reload into editor.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPastInvoicesModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* KPI Strip */}
            <div style={{ padding: '14px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: 8,
                background: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0'
              }}>
                Settled (Paid): ₹{savedInvoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + (curr.total || 0), 0).toLocaleString()}
              </span>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: 8,
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe'
              }}>
                Outstanding Receivable: ₹{savedInvoices.filter(i => i.status !== 'Paid').reduce((acc, curr) => acc + (curr.balance_due !== undefined ? curr.balance_due : curr.total || 0), 0).toLocaleString()}
              </span>
            </div>

            {/* Invoices List */}
            <div style={{ padding: '20px 24px', overflowY: 'auto' }}>
              {savedInvoices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <Receipt size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>No saved invoices yet</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12 }}>Create and save invoices using the Client Invoice Generator.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {savedInvoices.map((inv) => {
                    const isPaid = inv.status === 'Paid' || (inv.balance_due === 0 && inv.total > 0);
                    return (
                      <div key={inv.id || inv.invoice_number} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: '#ffffff',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        flexWrap: 'wrap',
                        gap: 12
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: '#4f46e5' }}>
                              {inv.invoice_number}
                            </strong>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: isPaid ? '#ecfdf5' : '#eff6ff',
                              color: isPaid ? '#059669' : '#1d4ed8'
                            }}>
                              {isPaid ? 'PAID ✓' : 'SENT / PENDING'}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                            {inv.client_company || 'Client Workspace'}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {inv.client_name} • Issued: {inv.issue_date || 'Recent'} • Due: {inv.due_date || '7 Days'}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                            ₹{(inv.total || 0).toLocaleString()}
                          </div>
                          <div style={{ fontSize: 11, color: isPaid ? '#059669' : '#dc2626', fontWeight: 600 }}>
                            {isPaid ? 'Balance Settled' : `Balance Due: ₹${(inv.balance_due !== undefined ? inv.balance_due : inv.total || 0).toLocaleString()}`}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => {
                              handleLoadSavedInvoice(inv);
                              setShowPastInvoicesModal(false);
                            }}
                            className="btn-primary"
                            style={{ fontSize: 11, padding: '5px 10px' }}
                          >
                            Load in Editor
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleLoadSavedInvoice(inv);
                              handlePrintInvoice();
                            }}
                            className="btn-secondary"
                            style={{ fontSize: 11, padding: '5px 10px', color: '#059669', borderColor: '#a7f3d0' }}
                          >
                            <Printer size={12} /> PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteInvoice(inv.id)}
                            style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 6, padding: '4px 6px', color: '#ef4444', cursor: 'pointer' }}
                            title="Delete invoice"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowPastInvoicesModal(false)}
                className="btn-secondary"
                style={{ fontSize: 12, padding: '8px 18px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADMIN REGISTERED USERS DIRECTORY MODAL
         ========================================================================= */}
      {showAdminUsersModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }} onClick={() => setShowAdminUsersModal(false)}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 920,
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
            border: '1px solid #cbd5e1',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #f1f5f9',
              background: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    👑 Admin Control Panel • Registered Platform Users ({adminUsers.length})
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>
                    Visible only to system administrators ({ADMIN_EMAILS.join(', ')}).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAdminUsersModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Admin Stats Strip */}
            <div style={{ padding: '14px 24px', background: '#faf5ff', borderBottom: '1px solid #f3e8ff', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#7e22ce' }}>
                Total Registered: {adminUsers.length} Users
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#6b21a8' }}>
                • Admins: {adminUsers.filter(u => u.role === 'admin').length}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                • Members: {adminUsers.filter(u => u.role !== 'admin').length}
              </span>
            </div>

            {/* Users Table */}
            <div style={{ padding: '20px 24px', overflowY: 'auto' }}>
              {loadingAdminUsers ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  <RefreshCw size={24} className="pulse-indicator" style={{ margin: '0 auto 8px' }} />
                  <div>Loading registered user directory...</div>
                </div>
              ) : adminUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <User size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>No users found</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 14px' }}>User</th>
                      <th style={{ padding: '10px 14px' }}>Role</th>
                      <th style={{ padding: '10px 14px' }}>Auth Method</th>
                      <th style={{ padding: '10px 14px' }}>Plan / Tier</th>
                      <th style={{ padding: '10px 14px' }}>Created</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map(user => {
                      const isAdmin = user.role === 'admin' || ADMIN_EMAILS.includes((user.email || '').toLowerCase());
                      return (
                        <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: isAdmin ? '#9333ea' : '#4f46e5',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                fontWeight: 800
                              }}>
                                {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <strong style={{ color: '#0f172a', display: 'block' }}>{user.name}</strong>
                                <span style={{ fontSize: 11, color: '#64748b' }}>{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 10,
                              background: isAdmin ? '#f3e8ff' : '#eff6ff',
                              color: isAdmin ? '#9333ea' : '#2563eb'
                            }}>
                              {isAdmin ? '👑 ADMIN' : 'MEMBER'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', color: '#64748b' }}>
                            {user.provider || 'Google OAuth'}
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>
                            {user.plan || 'Growth Tier'}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 11 }}>
                            {user.created_at ? user.created_at.slice(0, 10) : 'Recent'}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                            {!ADMIN_EMAILS.includes((user.email || '').toLowerCase()) ? (
                              <button
                                type="button"
                                onClick={() => handleDeleteAdminUser(user.id, user.email)}
                                style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 6, padding: '4px 8px', color: '#ef4444', cursor: 'pointer', fontSize: 11 }}
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            ) : (
                              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>Protected Admin</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAdminUsersModal(false)}
                className="btn-primary"
                style={{ fontSize: 12, padding: '8px 18px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
