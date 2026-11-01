import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  filterVisibleGalleries,
  filterVisibleScholarships,
  getLocalizedText,
  hasNonEmptyText,
  hasValidMapInformation,
  isRecordPubliclyVisible,
  isValidPublicUrl,
  resolveUniversityRequirements,
  shouldRenderSectionWithChildren,
} from '@/lib/visibility';
import { evaluateDeadline, formatDateInTimezone } from '@/lib/deadlines';
import {
  buildWhatsAppContactAction,
  normalizeWhatsAppNumber,
  renderWhatsAppMessage,
} from '@/lib/whatsapp';
import {
  DEFAULT_ROLE_PERMISSIONS,
  canAccessInquiryRecord,
  hasPermission,
} from '@/lib/rbac';
import {
  createSessionToken,
  hashPassword,
  loadActorById,
  verifyPassword,
  verifySessionToken,
} from '@/lib/auth';
import { sanitizeAuditMetadata } from '@/lib/audit';
import { validateUploadedImageFile } from '@/lib/media-validation';
import { sanitizePublicUniversity, searchPublicUniversities } from '@/lib/public-data';
import { getDirection, UI_LABELS } from '@/lib/i18n';
import { GET as getPublicInquiries, POST as postPublicInquiry } from '@/app/api/public/inquiries/route';
import { GET as getPublicCompare } from '@/app/api/public/compare/route';
import { POST as postAdminUniversity } from '@/app/api/admin/universities/route';
import { NextRequest } from 'next/server';

