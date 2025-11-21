import { useState, useEffect } from 'react';
import { LayoutDashboard, Upload, FileSpreadsheet, Settings, LogOut, Menu, Globe, X } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import PnLTable from './components/PnLTable';
import MappingManager from './components/MappingManager';
import Login from './components/Login';

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
    appTagline: 'Automação Financeira',
    nav: {
      upload: 'Importar',
      dashboard: 'Dashboard',
      pnl: 'DRE',
      mappings: 'Mapeamentos'
    }
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
    appTagline: 'Financial Automation',
    nav: {
      upload: 'Upload',
      dashboard: 'Dashboard',
      pnl: 'P&L',
      mappings: 'Mappings'
    }
  }
};

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'dashboard' | 'pnl' | 'mappings'>('upload');
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setActiveTab('upload');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const t = translations[language];

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <FileUpload language={language} />;
      case 'dashboard':
        return <Dashboard language={language} />;
      case 'pnl':
        return <PnLTable language={language} />;
      case 'mappings':
        return <MappingManager language={language} />;
      default:
        return <FileUpload language={language} />;
    }
  };

  const NavItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === id
        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-white/10 shadow-lg shadow-cyan-500/10'
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
    >
      <Icon size={20} className={`transition-colors ${activeTab === id ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
      <span className="font-medium">{label}</span>
      {activeTab === id && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
      )}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#0B1120] text-white overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Sidebar */}
      <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0f172a]/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Finance AI
                </h1>
                <p className="text-xs text-gray-500 mt-1 tracking-wider uppercase">Control & Analytics</p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-dark">
            <NavItem id="upload" label={t.nav.upload} icon={Upload} />
            <NavItem id="dashboard" label={t.nav.dashboard} icon={LayoutDashboard} />
            <NavItem id="pnl" label={t.nav.pnl} icon={FileSpreadsheet} />
            <NavItem id="mappings" label={t.nav.mappings} icon={Settings} />
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
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
            <button
              onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
              className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg hover:bg-white/10 transition-colors text-sm text-gray-300"
            >
              <Globe size={16} className="text-cyan-400" />
              <span>{language === 'pt' ? 'PT' : 'EN'}</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 lg:p-8 scrollbar-dark">
          <div className="max-w-7xl mx-auto">
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

            {renderContent()}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 right-0 p-2 pointer-events-none z-50">
        <p className="text-[7px] text-gray-400 font-light">
          Ferramenta construída pelo Especialista Financeiro Matheus Castro. Todos os direitos reservados ©
        </p>
      </footer>
    </div>
  );
}

export default App;
