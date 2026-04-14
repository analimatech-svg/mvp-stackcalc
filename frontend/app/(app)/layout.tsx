import Link from 'next/link';
import { MessageSquare, BarChart3, Settings } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-14 flex flex-col items-center py-4 gap-4 bg-gray-900 border-r border-gray-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          S
        </div>
        <nav className="flex flex-col gap-2 mt-4">
          <Link
            href="/sessions"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
            title="Sessões"
          >
            <MessageSquare size={18} />
          </Link>
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
            title="Dashboard"
          >
            <BarChart3 size={18} />
          </Link>
          <Link
            href="/admin"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
            title="Configurações"
          >
            <Settings size={18} />
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