describe('Red Dragon Study — Complete Platform Automated Test Suite', () => {
  // 1. VISIBILITY RULES
  describe('1. Automatic Content Visibility Rules (Section 5 & 25)', () => {
    it('distinguishes between PUBLISHED, DRAFT, UNPUBLISHED, DISABLED, ARCHIVED, and DELETED records', () => {
      expect(isRecordPubliclyVisible({ status: 'PUBLISHED', isEnabled: true })).toBe(true);
      expect(isRecordPubliclyVisible({ status: 'DRAFT', isEnabled: true })).toBe(false);
      expect(isRecordPubliclyVisible({ status: 'DRAFT', isEnabled: true }, true)).toBe(true);
      expect(isRecordPubliclyVisible({ status: 'UNPUBLISHED', isEnabled: true })).toBe(false);
      expect(isRecordPubliclyVisible({ status: 'DISABLED', isEnabled: true })).toBe(false);
      expect(isRecordPubliclyVisible({ status: 'ARCHIVED', isEnabled: true })).toBe(false);
      expect(isRecordPubliclyVisible({ status: 'DELETED', isEnabled: true })).toBe(false);
      expect(isRecordPubliclyVisible({ status: 'PUBLISHED', isEnabled: false })).toBe(false);
    });

    it('hides empty galleries and hides the entire gallery when all images are removed or unpublished', () => {
      const galleries = [
        {
          id: 'g-empty',
          status: 'PUBLISHED',
          isEnabled: true,
          isAccommodation: true,
          images: [],
        },
        {
          id: 'g-unpublished-imgs',
          status: 'PUBLISHED',
          isEnabled: true,
          isAccommodation: true,
          images: [{ id: 'img-1', imageUrl: '/uploads/dorm1.jpg', isPublished: false }],
        },
        {
          id: 'g-valid',
          status: 'PUBLISHED',
          isEnabled: true,
          isAccommodation: false,
          images: [{ id: 'img-2', imageUrl: '/uploads/campus.jpg', isPublished: true }],
        },
      ];

      const accomVisible = filterVisibleGalleries(galleries, { onlyAccommodation: true });
      expect(accomVisible).toHaveLength(0);

      const campusVisible = filterVisibleGalleries(galleries, { excludeAccommodation: true });
      expect(campusVisible).toHaveLength(1);
      expect(campusVisible[0].id).toBe('g-valid');

      // Now simulate removing the last image from g-valid:
      galleries[2].images = [];
      const afterRemovingAllImages = filterVisibleGalleries(galleries, {
        excludeAccommodation: true,
      });
      expect(afterRemovingAllImages).toHaveLength(0);
    });

    it('hides scholarship sections when no published scholarships exist', () => {
      const unpublishedOnly = [
        { id: 's1', nameEn: 'Draft Scholarship', status: 'DRAFT' },
        { id: 's2', nameEn: 'Archived Scholarship', status: 'ARCHIVED' },
      ];
      const visible = filterVisibleScholarships(unpublishedOnly);
      expect(visible).toHaveLength(0);
      expect(shouldRenderSectionWithChildren(true, 'PUBLISHED', visible)).toBe(false);
    });

    it('prevents missing or invalid official website URLs from producing buttons', () => {
      expect(isValidPublicUrl(null)).toBe(false);
      expect(isValidPublicUrl('')).toBe(false);
      expect(isValidPublicUrl('   ')).toBe(false);
      expect(isValidPublicUrl('javascript:alert(1)')).toBe(false);
      expect(isValidPublicUrl('https://www.tsinghua.edu.cn/en/')).toBe(true);
    });

    it('hides map section when coordinates and direct map URL are missing', () => {
      const missingMap = hasValidMapInformation({
        latitude: null,
        longitude: null,
        mapUrl: '',
        address: 'Some street without coordinates or map link',
      });
      expect(missingMap.canShowMapSection).toBe(false);

      const validCoords = hasValidMapInformation({
        latitude: 40.0003,
        longitude: 116.3264,
        mapUrl: null,
      });
      expect(validCoords.canShowMapSection).toBe(true);
      expect(validCoords.hasCoordinates).toBe(true);
    });

    it('ensures empty optional fields do not render labels', () => {
      expect(hasNonEmptyText(null)).toBe(false);
      expect(hasNonEmptyText(undefined)).toBe(false);
      expect(hasNonEmptyText('   ')).toBe(false);
      expect(getLocalizedText('ar', '', '')).toBeNull();
    });
  });

  // 2. SHARED REQUIREMENTS & PER-UNIVERSITY ISOLATED OVERRIDES
  describe('2. Shared Requirements Library & Per-University Overrides (Section 8 & 25)', () => {
    it('reuses shared requirements while isolating overrides for University A, B, C, and D', () => {
      const sharedRecommendationDoc = {
        id: 'req-rec-letters',
        nameEn: 'Two Academic Recommendation Letters',
        nameAr: 'خطابا توصية أكاديمية',
        descriptionEn: 'Standard recommendation letters.',
        instructionsEn: 'Standard instructions.',
        isRequiredDefault: true,
        isEnabled: true,
        status: 'PUBLISHED',
      };

      // University A: Required (uses default)
      const uniA = resolveUniversityRequirements(
        [
          {
            id: 'assign-A',
            isEnabled: true,
            status: 'PUBLISHED',
            requirement: sharedRecommendationDoc,
            override: null,
          },
        ],
        []
      );
      expect(uniA).toHaveLength(1);
      expect(uniA[0].isRequired).toBe(true);
      expect(uniA[0].instructionsEn).toBe('Standard instructions.');

      // University B: Overridden as Optional
      const uniB = resolveUniversityRequirements(
        [
          {
            id: 'assign-B',
            isEnabled: true,
            status: 'PUBLISHED',
            requirement: sharedRecommendationDoc,
            override: { isRequiredOverride: false },
          },
        ],
        []
      );
      expect(uniB).toHaveLength(1);
      expect(uniB[0].isRequired).toBe(false);
      // Verify University A was not modified!
      expect(uniA[0].isRequired).toBe(true);

      // University C: Excluded completely
      const uniC = resolveUniversityRequirements(
        [
          {
            id: 'assign-C',
            isEnabled: true,
            status: 'PUBLISHED',
            requirement: sharedRecommendationDoc,
            override: { isExcluded: true },
          },
        ],
        []
      );
      expect(uniC).toHaveLength(0);

      // University D: Custom instructions + University-specific requirement
      const uniD = resolveUniversityRequirements(
        [
          {
            id: 'assign-D',
            isEnabled: true,
            status: 'PUBLISHED',
            requirement: sharedRecommendationDoc,
            override: {
              customInstructionsEn: 'Must be signed by full professors in Computer Science.',
            },
          },
        ],
        [
          {
            id: 'spec-D',
            nameEn: 'CS Portfolio & Research Proposal',
            isRequired: true,
            isEnabled: true,
            status: 'PUBLISHED',
          },
        ]
      );
      expect(uniD).toHaveLength(2);
      expect(uniD[0].instructionsEn).toBe(
        'Must be signed by full professors in Computer Science.'
      );
      expect(uniD[1].source).toBe('UNIVERSITY_SPECIFIC');
    });

    it('verifies in the database that deleting a university assignment does not delete the shared requirement', async () => {
      const tempReq = await prisma.globalRequirement.create({
        data: {
          code: `TEST_REQ_${Date.now()}`,
          nameEn: 'Temporary Test Requirement',
          isRequiredDefault: true,
          status: 'PUBLISHED',
        },
      });

      const tsinghua = await prisma.university.findUnique({
        where: { slug: 'tsinghua-university' },
      });
      expect(tsinghua).not.toBeNull();

      const assignment = await prisma.universityRequirement.create({
        data: {
          universityId: tsinghua!.id,
          requirementId: tempReq.id,
        },
      });

      // Delete the assignment
      await prisma.universityRequirement.delete({ where: { id: assignment.id } });

      // Shared requirement must still exist!
      const stillExists = await prisma.globalRequirement.findUnique({
        where: { id: tempReq.id },
      });
      expect(stillExists).not.toBeNull();

      // Cleanup
      await prisma.globalRequirement.delete({ where: { id: tempReq.id } });
    });
  });

  // 3. DEADLINES & TIMEZONE HANDLING
  describe('3. Application Deadlines & Status Calculation (Section 10 & 25)', () => {
    const referenceNow = new Date('2026-11-01T10:00:00Z');

    it('calculates NOT_YET_OPEN, OPEN, DEADLINE_APPROACHING, DEADLINE_PASSED, and DEADLINE_NOT_ANNOUNCED accurately', () => {
      const notYetOpen = evaluateDeadline(
        {
          openingDate: '2026-12-01T00:00:00Z',
          closingDate: '2027-03-31T00:00:00Z',
          status: 'PUBLISHED',
        },
        { now: referenceNow, warningDays: 30 }
      );
      expect(notYetOpen.status).toBe('NOT_YET_OPEN');

      const open = evaluateDeadline(
        {
          openingDate: '2026-10-01T00:00:00Z',
          closingDate: '2027-03-31T00:00:00Z',
          status: 'PUBLISHED',
        },
        { now: referenceNow, warningDays: 30 }
      );
      expect(open.status).toBe('OPEN');

      const approaching = evaluateDeadline(
        {
          openingDate: '2026-10-01T00:00:00Z',
          closingDate: '2026-11-15T00:00:00Z',
          status: 'PUBLISHED',
        },
        { now: referenceNow, warningDays: 30 }
      );
      expect(approaching.status).toBe('DEADLINE_APPROACHING');
      expect(approaching.daysRemaining).toBe(14);

      const passedHidden = evaluateDeadline(
        {
          openingDate: '2026-01-01T00:00:00Z',
          closingDate: '2026-05-01T00:00:00Z',
          expiredBehavior: 'UNPUBLISH',
          status: 'PUBLISHED',
        },
        { now: referenceNow, warningDays: 30 }
      );
      expect(passedHidden.status).toBe('DEADLINE_PASSED');
      expect(passedHidden.shouldDisplayPublicly).toBe(false);
    });

    it('never fabricates missing deadlines and hides unannounced deadlines unless explicitly enabled', () => {
      const unannouncedHidden = evaluateDeadline(
        {
          openingDate: null,
          closingDate: null,
          showNotAnnounced: false,
          status: 'PUBLISHED',
        },
        { now: referenceNow }
      );
      expect(unannouncedHidden.status).toBe('DEADLINE_NOT_ANNOUNCED');
      expect(unannouncedHidden.formattedClosingDate).toBeNull();
      expect(unannouncedHidden.shouldDisplayPublicly).toBe(false);

      const unannouncedExplicit = evaluateDeadline(
        {
          openingDate: null,
          closingDate: null,
          showNotAnnounced: true,
          status: 'PUBLISHED',
        },
        { now: referenceNow }
      );
      expect(unannouncedExplicit.shouldDisplayPublicly).toBe(true);
      expect(unannouncedExplicit.formattedClosingDate).toBeNull();
    });

    it('formats dates consistently in Asia/Shanghai timezone', () => {
      // 2027-02-28T20:00:00Z is 2027-03-01 04:00:00 in Asia/Shanghai (UTC+8)!
      const shanghaiFormatted = formatDateInTimezone(
        '2027-02-28T20:00:00Z',
        'en',
        'Asia/Shanghai'
      );
      expect(shanghaiFormatted).toContain('Mar 1, 2027');
    });
  });

  // 4. CONFIGURABLE WHATSAPP CONTACT
  describe('4. Configurable WhatsApp Contact System (Section 13 & 25)', () => {
    it('validates phone numbers, selects templates by specificity, substitutes variables, and strips missing placeholders', () => {
      expect(normalizeWhatsAppNumber('+86 138-0013-8000')).toBe('8613800138000');
      expect(normalizeWhatsAppNumber('invalid')).toBeNull();
      expect(normalizeWhatsAppNumber('123')).toBeNull();

      // Missing {major_name} must never appear as raw "{major_name}"
      const msg = renderWhatsAppMessage(
        'Hello, I would like more information about {university_name}. I am interested in {major_name}. Could you explain scholarships?',
        {
          university_name: 'Tsinghua University',
          major_name: null,
        },
        'en'
      );
      expect(msg).toContain('Tsinghua University');
      expect(msg).not.toContain('{major_name}');
      expect(msg).not.toContain('{university_name}');

      const action = buildWhatsAppContactAction({
        config: {
          globalWhatsappEnabled: true,
          defaultWhatsappNumber: '+8613800138000',
          templates: [
            {
              scope: 'GLOBAL',
              templateEn: 'Global inquiry for {university_name}',
              isEnabled: true,
            },
            {
              scope: 'UNIVERSITY',
              universityId: 'uni-1',
              templateEn: 'University specific inquiry for {university_name} in {city}',
              isEnabled: true,
            },
          ],
        },
        lang: 'en',
        universityId: 'uni-1',
        variables: { university_name: 'Fudan University', city: 'Shanghai' },
      });

      expect(action.visible).toBe(true);
      expect(action.message).toBe('University specific inquiry for Fudan University in Shanghai');
      expect(action.href).toBe(
        `https://wa.me/8613800138000?text=${encodeURIComponent(
          'University specific inquiry for Fudan University in Shanghai'
        )}`
      );
    });

    it('hides the WhatsApp button when disabled or when phone number is missing', () => {
      const disabledAction = buildWhatsAppContactAction({
        config: { globalWhatsappEnabled: false, defaultWhatsappNumber: '+8613800138000' },
        lang: 'ar',
      });
      expect(disabledAction.visible).toBe(false);
      expect(disabledAction.href).toBeNull();

      const missingNumberAction = buildWhatsAppContactAction({
        config: { globalWhatsappEnabled: true, defaultWhatsappNumber: '' },
        lang: 'ar',
      });
      expect(missingNumberAction.visible).toBe(false);
    });
  });

  // 5. UNIVERSITY MANAGEMENT, SEARCH, & VERIFICATION SEPARATION
  describe('5. University Lifecycle, Public Search, & Internal Note Separation (Section 4, 11, 15, 25)', () => {
    it('creates, edits, publishes, unpublishes, archives, and deletes a university while keeping internalNotes private', async () => {
      const created = await prisma.university.create({
        data: {
          slug: `wuhan-test-${Date.now()}`,
          nameEn: 'Wuhan Test University',
          nameAr: 'جامعة ووهان التجريبية',
          nameZh: '武汉测试大学',
          city: 'Wuhan',
          province: 'Hubei',
          internalNotes: 'CONFIDENTIAL_INTERNAL_NOTE_DO_NOT_LEAK',
          status: 'DRAFT',
        },
      });

      // Draft university must NOT appear in public search or public sanitization
      expect(sanitizePublicUniversity(created)).toBeNull();
      const draftSearch = await searchPublicUniversities({ q: 'Wuhan Test University' });
      expect(draftSearch.items).toHaveLength(0);

      // Publish the university
      const published = await prisma.university.update({
        where: { id: created.id },
        data: { status: 'PUBLISHED' },
      });

      const publicSanitized = sanitizePublicUniversity(published);
      expect(publicSanitized).not.toBeNull();
      expect((publicSanitized as any).internalNotes).toBeUndefined();

      const pubSearch = await searchPublicUniversities({ q: '武汉测试大学' });
      expect(pubSearch.items.some((u) => u.id === created.id)).toBe(true);

      // Unpublish & Archive
      const archived = await prisma.university.update({
        where: { id: created.id },
        data: { status: 'ARCHIVED' },
      });
      expect(sanitizePublicUniversity(archived)).toBeNull();

      // Delete
      await prisma.university.delete({ where: { id: created.id } });
      const afterDelete = await prisma.university.findUnique({ where: { id: created.id } });
      expect(afterDelete).toBeNull();
    });
  });

  // 6. STUDENT INQUIRIES, STATUS HISTORY, & ACCESS RESTRICTIONS
  describe('6. Student Inquiries, Status History, & Role Access Restrictions (Section 14, 16, 25)', () => {
    it('enforces role-based inquiry access so Inquiry Officers only access assigned inquiries and Content Editors cannot access inquiries', async () => {
      const adminActor = {
        id: 'emp-admin',
        email: 'admin@reddragonstudy.com',
        name: 'Admin',
        isActive: true,
        roles: ['ADMINISTRATOR'],
        permissions: DEFAULT_ROLE_PERMISSIONS.ADMINISTRATOR,
      };

      const editorActor = {
        id: 'emp-editor',
        email: 'editor@reddragonstudy.com',
        name: 'Editor',
        isActive: true,
        roles: ['CONTENT_EDITOR'],
        permissions: DEFAULT_ROLE_PERMISSIONS.CONTENT_EDITOR,
      };

      const officerActor = {
        id: 'emp-officer-1',
        email: 'officer@reddragonstudy.com',
        name: 'Officer 1',
        isActive: true,
        roles: ['INQUIRY_OFFICER'],
        permissions: DEFAULT_ROLE_PERMISSIONS.INQUIRY_OFFICER,
      };

      const assignedInquiry = { assignedEmployeeId: 'emp-officer-1' };
      const unassignedOrOtherInquiry = { assignedEmployeeId: 'emp-officer-2' };

      // Admin can access all
      expect(canAccessInquiryRecord(adminActor, assignedInquiry)).toBe(true);
      expect(canAccessInquiryRecord(adminActor, unassignedOrOtherInquiry)).toBe(true);

      // Content Editor cannot access student inquiries by default
      expect(canAccessInquiryRecord(editorActor, assignedInquiry)).toBe(false);
      expect(hasPermission(editorActor, 'employees:manage')).toBe(false);
      expect(hasPermission(editorActor, 'universities:delete')).toBe(false);
      expect(hasPermission(editorActor, 'universities:write')).toBe(true);

      // Inquiry Officer can access assigned inquiry, but NOT another officer's inquiry
      expect(canAccessInquiryRecord(officerActor, assignedInquiry)).toBe(true);
      expect(canAccessInquiryRecord(officerActor, unassignedOrOtherInquiry)).toBe(false);
      expect(hasPermission(officerActor, 'universities:delete')).toBe(false);
      expect(hasPermission(officerActor, 'requirements:write')).toBe(false);
      expect(hasPermission(officerActor, 'settings:manage')).toBe(false);
    });
  });

  // 7. SECURITY, AUTHENTICATION, AUDIT SANITIZATION, & UPLOAD VALIDATION
  describe('7. Security, Authentication, & File Upload Restrictions (Section 7, 18, 25)', () => {
    it('hashes passwords securely, verifies JWT sessions, and invalidates sessions when sessionVersion increments', async () => {
      const hash = await hashPassword('SecurePass#2026');
      expect(hash).not.toBe('SecurePass#2026');
      expect(await verifyPassword('SecurePass#2026', hash)).toBe(true);
      expect(await verifyPassword('WrongPass', hash)).toBe(false);

      const adminInDb = await prisma.adminUser.findUnique({
        where: { email: 'admin@reddragonstudy.com' },
      });
      expect(adminInDb).not.toBeNull();

      const token = await createSessionToken({
        userId: adminInDb!.id,
        email: adminInDb!.email,
        sessionVersion: adminInDb!.sessionVersion,
      });
      const verified = await verifySessionToken(token);
      expect(verified?.email).toBe('admin@reddragonstudy.com');

      // Simulate session revocation by passing outdated sessionVersion
      const revokedActor = await loadActorById(adminInDb!.id, adminInDb!.sessionVersion + 99);
      expect(revokedActor).toBeNull();
    });

    it('redacts passwords and tokens from audit log metadata', () => {
      const raw = {
        email: 'user@example.com',
        password: 'PlaintextSecretPassword!',
        nested: { accessToken: 'jwt-secret-token' },
      };
      const clean = sanitizeAuditMetadata(raw) as any;
      expect(clean.email).toBe('user@example.com');
      expect(clean.password).toBe('[REDACTED]');
      expect(clean.nested.accessToken).toBe('[REDACTED]');
    });

    it('rejects dangerous file uploads (double extensions, SVG scripts, oversized files)', () => {
      expect(
        validateUploadedImageFile({
          fileName: 'exploit.php.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
        }).valid
      ).toBe(false);

      expect(
        validateUploadedImageFile({
          fileName: 'vector.svg',
          mimeType: 'image/svg+xml',
          sizeBytes: 1024,
        }).valid
      ).toBe(false);

      expect(
        validateUploadedImageFile({
          fileName: 'huge.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 10 * 1024 * 1024,
        }).valid
      ).toBe(false);

      const validImg = validateUploadedImageFile({
        fileName: 'tsinghua-campus.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 250_000,
      });
      expect(validImg.valid).toBe(true);
      expect(validImg.safeFileName).toMatch(/tsinghua-campus\.jpg$/);
    });
  });

  // 8. MULTILINGUAL & DIRECTIONALITY
  describe('8. Arabic (RTL) & English (LTR) Multilingual Support (Section 21 & 25)', () => {
    it('provides RTL direction for Arabic and LTR for English with complete localized dictionaries', () => {
      expect(getDirection('ar')).toBe('rtl');
      expect(getDirection('en')).toBe('ltr');
      expect(UI_LABELS.ar.siteTitle).toContain('التنين الأحمر');
      expect(UI_LABELS.en.siteTitle).toBe('Red Dragon Study');
      expect(getLocalizedText('ar', null, 'Tsinghua University')).toBe('Tsinghua University');
    });
  });

  // 9. API ROUTE INTEGRATION TESTS
  describe('9. API Route Handlers Integration (Inquiries & University Comparison)', () => {
    it('rejects public GET requests to /api/public/inquiries with 403 Forbidden', async () => {
      const res = await getPublicInquiries();
      expect(res.status).toBe(403);
    });

    it('submits a valid student inquiry via POST /api/public/inquiries and creates initial status history', async () => {
      const req = new NextRequest('http://localhost:3000/api/public/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: 'Tariq Al-Sayed',
          email: 'tariq@example.com',
          whatsappNumber: '+966551112222',
          countryOfResidence: 'Saudi Arabia',
          message: 'Interested in Computer Science at Tsinghua University.',
          privacyConsent: true,
        }),
      });

      const res = await postPublicInquiry(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.inquiryNumber).toMatch(/^RDS-/);

      const saved = await prisma.studentInquiry.findUnique({
        where: { inquiryNumber: data.inquiryNumber },
        include: { statusHistory: true },
      });
      expect(saved).not.toBeNull();
      expect(saved!.statusHistory).toHaveLength(1);
      expect(saved!.statusHistory[0].toStatus).toBe('NEW_INQUIRY');
    });

    it('returns side-by-side comparison data via GET /api/public/compare for published universities', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/public/compare?slugs=tsinghua-university,zhejiang-university'
      );
      const res = await getPublicCompare(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.universities.length).toBe(2);
      expect(data.enabledFields).toContain('tuitionFees');
    });

    it('creates university with programs, deadlines, requirements, and galleries all in a single unified submission', async () => {
      const adminUser = await prisma.adminUser.findUnique({
        where: { email: 'admin@reddragonstudy.com' },
      });
      expect(adminUser).not.toBeNull();

      const sessionToken = await createSessionToken({
        userId: adminUser!.id,
        email: adminUser!.email,
        sessionVersion: adminUser!.sessionVersion,
      });

      const globalReq = await prisma.globalRequirement.findFirst();

      const testSlug = `all-in-one-uni-${Date.now()}`;
      const req = new NextRequest('http://localhost:3000/api/admin/universities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `rds_admin_session=${sessionToken}`,
        },
        body: JSON.stringify({
          nameEn: 'Peking Polytechnic University',
          nameAr: 'جامعة بكين للعلوم التطبيقية',
          slug: testSlug,
          city: 'Beijing',
          province: 'Beijing',
          applicationOpeningDate: '2026-11-01',
          applicationDeadlineDate: '2027-04-15',
          academicYear: '2027-2028',
          status: 'PUBLISHED',
          programs: [
            {
              nameEn: 'B.Eng. in Artificial Intelligence',
              nameAr: 'بكالوريوس الذكاء الاصطناعي',
              degreeLevel: 'BACHELOR',
              languageOfInstruction: 'ENGLISH',
              durationEn: '4 Years',
              tuitionAmount: 30000,
              tuitionCurrency: 'CNY',
              tuitionPeriod: 'ANNUALLY',
            },
          ],
          fees: [
            {
              category: 'ACCOMMODATION',
              titleEn: 'International Student Dormitory',
              amount: 8500,
              currency: 'CNY',
              period: 'ANNUALLY',
            },
          ],
          selectedRequirementIds: globalReq ? [globalReq.id] : [],
          campusImages: [
            {
              imageUrl: '/uploads/campus-test.jpg',
              captionEn: 'Main Laboratory',
            },
          ],
          accommodationImages: [
            {
              imageUrl: '/uploads/dorm-test.jpg',
              captionEn: 'Dorm Room',
            },
          ],
        }),
      });

      const res = await postAdminUniversity(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.university).not.toBeNull();
      expect(data.university.slug).toBe(testSlug);

      // Verify associated child records created atomically
      const uniInDb = await prisma.university.findUnique({
        where: { id: data.university.id },
        include: {
          programs: true,
          fees: true,
          deadlines: true,
          sharedRequirements: true,
          galleries: { include: { images: true } },
        },
      });

      expect(uniInDb).not.toBeNull();
      expect(uniInDb!.programs).toHaveLength(1);
      expect(uniInDb!.programs[0].nameEn).toBe('B.Eng. in Artificial Intelligence');
      expect(uniInDb!.deadlines).toHaveLength(1);
      expect(uniInDb!.galleries.length).toBeGreaterThanOrEqual(1);

      // Clean up test university
      await prisma.university.delete({ where: { id: uniInDb!.id } });
    });
  });
});
