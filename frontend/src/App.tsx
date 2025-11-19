import { useState } from 'react';
import { LayoutDashboard, FileText, Upload, Settings, Menu } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PnLTable from './components/PnLTable';
import FileUpload from './components/FileUpload';
import MappingManager from './components/MappingManager';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pnl':
        return <PnLTable />;
      case 'mappings':
        return <MappingManager />;
      case 'upload':
      default:
        return <FileUpload />;
    }
  };

  const NavItem = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium
        ${activeTab === id
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
      `}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">FC</span>
              FinControl
            </h1>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <NavItem id="upload" label="Upload Data" icon={Upload} />
            <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavItem id="pnl" label="P&L Statement" icon={FileText} />
            <NavItem id="mappings" label="Mappings" icon={Settings} />
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-slate-500 font-medium">System Status</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-slate-700">Online</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 lg:px-8 justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500">
              Financial Control Automation
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                {activeTab === 'upload' && 'Upload Financial Data'}
                {activeTab === 'dashboard' && 'Financial Dashboard'}
                {activeTab === 'pnl' && 'Profit & Loss Statement'}
                {activeTab === 'mappings' && 'Cost Center Mappings'}
              </h2>
              <p className="text-slate-500 mt-1">
                {activeTab === 'upload' && 'Import your Conta Azul CSV export to get started.'}
                {activeTab === 'dashboard' && 'Overview of your key financial metrics and performance.'}
                {activeTab === 'pnl' && 'Detailed breakdown of revenue, costs, and expenses.'}
                {activeTab === 'mappings' && 'Manage how your expenses are categorized.'}
              </p>
            </div>

            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
