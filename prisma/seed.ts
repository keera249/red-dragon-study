import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '../src/lib/rbac';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('Seeding Red Dragon Study database...');

  // 1. Permissions
  for (const perm of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { module: perm.module, description: perm.description },
      create: { code: perm.code, module: perm.module, description: perm.description },
    });
  }

  // 2. Roles & RolePermissions
  const roleDefs = [
    {
      code: 'ADMINISTRATOR',
      nameEn: 'Administrator',
      nameAr: 'مدير النظام',
      description: 'Full administrative control over content, inquiries, users, and system settings.',
      isSystem: true,
    },
    {
      code: 'CONTENT_EDITOR',
      nameEn: 'Content Editor',
      nameAr: 'محرر المحتوى',
      description: 'Manages universities, programs, scholarships, requirements, and media galleries.',
      isSystem: true,
    },
    {
      code: 'INQUIRY_OFFICER',
      nameEn: 'Inquiry Officer',
      nameAr: 'مسؤول متابعة الاستفسارات',
      description: 'Manages assigned student inquiries, notes, statuses, and follow-up activities.',
      isSystem: true,
    },
  ];

  for (const r of roleDefs) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      update: { nameEn: r.nameEn, nameAr: r.nameAr, description: r.description, isSystem: r.isSystem },
      create: r,
    });

    const permCodes = DEFAULT_ROLE_PERMISSIONS[r.code] || [];
    for (const pCode of permCodes) {
      const perm = await prisma.permission.findUnique({ where: { code: pCode } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
  }

  // 3. Employee Accounts (Single Super Admin)
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@reddragonstudy.com';
  const adminPass = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';
  const adminHash = await bcrypt.hash(adminPass, 10);

  const adminUser = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { name: 'المدير العام (Super Admin)', passwordHash: adminHash, isActive: true },
    create: {
      email: adminEmail,
      name: 'المدير العام (Super Admin)',
      passwordHash: adminHash,
      isActive: true,
    },
  });

  // Ensure any other accounts are removed
  await prisma.adminUser.deleteMany({
    where: {
      id: { not: adminUser.id },
    },
  });

  const adminRole = await prisma.role.findUnique({ where: { code: 'ADMINISTRATOR' } });

  if (adminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: adminRole.id },
    });
  }

  // 4. System Settings & Contact Settings
  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteNameEn: 'Red Dragon Study',
      siteNameAr: 'التنين الأحمر للدراسة في الصين',
      logoUrl: '/logo.jpeg',
      defaultLanguage: 'ar',
      supportedLanguagesJson: JSON.stringify(['ar', 'en']),
      timezone: 'Asia/Shanghai',
      defaultCurrency: 'CNY',
      exchangeRatesJson: JSON.stringify({ CNY: 1, USD: 0.14, SAR: 0.52 }),
      itemsPerPage: 9,
      deadlineWarningDays: 45,
      maintenanceMode: false,
    },
  });

  await prisma.contactSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      defaultWhatsappNumber: '+8613800138000',
      globalWhatsappEnabled: true,
      buttonTextEn: 'Chat on WhatsApp',
      buttonTextAr: 'تواصل عبر واتساب',
      buttonPlacement: 'BOTH',
      defaultMessageEn:
        'Hello Red Dragon Study, I would like more information about studying in China.',
      defaultMessageAr:
        'مرحباً فريق التنين الأحمر للدراسة، أود الحصول على مزيد من المعلومات حول الدراسة في الصين.',
      contactEmail: 'admissions@reddragonstudy.com',
      phoneDisplay: '+86 138 0013 8000',
      addressEn: 'Suite 1208, International Education Plaza, Haidian District, Beijing, China',
      addressAr: 'جناح 1208، بلازا التعليم الدولي، حي هايديان، بكين، الصين',
      workingHoursEn: 'Mon - Sat: 09:00 - 18:00 (Beijing Time)',
      workingHoursAr: 'الإثنين - السبت: 09:00 صباحاً - 06:00 مساءً (بتوقيت بكين)',
      socialLinksJson: JSON.stringify({
        instagram: 'https://instagram.com/reddragonstudy',
        linkedin: 'https://linkedin.com/company/reddragonstudy',
        youtube: 'https://youtube.com/@reddragonstudy',
      }),
      inquiryFieldsConfigJson: JSON.stringify({
        studentName: { enabled: true, required: true },
        email: { enabled: true, required: true },
        whatsappNumber: { enabled: true, required: true },
        countryOfResidence: { enabled: true, required: false },
        nationality: { enabled: true, required: false },
        universityId: { enabled: true, required: false },
        programId: { enabled: true, required: false },
        scholarshipId: { enabled: true, required: false },
        intendedIntake: { enabled: true, required: false },
        currentQualification: { enabled: true, required: false },
        category: { enabled: true, required: false },
        message: { enabled: true, required: true },
      }),
      comparisonFieldsConfigJson: JSON.stringify([
        'location',
        'programs',
        'degreeLevels',
        'languages',
        'tuitionFees',
        'accommodationCosts',
        'scholarships',
        'funding',
        'requirements',
        'deadlines',
        'duration',
        'officialWebsite',
        'accommodationAvailability',
      ]),
    },
  });

  // 5. Inquiry Statuses
  const inquiryStatuses = [
    { code: 'NEW_INQUIRY', labelEn: 'New Inquiry', labelAr: 'استفسار جديد', color: 'blue', displayOrder: 1 },
    { code: 'UNDER_REVIEW', labelEn: 'Under Review', labelAr: 'قيد المراجعة', color: 'indigo', displayOrder: 2 },
    { code: 'CONTACTED', labelEn: 'Contacted', labelAr: 'تم التواصل', color: 'amber', displayOrder: 3 },
    { code: 'AWAITING_DOCUMENTS', labelEn: 'Awaiting Documents', labelAr: 'بانتظار المستندات', color: 'purple', displayOrder: 4 },
    { code: 'APPLICATION_PREPARATION', labelEn: 'Application Preparation', labelAr: 'تجهيز ملف التقديم', color: 'cyan', displayOrder: 5 },
    { code: 'APPLICATION_SUBMITTED', labelEn: 'Application Submitted', labelAr: 'تم تقديم الطلب', color: 'emerald', displayOrder: 6 },
    { code: 'COMPLETED', labelEn: 'Completed', labelAr: 'مكتمل', color: 'green', displayOrder: 7 },
    { code: 'CLOSED', labelEn: 'Closed', labelAr: 'مغلق', color: 'slate', displayOrder: 8 },
  ];

  for (const st of inquiryStatuses) {
    await prisma.inquiryStatusConfig.upsert({
      where: { code: st.code },
      update: st,
      create: st,
    });
  }

  // 6. Global Shared Requirements Library
  const globalReqs = [
    {
      code: 'PASSPORT_COPY',
      nameEn: 'Valid Ordinary Passport Copy',
      nameAr: 'نسخة من جواز سفر ساري المفعول',
      descriptionEn: 'Clear scan of the passport information page with at least 12 months validity.',
      descriptionAr: 'صورة واضحة للصفحة الرئيسية لجواز السفر بصلاحية لا تقل عن 12 شهراً.',
      instructionsEn: 'Must be scanned in color (PDF or JPG).',
      instructionsAr: 'يجب مسحها ضوئياً بالألوان بصيغة PDF أو JPG.',
      isRequiredDefault: true,
      displayOrder: 1,
    },
    {
      code: 'ACADEMIC_CERTIFICATE',
      nameEn: 'Highest Academic Degree Certificate',
      nameAr: 'شهادة المؤهل الدراسي الأعلى',
      descriptionEn: 'Notarized graduation certificate in English or Chinese.',
      descriptionAr: 'شهادة التخرج موثقة ومترجمة للغة الإنجليزية أو الصينية.',
      instructionsEn: 'Graduating students may provide an official pre-graduation certificate.',
      instructionsAr: 'يمكن للطلاب المتوقع تخرجهم تقديم إثبات قيد وتخرج متوقع رسمي.',
      isRequiredDefault: true,
      displayOrder: 2,
    },
    {
      code: 'ACADEMIC_TRANSCRIPT',
      nameEn: 'Official Academic Transcripts',
      nameAr: 'كشف الدرجات الأكاديمي الرسمي',
      descriptionEn: 'Complete record of all courses and grades notarized in English or Chinese.',
      descriptionAr: 'سجل كامل بجميع المواد والدرجات موثق باللغة الإنجليزية أو الصينية.',
      instructionsEn: 'Must bear the official stamp of the issuing institution.',
      instructionsAr: 'يجب أن يحمل الختم الرسمي للمؤسسة التعليمية الصادر منها.',
      isRequiredDefault: true,
      displayOrder: 3,
    },
    {
      code: 'PERSONAL_PHOTO',
      nameEn: 'Passport-Size Digital Photograph',
      nameAr: 'صورة شخصية رسمية بخلفية بيضاء',
      descriptionEn: 'Recent bareheaded color photo with white background.',
      descriptionAr: 'صورة ملونة حديثة بخلفية بيضاء بدون قبعة.',
      instructionsEn: 'Aspect ratio 3:4, resolution at least 300 DPI.',
      instructionsAr: 'أبعاد قياسية وبدقة واضحة.',
      isRequiredDefault: true,
      displayOrder: 4,
    },
    {
      code: 'ENGLISH_PROFICIENCY',
      nameEn: 'English Language Proficiency Certificate (IELTS / TOEFL)',
      nameAr: 'شهادة إتقان اللغة الإنجليزية (IELTS أو TOEFL)',
      descriptionEn: 'Required for English-taught programs for non-native English speakers.',
      descriptionAr: 'مطلوبة للبرامج التي تُدرّس باللغة الإنجليزية لغير الناطقين بها.',
      instructionsEn: 'Typically IELTS 6.0+ or TOEFL iBT 80+.',
      instructionsAr: 'عادةً درجة IELTS لا تقل عن 6.0 أو TOEFL لا تقل عن 80.',
      isRequiredDefault: true,
      displayOrder: 5,
    },
    {
      code: 'CHINESE_PROFICIENCY',
      nameEn: 'HSK Chinese Proficiency Certificate',
      nameAr: 'شهادة الكفاءة في اللغة الصينية (HSK)',
      descriptionEn: 'Official HSK score report for Chinese-taught programs.',
      descriptionAr: 'تقرير درجات اختبار HSK الرسمي للبرامج التي تُدرّس باللغة الصينية.',
      instructionsEn: 'HSK 4 or HSK 5 depending on the university and major.',
      instructionsAr: 'المستوى الرابع أو الخامس حسب الجامعة والتخصص.',
      isRequiredDefault: false,
      displayOrder: 6,
    },
    {
      code: 'STUDY_PLAN',
      nameEn: 'Study Plan / Personal Statement',
      nameAr: 'الخطة الدراسية / خطاب الدوافع',
      descriptionEn: 'Written statement explaining academic background and study objectives in China.',
      descriptionAr: 'مقال يوضح الخلفية الأكاديمية والأهداف الدراسية والبحثية في الصين.',
      instructionsEn: 'Minimum 800 words for undergraduate, 1000+ words for postgraduate.',
      instructionsAr: 'لا تقل عن 800 كلمة للبكالوريوس و1000 كلمة للدراسات العليا.',
      isRequiredDefault: true,
      displayOrder: 7,
    },
    {
      code: 'RECOMMENDATION_LETTERS',
      nameEn: 'Two Academic Recommendation Letters',
      nameAr: 'خطابا توصية أكاديمية',
      descriptionEn: 'Signed letters from professors or associate professors.',
      descriptionAr: 'خطابان موقعان من أساتذة أو أساتذة مشاركين.',
      instructionsEn: 'Must include the recommender contact email and institutional letterhead.',
      instructionsAr: 'يجب أن يتضمنا البريد الإلكتروني الرسمي للأستاذ وورق الجامعة الرسمي.',
      isRequiredDefault: true,
      displayOrder: 8,
    },
    {
      code: 'MEDICAL_EXAM_FORM',
      nameEn: 'Foreigner Physical Examination Form',
      nameAr: 'نموذج الفحص الطبي للأجانب',
      descriptionEn: 'Completed medical checkup form stamped by an authorized hospital.',
      descriptionAr: 'نموذج الفحص الطبي المعتمد مختوماً من مستشفى حكومي معتمد.',
      instructionsEn: 'Valid for 6 months from the examination date.',
      instructionsAr: 'صالح لمدة 6 أشهر من تاريخ إجراء الفحص.',
      isRequiredDefault: true,
      displayOrder: 9,
    },
    {
      code: 'NON_CRIMINAL_RECORD',
      nameEn: 'Non-Criminal Record Certificate',
      nameAr: 'شهادة خلو السوابق الجنائية (فيش وتشبيه)',
      descriptionEn: 'Official police clearance certificate issued within the last 6 months.',
      descriptionAr: 'شهادة حسن سيرة وسلوك صادرة خلال الأشهر الستة الأخيرة.',
      instructionsEn: 'Must be translated into English or Chinese and notarized.',
      instructionsAr: 'يجب ترجمتها للإنجليزية أو الصينية وتوثيقها.',
      isRequiredDefault: true,
      displayOrder: 10,
    },
  ];

  const createdReqs: Record<string, string> = {};
  for (const req of globalReqs) {
    const saved = await prisma.globalRequirement.upsert({
      where: { code: req.code },
      update: req,
      create: req,
    });
    createdReqs[req.code] = saved.id;
  }

  // 7. Universities
  const tsinghua = await prisma.university.upsert({
    where: { slug: 'tsinghua-university' },
    update: {},
    create: {
      slug: 'tsinghua-university',
      nameEn: 'Tsinghua University',
      nameAr: 'جامعة تسينغهوا',
      nameZh: '清华大学',
      logoUrl: '/logo.jpeg',
      shortDescriptionEn:
        'A premier public research university in Beijing and member of the C9 League, renowned globally for engineering, computer science, and public policy.',
      shortDescriptionAr:
        'جامعة بحثية حكومية رائدة في العاصمة بكين وعضو في رابطة C9، تشتهر عالمياً في مجالات الهندسة وعلوم الحاسوب والعلوم الإدارية.',
      detailedDescriptionEn:
        'Founded in 1911, Tsinghua University is situated on the former imperial gardens of the Qing Dynasty in northwestern Beijing. It offers comprehensive undergraduate, master, and doctoral programs taught in both English and Chinese for international scholars.',
      detailedDescriptionAr:
        'تأسست جامعة تسينغهوا عام 1911 وتقع في شمال غرب العاصمة بكين. تقدم الجامعة برامج أكاديمية شاملة لمرحلة البكالوريوس والماجستير والدكتوراه باللغتين الإنجليزية والصينية للطلاب الدوليين.',
      universityType: 'Public Research University (Project 985 / Double First-Class)',
      country: 'China',
      province: 'Beijing',
      city: 'Beijing',
      district: 'Haidian District',
      address: '30 Shuangqing Rd, Haidian District, Beijing, China, 100084',
      latitude: 40.0003,
      longitude: 116.3264,
      mapUrl: 'https://www.openstreetmap.org/?mlat=40.0003&mlon=116.3264#map=15/40.0003/116.3264',
      officialWebsite: 'https://www.tsinghua.edu.cn/en/',
      officialAdmissionsUrl: 'https://is.tsinghua.edu.cn/',
      officialContact: 'undergra@tsinghua.edu.cn',
      accreditationInfoEn: 'Accredited by the Ministry of Education of the People’s Republic of China.',
      accreditationInfoAr: 'معتمدة من وزارة التعليم في جمهورية الصين الشعبية.',
      recognitionInfoEn: 'Double First-Class A University & C9 League Member.',
      recognitionInfoAr: 'مصنفة ضمن جامعات الدرجة الأولى المزدوجة ورابطة C9 الصينية.',
      accommodationAvailable: true,
      accommodationDescEn:
        'On-campus international student dormitories at Zijing Apartments with single and double room options.',
      accommodationDescAr:
        'سكن طلابي دولي داخل الحرم الجامعي في شقق تسيجينغ مع خيارات غرف مفردة ومزدوجة.',
      isFeatured: true,
      acceptingApplications: true,
      status: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      sourceUrl: 'https://is.tsinghua.edu.cn/',
      lastVerifiedAt: new Date('2026-10-15T00:00:00Z'),
    },
  });

  const zhejiang = await prisma.university.upsert({
    where: { slug: 'zhejiang-university' },
    update: {},
    create: {
      slug: 'zhejiang-university',
      nameEn: 'Zhejiang University',
      nameAr: 'جامعة تشجيانغ',
      nameZh: '浙江大学',
      logoUrl: '/logo.jpeg',
      shortDescriptionEn:
        'Located in the historic and tech-driven city of Hangzhou, Zhejiang University is one of China’s oldest and most prestigious comprehensive institutions.',
      shortDescriptionAr:
        'تقع في مدينة هانغتشو التاريخية والتقنية، وتعد من أقدم وأعرق الجامعات الصينية الشاملة في الطب والهندسة والتجارة الدولية.',
      detailedDescriptionEn:
        'Established in 1897, Zhejiang University spans multiple picturesque campuses in Hangzhou and Haining, including the International Campus featuring joint institutes with global universities.',
      detailedDescriptionAr:
        'تأسست عام 1897 وتمتد عبر عدة أحرام جامعية حديثة في هانغتشو وهاينينغ، بما في ذلك الحرم الجامعي الدولي الذي يقدم برامج باللغة الإنجليزية.',
      universityType: 'Public Research University (C9 League / Double First-Class)',
      country: 'China',
      province: 'Zhejiang',
      city: 'Hangzhou',
      district: 'Xihu District',
      address: '866 Yuhangtang Rd, Xihu District, Hangzhou, Zhejiang, China',
      latitude: 30.3046,
      longitude: 120.0864,
      mapUrl: 'https://www.openstreetmap.org/?mlat=30.3046&mlon=120.0864#map=15/30.3046/120.0864',
      officialWebsite: 'https://www.zju.edu.cn/english/',
      officialAdmissionsUrl: 'https://iczu.zju.edu.cn/admissionsen/',
      officialContact: 'admission1@zju.edu.cn',
      accreditationInfoEn: 'Accredited by the Ministry of Education of China.',
      accreditationInfoAr: 'معتمدة رسمياً من وزارة التعليم الصينية.',
      accommodationAvailable: true,
      accommodationDescEn: 'International student residence halls on Zijingang and Yuquan campuses.',
      accommodationDescAr: 'مباني سكنية مخصصة للطلاب الدوليين في حرم تسيجينغانغ ويوتشوان.',
      isFeatured: true,
      acceptingApplications: true,
      status: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      sourceUrl: 'https://iczu.zju.edu.cn/admissionsen/',
      lastVerifiedAt: new Date('2026-10-20T00:00:00Z'),
    },
  });

  const fudan = await prisma.university.upsert({
    where: { slug: 'fudan-university' },
    update: {},
    create: {
      slug: 'fudan-university',
      nameEn: 'Fudan University',
      nameAr: 'جامعة فودان',
      nameZh: '复旦大学',
      logoUrl: '/logo.jpeg',
      shortDescriptionEn:
        'A leading comprehensive research university in Shanghai known for clinical medicine, international politics, economics, and natural sciences.',
      shortDescriptionAr:
        'جامعة بحثية شاملة رائدة في مدينة شنغهاي تشتهر ببرامج الطب السريري (MBBS) والاقتصاد والعلاقات الدولية.',
      detailedDescriptionEn:
        'Located in the financial hub of Shanghai, Fudan University provides world-class academic facilities, research hospitals, and English-taught degree programs.',
      detailedDescriptionAr:
        'تقع في قلب العاصمة المالية شنغهاي وتوفر مرافق أكاديمية ومستشفيات تعليمية متقدمة وبرامج دراسية متكاملة باللغة الإنجليزية.',
      universityType: 'Public Research University (C9 League / Double First-Class)',
      country: 'China',
      province: 'Shanghai',
      city: 'Shanghai',
      district: 'Yangpu District',
      address: '220 Handan Rd, Yangpu District, Shanghai, China',
      latitude: 31.2989,
      longitude: 121.5036,
      mapUrl: 'https://www.openstreetmap.org/?mlat=31.2989&mlon=121.5036#map=15/31.2989/121.5036',
      officialWebsite: 'https://www.fudan.edu.cn/en/',
      officialAdmissionsUrl: 'https://iso.fudan.edu.cn/isoenglish/',
      accreditationInfoEn: 'Ministry of Education of China & WHO-listed medical school.',
      accreditationInfoAr: 'معتمدة من وزارة التعليم الصينية ومدرجة في دليل كليات الطب العالمي.',
      accommodationAvailable: true,
      accommodationDescEn: 'Handan and Fenglin campus international student apartments.',
      accommodationDescAr: 'شقق الطلاب الدوليين في حرم هاندان وفنغلين الجامعي.',
      isFeatured: true,
      acceptingApplications: true,
      status: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      sourceUrl: 'https://iso.fudan.edu.cn/isoenglish/',
      lastVerifiedAt: new Date('2026-10-18T00:00:00Z'),
    },
  });

  // 8. Programs
  const prog1 = await prisma.universityProgram.upsert({
    where: { universityId_slug: { universityId: tsinghua.id, slug: 'master-computer-science' } },
    update: {},
    create: {
      universityId: tsinghua.id,
      slug: 'master-computer-science',
      nameEn: 'Master of Advanced Computing (Computer Science)',
      nameAr: 'ماجستير الحوسبة المتقدمة وعلوم الحاسوب',
      nameZh: '高级计算硕士',
      degreeLevel: 'MASTER',
      disciplineEn: 'Computer Science & Artificial Intelligence',
      disciplineAr: 'علوم الحاسوب والذكاء الاصطناعي',
      languageOfInstruction: 'ENGLISH',
      durationEn: '2 Years',
      durationAr: 'سنتان',
      intakePeriodsEn: 'Autumn Intake (September)',
      intakePeriodsAr: 'فصل الخريف (سبتمبر)',
      tuitionAmount: 39000,
      tuitionCurrency: 'CNY',
      tuitionPeriod: 'ANNUALLY',
      applicationFeeAmount: 800,
      applicationFeeCurrency: 'CNY',
      eligibilityEn: 'Bachelor degree in Computer Science, Engineering, or Mathematics.',
      eligibilityAr: 'درجة البكالوريوس في علوم الحاسوب أو الهندسة أو الرياضيات.',
      languageReqEn: 'IELTS 6.5 or TOEFL iBT 85 minimum.',
      languageReqAr: 'شهادة IELTS بدرجة 6.5 أو TOEFL بدرجة 85 كحد أدنى.',
      openingDate: new Date('2026-10-15T00:00:00Z'),
      deadlineDate: new Date('2027-02-28T23:59:59Z'),
      officialProgramUrl: 'https://is.tsinghua.edu.cn/',
      status: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
    },
  });

  const prog2 = await prisma.universityProgram.upsert({
    where: { universityId_slug: { universityId: zhejiang.id, slug: 'bachelor-civil-engineering' } },
    update: {},
    create: {
      universityId: zhejiang.id,
      slug: 'bachelor-civil-engineering',
      nameEn: 'B.Eng. in Civil Engineering',
      nameAr: 'بكالوريوس الهندسة المدنية',
      nameZh: '土木工程本科',
      degreeLevel: 'BACHELOR',
      disciplineEn: 'Engineering & Technology',
      disciplineAr: 'الهندسة والتكنولوجيا',
      languageOfInstruction: 'ENGLISH',
      durationEn: '4 Years',
      durationAr: '4 سنوات',
      intakePeriodsEn: 'Autumn Intake (September)',
      intakePeriodsAr: 'فصل الخريف (سبتمبر)',
      tuitionAmount: 29800,
      tuitionCurrency: 'CNY',
      tuitionPeriod: 'ANNUALLY',
      applicationFeeAmount: 800,
      applicationFeeCurrency: 'CNY',
      eligibilityEn: 'High school graduate under 25 years old with strong Mathematics and Physics scores.',
      eligibilityAr: 'خريج ثانوية عامة بعمر أقل من 25 عاماً مع درجات متميزة في الرياضيات والفيزياء.',
      languageReqEn: 'IELTS 6.0 or TOEFL 80.',
      languageReqAr: 'شهادة IELTS بدرجة 6.0 أو TOEFL بدرجة 80.',
      openingDate: new Date('2026-10-20T00:00:00Z'),
      deadlineDate: new Date('2027-03-31T23:59:59Z'),
      officialProgramUrl: 'https://iczu.zju.edu.cn/admissionsen/',
      status: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
    },
  });

  const prog3 = await prisma.universityProgram.upsert({
    where: { universityId_slug: { universityId: fudan.id, slug: 'mbbs-clinical-medicine' } },
    update: {},
    create: {
      universityId: fudan.id,
      slug: 'mbbs-clinical-medicine',
      nameEn: 'MBBS (Bachelor of Medicine & Bachelor of Surgery)',
      nameAr: 'بكالوريوس الطب والجراحة العامة (MBBS)',
      nameZh: '临床医学本科（英语授课）',
      degreeLevel: 'BACHELOR',
      disciplineEn: 'Clinical Medicine & Healthcare',
      disciplineAr: 'الطب البشري والرعاية الصحية',
      languageOfInstruction: 'ENGLISH',
      durationEn: '6 Years',
      durationAr: '6 سنوات',
      intakePeriodsEn: 'Autumn Intake (September)',
      intakePeriodsAr: 'فصل الخريف (سبتمبر)',
      tuitionAmount: 75000,
      tuitionCurrency: 'CNY',
      tuitionPeriod: 'ANNUALLY',
      applicationFeeAmount: 800,
      applicationFeeCurrency: 'CNY',
      eligibilityEn: 'High school diploma with top grades in Biology, Chemistry, Physics, and Mathematics.',
      eligibilityAr: 'شهادة الثانوية العامة بتقدير ممتاز في الأحياء والكيمياء والفيزياء والرياضيات.',
      languageReqEn: 'IELTS 6.5 or TOEFL 90.',
      languageReqAr: 'شهادة IELTS بدرجة 6.5 أو TOEFL بدرجة 90.',
      openingDate: new Date('2026-11-01T00:00:00Z'),
      deadlineDate: new Date('2027-01-30T23:59:59Z'),
      officialProgramUrl: 'https://iso.fudan.edu.cn/isoenglish/',
      status: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
    },
  });

  // 9. Fees & Expenses
  const existingFees = await prisma.universityFee.count();
  if (existingFees === 0) {
    await prisma.universityFee.createMany({
      data: [
        {
          universityId: tsinghua.id,
          programId: prog1.id,
          category: 'TUITION',
          titleEn: 'Master of Advanced Computing Tuition',
          titleAr: 'الرسوم الدراسية لماجستير الحوسبة المتقدمة',
          amount: 39000,
          currency: 'CNY',
          period: 'ANNUALLY',
          academicYear: '2027-2028',
          isConfirmed: true,
          sourceUrl: 'https://is.tsinghua.edu.cn/',
          verifiedDate: new Date('2026-10-15T00:00:00Z'),
        },
        {
          universityId: tsinghua.id,
          category: 'ACCOMMODATION',
          titleEn: 'Zijing International Dormitory (Single Room)',
          titleAr: 'سكن تسيجينغ للطلاب الدوليين (غرفة مفردة)',
          amount: 2400,
          currency: 'CNY',
          period: 'MONTHLY',
          academicYear: '2027-2028',
          isConfirmed: true,
          sourceUrl: 'https://is.tsinghua.edu.cn/',
          verifiedDate: new Date('2026-10-15T00:00:00Z'),
        },
        {
          universityId: tsinghua.id,
          category: 'INSURANCE',
          titleEn: 'Comprehensive Medical Insurance for International Students',
          titleAr: 'التأمين الطبي الشامل للطلاب الدوليين',
          amount: 800,
          currency: 'CNY',
          period: 'ANNUALLY',
          academicYear: '2027-2028',
          isConfirmed: true,
          sourceUrl: 'https://is.tsinghua.edu.cn/',
          verifiedDate: new Date('2026-10-15T00:00:00Z'),
        },
        {
          universityId: zhejiang.id,
          programId: prog2.id,
          category: 'TUITION',
          titleEn: 'Undergraduate Engineering Tuition',
          titleAr: 'الرسوم الدراسية لبكالوريوس الهندسة',
          amount: 29800,
          currency: 'CNY',
          period: 'ANNUALLY',
          academicYear: '2027-2028',
          isConfirmed: true,
          sourceUrl: 'https://iczu.zju.edu.cn/admissionsen/',
          verifiedDate: new Date('2026-10-20T00:00:00Z'),
        },
        {
          universityId: zhejiang.id,
          category: 'ACCOMMODATION',
          titleEn: 'On-Campus Twin Room Accommodation',
          titleAr: 'سكن جامعي داخلي (غرفة مزدوجة)',
          amount: 9000,
          currency: 'CNY',
          period: 'ANNUALLY',
          academicYear: '2027-2028',
          isConfirmed: false,
          sourceUrl: 'https://iczu.zju.edu.cn/admissionsen/',
        },
        {
          universityId: fudan.id,
          programId: prog3.id,
          category: 'TUITION',
          titleEn: 'MBBS English-Taught Program Tuition',
          titleAr: 'رسوم برنامج الطب البشري باللغة الإنجليزية',
          amount: 75000,
          currency: 'CNY',
          period: 'ANNUALLY',
          academicYear: '2027-2028',
          isConfirmed: true,
          sourceUrl: 'https://iso.fudan.edu.cn/isoenglish/',
          verifiedDate: new Date('2026-10-18T00:00:00Z'),
        },
      ],
    });
  }

  // 10. Assign Shared Requirements & Overrides
  const coreReqCodes = [
    'PASSPORT_COPY',
    'ACADEMIC_CERTIFICATE',
    'ACADEMIC_TRANSCRIPT',
    'PERSONAL_PHOTO',
    'ENGLISH_PROFICIENCY',
    'STUDY_PLAN',
    'RECOMMENDATION_LETTERS',
    'MEDICAL_EXAM_FORM',
    'NON_CRIMINAL_RECORD',
  ];

  for (const [idx, code] of coreReqCodes.entries()) {
    const reqId = createdReqs[code];
    if (!reqId) continue;

    for (const uni of [tsinghua, zhejiang, fudan]) {
      const assign = await prisma.universityRequirement.upsert({
        where: { universityId_requirementId: { universityId: uni.id, requirementId: reqId } },
        update: { displayOrder: idx + 1 },
        create: {
          universityId: uni.id,
          requirementId: reqId,
          displayOrder: idx + 1,
          isEnabled: true,
          status: 'PUBLISHED',
        },
      });

      // Demonstrate per-university override isolation:
      // At Zhejiang, Recommendation Letters are optional for undergraduate applicants with custom instructions.
      if (uni.id === zhejiang.id && code === 'RECOMMENDATION_LETTERS') {
        await prisma.requirementOverride.upsert({
          where: { universityRequirementId: assign.id },
          update: {},
          create: {
            universityRequirementId: assign.id,
            isRequiredOverride: false,
            customInstructionsEn:
              'Optional for Bachelor applicants unless applying for the Zhejiang University Scholarship; mandatory for Master/PhD.',
            customInstructionsAr:
              'اختياري لمتقدمي البكالوريوس ما لم يكن التقديم على منحة الجامعة، وإلزامي للماجستير والدكتوراه.',
          },
        });
      }
    }
  }

  // University-specific requirement for Tsinghua
  const existingSpec = await prisma.universitySpecificRequirement.count({
    where: { universityId: tsinghua.id },
  });
  if (existingSpec === 0) {
    await prisma.universitySpecificRequirement.create({
      data: {
        universityId: tsinghua.id,
        programId: prog1.id,
        nameEn: 'Portfolio of Published Research or GitHub Technical Projects',
        nameAr: 'ملف الأبحاث المنشورة أو المشاريع البرمجية التقنية',
        descriptionEn: 'Recommended for applicants to the Master of Advanced Computing program.',
        descriptionAr: 'يُنصح بتقديمه للمتقدمين لبرنامج ماجستير الحوسبة المتقدمة.',
        isRequired: false,
        displayOrder: 20,
        isEnabled: true,
        status: 'PUBLISHED',
      },
    });
  }

  // 11. Scholarships
  const cscScholarship = await prisma.scholarship.upsert({
    where: { slug: 'chinese-government-scholarship-csc' },
    update: {},
    create: {
      slug: 'chinese-government-scholarship-csc',
      nameEn: 'Chinese Government Scholarship (CSC - Type B University Program)',
      nameAr: 'منحة الحكومة الصينية (CSC - البرنامج الجامعي الفئة B)',
      providerEn: 'China Scholarship Council (CSC)',
      providerAr: 'مجلس المنح الدراسية الصيني (CSC)',
      category: 'GOVERNMENT',
      fundingType: 'FULL',
      tuitionCoverageEn: '100% Full Tuition Waiver',
      tuitionCoverageAr: 'إعفاء كامل بنسبة 100% من الرسوم الدراسية',
      accommodationCoverageEn: 'Free on-campus dormitory or monthly accommodation subsidy',
      accommodationCoverageAr: 'سكن جامعي مجاني داخل الحرم الجامعي أو بدل سكن شهري',
      stipendAmount: 3000,
      stipendCurrency: 'CNY',
      stipendPeriod: 'MONTHLY',
      otherBenefitsEn: 'Comprehensive Medical Insurance (800 CNY/year)',
      otherBenefitsAr: 'تأمين طبي شامل طوال فترة الدراسة (800 يوان سنوياً)',
      eligibilityEn:
        'Non-Chinese citizens in good health; Master applicants under 35, Doctoral applicants under 40 with strong academic records.',
      eligibilityAr:
        'لغير المواطنين الصينيين المتمتعين بصحة جيدة؛ عمر المتقدم للماجستير أقل من 35 عاماً وللدكتوراه أقل من 40 عاماً مع سجل أكاديمي متميز.',
      degreeLevelsJson: JSON.stringify(['BACHELOR', 'MASTER', 'PHD']),
      languageRequirementsEn: 'IELTS 6.0+ / TOEFL 80+ for English track, or HSK 4/5 for Chinese track.',
      languageRequirementsAr: 'شهادة IELTS 6.0+ للمسار الإنجليزي أو HSK 4/5 للمسار الصيني.',
      openingDate: new Date('2026-11-01T00:00:00Z'),
      deadlineDate: new Date('2027-02-28T23:59:59Z'),
      durationEn: 'Covers full standard duration of the degree program',
      durationAr: 'تغطي كامل المدة النظامية للبرنامج الدراسي',
      renewalConditionsEn: 'Subject to passing the annual CSC academic and conduct review each spring.',
      renewalConditionsAr: 'تخضع لاجتياز التقييم الأكاديمي السنوي لمجلس المنح الصيني بنجاح.',
      officialUrl: 'https://www.campuschina.org/',
      isFeatured: true,
      status: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      sourceUrl: 'https://www.campuschina.org/',
      lastVerifiedAt: new Date('2026-10-20T00:00:00Z'),
    },
  });

  const shanghaiScholarship = await prisma.scholarship.upsert({
    where: { slug: 'shanghai-government-scholarship' },
    update: {},
    create: {
      slug: 'shanghai-government-scholarship',
      nameEn: 'Shanghai Government Scholarship (SGS - Class A & B)',
      nameAr: 'منحة حكومة بلدية شنغهاي (SGS - الفئة A و B)',
      providerEn: 'Shanghai Municipal Education Commission',
      providerAr: 'هيئة التعليم لبلدية شنغهاي',
      category: 'PROVINCIAL',
      fundingType: 'PARTIAL',
      tuitionCoverageEn: 'Full Tuition Waiver (Class A & B)',
      tuitionCoverageAr: 'إعفاء كامل من الرسوم الدراسية',
      accommodationCoverageEn: 'Included in Class A only',
      accommodationCoverageAr: 'متضمنة في الفئة A فقط',
      otherBenefitsEn: 'Comprehensive Medical Insurance included',
      otherBenefitsAr: 'تشمل التأمين الطبي الشامل',
      eligibilityEn: 'Outstanding international applicants applying to accredited universities in Shanghai.',
      eligibilityAr: 'للطلاب الدوليين المتفوقين المتقدمين للجامعات المعتمدة في مدينة شنغهاي.',
      degreeLevelsJson: JSON.stringify(['BACHELOR', 'MASTER', 'PHD']),
      openingDate: new Date('2026-11-15T00:00:00Z'),
      deadlineDate: new Date('2027-03-15T23:59:59Z'),
      durationEn: 'Full program duration with annual review',
      durationAr: 'كامل مدة البرنامج مع مراجعة سنوية',
      officialUrl: 'https://iso.fudan.edu.cn/isoenglish/',
      isFeatured: true,
      status: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      sourceUrl: 'https://iso.fudan.edu.cn/isoenglish/',
      lastVerifiedAt: new Date('2026-10-18T00:00:00Z'),
    },
  });

  for (const uni of [tsinghua, zhejiang, fudan]) {
    await prisma.scholarshipUniversity.upsert({
      where: { scholarshipId_universityId: { scholarshipId: cscScholarship.id, universityId: uni.id } },
      update: {},
      create: { scholarshipId: cscScholarship.id, universityId: uni.id },
    });
  }
  await prisma.scholarshipUniversity.upsert({
    where: { scholarshipId_universityId: { scholarshipId: shanghaiScholarship.id, universityId: fudan.id } },
    update: {},
    create: { scholarshipId: shanghaiScholarship.id, universityId: fudan.id },
  });

  // 12. Deadlines
  const existingDeadlines = await prisma.applicationDeadline.count();
  if (existingDeadlines === 0) {
    await prisma.applicationDeadline.createMany({
      data: [
        {
          titleEn: 'Tsinghua Graduate Autumn 2027 Application Round',
          titleAr: 'التقديم لمرحلة الدراسات العليا في جامعة تسينغهوا لخريف 2027',
          universityId: tsinghua.id,
          programId: prog1.id,
          intakeNameEn: 'Autumn 2027',
          intakeNameAr: 'خريف 2027',
          academicYear: '2027-2028',
          openingDate: new Date('2026-10-15T00:00:00Z'),
          closingDate: new Date('2027-02-28T23:59:59Z'),
          timezone: 'Asia/Shanghai',
          sourceUrl: 'https://is.tsinghua.edu.cn/',
          verificationStatus: 'VERIFIED',
          lastVerifiedAt: new Date('2026-10-15T00:00:00Z'),
          status: 'PUBLISHED',
        },
        {
          titleEn: 'Fudan University MBBS Early Admission Deadline',
          titleAr: 'موعد التقديم المبكر لبرنامج الطب البشري في جامعة فودان',
          universityId: fudan.id,
          programId: prog3.id,
          intakeNameEn: 'Autumn 2027',
          intakeNameAr: 'خريف 2027',
          academicYear: '2027-2028',
          openingDate: new Date('2026-11-01T00:00:00Z'),
          closingDate: new Date('2026-12-05T23:59:59Z'),
          timezone: 'Asia/Shanghai',
          sourceUrl: 'https://iso.fudan.edu.cn/isoenglish/',
          verificationStatus: 'VERIFIED',
          lastVerifiedAt: new Date('2026-10-18T00:00:00Z'),
          status: 'PUBLISHED',
        },
        {
          titleEn: 'Zhejiang University Undergraduate 2027 Intake',
          titleAr: 'التقديم لمرحلة البكالوريوس في جامعة تشجيانغ 2027',
          universityId: zhejiang.id,
          programId: prog2.id,
          intakeNameEn: 'Autumn 2027',
          intakeNameAr: 'خريف 2027',
          academicYear: '2027-2028',
          openingDate: new Date('2026-10-20T00:00:00Z'),
          closingDate: new Date('2027-03-31T23:59:59Z'),
          timezone: 'Asia/Shanghai',
          sourceUrl: 'https://iczu.zju.edu.cn/admissionsen/',
          verificationStatus: 'VERIFIED',
          lastVerifiedAt: new Date('2026-10-20T00:00:00Z'),
          status: 'PUBLISHED',
        },
      ],
    });
  }

  // 13. WhatsApp Templates
  const existingTemplates = await prisma.whatsAppTemplate.count();
  if (existingTemplates === 0) {
    await prisma.whatsAppTemplate.createMany({
      data: [
        {
          name: 'Default Global Template',
          scope: 'GLOBAL',
          templateEn:
            'Hello, I would like more information about {university_name}. I am interested in {major_name}. Could you please explain the admission requirements, available scholarships, and application deadline?',
          templateAr:
            'مرحباً، أود الحصول على مزيد من المعلومات حول {university_name}. أنا مهتم في تخصص {major_name}. هل يمكنكم توضيح متطلبات القبول والمنح الدراسية المتاحة والموعد النهائي للتقديم؟',
          isEnabled: true,
        },
        {
          name: 'Tsinghua University Specific Template',
          scope: 'UNIVERSITY',
          universityId: tsinghua.id,
          templateEn:
            'Hello Red Dragon Study! I am reviewing {university_name} in {city}. I am interested in {major_name}. Could you advise me on the admission requirements and CSC scholarship steps?',
          templateAr:
            'مرحباً فريق التنين الأحمر! أتصفح حالياً {university_name} في مدينة {city}. أنا مهتم في تخصص {major_name}. هل يمكنكم إرشادي حول متطلبات القبول وخطوات التقديم على المنحة؟',
          isEnabled: true,
        },
      ],
    });
  }

  // 14. Homepage Sections
  const homepageSections = [
    {
      sectionKey: 'hero',
      titleEn: 'Your Trusted Gateway to Top Accredited Chinese Universities',
      titleAr: 'بوابتك الموثوقة للقبول الجامعي والمنح الدراسية في أفضل الجامعات الصينية',
      subtitleEn: 'RED DRAGON STUDY CONSULTANCY',
      subtitleAr: 'مؤسسة التنين الأحمر للاستشارات التعليمية والدراسة في الصين',
      descriptionEn:
        'Explore verified English and Chinese degree programs, government scholarships, transparent admission checklists, and official application deadlines.',
      descriptionAr:
        'استكشف البرامج الأكاديمية المعتمدة باللغتين الإنجليزية والصينية، والمنح الحكومية والجامعية، وقوائم المتطلبات الموثقة، ومواعيد التقديم الرسمية.',
      buttonTextEn: 'Explore Universities',
      buttonTextAr: 'استكشف الجامعات الصينية',
      buttonUrl: '/universities',
      secondaryButtonTextEn: 'Browse Scholarships',
      secondaryButtonTextAr: 'تصفح المنح الدراسية',
      secondaryButtonUrl: '/scholarships',
      imageUrl: '/logo.jpeg',
      displayOrder: 1,
      isEnabled: true,
      status: 'PUBLISHED',
    },
    {
      sectionKey: 'featured_universities',
      titleEn: 'Featured Chinese Universities',
      titleAr: 'أبرز الجامعات الصينية الموصى بها',
      descriptionEn: 'Compare programs, tuition fees, and admission criteria at top-tier institutions.',
      descriptionAr: 'قارن بين البرامج الأكاديمية والرسوم الدراسية ومتطلبات القبول في نخبة الجامعات الصينية.',
      displayOrder: 2,
      isEnabled: true,
      status: 'PUBLISHED',
    },
    {
      sectionKey: 'available_scholarships',
      titleEn: 'Available Scholarships & Funding Opportunities',
      titleAr: 'المنح الدراسية وفرص التمويل المتاحة',
      descriptionEn: 'Review verified full and partial scholarships with clear eligibility criteria.',
      descriptionAr: 'اطلع على المنح الدراسية الكاملة والجزئية الموثقة مع شروط الأهلية والمزايا الفعلية.',
      displayOrder: 3,
      isEnabled: true,
      status: 'PUBLISHED',
    },
    {
      sectionKey: 'upcoming_deadlines',
      titleEn: 'Upcoming Application Deadlines',
      titleAr: 'مواعيد التقديم القادمة والنشطة',
      descriptionEn: 'Track official opening and closing dates calculated in Beijing Time (UTC+8).',
      descriptionAr: 'تابع تواريخ فتح وإغلاق التقديم الرسمية المحسوبة بدقة بتوقيت بكين.',
      displayOrder: 4,
      isEnabled: true,
      status: 'PUBLISHED',
    },
    {
      sectionKey: 'application_process',
      titleEn: 'Structured 4-Step Admission Process',
      titleAr: 'خطوات التقديم والقبول الجامعي في 4 مراحل واضحة',
      descriptionEn: 'From academic consultation and document verification to official admission notice and JW202 visa support.',
      descriptionAr: 'من الاستشارة الأكاديمية وتدقيق الوثائق إلى استخراج خطاب القبول الرسمي ونموذج التأشيرة JW202.',
      displayOrder: 5,
      isEnabled: true,
      status: 'PUBLISHED',
    },
    {
      sectionKey: 'faq_section',
      titleEn: 'Frequently Asked Questions',
      titleAr: 'الأسئلة الشائعة للطلاب الدوليين',
      descriptionEn: 'Answers to common questions about studying in China, scholarships, and admission documents.',
      descriptionAr: 'إجابات وافية لأبرز استفسارات الطلاب حول الدراسة في الصين والمنح والمستندات المطلوبة.',
      displayOrder: 6,
      isEnabled: true,
      status: 'PUBLISHED',
    },
    {
      sectionKey: 'inquiry_section',
      titleEn: 'Request Personalized Admission Guidance',
      titleAr: 'اطلب استشارة أكاديمية مخصصة مجاناً',
      descriptionEn: 'Submit your inquiry and our admissions advisors will evaluate your eligibility and contact you.',
      descriptionAr: 'أرسل استفسارك الآن وسيقوم فريق القبول بتقييم أهليتك والتواصل معك.',
      displayOrder: 7,
      isEnabled: true,
      status: 'PUBLISHED',
    },
  ];

  for (const sec of homepageSections) {
    await prisma.homepageSection.upsert({
      where: { sectionKey: sec.sectionKey },
      update: sec,
      create: sec,
    });
  }

  // 15. Navigation Items
  const existingNav = await prisma.navigationItem.count();
  if (existingNav === 0) {
    await prisma.navigationItem.createMany({
      data: [
        { labelEn: 'Home', labelAr: 'الرئيسية', href: '/', location: 'HEADER', displayOrder: 1, isEnabled: true },
        { labelEn: 'Universities', labelAr: 'دليل الجامعات', href: '/universities', location: 'HEADER', displayOrder: 2, isEnabled: true },
        { labelEn: 'Scholarships', labelAr: 'المنح الدراسية', href: '/scholarships', location: 'HEADER', displayOrder: 3, isEnabled: true },
        { labelEn: 'Compare', labelAr: 'مقارنة الجامعات', href: '/compare', location: 'HEADER', displayOrder: 4, isEnabled: true },
        { labelEn: 'About Us', labelAr: 'عن المؤسسة', href: '/about', location: 'HEADER', displayOrder: 5, isEnabled: true },
        { labelEn: 'FAQ', labelAr: 'الأسئلة الشائعة', href: '/faq', location: 'HEADER', displayOrder: 6, isEnabled: true },
        { labelEn: 'Contact', labelAr: 'تواصل معنا', href: '/contact', location: 'HEADER', displayOrder: 7, isEnabled: true },
        { labelEn: 'Privacy Policy', labelAr: 'سياسة الخصوصية', href: '/privacy-policy', location: 'FOOTER', displayOrder: 1, isEnabled: true },
        { labelEn: 'Terms & Conditions', labelAr: 'الشروط والأحكام', href: '/terms', location: 'FOOTER', displayOrder: 2, isEnabled: true },
      ],
    });
  }

  // 16. Website Pages (System + Custom)
  const pages = [
    {
      slug: 'about',
      titleEn: 'About Red Dragon Study',
      titleAr: 'عن مؤسسة التنين الأحمر للدراسة في الصين',
      subtitleEn: 'Dedicated International Admissions & Scholarship Consultancy',
      subtitleAr: 'مؤسسة متخصصة في القبول الجامعي والمنح الدراسية في الجامعات الصينية المعتمدة',
      contentEn:
        'Red Dragon Study is an educational consultancy dedicated to helping international students navigate admissions to accredited Chinese universities. We maintain strict verification standards, transparent fee tables, and up-to-date scholarship criteria so students and families can make informed academic decisions.',
      contentAr:
        'مؤسسة التنين الأحمر للدراسة (Red Dragon Study) هي جهة استشارية تعليمية متخصصة في مساعدة الطلاب الدوليين للالتحاق بالجامعات الصينية الحكومية المعتمدة. نحن نلتزم بأعلى معايير الدقة والتوثيق للمعلومات الأكاديمية والرسوم الدراسية وشروط المنح لضمان اتخاذ الطالب لقراره الأكاديمي بثقة ووضوح.',
      isSystemPage: true,
      isEnabled: true,
      status: 'PUBLISHED',
    },
    {
      slug: 'privacy-policy',
      titleEn: 'Privacy Policy',
      titleAr: 'سياسة الخصوصية وحماية البيانات',
      subtitleEn: 'How We Protect Student Information',
      subtitleAr: 'كيف نحمي البيانات الشخصية للطلاب المتقدمين',
      contentEn:
        'We collect only the contact and academic background information necessary to evaluate your admission inquiry and communicate with you. Student inquiry records are strictly access-controlled by role-based permissions and are never sold or exposed publicly.',
      contentAr:
        'نحن نجمع فقط بيانات التواصل والخلفية التعليمية الضرورية لتقييم استفسار القبول الجامعي الخاص بك والتواصل معك. تخضع جميع سجلات استفسارات الطلاب لصلاحيات وصول صارمة ولا يتم مشاركتها أو نشرها علناً تحت أي ظرف.',
      isSystemPage: true,
      isEnabled: true,
      status: 'PUBLISHED',
    },
    {
      slug: 'terms',
      titleEn: 'Terms and Conditions',
      titleAr: 'الشروط والأحكام',
      subtitleEn: 'Terms of Use & Advisory Services',
      subtitleAr: 'شروط استخدام المنصة والخدمات الاستشارية',
      contentEn:
        'All university tuition fees, scholarship coverage details, and admission deadlines displayed on Red Dragon Study are sourced from official university publications and verified periodically. Final admission and scholarship decisions always rest with the respective university and scholarship council.',
      contentAr:
        'تُستمد جميع بيانات الرسوم الدراسية وتفاصيل المنح ومواعيد التقديم المعروضة على منصة التنين الأحمر للدراسة من النشرات الرسمية للجامعات وتتم مراجعتها دورياً. ويعود القرار النهائي للقبول أو المنحة دائماً للجامعة المعنية أو مجلس المنح المختص.',
      isSystemPage: true,
      isEnabled: true,
      status: 'PUBLISHED',
    },
    {
      slug: 'study-guide-china',
      titleEn: 'Complete Guide to Studying in China',
      titleAr: 'الدليل الشامل للدراسة والمعيشة في الصين',
      subtitleEn: 'Visas, Campus Life, and Preparation Checklist',
      subtitleAr: 'التأشيرة الدراسية، الحياة الجامعية، وقائمة الاستعداد للسفر',
      contentEn:
        'Preparing to study in China involves securing your Admission Notice, JW201/JW202 visa form, applying for an X1 or X2 student visa at the Chinese embassy, and registering for on-campus accommodation.',
      contentAr:
        'يشمل الاستعداد للدراسة في الصين الحصول على إشعار القبول الرسمي ونموذج التأشيرة JW201 أو JW202، والتقديم على تأشيرة الطالب X1 أو X2 لدى السفارة الصينية، وتأكيد حجز السكن الجامعي.',
      isSystemPage: false,
      isEnabled: true,
      status: 'PUBLISHED',
    },
  ];

  for (const p of pages) {
    await prisma.websitePage.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  // 17. FAQs
  const existingFaq = await prisma.faqItem.count();
  if (existingFaq === 0) {
    await prisma.faqItem.createMany({
      data: [
        {
          questionEn: 'Can I study in China in English without knowing Chinese?',
          questionAr: 'هل يمكنني الدراسة في الصين باللغة الإنجليزية دون إتقان اللغة الصينية؟',
          answerEn:
            'Yes. Many leading Chinese universities offer Bachelor, Master, and PhD programs taught entirely in English, including Engineering, Computer Science, International Business, and MBBS.',
          answerAr:
            'نعم، تقدم العديد من الجامعات الصينية المرموقة برامج بكالوريوس وماجستير ودكتوراه تُدرّس بالكامل باللغة الإنجليزية، بما في ذلك الهندسة وعلوم الحاسوب وإدارة الأعمال والطب البشري.',
          category: 'ADMISSIONS',
          displayOrder: 1,
          isEnabled: true,
          status: 'PUBLISHED',
        },
        {
          questionEn: 'What is the difference between CSC Type A and Type B scholarships?',
          questionAr: 'ما الفرق بين منحة الحكومة الصينية CSC الفئة A والفئة B؟',
          answerEn:
            'CSC Type A is administered through your home country’s Chinese Embassy or Ministry of Education, while CSC Type B is applied for directly through the designated Chinese university.',
          answerAr:
            'يتم التقديم على الفئة A عبر السفارة الصينية أو وزارة التعليم في بلد الطالب، بينما يتم التقديم على الفئة B مباشرة عبر بوابة الجامعة الصينية المستضيفة.',
          category: 'SCHOLARSHIPS',
          displayOrder: 2,
          isEnabled: true,
          status: 'PUBLISHED',
        },
        {
          questionEn: 'When should I prepare my documents for the Autumn intake?',
          questionAr: 'متى يجب عليّ تجهيز مستنداتي للتقديم على فصل الخريف؟',
          answerEn:
            'Most Chinese universities open applications between October and November for the following September intake, with scholarship deadlines typically falling between January and March.',
          answerAr:
            'تفتح معظم الجامعات الصينية باب التقديم بين شهري أكتوبر ونوفمبر للدراسة في سبتمبر من العام التالي، وتنتهي مواعيد أغلب المنح بين يناير ومارس.',
          category: 'DEADLINES',
          displayOrder: 3,
          isEnabled: true,
          status: 'PUBLISHED',
        },
      ],
    });
  }

  // 18. Verification Records
  const existingVerifications = await prisma.verificationRecord.count();
  if (existingVerifications === 0) {
    await prisma.verificationRecord.createMany({
      data: [
        {
          entityType: 'UNIVERSITY',
          entityId: tsinghua.id,
          entityTitle: 'Tsinghua University Profile & 2027 Fees',
          status: 'VERIFIED',
          sourceUrl: 'https://is.tsinghua.edu.cn/',
          sourceType: 'OFFICIAL_WEBSITE',
          lastVerifiedDate: new Date('2026-10-15T00:00:00Z'),
          verifiedById: adminUser.id,
          internalNotes: 'Confirmed against Tsinghua 2027 International Graduate Admissions Brochure.',
          nextReviewDate: new Date('2027-04-01T00:00:00Z'),
          academicYear: '2027-2028',
          showPublicIndicator: true,
        },
        {
          entityType: 'UNIVERSITY',
          entityId: zhejiang.id,
          entityTitle: 'Zhejiang University Accommodation Fee Estimate',
          status: 'REQUIRES_REVIEW',
          sourceUrl: 'https://iczu.zju.edu.cn/admissionsen/',
          sourceType: 'OFFICIAL_WEBSITE',
          lastVerifiedDate: new Date('2026-09-10T00:00:00Z'),
          verifiedById: adminUser.id,
          internalNotes: 'Verify updated Zijingang twin room rates for 2027-2028.',
          nextReviewDate: new Date('2026-11-15T00:00:00Z'),
          academicYear: '2027-2028',
          showPublicIndicator: false,
        },
      ],
    });
  }

  // 19. Sample Student Inquiry
  const existingInquiries = await prisma.studentInquiry.count();
  if (existingInquiries === 0) {
    const inq = await prisma.studentInquiry.create({
      data: {
        inquiryNumber: 'RDS-2026-1001',
        studentName: 'Omar Al-Harbi',
        email: 'omar.harbi@example.com',
        whatsappNumber: '+966501234567',
        countryOfResidence: 'Saudi Arabia',
        nationality: 'Saudi',
        universityId: tsinghua.id,
        programId: prog1.id,
        scholarshipId: cscScholarship.id,
        intendedIntake: 'Autumn 2027',
        currentQualification: 'Bachelor in Software Engineering (GPA 3.8/4.0)',
        category: 'SCHOLARSHIP_ADMISSION',
        message:
          'I would like to apply for the Master of Advanced Computing at Tsinghua University with the CSC scholarship. My IELTS score is 7.0.',
        privacyConsent: true,
        statusCode: 'UNDER_REVIEW',
        assignedEmployeeId: adminUser.id,
        nextFollowUpDate: new Date('2026-11-05T10:00:00Z'),
      },
    });

    await prisma.inquiryStatusHistory.create({
      data: {
        inquiryId: inq.id,
        fromStatus: 'NEW_INQUIRY',
        toStatus: 'UNDER_REVIEW',
        changedById: adminUser.id,
        note: 'Assigned for initial transcript review.',
      },
    });

    await prisma.inquiryNote.create({
      data: {
        inquiryId: inq.id,
        authorId: adminUser.id,
        noteText: 'Strong GPA and IELTS 7.0. Ready to prepare study plan and supervisor outreach.',
        isInternal: true,
      },
    });

    await prisma.followUpReminder.create({
      data: {
        inquiryId: inq.id,
        employeeId: adminUser.id,
        dueAt: new Date('2026-11-05T10:00:00Z'),
        note: 'Follow up with Omar regarding notarized transcript scan.',
      },
    });
  }

  console.log('Database seeded successfully!');
}

if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
