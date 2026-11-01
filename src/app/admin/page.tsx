import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedActor } from '@/lib/auth';
import { AdminDashboardClient } from '@/components/AdminDashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    redirect('/admin/login');
  }

  return <AdminDashboardClient actor={actor} />;
}
