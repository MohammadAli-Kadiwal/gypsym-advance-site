'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Download, Mail } from 'lucide-react';

interface NewsletterRecord extends BaseRecord {
  email: string;
  source: string;
  subscribedAt: string;
}

export default function NewsletterAdminPage() {
  const { data, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<NewsletterRecord>('newsletter');

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Email,Source,SubscribedAt\n' +
      data.map((e) => `${e.email},${e.source},${e.subscribedAt}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gypsym_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<NewsletterRecord>[] = [
    {
      key: 'email',
      header: 'Subscriber Email',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="font-mono font-semibold text-foreground text-xs">{item.email}</span>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Opt-in Channel / Page',
      sortable: true,
      render: (item) => <Badge variant="outline">{item.source}</Badge>,
    },
    {
      key: 'subscribedAt',
      header: 'Subscription Date',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDateTime(item.subscribedAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleExportCsv} variant="outline" size="sm" className="h-8">
          <Download className="h-3.5 w-3.5 mr-1.5" />
          <span>Export Subscribers (CSV)</span>
        </Button>
      </div>

      <DataTable<NewsletterRecord>
        title="Engineering Newsletter Subscribers"
        description="Verified institutional subscribers receiving quarterly distributed systems whitepapers."
        data={data}
        columns={columns}
        searchKeys={['email', 'source']}
        requiredPermission="content:read"
        onDelete={deleteItem}
        onBulkDelete={bulkDelete}
        onBulkStatusChange={bulkUpdateStatus}
      />
    </div>
  );
}
