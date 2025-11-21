import { useState } from 'react';
import { LayoutDashboard, FileText, Upload, Settings, Menu, X, Globe } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PnLTable from './components/PnLTable';
import FileUpload from './components/FileUpload';
import MappingManager from './components/MappingManager';

// Translation Dictionary
const translations = {
  pt: {
    upload: 'Importar Dados',
    dashboard: 'Dashboard',
    pnl: 'DRE Gerencial',
    mappings: 'Mapeamentos',
    systemStatus: 'Status do Sistema',
    online: 'Online',
    currentView: 'Visualização Atual:',
    uploadTitle: 'Importar Dados Financeiros',
    dashboardTitle: 'Dashboard Financeiro',
    pnlTitle: 'Demonstrativo de Resultados',
    mappingsTitle: 'Mapeamento de Custos',
    uploadDesc: 'Importe seu arquivo CSV do Conta Azul para começar.',
    dashboardDesc: 'Visão geral das suas métricas financeiras e desempenho.',
    pnlDesc: 'Detalhamento de receitas, custos e despesas.',
    mappingsDesc: 'Gerencie como suas despesas são categorizadas.',
    autoSync: 'Sincronização Ativa',
    appName: 'FinControl',
    appTagline: 'Automação Financeira'
  },
  en: {
    upload: 'Upload Data',
    dashboard: 'Dashboard',
    pnl: 'P&L Statement',
    mappings: 'Mappings',
    systemStatus: 'System Status',
    online: 'Online',
    currentView: 'Current View:',
    uploadTitle: 'Upload Financial Data',
    dashboardTitle: 'Financial Dashboard',
    pnlTitle: 'Profit & Loss Statement',
    mappingsTitle: 'Cost Center Mappings',
    uploadDesc: 'Import your Conta Azul CSV export to get started.',
    dashboardDesc: 'Overview of your key financial metrics and performance.',
    pnlDesc: 'Detailed breakdown of revenue, costs, and expenses.',
    mappingsDesc: 'Manage how your expenses are categorized.',
    autoSync: 'Auto-sync Active',
    appName: 'FinControl',
    appTagline: 'Financial Automation'
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [language, setLanguage] = useState<'pt' | 'en'>('pt'); // Default to Portuguese

  const t = translations[language];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard language={language} />;
      case 'pnl':
        return <PnLTable language={language} />;
      case 'mappings':
        return <MappingManager language={language} />;
      case 'upload':
      default:
        return <FileUpload language={language} />;
    }
  };

  const NavItem = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm
        ${activeTab === id
          ? 'gradient-primary text-white shadow-lg shadow-cyan-500/20 glow-cyan'
          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}
      `}
    >
      <Icon size={20} className={activeTab === id ? 'animate-pulse' : ''} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex font-sans bg-black overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 glass-strong border-r border-white/10
          transform transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo & Brand */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/30 glow-cyan">
                  FC
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient-primary">{t.appName}</h1>
                  <p className="text-xs text-gray-500">{t.appTagline}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-dark">
            <NavItem id="upload" label={t.upload} icon={Upload} />
            <NavItem id="dashboard" label={t.dashboard} icon={LayoutDashboard} />
            <NavItem id="pnl" label={t.pnl} icon={FileText} />
            <NavItem id="mappings" label={t.mappings} icon={Settings} />
          </nav>

          {/* System Status */}
          <div className="p-4 border-t border-white/10">
            <div className="glass bg-white/5 p-4 rounded-xl">
              <p className="text-xs font-medium text-gray-400 mb-2">{t.systemStatus}</p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
                </span>
                <span className="text-sm font-medium text-emerald-400">{t.online}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="glass-strong border-b border-white/10 h-16 flex items-center px-6 lg:px-8 justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>

            <div className="hidden lg:flex items-center gap-2 text-sm">
              <span className="text-gray-500">{t.currentView}</span>
              <span className="text-cyan-400 font-semibold">
                {activeTab === 'upload' && t.uploadTitle}
                {activeTab === 'dashboard' && t.dashboardTitle}
                {activeTab === 'pnl' && t.pnlTitle}
                {activeTab === 'mappings' && t.mappingsTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
              className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg hover:bg-white/10 transition-colors text-sm text-gray-300"
            >
              <Globe size={16} className="text-cyan-400" />
              <span>{language === 'pt' ? 'PT' : 'EN'}</span>
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 glass rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-xs text-gray-400">{t.autoSync}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 lg:p-8 scrollbar-dark">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                {activeTab === 'upload' && t.uploadTitle}
                {activeTab === 'dashboard' && t.dashboardTitle}
                {activeTab === 'pnl' && t.pnlTitle}
                {activeTab === 'mappings' && t.mappingsTitle}
              </h2>
              <p className="text-gray-400">
                {activeTab === 'upload' && t.uploadDesc}
                {activeTab === 'dashboard' && t.dashboardDesc}
                {activeTab === 'pnl' && t.pnlDesc}
                {activeTab === 'mappings' && t.mappingsDesc}
              </p>
            </div>

            {/* Dynamic Content */}
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
