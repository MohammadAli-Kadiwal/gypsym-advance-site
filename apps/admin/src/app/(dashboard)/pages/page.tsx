'use client';

import * as React from 'react';
import { notify } from '@/lib/notifications';
import { fetchApi, normalizeErrorMessage } from '@/lib/api-client';
import { AdminContentContainer } from '@/components/layout/admin-page';
import { PagesTable } from './_components/pages-table';
import type { PageData } from './_components/types';

export default function PagesManagementPage() {
  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [allPages, setAllPages] = React.useState<PageData[]>([]);

  const loadBackendData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApi<PageData[]>('/pages');
      if (Array.isArray(data)) {
        setAllPages(data);
      }
    } catch {
      notify.error('Unable to synchronize pages from database.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
    loadBackendData();
  }, [loadBackendData]);

  const handleSavePageSettings = async (slug: string, data: Partial<PageData>) => {
    try {
      await fetchApi(`/pages/${slug}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      notify.success(`Page settings for "/${slug}" saved successfully.`);
      await loadBackendData();
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err, 'Failed to save page settings'));
      throw err;
    }
  };

  const handleCreatePage = async (data: Partial<PageData>) => {
    try {
      await fetchApi('/pages', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      notify.success(`Page "${data.title}" created successfully.`);
      await loadBackendData();
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err, 'Failed to create page'));
      throw err;
    }
  };

  if (!mounted) {
    return (
      <AdminContentContainer variant="wide">
        <div className="w-full py-6 space-y-4">
          <div className="h-8 w-48 bg-muted rounded-xl animate-pulse" />
          <div className="h-32 bg-card rounded-2xl border border-border animate-pulse" />
        </div>
      </AdminContentContainer>
    );
  }

  return (
    <AdminContentContainer variant="wide">
      <React.Suspense fallback={null}>
        <PagesTable
          pages={allPages}
          loading={loading}
          onSavePageSettings={handleSavePageSettings}
          onCreatePage={handleCreatePage}
        />
      </React.Suspense>
    </AdminContentContainer>
  );
}
