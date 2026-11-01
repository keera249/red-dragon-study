-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "nameZh" TEXT,
    "logoUrl" TEXT,
    "shortDescriptionEn" TEXT,
    "shortDescriptionAr" TEXT,
    "detailedDescriptionEn" TEXT,
    "detailedDescriptionAr" TEXT,
    "universityType" TEXT,
    "country" TEXT DEFAULT 'China',
    "province" TEXT,
    "city" TEXT,
    "district" TEXT,
    "address" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "mapUrl" TEXT,
    "officialWebsite" TEXT,
    "officialAdmissionsUrl" TEXT,
    "officialContact" TEXT,
    "accreditationInfoEn" TEXT,
    "accreditationInfoAr" TEXT,
    "recognitionInfoEn" TEXT,
    "recognitionInfoAr" TEXT,
    "rankingInfoEn" TEXT,
    "rankingInfoAr" TEXT,
    "accommodationAvailable" BOOLEAN,
    "accommodationDescEn" TEXT,
    "accommodationDescAr" TEXT,
    "whatsappNumber" TEXT,
    "internalNotes" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "acceptingApplications" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "sourceUrl" TEXT,
    "lastVerifiedAt" DATETIME,
    "seoTitleEn" TEXT,
    "seoTitleAr" TEXT,
    "seoDescriptionEn" TEXT,
    "seoDescriptionAr" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UniversitySlugRedirect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "oldSlug" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UniversitySlugRedirect_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UniversityProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "universityId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "nameZh" TEXT,
    "degreeLevel" TEXT NOT NULL,
    "disciplineEn" TEXT,
    "disciplineAr" TEXT,
    "languageOfInstruction" TEXT NOT NULL,
    "durationEn" TEXT,
    "durationAr" TEXT,
    "intakePeriodsEn" TEXT,
    "intakePeriodsAr" TEXT,
    "tuitionAmount" REAL,
    "tuitionCurrency" TEXT NOT NULL DEFAULT 'CNY',
    "tuitionPeriod" TEXT NOT NULL DEFAULT 'ANNUALLY',
    "applicationFeeAmount" REAL,
    "applicationFeeCurrency" TEXT NOT NULL DEFAULT 'CNY',
    "eligibilityEn" TEXT,
    "eligibilityAr" TEXT,
    "languageReqEn" TEXT,
    "languageReqAr" TEXT,
    "academicReqEn" TEXT,
    "academicReqAr" TEXT,
    "entranceExamsEn" TEXT,
    "entranceExamsAr" TEXT,
    "openingDate" DATETIME,
    "deadlineDate" DATETIME,
    "officialProgramUrl" TEXT,
    "additionalNotesEn" TEXT,
    "additionalNotesAr" TEXT,
    "internalNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "sourceUrl" TEXT,
    "lastVerifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UniversityProgram_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgramIntake" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "academicYear" TEXT NOT NULL,
    "openingDate" DATETIME,
    "deadlineDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgramIntake_programId_fkey" FOREIGN KEY ("programId") REFERENCES "UniversityProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UniversityFee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "universityId" TEXT NOT NULL,
    "programId" TEXT,
    "category" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "period" TEXT NOT NULL DEFAULT 'ANNUALLY',
    "academicYear" TEXT,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "sourceUrl" TEXT,
    "verifiedDate" DATETIME,
    "notesEn" TEXT,
    "notesAr" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UniversityFee_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UniversityFee_programId_fkey" FOREIGN KEY ("programId") REFERENCES "UniversityProgram" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "providerEn" TEXT,
    "providerAr" TEXT,
    "category" TEXT,
    "fundingType" TEXT NOT NULL,
    "tuitionCoverageEn" TEXT,
    "tuitionCoverageAr" TEXT,
    "accommodationCoverageEn" TEXT,
    "accommodationCoverageAr" TEXT,
    "stipendAmount" REAL,
    "stipendCurrency" TEXT DEFAULT 'CNY',
    "stipendPeriod" TEXT DEFAULT 'MONTHLY',
    "otherBenefitsEn" TEXT,
    "otherBenefitsAr" TEXT,
    "eligibilityEn" TEXT,
    "eligibilityAr" TEXT,
    "eligibleNationalities" TEXT,
    "degreeLevelsJson" TEXT,
    "languageRequirementsEn" TEXT,
    "languageRequirementsAr" TEXT,
    "requiredDocumentsEn" TEXT,
    "requiredDocumentsAr" TEXT,
    "openingDate" DATETIME,
    "deadlineDate" DATETIME,
    "durationEn" TEXT,
    "durationAr" TEXT,
    "renewalConditionsEn" TEXT,
    "renewalConditionsAr" TEXT,
    "officialUrl" TEXT,
    "applicationInstructionsEn" TEXT,
    "applicationInstructionsAr" TEXT,
    "additionalNotesEn" TEXT,
    "additionalNotesAr" TEXT,
    "internalNotes" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "sourceUrl" TEXT,
    "lastVerifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScholarshipUniversity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scholarshipId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    CONSTRAINT "ScholarshipUniversity_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScholarshipUniversity_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScholarshipProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scholarshipId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    CONSTRAINT "ScholarshipProgram_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScholarshipProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "UniversityProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GlobalRequirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "instructionsEn" TEXT,
    "instructionsAr" TEXT,
    "supportingDocUrl" TEXT,
    "isRequiredDefault" BOOLEAN NOT NULL DEFAULT true,
    "degreeLevelsJson" TEXT,
    "languageTracksJson" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UniversityRequirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "universityId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UniversityRequirement_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UniversityRequirement_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "GlobalRequirement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RequirementOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "universityRequirementId" TEXT NOT NULL,
    "isRequiredOverride" BOOLEAN,
    "customNameEn" TEXT,
    "customNameAr" TEXT,
    "customDescriptionEn" TEXT,
    "customDescriptionAr" TEXT,
    "customInstructionsEn" TEXT,
    "customInstructionsAr" TEXT,
    "customSupportingDocUrl" TEXT,
    "isExcluded" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RequirementOverride_universityRequirementId_fkey" FOREIGN KEY ("universityRequirementId") REFERENCES "UniversityRequirement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UniversitySpecificRequirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "universityId" TEXT NOT NULL,
    "programId" TEXT,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "instructionsEn" TEXT,
    "instructionsAr" TEXT,
    "supportingDocUrl" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UniversitySpecificRequirement_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UniversitySpecificRequirement_programId_fkey" FOREIGN KEY ("programId") REFERENCES "UniversityProgram" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "altEn" TEXT,
    "altAr" TEXT,
    "captionEn" TEXT,
    "captionAr" TEXT,
    "sourceInfo" TEXT,
    "sourceUrl" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'VERIFIED',
    "isGenuinePhoto" BOOLEAN NOT NULL DEFAULT true,
    "uploadedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MediaAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MediaGallery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "universityId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "customCategoryEn" TEXT,
    "customCategoryAr" TEXT,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "isAccommodation" BOOLEAN NOT NULL DEFAULT false,
    "coverImageUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MediaGallery_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "galleryId" TEXT NOT NULL,
    "mediaAssetId" TEXT,
    "imageUrl" TEXT NOT NULL,
    "altEn" TEXT,
    "altAr" TEXT,
    "captionEn" TEXT,
    "captionAr" TEXT,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "sourceInfo" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'VERIFIED',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GalleryImage_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "MediaGallery" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GalleryImage_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApplicationDeadline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT,
    "universityId" TEXT,
    "programId" TEXT,
    "scholarshipId" TEXT,
    "intakeNameEn" TEXT,
    "intakeNameAr" TEXT,
    "academicYear" TEXT NOT NULL,
    "openingDate" DATETIME,
    "closingDate" DATETIME,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Shanghai',
    "showNotAnnounced" BOOLEAN NOT NULL DEFAULT false,
    "expiredBehavior" TEXT NOT NULL DEFAULT 'KEEP_VISIBLE',
    "sourceUrl" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'VERIFIED',
    "lastVerifiedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ApplicationDeadline_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApplicationDeadline_programId_fkey" FOREIGN KEY ("programId") REFERENCES "UniversityProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApplicationDeadline_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityTitle" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "sourceUrl" TEXT,
    "sourceType" TEXT,
    "lastVerifiedDate" DATETIME,
    "verifiedById" TEXT,
    "internalNotes" TEXT,
    "nextReviewDate" DATETIME,
    "academicYear" TEXT,
    "previousValuesJson" TEXT,
    "showPublicIndicator" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VerificationRecord_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebsitePage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT,
    "subtitleEn" TEXT,
    "subtitleAr" TEXT,
    "contentEn" TEXT,
    "contentAr" TEXT,
    "metaTitleEn" TEXT,
    "metaTitleAr" TEXT,
    "metaDescriptionEn" TEXT,
    "metaDescriptionAr" TEXT,
    "canonicalUrl" TEXT,
    "ogImageUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "enabledLanguagesJson" TEXT NOT NULL DEFAULT '["ar","en"]',
    "isSystemPage" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HomepageSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionKey" TEXT NOT NULL,
    "titleEn" TEXT,
    "titleAr" TEXT,
    "subtitleEn" TEXT,
    "subtitleAr" TEXT,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "buttonTextEn" TEXT,
    "buttonTextAr" TEXT,
    "buttonUrl" TEXT,
    "secondaryButtonTextEn" TEXT,
    "secondaryButtonTextAr" TEXT,
    "secondaryButtonUrl" TEXT,
    "imageUrl" TEXT,
    "configJson" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NavigationItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "labelEn" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "pageSlug" TEXT,
    "location" TEXT NOT NULL DEFAULT 'HEADER',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContactSetting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "defaultWhatsappNumber" TEXT,
    "globalWhatsappEnabled" BOOLEAN NOT NULL DEFAULT true,
    "buttonTextEn" TEXT NOT NULL DEFAULT 'Chat on WhatsApp',
    "buttonTextAr" TEXT NOT NULL DEFAULT 'تواصل عبر واتساب',
    "buttonPlacement" TEXT NOT NULL DEFAULT 'BOTH',
    "defaultMessageEn" TEXT NOT NULL DEFAULT 'Hello Red Dragon Study, I would like to inquire about studying in China.',
    "defaultMessageAr" TEXT NOT NULL DEFAULT 'مرحباً فريق التنين الأحمر للدراسة، أود الاستفسار عن الدراسة في الصين.',
    "contactEmail" TEXT,
    "phoneDisplay" TEXT,
    "addressEn" TEXT,
    "addressAr" TEXT,
    "workingHoursEn" TEXT,
    "workingHoursAr" TEXT,
    "socialLinksJson" TEXT,
    "inquiryFieldsConfigJson" TEXT,
    "comparisonFieldsConfigJson" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WhatsAppTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'GLOBAL',
    "universityId" TEXT,
    "programId" TEXT,
    "scholarshipId" TEXT,
    "whatsappNumberOverride" TEXT,
    "templateEn" TEXT NOT NULL,
    "templateAr" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WhatsAppTemplate_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WhatsAppTemplate_programId_fkey" FOREIGN KEY ("programId") REFERENCES "UniversityProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WhatsAppTemplate_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InquiryStatusConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'blue',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "StudentInquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inquiryNumber" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "email" TEXT,
    "whatsappNumber" TEXT,
    "countryOfResidence" TEXT,
    "nationality" TEXT,
    "universityId" TEXT,
    "programId" TEXT,
    "scholarshipId" TEXT,
    "intendedIntake" TEXT,
    "currentQualification" TEXT,
    "category" TEXT DEFAULT 'GENERAL_ADMISSION',
    "message" TEXT NOT NULL,
    "privacyConsent" BOOLEAN NOT NULL DEFAULT true,
    "statusCode" TEXT NOT NULL DEFAULT 'NEW_INQUIRY',
    "assignedEmployeeId" TEXT,
    "lastFollowUpDate" DATETIME,
    "nextFollowUpDate" DATETIME,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentInquiry_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StudentInquiry_programId_fkey" FOREIGN KEY ("programId") REFERENCES "UniversityProgram" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StudentInquiry_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StudentInquiry_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InquiryAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inquiryId" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "assignedById" TEXT,
    "notes" TEXT,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InquiryAssignment_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "StudentInquiry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InquiryAssignment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "AdminUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InquiryAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InquiryNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inquiryId" TEXT NOT NULL,
    "authorId" TEXT,
    "noteText" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InquiryNote_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "StudentInquiry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InquiryNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InquiryStatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inquiryId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "changedById" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InquiryStatusHistory_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "StudentInquiry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InquiryStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FollowUpReminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inquiryId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "dueAt" DATETIME NOT NULL,
    "note" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FollowUpReminder_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "StudentInquiry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FollowUpReminder_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "AdminUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "siteNameEn" TEXT NOT NULL DEFAULT 'Red Dragon Study',
    "siteNameAr" TEXT NOT NULL DEFAULT 'التنين الأحمر للدراسة في الصين',
    "logoUrl" TEXT NOT NULL DEFAULT '/logo.jpeg',
    "defaultLanguage" TEXT NOT NULL DEFAULT 'ar',
    "supportedLanguagesJson" TEXT NOT NULL DEFAULT '["ar","en"]',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Shanghai',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'CNY',
    "exchangeRatesJson" TEXT NOT NULL DEFAULT '{"CNY":1,"USD":0.14,"SAR":0.52}',
    "itemsPerPage" INTEGER NOT NULL DEFAULT 9,
    "deadlineWarningDays" INTEGER NOT NULL DEFAULT 30,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "privacyNoticeEn" TEXT NOT NULL DEFAULT 'We collect only the information needed to assist with your university admission inquiry and never share your personal data with unauthorized third parties.',
    "privacyNoticeAr" TEXT NOT NULL DEFAULT 'نحن نجمع فقط المعلومات اللازمة لمساعدتك في استفسار القبول الجامعي الخاص بك ولا نشارك بياناتك الشخصية مع أطراف ثالثة غير مصرح لها.',
    "retentionDays" INTEGER NOT NULL DEFAULT 365,
    "seoDefaultTitleEn" TEXT NOT NULL DEFAULT 'Red Dragon Study | China University Admissions & Scholarships',
    "seoDefaultTitleAr" TEXT NOT NULL DEFAULT 'التنين الأحمر للدراسة | القبول الجامعي والمنح الدراسية في الصين',
    "seoDefaultDescEn" TEXT NOT NULL DEFAULT 'Discover accredited Chinese universities, academic programs, scholarships, and admission requirements with Red Dragon Study.',
    "seoDefaultDescAr" TEXT NOT NULL DEFAULT 'اكتشف الجامعات الصينية المعتمدة والبرامج الأكاديمية والمنح الدراسية ومتطلبات القبول مع مؤسسة التنين الأحمر للدراسة.',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionEn" TEXT NOT NULL,
    "questionAr" TEXT,
    "answerEn" TEXT NOT NULL,
    "answerAr" TEXT,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "metadataJson" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "University_slug_key" ON "University"("slug");

