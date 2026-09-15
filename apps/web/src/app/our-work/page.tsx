import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface OurWorkPageProps {
  searchParams?: {
    category?: string;
  };
}

export default function OurWorkRedirect({ searchParams }: OurWorkPageProps) {
  const category = searchParams?.category;
  if (category) {
    redirect(`/portfolio?category=${encodeURIComponent(category)}`);
  }
  redirect('/portfolio');
}
