'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PhoneCall,
  Plus,
  RefreshCw,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { AuthenticatedActor } from '@/lib/rbac';

type TabKey =
  | 'overview'
  | 'universities'
  | 'programs'
  | 'scholarships'
  | 'requirements'
  | 'galleries'
  | 'deadlines'
  | 'inquiries'
  | 'verification'
  | 'content'
  | 'contact'
  | 'employees'
  | 'settings';

export function AdminDashboardClient({ actor }: { actor: AuthenticatedActor }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [uniSubTab, setUniSubTab] = useState<'universities' | 'programs' | 'scholarships' | 'requirements'>('universities');
  const [settingsSubTab, setSettingsSubTab] = useState<'system' | 'employees' | 'content'>('system');
  const [toast, setToast] = useState<string | null>(null);

  // Module States
  const [overview, setOverview] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [reqData, setReqData] = useState<any>({
    globalRequirements: [],
    universityAssignments: [],
    specificRequirements: [],
  });
  const [galleryData, setGalleryData] = useState<any>({ galleries: [], mediaAssets: [] });
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [inquiriesData, setInquiriesData] = useState<any>({
    inquiries: [],
    statuses: [],
    employees: [],
  });
  const [verifications, setVerifications] = useState<any[]>([]);
  const [contentData, setContentData] = useState<any>({
    homepageSections: [],
    navigationItems: [],
    pages: [],
    faqs: [],
  });
  const [contactData, setContactData] = useState<any>({
    contactSetting: null,
    templates: [],
  });
  const [employeeData, setEmployeeData] = useState<any>({
    employees: [],
    roles: [],
    permissions: [],
  });
  const [settingsData, setSettingsData] = useState<any>({
    systemSetting: null,
    auditLogs: [],
  });

  // Form states for quick creation
  const [isUniFormOpen, setIsUniFormOpen] = useState(false);
  const [newUni, setNewUni] = useState({
    nameEn: '',
    nameAr: '',
    nameZh: '',
    slug: '',
    city: 'Beijing',
    province: 'Beijing',
    district: '',
    address: '',
    universityType: 'جامعة بحثية حكومية (Double First-Class)',
    officialWebsite: '',
    logoUrl: '/logo.jpeg',
    shortDescriptionEn: '',
    shortDescriptionAr: '',
    detailedDescriptionEn: '',
    detailedDescriptionAr: '',
    status: 'PUBLISHED',
    applicationOpeningDate: '2026-11-01',
    applicationDeadlineDate: '2027-03-31',
    academicYear: '2027-2028',
    accommodationAvailable: true,
    accommodationFeeAmount: '9000',
    accommodationFeePeriod: 'ANNUALLY',
    accommodationDescEn: 'On-campus international student residence halls.',
    accommodationDescAr: 'سكن طلابي دولي مجهز داخل الحرم الجامعي.',
  });

  const [uniPrograms, setUniPrograms] = useState<Array<{
    nameEn: string;
    nameAr: string;
    nameZh: string;
    degreeLevel: string;
    languageOfInstruction: string;
    durationEn: string;
    tuitionAmount: string;
    tuitionCurrency: string;
    tuitionPeriod: string;
    eligibilityEn: string;
  }>>([
    {
      nameEn: 'B.Eng. in Computer Science & Technology',
      nameAr: 'بكالوريوس علوم الحاسوب وهندسة البرمجيات',
      nameZh: '',
      degreeLevel: 'BACHELOR',
      languageOfInstruction: 'ENGLISH',
      durationEn: '4 Years',
      tuitionAmount: '28000',
      tuitionCurrency: 'CNY',
      tuitionPeriod: 'ANNUALLY',
      eligibilityEn: 'High school diploma with good grades in Mathematics and English.',
    },
  ]);

  const [uniSelectedReqIds, setUniSelectedReqIds] = useState<string[]>([]);
  const [uniReqOverrides, setUniReqOverrides] = useState<Record<string, { isRequiredOverride?: boolean; customInstructionsEn?: string }>>({});
  const [uniSpecificReqs, setUniSpecificReqs] = useState<Array<{ nameEn: string; nameAr: string; instructionsEn: string; isRequired: boolean }>>([]);
  const [uniSelectedSchIds, setUniSelectedSchIds] = useState<string[]>([]);
  const [uniCampusImages, setUniCampusImages] = useState<Array<{ imageUrl: string; captionEn: string; captionAr: string }>>([
    { imageUrl: '/logo.jpeg', captionEn: 'Main Campus View', captionAr: 'الحرم الجامعي الرئيسي' },
  ]);
  const [uniAccomImages, setUniAccomImages] = useState<Array<{ imageUrl: string; captionEn: string; captionAr: string }>>([
    { imageUrl: '/logo.jpeg', captionEn: 'International Student Dormitory', captionAr: 'السكن الطلابي الدولي' },
  ]);

  const [newProg, setNewProg] = useState({
    universityId: '',
    nameEn: '',
    nameAr: '',
    degreeLevel: 'BACHELOR',
    languageOfInstruction: 'ENGLISH',
    durationEn: '4 Years',
    tuitionAmount: '28000',
    tuitionCurrency: 'CNY',
    tuitionPeriod: 'ANNUALLY',
    deadlineDate: '2027-03-31',
  });

  const [newFee, setNewFee] = useState({
    universityId: '',
    category: 'TUITION',
    titleEn: '',
    titleAr: '',
    amount: '25000',
    currency: 'CNY',
    period: 'ANNUALLY',
    academicYear: '2027-2028',
    isConfirmed: true,
    sourceUrl: '',
  });

  const [newSch, setNewSch] = useState({
    nameEn: '',
    nameAr: '',
    providerEn: '',
    fundingType: 'FULL',
    tuitionCoverageEn: '100% Tuition Waiver',
    accommodationCoverageEn: 'Free Dormitory',
    stipendAmount: '',
    status: 'PUBLISHED',
  });

  const [newGlobalReq, setNewGlobalReq] = useState({
    nameEn: '',
    nameAr: '',
    descriptionEn: '',
    instructionsEn: '',
    isRequiredDefault: true,
  });

  const [overrideForm, setOverrideForm] = useState({
    universityRequirementId: '',
    isRequiredOverride: false,
    customInstructionsEn: '',
    customInstructionsAr: '',
    isExcluded: false,
  });

  const [newGallery, setNewGallery] = useState({
    universityId: '',
    category: 'CAMPUS',
    titleEn: '',
    titleAr: '',
    isAccommodation: false,
  });

  const [newGalleryImage, setNewGalleryImage] = useState({
    galleryId: '',
    imageUrl: '/logo.jpeg',
    captionEn: '',
    captionAr: '',
    sourceInfo: 'Official Campus Photography',
  });

  const [newDeadline, setNewDeadline] = useState({
    titleEn: '',
    titleAr: '',
    universityId: '',
    academicYear: '2027-2028',
    openingDate: '2026-11-01',
    closingDate: '2027-03-15',
    showNotAnnounced: false,
    expiredBehavior: 'KEEP_VISIBLE',
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    scope: 'GLOBAL',
    universityId: '',
    templateEn:
      'Hello, I would like more information about {university_name}. I am interested in {major_name}.',
    templateAr: 'مرحباً، أود الاستفسار عن {university_name} في تخصص {major_name}.',
  });

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    roleCode: 'INQUIRY_OFFICER',
  });

  const [newPage, setNewPage] = useState({
    slug: '',
    titleEn: '',
    titleAr: '',
    contentEn: '',
    contentAr: '',
    status: 'PUBLISHED',
  });

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const loadTabData = async (tab: TabKey) => {
    try {
      if (tab === 'overview') {
        const res = await fetch('/api/admin/overview');
        if (res.ok) setOverview(await res.json());
      } else if (tab === 'universities') {
        const [uRes, rRes, sRes, pRes, fRes] = await Promise.all([
          fetch('/api/admin/universities'),
          fetch('/api/admin/requirements'),
          fetch('/api/admin/scholarships'),
          fetch('/api/admin/programs'),
          fetch('/api/admin/fees'),
        ]);
        if (uRes.ok) {
          const d = await uRes.json();
          setUniversities(d.universities || []);
        }
        if (rRes.ok) {
          const r = await rRes.json();
          setReqData(r);
          if (r.globalRequirements?.length > 0) {
            setUniSelectedReqIds((prev) =>
              prev.length === 0
                ? r.globalRequirements.filter((gr: any) => gr.isRequiredDefault).map((gr: any) => gr.id)
                : prev
            );
          }
        }
        if (sRes.ok) {
          const s = await sRes.json();
          setScholarships(s.scholarships || []);
        }
        if (pRes.ok) setPrograms((await pRes.json()).programs || []);
        if (fRes.ok) setFees((await fRes.json()).fees || []);
      } else if (tab === 'programs') {
        const [uRes, pRes, fRes] = await Promise.all([
          fetch('/api/admin/universities'),
          fetch('/api/admin/programs'),
          fetch('/api/admin/fees'),
        ]);
        if (uRes.ok) setUniversities((await uRes.json()).universities || []);
        if (pRes.ok) setPrograms((await pRes.json()).programs || []);
        if (fRes.ok) setFees((await fRes.json()).fees || []);
      } else if (tab === 'scholarships') {
        const res = await fetch('/api/admin/scholarships');
        if (res.ok) setScholarships((await res.json()).scholarships || []);
      } else if (tab === 'requirements') {
        const [rRes, uRes] = await Promise.all([
          fetch('/api/admin/requirements'),
          fetch('/api/admin/universities'),
        ]);
        if (rRes.ok) setReqData(await rRes.json());
        if (uRes.ok) setUniversities((await uRes.json()).universities || []);
      } else if (tab === 'galleries') {
        const [gRes, uRes] = await Promise.all([
          fetch('/api/admin/galleries'),
          fetch('/api/admin/universities'),
        ]);
        if (gRes.ok) setGalleryData(await gRes.json());
        if (uRes.ok) setUniversities((await uRes.json()).universities || []);
      } else if (tab === 'deadlines') {
        const [dRes, uRes] = await Promise.all([
          fetch('/api/admin/deadlines'),
          fetch('/api/admin/universities'),
        ]);
        if (dRes.ok) setDeadlines((await dRes.json()).deadlines || []);
        if (uRes.ok) setUniversities((await uRes.json()).universities || []);
      } else if (tab === 'inquiries') {
        const res = await fetch('/api/admin/inquiries');
        if (res.ok) setInquiriesData(await res.json());
      } else if (tab === 'verification') {
        const res = await fetch('/api/admin/verification');
        if (res.ok) setVerifications((await res.json()).records || []);
      } else if (tab === 'content') {
        const res = await fetch('/api/admin/content');
        if (res.ok) setContentData(await res.json());
      } else if (tab === 'contact') {
        const res = await fetch('/api/admin/contact');
        if (res.ok) setContactData(await res.json());
      } else if (tab === 'employees') {
        const res = await fetch('/api/admin/employees');
        if (res.ok) setEmployeeData(await res.json());
      } else if (tab === 'settings') {
        const [sRes, eRes, cRes] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/admin/employees'),
          fetch('/api/admin/content'),
        ]);
        if (sRes.ok) setSettingsData(await sRes.json());
        if (eRes.ok) setEmployeeData(await eRes.json());
        if (cRes.ok) setContentData(await cRes.json());
      }
    } catch (e) {
      console.error('Error loading tab data:', e);
    }
  };

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const can = (perm: string) =>
    actor.roles.includes('ADMINISTRATOR') || actor.permissions.includes(perm);

  const navTabs: Array<{ key: TabKey; label: string; labelAr: string; icon: any; show: boolean }> = [
    { key: 'overview', label: 'Overview', labelAr: 'نظرة عامة', icon: LayoutDashboard, show: true },
    {
      key: 'universities',
      label: 'Universities & Admissions',
      labelAr: 'الجامعات والبرامج والمنح',
      icon: Building2,
      show: can('universities:read'),
    },
    {
      key: 'inquiries',
      label: 'Student Inquiries',
      labelAr: 'استفسارات الطلاب',
      icon: MessageSquare,
      show: can('inquiries:read_all') || can('inquiries:read_assigned'),
    },
    { key: 'contact', label: 'WhatsApp & Contact', labelAr: 'الواتساب والتواصل', icon: PhoneCall, show: can('contact:manage') },
    {
      key: 'settings',
      label: 'Settings & Team',
      labelAr: 'الموقع والموظفين',
      icon: Settings,
      show: can('settings:manage') || can('employees:manage') || can('content:manage'),
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900" dir="ltr">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 text-slate-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="Red Dragon Study"
            className="h-10 w-10 rounded-full object-cover bg-white p-0.5"
          />
          <div>
            <div className="text-sm font-extrabold text-white">Red Dragon Admin</div>
            <div className="text-[11px] text-brand-400 font-semibold">{actor.roles.join(', ')}</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navTabs
            .filter((t) => t.show)
            .map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition text-right ${
                    activeTab === t.key
                      ? 'bg-brand-700 text-white shadow'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-brand-400" />
                  <div className="flex-1 text-left">
                    <div className="text-xs font-bold text-slate-100">{t.labelAr}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{t.label}</div>
                  </div>
                </button>
              );
            })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 truncate">{actor.name}</div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex-1 rounded-lg bg-slate-800 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-slate-700"
            >
              Public Site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-900/50 p-1.5 text-red-300 hover:bg-red-800"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 capitalize">
              {navTabs.find((n) => n.key === activeTab)?.label}
            </h1>
            <p className="text-xs text-slate-500">
              Signed in as {actor.email} • Server-enforced RBAC active
            </p>
          </div>
          <div className="flex items-center gap-3">
            {toast && (
              <div className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow">
                {toast}
              </div>
            )}
            <button
              type="button"
              onClick={() => loadTabData(activeTab)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        <main className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && overview && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Total Universities', val: overview.stats.totalUniversities },
                  { label: 'Published Universities', val: overview.stats.publishedUniversities },
                  { label: 'Draft Universities', val: overview.stats.draftUniversities },
                  { label: 'Active Programs', val: overview.stats.activePrograms },
                  { label: 'Active Scholarships', val: overview.stats.activeScholarships },
                  { label: 'Upcoming Deadlines', val: overview.stats.upcomingDeadlines },
                  { label: 'Expired Opportunities', val: overview.stats.expiredOpportunities },
                  { label: 'New Inquiries', val: overview.stats.newInquiries },
                  { label: 'Follow-Up Reminders', val: overview.stats.inquiriesRequiringFollowUp },
                  { label: 'Needs Verification', val: overview.stats.recordsRequiringVerification },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="text-2xl font-black text-brand-700">{stat.val}</div>
                    <div className="text-xs font-semibold text-slate-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {overview.deadlineAlerts?.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3">
                  <h2 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-700" />
                    <span>Opportunities Approaching Deadline</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {overview.deadlineAlerts.map((dl: any) => (
                      <div key={dl.id} className="rounded-xl bg-white p-3 border border-amber-200 text-xs">
                        <div className="font-bold text-slate-900">{dl.titleEn}</div>
                        <div className="text-amber-800 mt-1">
                          Closing: {dl.evaluated.formattedClosingDate} ({dl.evaluated.daysRemaining} days left)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                  <h2 className="text-sm font-bold text-slate-900">Recently Updated Universities</h2>
                  <div className="divide-y divide-slate-100 text-xs">
                    {overview.recentUniversities?.map((u: any) => (
                      <div key={u.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">{u.nameEn}</span>
                          <span className="ml-2 text-slate-400">({u.status})</span>
                        </div>
                        <Link
                          href={`/universities/${u.slug}?preview=true`}
                          target="_blank"
                          className="text-brand-700 font-semibold hover:underline"
                        >
                          Preview →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {overview.recentAuditLogs?.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                    <h2 className="text-sm font-bold text-slate-900">Recent Administrative Audit Trail</h2>
                    <div className="divide-y divide-slate-100 text-xs">
                      {overview.recentAuditLogs.map((log: any) => (
                        <div key={log.id} className="py-2 flex items-center justify-between gap-2">
                          <div>
                            <span className="font-mono font-bold text-brand-800">{log.action}</span>:{' '}
                            <span className="text-slate-700">{log.summary}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. UNIVERSITIES TAB */}
          {activeTab === 'universities' && (
            <div className="space-y-6">
              {/* Internal Sub-Tabs for Universities & Admissions Hub */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
                <button
                  type="button"
                  onClick={() => setUniSubTab('universities')}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    uniSubTab === 'universities'
                      ? 'bg-brand-700 text-white shadow'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  الجامعات الصينية وإضافة شاملة ({universities.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUniSubTab('programs');
                    loadTabData('programs');
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    uniSubTab === 'programs'
                      ? 'bg-brand-700 text-white shadow'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  البرامج الأكاديمية والرسوم ({programs.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUniSubTab('scholarships');
                    loadTabData('scholarships');
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    uniSubTab === 'scholarships'
                      ? 'bg-brand-700 text-white shadow'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  المنح الدراسية ({scholarships.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUniSubTab('requirements');
                    loadTabData('requirements');
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    uniSubTab === 'requirements'
                      ? 'bg-brand-700 text-white shadow'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  مكتبة المتطلبات العامة ({reqData?.globalRequirements?.length || 0})
                </button>
              </div>

              {uniSubTab === 'universities' && (
                <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    إدارة الجامعات الصينية ({universities.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    إضافة وتعديل بيانات الجامعات، البرامج، الرسوم، المواعيد، المتطلبات، والصور في نموذج موحد متكامل.
                  </p>
                </div>
                {can('universities:write') && (
                  <button
                    type="button"
                    onClick={() => setIsUniFormOpen(!isUniFormOpen)}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-800 shadow transition self-start"
                  >
                    <Plus className="h-4 w-4" />
                    <span>
                      {isUniFormOpen ? 'إغلاق نموذج الإضافة' : '+ إضافة جامعة جديدة متكاملة (برامج، مواعيد، متطلبات، صور)'}
                    </span>
                  </button>
                )}
              </div>

              {/* UNIFIED ALL-IN-ONE UNIVERSITY CREATION FORM */}
              {can('universities:write') && isUniFormOpen && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newUni.nameEn.trim()) {
                      notify('اسم الجامعة باللغة الإنجليزية مطلوب');
                      return;
                    }

                    const payload = {
                      ...newUni,
                      slug:
                        newUni.slug?.trim() ||
                        newUni.nameEn
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, ''),
                      programs: uniPrograms.filter((p) => p.nameEn.trim()),
                      fees: newUni.accommodationFeeAmount
                        ? [
                            {
                              category: 'ACCOMMODATION',
                              titleEn: `${newUni.nameEn} Student Accommodation`,
                              titleAr: newUni.nameAr
                                ? `السكن الطلابي - ${newUni.nameAr}`
                                : 'السكن الطلابي',
                              amount: Number(newUni.accommodationFeeAmount),
                              currency: 'CNY',
                              period: newUni.accommodationFeePeriod || 'ANNUALLY',
                              academicYear: newUni.academicYear || '2027-2028',
                              isConfirmed: true,
                            },
                          ]
                        : [],
                      applicationOpeningDate: newUni.applicationOpeningDate || null,
                      applicationDeadlineDate: newUni.applicationDeadlineDate || null,
                      academicYear: newUni.academicYear || '2027-2028',
                      selectedRequirementIds: uniSelectedReqIds,
                      requirementOverrides: uniReqOverrides,
                      specificRequirements: uniSpecificReqs.filter((sr) => sr.nameEn.trim()),
                      selectedScholarshipIds: uniSelectedSchIds,
                      campusImages: uniCampusImages.filter((img) => img.imageUrl.trim()),
                      accommodationImages: uniAccomImages.filter((img) => img.imageUrl.trim()),
                    };

                    const res = await fetch('/api/admin/universities', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });

                    if (res.ok) {
                      notify('تم إنشاء الجامعة وحفظ جميع البرامج والمواعيد والمتطلبات والصور والمنح بنجاح!');
                      setIsUniFormOpen(false);
                      // Reset fields
                      setNewUni({
                        nameEn: '',
                        nameAr: '',
                        nameZh: '',
                        slug: '',
                        city: 'Beijing',
                        province: 'Beijing',
                        district: '',
                        address: '',
                        universityType: 'جامعة بحثية حكومية (Double First-Class)',
                        officialWebsite: '',
                        logoUrl: '/logo.jpeg',
                        shortDescriptionEn: '',
                        shortDescriptionAr: '',
                        detailedDescriptionEn: '',
                        detailedDescriptionAr: '',
                        status: 'PUBLISHED',
                        applicationOpeningDate: '2026-11-01',
                        applicationDeadlineDate: '2027-03-31',
                        academicYear: '2027-2028',
                        accommodationAvailable: true,
                        accommodationFeeAmount: '9000',
                        accommodationFeePeriod: 'ANNUALLY',
                        accommodationDescEn: 'On-campus international student residence halls.',
                        accommodationDescAr: 'سكن طلابي دولي مجهز داخل الحرم الجامعي.',
                      });
                      loadTabData('universities');
                    } else {
                      const err = await res.json();
                      notify(err.error || 'حدث خطأ أثناء حفظ الجامعة');
                    }
                  }}
                  className="rounded-3xl border border-brand-200 bg-white p-6 shadow-md space-y-8"
                >
                  <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        نموذج إضافة جامعة شامل (All-in-One University Form)
                      </h3>
                      <p className="text-xs text-slate-500">
                        أدخل اسم الجامعة، التخصصات والبرامج، مواعيد التقديم، متطلبات القبول، رسوم السكن، الصور والمنح دفعة واحدة.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsUniFormOpen(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      إلغاء الإضافة
                    </button>
                  </div>

                  {/* 1. معلومات الجامعة الأساسية */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-800 uppercase tracking-wider bg-brand-50 px-3 py-1.5 rounded-lg w-fit">
                      <Building2 className="h-4 w-4" />
                      <span>1. البيانات الأساسية للجامعة</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">اسم الجامعة بالإنجليزية *</label>
                        <input
                          required
                          placeholder="e.g. Tsinghua University"
                          value={newUni.nameEn}
                          onChange={(e) => setNewUni({ ...newUni, nameEn: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">اسم الجامعة بالعربية</label>
                        <input
                          placeholder="مثال: جامعة تسينغهوا"
                          value={newUni.nameAr}
                          onChange={(e) => setNewUni({ ...newUni, nameAr: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-right focus:border-brand-700 focus:outline-none"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">الاسم بالصينية</label>
                        <input
                          placeholder="مثال: 清华大学"
                          value={newUni.nameZh}
                          onChange={(e) => setNewUni({ ...newUni, nameZh: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">المدينة (City) *</label>
                        <input
                          required
                          placeholder="e.g. Beijing"
                          value={newUni.city}
                          onChange={(e) => setNewUni({ ...newUni, city: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">المقاطعة (Province) *</label>
                        <input
                          required
                          placeholder="e.g. Beijing"
                          value={newUni.province}
                          onChange={(e) => setNewUni({ ...newUni, province: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">تصنيف / نوع الجامعة</label>
                        <input
                          placeholder="Double First-Class / Project 985"
                          value={newUni.universityType}
                          onChange={(e) => setNewUni({ ...newUni, universityType: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">رابط الموقع الرسمي للجامعة</label>
                        <input
                          placeholder="https://..."
                          value={newUni.officialWebsite}
                          onChange={(e) => setNewUni({ ...newUni, officialWebsite: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">شعار الجامعة (Logo URL)</label>
                        <input
                          placeholder="/logo.jpeg"
                          value={newUni.logoUrl}
                          onChange={(e) => setNewUni({ ...newUni, logoUrl: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">نبذة تعريفية بالإنجليزية</label>
                        <textarea
                          rows={2}
                          placeholder="Short summary of the university in English..."
                          value={newUni.shortDescriptionEn}
                          onChange={(e) =>
                            setNewUni({ ...newUni, shortDescriptionEn: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">نبذة تعريفية بالعربية</label>
                        <textarea
                          rows={2}
                          placeholder="نبذة موجزة عن الجامعة باللغة العربية..."
                          value={newUni.shortDescriptionAr}
                          onChange={(e) =>
                            setNewUni({ ...newUni, shortDescriptionAr: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-right focus:border-brand-700 focus:outline-none"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <label className="flex items-center gap-2">
                        <span>حالة النشر:</span>
                        <select
                          value={newUni.status}
                          onChange={(e) => setNewUni({ ...newUni, status: e.target.value })}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-1.5"
                        >
                          <option value="PUBLISHED">PUBLISHED (منشور للطلاب)</option>
                          <option value="DRAFT">DRAFT (مسودة خاصة)</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  {/* 2. مواعيد التقديم والعام الدراسي */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-800 uppercase tracking-wider bg-brand-50 px-3 py-1.5 rounded-lg w-fit">
                      <Calendar className="h-4 w-4" />
                      <span>2. مواعيد التقديم والعام الدراسي</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">العام الدراسي المستهدف</label>
                        <input
                          placeholder="2027-2028"
                          value={newUni.academicYear}
                          onChange={(e) => setNewUni({ ...newUni, academicYear: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">تاريخ فتح التقديم</label>
                        <input
                          type="date"
                          value={newUni.applicationOpeningDate}
                          onChange={(e) =>
                            setNewUni({ ...newUni, applicationOpeningDate: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">آخر موعد للتقديم (Deadline) *</label>
                        <input
                          type="date"
                          required
                          value={newUni.applicationDeadlineDate}
                          onChange={(e) =>
                            setNewUni({ ...newUni, applicationDeadlineDate: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold text-brand-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. البرامج والتخصصات الأكاديمية */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-800 uppercase tracking-wider bg-brand-50 px-3 py-1.5 rounded-lg w-fit">
                        <BookOpen className="h-4 w-4" />
                        <span>3. البرامج والتخصصات الأكاديمية ({uniPrograms.length})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setUniPrograms([
                            ...uniPrograms,
                            {
                              nameEn: '',
                              nameAr: '',
                              nameZh: '',
                              degreeLevel: 'BACHELOR',
                              languageOfInstruction: 'ENGLISH',
                              durationEn: '4 Years',
                              tuitionAmount: '28000',
                              tuitionCurrency: 'CNY',
                              tuitionPeriod: 'ANNUALLY',
                              eligibilityEn: '',
                            },
                          ])
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-800 hover:bg-brand-100"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>+ إضافة برنامج آخر</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {uniPrograms.map((prog, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">برنامج #{idx + 1}</span>
                            {uniPrograms.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setUniPrograms(uniPrograms.filter((_, i) => i !== idx))
                                }
                                className="text-red-600 hover:underline flex items-center gap-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>حذف هذا البرنامج</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                اسم البرنامج بالإنجليزية *
                              </label>
                              <input
                                required
                                placeholder="e.g. Master of Computer Science"
                                value={prog.nameEn}
                                onChange={(e) => {
                                  const list = [...uniPrograms];
                                  list[idx].nameEn = e.target.value;
                                  setUniPrograms(list);
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                اسم البرنامج بالعربية
                              </label>
                              <input
                                placeholder="مثال: ماجستير علوم الحاسوب"
                                value={prog.nameAr}
                                onChange={(e) => {
                                  const list = [...uniPrograms];
                                  list[idx].nameAr = e.target.value;
                                  setUniPrograms(list);
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-right"
                                dir="rtl"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                الدرجة العلمية
                              </label>
                              <select
                                value={prog.degreeLevel}
                                onChange={(e) => {
                                  const list = [...uniPrograms];
                                  list[idx].degreeLevel = e.target.value;
                                  setUniPrograms(list);
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5"
                              >
                                <option value="BACHELOR">بكالوريوس (Bachelor)</option>
                                <option value="MASTER">ماجستير (Master)</option>
                                <option value="PHD">دكتوراه (PhD)</option>
                                <option value="LANGUAGE">لغة صينية / سنة تحضيرية</option>
                                <option value="DIPLOMA">دبلوم (Diploma)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                لغة التدريس
                              </label>
                              <select
                                value={prog.languageOfInstruction}
                                onChange={(e) => {
                                  const list = [...uniPrograms];
                                  list[idx].languageOfInstruction = e.target.value;
                                  setUniPrograms(list);
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5"
                              >
                                <option value="ENGLISH">الإنجليزية (English)</option>
                                <option value="CHINESE">الصينية (Chinese)</option>
                                <option value="BILINGUAL">ثنائي اللغة (Bilingual)</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                مدة الدراسة
                              </label>
                              <input
                                placeholder="e.g. 4 Years"
                                value={prog.durationEn}
                                onChange={(e) => {
                                  const list = [...uniPrograms];
                                  list[idx].durationEn = e.target.value;
                                  setUniPrograms(list);
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                الرسوم الدراسية السنوية (باليوان CNY)
                              </label>
                              <input
                                type="number"
                                placeholder="28000"
                                value={prog.tuitionAmount}
                                onChange={(e) => {
                                  const list = [...uniPrograms];
                                  list[idx].tuitionAmount = e.target.value;
                                  setUniPrograms(list);
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-brand-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                شروط الأهلية للبرنامج
                              </label>
                              <input
                                placeholder="High school diploma, IELTS 6.0"
                                value={prog.eligibilityEn}
                                onChange={(e) => {
                                  const list = [...uniPrograms];
                                  list[idx].eligibilityEn = e.target.value;
                                  setUniPrograms(list);
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. متطلبات القبول والمستندات */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-800 uppercase tracking-wider bg-brand-50 px-3 py-1.5 rounded-lg w-fit">
                      <FileCheck2 className="h-4 w-4" />
                      <span>4. قائمة متطلبات القبول والمستندات المطلوبة</span>
                    </div>

                    <p className="text-xs text-slate-500">
                      حدد المستندات المطلوبة للتقديم لهذه الجامعة من المكتبة الموحدة (يمكن تعديل الشروط أو إضافة متطلب خاص):
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                      {reqData.globalRequirements?.map((gr: any) => {
                        const isChecked = uniSelectedReqIds.includes(gr.id);
                        return (
                          <label
                            key={gr.id}
                            className={`flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition ${
                              isChecked
                                ? 'border-brand-700 bg-brand-50/50'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setUniSelectedReqIds([...uniSelectedReqIds, gr.id]);
                                } else {
                                  setUniSelectedReqIds(uniSelectedReqIds.filter((id) => id !== gr.id));
                                }
                              }}
                              className="mt-0.5 rounded border-slate-300 text-brand-700"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{gr.nameEn}</div>
                              {gr.nameAr && <div className="text-[11px] text-slate-500">{gr.nameAr}</div>}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. السكن الطلابي والمصاريف */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-800 uppercase tracking-wider bg-brand-50 px-3 py-1.5 rounded-lg w-fit">
                      <Building2 className="h-4 w-4" />
                      <span>5. السكن الطلابي وتكلفة المعيشة</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center pt-6">
                        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newUni.accommodationAvailable}
                            onChange={(e) =>
                              setNewUni({ ...newUni, accommodationAvailable: e.target.checked })
                            }
                            className="rounded border-slate-300 text-brand-700"
                          />
                          <span>يتوفر سكن جامعي للطلاب الدوليين</span>
                        </label>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          تكلفة السكن السنوية (باليوان CNY)
                        </label>
                        <input
                          type="number"
                          placeholder="9000"
                          value={newUni.accommodationFeeAmount}
                          onChange={(e) =>
                            setNewUni({ ...newUni, accommodationFeeAmount: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold text-brand-800"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">فترة الدفع</label>
                        <select
                          value={newUni.accommodationFeePeriod}
                          onChange={(e) =>
                            setNewUni({ ...newUni, accommodationFeePeriod: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                        >
                          <option value="ANNUALLY">سنوياً (Annually)</option>
                          <option value="SEMESTERLY">فصلياً (Semesterly)</option>
                          <option value="MONTHLY">شهرياً (Monthly)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">
                          تفاصيل السكن (English)
                        </label>
                        <input
                          value={newUni.accommodationDescEn}
                          onChange={(e) =>
                            setNewUni({ ...newUni, accommodationDescEn: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">
                          تفاصيل السكن (العربية)
                        </label>
                        <input
                          value={newUni.accommodationDescAr}
                          onChange={(e) =>
                            setNewUni({ ...newUni, accommodationDescAr: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-right"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 6. معرض الصور (الحرم الجامعي والسكن) */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-800 uppercase tracking-wider bg-brand-50 px-3 py-1.5 rounded-lg w-fit">
                      <ImageIcon className="h-4 w-4" />
                      <span>6. معرض الصور (صور الجامعة والسكن الطلابي)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                      {/* صور الحرم الجامعي */}
                      <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">صور الحرم الجامعي ومرافق الدراسة</span>
                          <button
                            type="button"
                            onClick={() =>
                              setUniCampusImages([
                                ...uniCampusImages,
                                { imageUrl: '/logo.jpeg', captionEn: 'Campus Library', captionAr: 'المكتبة المركزية' },
                              ])
                            }
                            className="text-brand-700 font-bold hover:underline"
                          >
                            + إضافة صورة حرم
                          </button>
                        </div>
                        {uniCampusImages.map((img, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              placeholder="رابط الصورة (Image URL) *"
                              value={img.imageUrl}
                              onChange={(e) => {
                                const list = [...uniCampusImages];
                                list[idx].imageUrl = e.target.value;
                                setUniCampusImages(list);
                              }}
                              className="flex-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5"
                            />
                            <input
                              placeholder="تعليق الصورة (Caption)"
                              value={img.captionEn}
                              onChange={(e) => {
                                const list = [...uniCampusImages];
                                list[idx].captionEn = e.target.value;
                                setUniCampusImages(list);
                              }}
                              className="w-1/3 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5"
                            />
                            {uniCampusImages.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setUniCampusImages(uniCampusImages.filter((_, i) => i !== idx))
                                }
                                className="text-red-500 hover:text-red-700 font-bold px-1"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* صور السكن الطلابي */}
                      <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">صور السكن الطلابي والغرف</span>
                          <button
                            type="button"
                            onClick={() =>
                              setUniAccomImages([
                                ...uniAccomImages,
                                { imageUrl: '/logo.jpeg', captionEn: 'Dormitory Room', captionAr: 'غرفة السكن الطلابي' },
                              ])
                            }
                            className="text-brand-700 font-bold hover:underline"
                          >
                            + إضافة صورة سكن
                          </button>
                        </div>
                        {uniAccomImages.map((img, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              placeholder="رابط صورة السكن *"
                              value={img.imageUrl}
                              onChange={(e) => {
                                const list = [...uniAccomImages];
                                list[idx].imageUrl = e.target.value;
                                setUniAccomImages(list);
                              }}
                              className="flex-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5"
                            />
                            <input
                              placeholder="تعليق الصورة"
                              value={img.captionEn}
                              onChange={(e) => {
                                const list = [...uniAccomImages];
                                list[idx].captionEn = e.target.value;
                                setUniAccomImages(list);
                              }}
                              className="w-1/3 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5"
                            />
                            {uniAccomImages.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setUniAccomImages(uniAccomImages.filter((_, i) => i !== idx))
                                }
                                className="text-red-500 hover:text-red-700 font-bold px-1"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 7. المنح الدراسية المتاحة */}
                  {scholarships.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-800 uppercase tracking-wider bg-brand-50 px-3 py-1.5 rounded-lg w-fit">
                        <Award className="h-4 w-4" />
                        <span>7. ربط المنح الدراسية المتاحة في هذه الجامعة</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                        {scholarships.map((sch) => {
                          const isChecked = uniSelectedSchIds.includes(sch.id);
                          return (
                            <label
                              key={sch.id}
                              className={`flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition ${
                                isChecked
                                  ? 'border-brand-700 bg-brand-50/50'
                                  : 'border-slate-200 bg-white hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setUniSelectedSchIds([...uniSelectedSchIds, sch.id]);
                                  } else {
                                    setUniSelectedSchIds(
                                      uniSelectedSchIds.filter((id) => id !== sch.id)
                                    );
                                  }
                                }}
                                className="mt-0.5 rounded border-slate-300 text-brand-700"
                              />
                              <div>
                                <div className="font-bold text-slate-900">{sch.nameEn}</div>
                                <div className="text-[11px] text-brand-700 font-semibold">
                                  {sch.fundingType} • {sch.category}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-2xl bg-brand-700 px-6 py-3 text-sm font-extrabold text-white shadow-lg hover:bg-brand-800 transition"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span>حفظ ونشر الجامعة بجميع تفاصيلها الآن</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUniFormOpen(false)}
                      className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}

              {/* UNIVERSITIES DIRECTORY TABLE */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                    <tr>
                      <th className="p-3.5">University</th>
                      <th className="p-3.5">City / Province</th>
                      <th className="p-3.5">Programs</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Verification</th>
                      <th className="p-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {universities.map((u) => (
                      <tr key={u.id}>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{u.nameEn}</div>
                          <div className="text-slate-500">
                            {u.nameAr} {u.nameZh ? `• ${u.nameZh}` : ''}
                          </div>
                        </td>
                        <td className="p-3.5">{[u.city, u.province].filter(Boolean).join(', ')}</td>
                        <td className="p-3.5 font-semibold">{u.programs?.length || 0}</td>
                        <td className="p-3.5">
                          <select
                            value={u.status}
                            onChange={async (e) => {
                              const res = await fetch(`/api/admin/universities/${u.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: e.target.value }),
                              });
                              if (res.ok) {
                                notify(`Updated ${u.nameEn} status to ${e.target.value}`);
                                loadTabData('universities');
                              }
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold"
                          >
                            <option value="DRAFT">DRAFT</option>
                            <option value="PUBLISHED">PUBLISHED</option>
                            <option value="UNPUBLISHED">UNPUBLISHED</option>
                            <option value="DISABLED">DISABLED</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>
                        </td>
                        <td className="p-3.5">{u.verificationStatus}</td>
                        <td className="p-3.5 flex items-center gap-2">
                          <Link
                            href={`/universities/${u.slug}?preview=true`}
                            target="_blank"
                            className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-brand-700 hover:bg-slate-50"
                          >
                            Preview
                          </Link>
                          <button
                            type="button"
                            onClick={async () => {
                              const res = await fetch('/api/admin/universities', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  action: 'DUPLICATE',
                                  sourceUniversityId: u.id,
                                }),
                              });
                              if (res.ok) {
                                notify('University duplicated as Draft!');
                                loadTabData('universities');
                              }
                            }}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Duplicate
                          </button>
                          {can('universities:delete') && (
                            <button
                              type="button"
                              onClick={async () => {
                                if (!confirm(`Confirm deleting ${u.nameEn}?`)) return;
                                const res = await fetch(
                                  `/api/admin/universities/${u.id}?confirm=true`,
                                  { method: 'DELETE' }
                                );
                                if (res.ok) {
                                  notify('University deleted');
                                  loadTabData('universities');
                                }
                              }}
                              className="rounded-lg border border-red-200 px-2 py-1 text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
            </div>
          )}

          {/* 3. PROGRAMS & FEES TAB */}
          {(activeTab === 'programs' || (activeTab === 'universities' && uniSubTab === 'programs')) && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add Program */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch('/api/admin/programs', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newProg),
                    });
                    if (res.ok) {
                      notify('Academic program created!');
                      loadTabData('programs');
                    }
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-xs"
                >
                  <h2 className="text-sm font-bold text-slate-900">Add Academic Program</h2>
                  <select
                    required
                    value={newProg.universityId}
                    onChange={(e) => setNewProg({ ...newProg, universityId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="">Select University *</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nameEn}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      required
                      placeholder="Program Name (EN) *"
                      value={newProg.nameEn}
                      onChange={(e) => setNewProg({ ...newProg, nameEn: e.target.value })}
                      className="rounded-xl border border-slate-300 px-3 py-2"
                    />
                    <input
                      placeholder="Program Name (AR)"
                      value={newProg.nameAr}
                      onChange={(e) => setNewProg({ ...newProg, nameAr: e.target.value })}
                      className="rounded-xl border border-slate-300 px-3 py-2"
                      dir="rtl"
                    />
                    <select
                      value={newProg.degreeLevel}
                      onChange={(e) => setNewProg({ ...newProg, degreeLevel: e.target.value })}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    >
                      <option value="BACHELOR">Bachelor</option>
                      <option value="MASTER">Master</option>
                      <option value="PHD">PhD</option>
                      <option value="LANGUAGE">Language</option>
                    </select>
                    <select
                      value={newProg.languageOfInstruction}
                      onChange={(e) =>
                        setNewProg({ ...newProg, languageOfInstruction: e.target.value })
                      }
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    >
                      <option value="ENGLISH">English</option>
                      <option value="CHINESE">Chinese</option>
                      <option value="BILINGUAL">Bilingual</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Tuition Amount"
                      value={newProg.tuitionAmount}
                      onChange={(e) => setNewProg({ ...newProg, tuitionAmount: e.target.value })}
                      className="rounded-xl border border-slate-300 px-3 py-2"
                    />
                    <input
                      type="date"
                      value={newProg.deadlineDate}
                      onChange={(e) => setNewProg({ ...newProg, deadlineDate: e.target.value })}
                      className="rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-700 px-4 py-2 font-bold text-white"
                  >
                    + Add Program
                  </button>
                </form>

                {/* Add Fee Record */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch('/api/admin/fees', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newFee),
                    });
                    if (res.ok) {
                      notify('Fee record created!');
                      loadTabData('programs');
                    }
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-xs"
                >
                  <h2 className="text-sm font-bold text-slate-900">Add Fee / Expense Record</h2>
                  <select
                    required
                    value={newFee.universityId}
                    onChange={(e) => setNewFee({ ...newFee, universityId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="">Select University *</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nameEn}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newFee.category}
                      onChange={(e) => setNewFee({ ...newFee, category: e.target.value })}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    >
                      <option value="TUITION">Tuition</option>
                      <option value="ACCOMMODATION">Accommodation</option>
                      <option value="APPLICATION">Application Fee</option>
                      <option value="REGISTRATION">Registration Fee</option>
                      <option value="INSURANCE">Medical Insurance</option>
                      <option value="LIVING_EXPENSES">Living Expenses</option>
                    </select>
                    <input
                      required
                      placeholder="Fee Title (EN) *"
                      value={newFee.titleEn}
                      onChange={(e) => setNewFee({ ...newFee, titleEn: e.target.value })}
                      className="rounded-xl border border-slate-300 px-3 py-2"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Amount *"
                      value={newFee.amount}
                      onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                      className="rounded-xl border border-slate-300 px-3 py-2"
                    />
                    <select
                      value={newFee.period}
                      onChange={(e) => setNewFee({ ...newFee, period: e.target.value })}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    >
                      <option value="ANNUALLY">Annually</option>
                      <option value="SEMESTERLY">Semesterly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="ONE_TIME">One-Time</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newFee.isConfirmed}
                      onChange={(e) => setNewFee({ ...newFee, isConfirmed: e.target.checked })}
                    />
                    <span>Officially Confirmed (uncheck if estimated)</span>
                  </label>
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-700 px-4 py-2 font-bold text-white"
                  >
                    + Add Fee Record
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Academic Programs ({programs.length})</h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {programs.map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{p.nameEn}</span> •{' '}
                        <span className="text-slate-600">{p.university?.nameEn}</span> ({p.degreeLevel} /{' '}
                        {p.languageOfInstruction})
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch(`/api/admin/programs?id=${p.id}`, { method: 'DELETE' });
                          loadTabData('programs');
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. SCHOLARSHIPS TAB */}
          {(activeTab === 'scholarships' || (activeTab === 'universities' && uniSubTab === 'scholarships')) && (
            <div className="space-y-6">
              {can('scholarships:write') && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch('/api/admin/scholarships', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newSch),
                    });
                    if (res.ok) {
                      notify('Scholarship created!');
                      loadTabData('scholarships');
                    }
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-xs"
                >
                  <h2 className="text-sm font-bold text-slate-900">Create Scholarship Opportunity</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      required
                      placeholder="Scholarship Name (EN) *"
                      value={newSch.nameEn}
                      onChange={(e) => setNewSch({ ...newSch, nameEn: e.target.value })}
                      className="rounded-xl border border-slate-300 px-3 py-2"
                    />
                    <input
                      placeholder="Scholarship Name (AR)"
                      value={newSch.nameAr}
                      onChange={(e) => setNewSch({ ...newSch, nameAr: e.target.value })}
                      className="rounded-xl border border-slate-300 px-3 py-2"
                      dir="rtl"
                    />
                    <select
                      value={newSch.fundingType}
                      onChange={(e) => setNewSch({ ...newSch, fundingType: e.target.value })}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    >
                      <option value="FULL">Full Funding</option>
                      <option value="PARTIAL">Partial Funding</option>
                    </select>
                    <input
                      placeholder="Tuition Coverage (EN)"
                      value={newSch.tuitionCoverageEn}
                      onChange={(e) => setNewSch({ ...newSch, tuitionCoverageEn: e.target.value })}
                      className="rounded-xl border border-slate-300 px-3 py-2"
                    />
                    <input
                      placeholder="Monthly Stipend Amount (leave blank if none)"
                      value={newSch.stipendAmount}
                      onChange={(e) => setNewSch({ ...newSch, stipendAmount: e.target.value })}
                      className="rounded-xl border border-slate-300 px-3 py-2"
                    />
                    <select
                      value={newSch.status}
                      onChange={(e) => setNewSch({ ...newSch, status: e.target.value })}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    >
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="DISABLED">DISABLED</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-700 px-4 py-2 font-bold text-white"
                  >
                    + Create Scholarship
                  </button>
                </form>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <h2 className="text-sm font-bold text-slate-900">Scholarships ({scholarships.length})</h2>
                <div className="divide-y divide-slate-100 text-xs">
                  {scholarships.map((s) => (
                    <div key={s.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{s.nameEn}</span> ({s.fundingType} •{' '}
                        {s.status})
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/scholarships/${s.slug}`}
                          target="_blank"
                          className="text-brand-700 font-semibold"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. SHARED REQUIREMENTS & OVERRIDES TAB */}
          {(activeTab === 'requirements' || (activeTab === 'universities' && uniSubTab === 'requirements')) && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch('/api/admin/requirements', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ type: 'GLOBAL', ...newGlobalReq }),
                    });
                    if (res.ok) {
                      notify('Global shared requirement added!');
                      loadTabData('requirements');
                    }
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-xs"
                >
                  <h2 className="text-sm font-bold text-slate-900">
                    1. Add to Shared Requirements Library
                  </h2>
                  <input
                    required
                    placeholder="Requirement Name (EN) *"
                    value={newGlobalReq.nameEn}
                    onChange={(e) => setNewGlobalReq({ ...newGlobalReq, nameEn: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <input
                    placeholder="Requirement Name (AR)"
                    value={newGlobalReq.nameAr}
                    onChange={(e) => setNewGlobalReq({ ...newGlobalReq, nameAr: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    dir="rtl"
                  />
                  <input
                    placeholder="Instructions (EN)"
                    value={newGlobalReq.instructionsEn}
                    onChange={(e) =>
                      setNewGlobalReq({ ...newGlobalReq, instructionsEn: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-700 px-4 py-2 font-bold text-white"
                  >
                    + Add Shared Requirement
                  </button>
                </form>

                {/* Per-University Override Form */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch('/api/admin/requirements', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ type: 'OVERRIDE', ...overrideForm }),
                    });
                    if (res.ok) {
                      notify('University-specific override saved without modifying other universities!');
                      loadTabData('requirements');
                    }
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-xs"
                >
                  <h2 className="text-sm font-bold text-slate-900">
                    2. Per-University Requirement Override (Isolated)
                  </h2>
                  <select
                    required
                    value={overrideForm.universityRequirementId}
                    onChange={(e) =>
                      setOverrideForm({
                        ...overrideForm,
                        universityRequirementId: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="">Select University + Requirement Assignment *</option>
                    {reqData.universityAssignments?.map((ua: any) => (
                      <option key={ua.id} value={ua.id}>
                        {ua.university?.nameEn} — {ua.requirement?.nameEn}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Custom Instructions for this university only (EN)"
                    value={overrideForm.customInstructionsEn}
                    onChange={(e) =>
                      setOverrideForm({ ...overrideForm, customInstructionsEn: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={overrideForm.isRequiredOverride}
                        onChange={(e) =>
                          setOverrideForm({
                            ...overrideForm,
                            isRequiredOverride: e.target.checked,
                          })
                        }
                      />
                      <span>Required at this university</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-red-700">
                      <input
                        type="checkbox"
                        checked={overrideForm.isExcluded}
                        onChange={(e) =>
                          setOverrideForm({ ...overrideForm, isExcluded: e.target.checked })
                        }
                      />
                      <span>Exclude from this university</span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-700 px-4 py-2 font-bold text-white"
                  >
                    Save Isolated Override
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Global Shared Requirements Library ({reqData.globalRequirements?.length || 0})
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {reqData.globalRequirements?.map((r: any) => (
                    <div key={r.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{r.nameEn}</span> •{' '}
                        <span className="text-slate-500">{r.nameAr}</span> (
                        {r.isRequiredDefault ? 'Required by default' : 'Optional by default'})
                      </div>
                      <span className="text-emerald-700 font-semibold">{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. GALLERIES & MEDIA TAB */}
          {activeTab === 'galleries' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch('/api/admin/galleries', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newGallery),
                    });
                    if (res.ok) {
                      notify('Gallery created! (Will stay hidden publicly until published images are added)');
                      loadTabData('galleries');
                    }
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-xs"
                >
                  <h2 className="text-sm font-bold text-slate-900">Create University / Accommodation Gallery</h2>
                  <select
                    required
                    value={newGallery.universityId}
                    onChange={(e) => setNewGallery({ ...newGallery, universityId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="">Select University *</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nameEn}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newGallery.category}
                    onChange={(e) => setNewGallery({ ...newGallery, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="CAMPUS">Campus</option>
                    <option value="BUILDINGS">University Buildings</option>
                    <option value="LABORATORIES">Laboratories</option>
                    <option value="LIBRARIES">Libraries</option>
                    <option value="ACCOMMODATION">Student Accommodation</option>
                    <option value="DORMITORY_ROOMS">Dormitory Rooms</option>
                  </select>
                  <input
                    required
                    placeholder="Gallery Title (EN) *"
                    value={newGallery.titleEn}
                    onChange={(e) => setNewGallery({ ...newGallery, titleEn: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-700 px-4 py-2 font-bold text-white"
                  >
                    + Create Gallery
                  </button>
                </form>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch('/api/admin/galleries', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'ADD_IMAGE', ...newGalleryImage }),
                    });
                    if (res.ok) {
                      notify('Image added to gallery!');
                      loadTabData('galleries');
                    }
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-xs"
                >
                  <h2 className="text-sm font-bold text-slate-900">Add Verified Photograph to Gallery</h2>
                  <select
                    required
                    value={newGalleryImage.galleryId}
                    onChange={(e) =>
                      setNewGalleryImage({ ...newGalleryImage, galleryId: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="">Select Gallery *</option>
                    {galleryData.galleries?.map((g: any) => (
                      <option key={g.id} value={g.id}>
                        {g.university?.nameEn} — {g.titleEn}
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    placeholder="Image URL *"
                    value={newGalleryImage.imageUrl}
                    onChange={(e) =>
                      setNewGalleryImage({ ...newGalleryImage, imageUrl: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <input
                    placeholder="Caption (EN)"
                    value={newGalleryImage.captionEn}
                    onChange={(e) =>
                      setNewGalleryImage({ ...newGalleryImage, captionEn: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-700 px-4 py-2 font-bold text-white"
                  >
                    + Add Image
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Configured Galleries ({galleryData.galleries?.length || 0})
                </h3>
                {galleryData.galleries?.map((g: any) => (
                  <div key={g.id} className="rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{g.titleEn}</span> (
                        {g.university?.nameEn} • {g.category}) —{' '}
                        <span className="font-semibold text-brand-700">
                          {g.images?.length || 0} images
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch(`/api/admin/galleries?galleryId=${g.id}`, {
                            method: 'DELETE',
                          });
                          loadTabData('galleries');
                        }}
                        className="text-red-600 font-semibold"
                      >
                        Delete Gallery
                      </button>
                    </div>
                    {g.images?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {g.images.map((img: any) => (
                          <div
                            key={img.id}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1 bg-slate-50"
                          >
                            <span>{img.captionEn || img.imageUrl}</span>
                            <button
                              type="button"
                              onClick={async () => {
                                await fetch(`/api/admin/galleries?imageId=${img.id}`, {
                                  method: 'DELETE',
                                });
                                notify('Image removed');
                                loadTabData('galleries');
                              }}
                              className="text-red-600 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. DEADLINES TAB */}
          {activeTab === 'deadlines' && (
            <div className="space-y-6">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await fetch('/api/admin/deadlines', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newDeadline),
                  });
                  if (res.ok) {
                    notify('Deadline created!');
                    loadTabData('deadlines');
                  }
                }}
                className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-xs"
              >
                <h2 className="text-sm font-bold text-slate-900">Add Application Deadline</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    required
                    placeholder="Deadline Title (EN) *"
                    value={newDeadline.titleEn}
                    onChange={(e) => setNewDeadline({ ...newDeadline, titleEn: e.target.value })}
                    className="rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <select
                    value={newDeadline.universityId}
                    onChange={(e) =>
                      setNewDeadline({ ...newDeadline, universityId: e.target.value })
                    }
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="">General / All Universities</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nameEn}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={newDeadline.closingDate}
                    onChange={(e) =>
                      setNewDeadline({ ...newDeadline, closingDate: e.target.value })
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-700 px-4 py-2 font-bold text-white"
                >
                  + Create Deadline
                </button>
              </form>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Configured Deadlines</h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {deadlines.map((d) => (
                    <div key={d.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{d.titleEn}</span> •{' '}
                        <span className="font-semibold text-brand-700">
                          {d.evaluated?.labelEn}
                        </span>{' '}
                        ({d.evaluated?.formattedClosingDate || 'No closing date'})
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch(`/api/admin/deadlines?id=${d.id}`, { method: 'DELETE' });
                          loadTabData('deadlines');
                        }}
                        className="text-red-600 font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 8. INQUIRIES TAB */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Student Inquiries ({inquiriesData.inquiries?.length || 0})
                </h2>
                {can('inquiries:export') && (
                  <a
                    href="/api/admin/inquiries?export=csv"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Authorized CSV</span>
                  </a>
                )}
              </div>

              <div className="space-y-4">
                {inquiriesData.inquiries?.map((inq: any) => (
                  <div
                    key={inq.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 text-xs"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-700">
                            {inq.inquiryNumber}
                          </span>
                          <span className="font-extrabold text-sm text-slate-900">
                            {inq.studentName}
                          </span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-bold text-blue-800">
                            {inq.statusCode}
                          </span>
                        </div>
                        <div className="text-slate-500 mt-1">
                          Email: {inq.email || '—'} • WhatsApp: {inq.whatsappNumber || '—'} •
                          Country: {inq.countryOfResidence || '—'}
                        </div>
                        {inq.university && (
                          <div className="text-slate-700 font-semibold mt-1">
                            Target University: {inq.university.nameEn}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={inq.statusCode}
                          onChange={async (e) => {
                            const res = await fetch('/api/admin/inquiries', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                inquiryId: inq.id,
                                action: 'UPDATE_STATUS',
                                statusCode: e.target.value,
                              }),
                            });
                            if (res.ok) {
                              notify('Inquiry status updated & recorded in history!');
                              loadTabData('inquiries');
                            }
                          }}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-semibold"
                        >
                          {inquiriesData.statuses?.map((st: any) => (
                            <option key={st.code} value={st.code}>
                              {st.labelEn}
                            </option>
                          ))}
                        </select>

                        {can('inquiries:assign') && (
                          <select
                            value={inq.assignedEmployeeId || ''}
                            onChange={async (e) => {
                              const res = await fetch('/api/admin/inquiries', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  inquiryId: inq.id,
                                  action: 'ASSIGN_EMPLOYEE',
                                  assignedToId: e.target.value || null,
                                }),
                              });
                              if (res.ok) {
                                notify('Assigned employee updated!');
                                loadTabData('inquiries');
                              }
                            }}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5"
                          >
                            <option value="">Unassigned</option>
                            {inquiriesData.employees?.map((emp: any) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 text-slate-800">{inq.message}</div>

                    {/* Internal Notes (Never Public) */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="font-bold text-slate-700">
                        Internal Consultancy Notes ({inq.notes?.length || 0}) — Private
                      </div>
                      {inq.notes?.map((n: any) => (
                        <div key={n.id} className="rounded-lg bg-amber-50/70 p-2.5 text-slate-700">
                          <strong>{n.author?.name || 'Employee'}:</strong> {n.noteText}
                        </div>
                      ))}
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const input = form.elements.namedItem('noteText') as HTMLInputElement;
                          if (!input.value.trim()) return;
                          const res = await fetch('/api/admin/inquiries', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              inquiryId: inq.id,
                              action: 'ADD_NOTE',
                              noteText: input.value,
                            }),
                          });
                          if (res.ok) {
                            input.value = '';
                            notify('Internal note added');
                            loadTabData('inquiries');
                          }
                        }}
                        className="flex gap-2"
                      >
                        <input
                          name="noteText"
                          placeholder="Add private internal follow-up note..."
                          className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5"
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-slate-800 px-3 py-1.5 font-bold text-white"
                        >
                          Add Note
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. VERIFICATION CENTER TAB */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                <h2 className="text-sm font-bold text-slate-900">
                  Information Verification & Trustworthiness Records
                </h2>
                <div className="divide-y divide-slate-100 text-xs">
                  {verifications.map((v) => (
                    <div key={v.id} className="py-3 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="font-bold text-slate-900">{v.entityTitle}</span> (
                        {v.entityType} • Academic Year: {v.academicYear || '2027-2028'})
                        <div className="text-slate-500 mt-0.5">
                          Source: {v.sourceUrl || 'Not specified'} • Internal Note:{' '}
                          {v.internalNotes || '—'}
                        </div>
                      </div>
                      <select
                        value={v.status}
                        onChange={async (e) => {
                          const res = await fetch('/api/admin/verification', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: v.id, status: e.target.value }),
                          });
                          if (res.ok) {
                            notify(`Verification status updated to ${e.target.value}`);
                            loadTabData('verification');
                          }
                        }}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-bold"
                      >
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                        <option value="REQUIRES_REVIEW">REQUIRES_REVIEW</option>
                        <option value="OUTDATED">OUTDATED</option>
                        <option value="UNABLE_TO_VERIFY">UNABLE_TO_VERIFY</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 10. WEBSITE CONTENT, NAVIGATION & CUSTOM PAGES TAB */}
          {(activeTab === 'content' || (activeTab === 'settings' && settingsSubTab === 'content')) && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">
                    Homepage Configurable Sections
                  </h2>
                  <Link
                    href="/?preview=true"
                    target="_blank"
                    className="text-xs font-bold text-brand-700 hover:underline"
                  >
                    Preview Homepage →
                  </Link>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {contentData.homepageSections?.map((sec: any) => (
                    <div key={sec.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-mono font-bold text-brand-800">
                          #{sec.displayOrder} {sec.sectionKey}
                        </span>
                        : {sec.titleEn} / {sec.titleAr}
                      </div>
                      <label className="flex items-center gap-2 font-semibold">
                        <input
                          type="checkbox"
                          checked={sec.isEnabled}
                          onChange={async (e) => {
                            await fetch('/api/admin/content', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                type: 'HOMEPAGE_SECTION',
                                id: sec.id,
                                isEnabled: e.target.checked,
                              }),
                            });
                            notify(`Section ${sec.sectionKey} visibility updated`);
                            loadTabData('content');
                          }}
                        />
                        <span>Enabled</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create Custom Page */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await fetch('/api/admin/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'PAGE', ...newPage }),
                  });
                  if (res.ok) {
                    notify('Custom page created!');
                    loadTabData('content');
                  }
                }}
                className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-xs"
              >
                <h2 className="text-sm font-bold text-slate-900">Create Custom Public Page</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    required
                    placeholder="URL Slug (e.g. visa-guide) *"
                    value={newPage.slug}
                    onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                    className="rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <input
                    required
                    placeholder="Page Title (EN) *"
                    value={newPage.titleEn}
                    onChange={(e) => setNewPage({ ...newPage, titleEn: e.target.value })}
                    className="rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <input
                    placeholder="Page Title (AR)"
                    value={newPage.titleAr}
                    onChange={(e) => setNewPage({ ...newPage, titleAr: e.target.value })}
                    className="rounded-xl border border-slate-300 px-3 py-2"
                    dir="rtl"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Page Content (EN)"
                  value={newPage.contentEn}
                  onChange={(e) => setNewPage({ ...newPage, contentEn: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-brand-700 px-4 py-2 font-bold text-white"
                >
                  + Publish Custom Page
                </button>
              </form>
            </div>
          )}

          {/* 11. WHATSAPP & CONTACT SETTINGS TAB */}
          {activeTab === 'contact' && contactData.contactSetting && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 text-xs">
                <h2 className="text-sm font-bold text-slate-900">
                  Global WhatsApp Contact Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Default WhatsApp Number</label>
                    <input
                      value={contactData.contactSetting.defaultWhatsappNumber || ''}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          contactSetting: {
                            ...contactData.contactSetting,
                            defaultWhatsappNumber: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Button Text (EN)</label>
                    <input
                      value={contactData.contactSetting.buttonTextEn || ''}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          contactSetting: {
                            ...contactData.contactSetting,
                            buttonTextEn: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 font-bold">
                      <input
                        type="checkbox"
                        checked={contactData.contactSetting.globalWhatsappEnabled}
                        onChange={(e) =>
                          setContactData({
                            ...contactData,
                            contactSetting: {
                              ...contactData.contactSetting,
                              globalWhatsappEnabled: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>Enable WhatsApp Buttons Globally</span>
                    </label>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await fetch('/api/admin/contact', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(contactData.contactSetting),
                    });
                    if (res.ok) notify('WhatsApp settings saved!');
                  }}
                  className="rounded-xl bg-brand-700 px-4 py-2 font-bold text-white"
                >
                  Save Contact Settings
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await fetch('/api/admin/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTemplate),
                  });
                  if (res.ok) {
                    notify('WhatsApp message template added!');
                    loadTabData('contact');
                  }
                }}
                className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-xs"
              >
                <h2 className="text-sm font-bold text-slate-900">
                  Create WhatsApp Message Template (Variables: {'{university_name}'}, {'{major_name}'},{' '}
                  {'{city}'}, {'{scholarship_name}'}, {'{application_deadline}'})
                </h2>
                <input
                  required
                  placeholder="Template Name *"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
                <textarea
                  rows={2}
                  required
                  value={newTemplate.templateEn}
                  onChange={(e) => setNewTemplate({ ...newTemplate, templateEn: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-brand-700 px-4 py-2 font-bold text-white"
                >
                  + Save Template
                </button>
              </form>
            </div>
          )}

          {/* 12. EMPLOYEES & RBAC TAB */}
          {(activeTab === 'employees' || (activeTab === 'settings' && settingsSubTab === 'employees')) && (
            <div className="space-y-6">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await fetch('/api/admin/employees', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newEmployee),
                  });
                  if (res.ok) {
                    notify('Employee account created!');
                    loadTabData('employees');
                  }
                }}
                className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-xs"
              >
                <h2 className="text-sm font-bold text-slate-900">Invite / Create Employee Account</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    required
                    placeholder="Employee Full Name *"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className="rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    className="rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <input
                    type="password"
                    required
                    placeholder="Initial Password *"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    className="rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <select
                    value={newEmployee.roleCode}
                    onChange={(e) => setNewEmployee({ ...newEmployee, roleCode: e.target.value })}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                  >
                    {employeeData.roles?.map((r: any) => (
                      <option key={r.id} value={r.code}>
                        {r.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-700 px-4 py-2 font-bold text-white"
                >
                  + Create Employee
                </button>
              </form>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <h2 className="text-sm font-bold text-slate-900">Employee Directory</h2>
                <div className="divide-y divide-slate-100 text-xs">
                  {employeeData.employees?.map((emp: any) => (
                    <div key={emp.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{emp.name}</span> ({emp.email}) —
                        Roles:{' '}
                        <span className="font-semibold text-brand-700">
                          {emp.userRoles?.map((ur: any) => ur.role.code).join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch('/api/admin/employees', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                userId: emp.id,
                                revokeSessions: true,
                              }),
                            });
                            notify(`Revoked active sessions for ${emp.email}`);
                          }}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-700"
                        >
                          Revoke Sessions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 13. SYSTEM SETTINGS & BACKUP TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Internal Sub-Tabs for Settings Hub */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('system')}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    settingsSubTab === 'system'
                      ? 'bg-brand-700 text-white shadow'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  إعدادات النظام والنسخ الاحتياطي
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSettingsSubTab('employees');
                    loadTabData('employees');
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    settingsSubTab === 'employees'
                      ? 'bg-brand-700 text-white shadow'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  الموظفين والصلاحيات ({employeeData.employees?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSettingsSubTab('content');
                    loadTabData('content');
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    settingsSubTab === 'content'
                      ? 'bg-brand-700 text-white shadow'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  أقسام الموقع والصفحات
                </button>
              </div>

              {settingsSubTab === 'system' && settingsData.systemSetting && (
                <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">System Configuration</h2>
                  <a
                    href="/api/admin/settings?backup=json"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Database Backup (JSON)</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Website Name (EN)</label>
                    <input
                      value={settingsData.systemSetting.siteNameEn}
                      onChange={(e) =>
                        setSettingsData({
                          ...settingsData,
                          systemSetting: {
                            ...settingsData.systemSetting,
                            siteNameEn: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Default Language</label>
                    <select
                      value={settingsData.systemSetting.defaultLanguage}
                      onChange={(e) =>
                        setSettingsData({
                          ...settingsData,
                          systemSetting: {
                            ...settingsData.systemSetting,
                            defaultLanguage: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                    >
                      <option value="ar">Arabic (RTL Default)</option>
                      <option value="en">English (LTR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Deadline Warning Window (Days)</label>
                    <input
                      type="number"
                      value={settingsData.systemSetting.deadlineWarningDays}
                      onChange={(e) =>
                        setSettingsData({
                          ...settingsData,
                          systemSetting: {
                            ...settingsData.systemSetting,
                            deadlineWarningDays: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    const res = await fetch('/api/admin/settings', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(settingsData.systemSetting),
                    });
                    if (res.ok) notify('System settings saved!');
                  }}
                  className="rounded-xl bg-brand-700 px-4 py-2 font-bold text-white"
                >
                  Save System Settings
                </button>
              </div>
            </div>
            )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