-- CreateIndex
CREATE INDEX "University_status_idx" ON "University"("status");

-- CreateIndex
CREATE INDEX "University_city_idx" ON "University"("city");

-- CreateIndex
CREATE INDEX "University_province_idx" ON "University"("province");

-- CreateIndex
CREATE UNIQUE INDEX "UniversitySlugRedirect_oldSlug_key" ON "UniversitySlugRedirect"("oldSlug");

-- CreateIndex
CREATE INDEX "UniversityProgram_degreeLevel_idx" ON "UniversityProgram"("degreeLevel");

-- CreateIndex
CREATE INDEX "UniversityProgram_languageOfInstruction_idx" ON "UniversityProgram"("languageOfInstruction");

-- CreateIndex
CREATE INDEX "UniversityProgram_status_idx" ON "UniversityProgram"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityProgram_universityId_slug_key" ON "UniversityProgram"("universityId", "slug");

-- CreateIndex
CREATE INDEX "UniversityFee_universityId_idx" ON "UniversityFee"("universityId");

-- CreateIndex
CREATE INDEX "UniversityFee_category_idx" ON "UniversityFee"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Scholarship_slug_key" ON "Scholarship"("slug");

-- CreateIndex
CREATE INDEX "Scholarship_status_idx" ON "Scholarship"("status");

