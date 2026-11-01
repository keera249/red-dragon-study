import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/auth';

const inquirySubmitSchema = z.object({
  studentName: z.string().trim().min(2, 'Student name is required').max(120),
  email: z.string().trim().email('Valid email is required').optional().or(z.literal('')),
  whatsappNumber: z.string().trim().min(6, 'Valid contact number is required').max(30).optional().or(z.literal('')),
  countryOfResidence: z.string().trim().max(100).optional(),
  nationality: z.string().trim().max(100).optional(),
  universityId: z.string().optional().nullable(),
  programId: z.string().optional().nullable(),
  scholarshipId: z.string().optional().nullable(),
  intendedIntake: z.string().trim().max(80).optional(),
  currentQualification: z.string().trim().max(150).optional(),
  category: z.string().trim().max(80).optional(),
  message: z.string().trim().min(5, 'Please enter your inquiry message').max(3000),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: 'Consent to the privacy terms is required',
  }),
  honeypot: z.string().max(0).optional(), // Anti-spam honeypot
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(`inquiry:${ip}`, 8, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before submitting another inquiry.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    if (body?.honeypot) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }

    const parsed = inquirySubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    if (!data.email && !data.whatsappNumber) {
      return NextResponse.json(
        { error: 'Please provide either an email address or a WhatsApp number so we can contact you.' },
        { status: 400 }
      );
    }

    // Check configured required fields from ContactSetting if present
    const contactSetting = await prisma.contactSetting.findUnique({ where: { id: 'default' } });
    if (contactSetting?.inquiryFieldsConfigJson) {
      try {
        const cfg = JSON.parse(contactSetting.inquiryFieldsConfigJson);
        if (cfg.email?.required && !data.email) {
          return NextResponse.json({ error: 'Contact email is required.' }, { status: 400 });
        }
        if (cfg.whatsappNumber?.required && !data.whatsappNumber) {
          return NextResponse.json({ error: 'WhatsApp number is required.' }, { status: 400 });
        }
      } catch {
        // ignore invalid json
      }
    }

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const count = await prisma.studentInquiry.count();
    const inquiryNumber = `RDS-${year}-${1000 + count + 1}-${randomSuffix}`;

    const created = await prisma.$transaction(async (tx) => {
      const inq = await tx.studentInquiry.create({
        data: {
          inquiryNumber,
          studentName: data.studentName,
          email: data.email || null,
          whatsappNumber: data.whatsappNumber || null,
          countryOfResidence: data.countryOfResidence || null,
          nationality: data.nationality || null,
          universityId: data.universityId || null,
          programId: data.programId || null,
          scholarshipId: data.scholarshipId || null,
          intendedIntake: data.intendedIntake || null,
          currentQualification: data.currentQualification || null,
          category: data.category || 'GENERAL_ADMISSION',
          message: data.message,
          privacyConsent: true,
          statusCode: 'NEW_INQUIRY',
        },
      });

      await tx.inquiryStatusHistory.create({
        data: {
          inquiryId: inq.id,
          fromStatus: null,
          toStatus: 'NEW_INQUIRY',
          note: 'Submitted via public inquiry form',
        },
      });

      return inq;
    });

    // Return only the safe reference number — never expose other inquiry data publicly
    return NextResponse.json(
      {
        ok: true,
        inquiryNumber: created.inquiryNumber,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Public inquiry submission error:', err);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}

// Explicitly reject public GET attempts to prevent exposing student inquiries publicly
export async function GET() {
  return NextResponse.json(
    { error: 'Forbidden: Student inquiries are private and require employee authentication.' },
    { status: 403 }
  );
}
