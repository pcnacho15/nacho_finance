import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import ChatModule from '@/app/components/finance/ChatModule';
import BreadcrumbComp from '@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/finance', title: 'Finanzas' },
  { to: '/finance/crypto', title: 'Crypto' },
  { title: 'Chat' },
];

export default async function ChatPage() {
  const session = await auth();
  const role = session?.user?.role ?? 'user';
  if (role !== 'investor' && role !== 'admin') redirect('/finance');

  return (
    <div className="space-y-6">
      <BreadcrumbComp title="Chat de Traders" items={BCrumb} />
      <ChatModule currentUserId={session!.user.id} />
    </div>
  );
}
