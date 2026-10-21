import * as React from 'react';
import { AdminPageLoadingState } from '@/components/layout/admin-page';

export default function DashboardLoading() {
  return (
    <AdminPageLoadingState
      title="Loading Workspace"
      message="Synchronizing operational modules and fetching live data..."
      description="Connecting to Gypsym enterprise API..."
    />
  );
}