-- CreateIndex
CREATE INDEX "Scholarship_fundingType_idx" ON "Scholarship"("fundingType");

-- CreateIndex
CREATE UNIQUE INDEX "ScholarshipUniversity_scholarshipId_universityId_key" ON "ScholarshipUniversity"("scholarshipId", "universityId");

-- CreateIndex
CREATE UNIQUE INDEX "ScholarshipProgram_scholarshipId_programId_key" ON "ScholarshipProgram"("scholarshipId", "programId");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalRequirement_code_key" ON "GlobalRequirement"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityRequirement_universityId_requirementId_key" ON "UniversityRequirement"("universityId", "requirementId");

-- CreateIndex
CREATE UNIQUE INDEX "RequirementOverride_universityRequirementId_key" ON "RequirementOverride"("universityRequirementId");

-- CreateIndex
CREATE INDEX "VerificationRecord_entityType_entityId_idx" ON "VerificationRecord"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "VerificationRecord_status_idx" ON "VerificationRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WebsitePage_slug_key" ON "WebsitePage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageSection_sectionKey_key" ON "HomepageSection"("sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "InquiryStatusConfig_code_key" ON "InquiryStatusConfig"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StudentInquiry_inquiryNumber_key" ON "StudentInquiry"("inquiryNumber");

-- CreateIndex
CREATE INDEX "StudentInquiry_statusCode_idx" ON "StudentInquiry"("statusCode");

-- CreateIndex
CREATE INDEX "StudentInquiry_assignedEmployeeId_idx" ON "StudentInquiry"("assignedEmployeeId");

-- CreateIndex
CREATE INDEX "StudentInquiry_createdAt_idx" ON "StudentInquiry"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");
