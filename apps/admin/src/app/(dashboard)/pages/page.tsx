'use client';

import * as React from 'react';
import { notify } from '@/lib/notifications';
import { fetchApi, normalizeErrorMessage, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/api-client';
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
      notify.error(ERROR_MESSAGES.PAGES.PAGE_SYNC_FAILED);
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
      notify.success(SUCCESS_MESSAGES.PAGES.PAGE_SAVED(slug));
      await loadBackendData();
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err, ERROR_MESSAGES.PAGES.PAGE_SAVE_FAILED));
      throw err;
    }
  };

  const handleCreatePage = async (data: Partial<PageData>) => {
    try {
      await fetchApi('/pages', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      notify.success(SUCCESS_MESSAGES.PAGES.PAGE_CREATED(data.title || 'New Page'));
      await loadBackendData();
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err, ERROR_MESSAGES.PAGES.PAGE_CREATE_FAILED));
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
