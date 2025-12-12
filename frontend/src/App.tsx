import { useState } from 'react';
import { LayoutDashboard, Upload, FileSpreadsheet, Settings, LogOut, Menu, Globe, X } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import PnLTable from './components/PnLTable';
import MappingManager from './components/MappingManager';
// import Login from './components/Login';

const translations = {
  import { motion, AnimatePresence } from 'framer-motion';

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
const [isSidebarOpen, setIsSidebarOpen] = useState(false);

const handleLogout = () => {
  // Logout disabled since login is disabled
  localStorage.removeItem('token');
  window.location.reload();
};

// TEMPORARILY DISABLED FOR DEPLOYMENT TESTING
// if (!isAuthenticated) {
//   return <Login onLogin={handleLogin} />;
// }

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
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${activeTab === id
      ? 'text-white shadow-[0_0_20px_rgba(6,182,212,0.15)]'
      : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
  >
    {activeTab === id && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-white/10 rounded-xl"
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
    <div className="relative z-10 flex items-center gap-3">
      <Icon size={20} className={`transition-colors ${activeTab === id ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
      <span className="font-medium">{label}</span>
    </div>
    {activeTab === id && (
      <motion.div
        layoutId="activeIndicator"
        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
      />
    )}
  </button>
);

return (
  <div className="flex h-screen bg-[#0B1120] text-white overflow-hidden font-sans selection:bg-cyan-500/30 relative">
    {/* Ambient Background Effects */}
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
    </div>

    {/* Sidebar */}
    <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0f172a]/80 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 p-1">
                <img src="/logo.webp" alt="UMatch" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  UMatch
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Control & Analytics</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-none">
          <NavItem id="upload" label={t.nav.upload} icon={Upload} />
          <NavItem id="dashboard" label={t.nav.dashboard} icon={LayoutDashboard} />
          <NavItem id="pnl" label={t.nav.pnl} icon={FileSpreadsheet} />
          <NavItem id="mappings" label={t.nav.mappings} icon={Settings} />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>

    {/* Mobile Overlay */}
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </AnimatePresence>

    {/* Main Content */}
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
      {/* Header */}
      <header className="h-20 flex items-center px-6 lg:px-8 justify-between bg-[#0B1120]/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>

          <div className="hidden lg:flex items-center gap-3 text-sm">
            <span className="text-slate-500 font-medium">{t.currentView}</span>
            <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold text-xs uppercase tracking-wide">
              {activeTab === 'upload' && t.uploadTitle}
              {activeTab === 'dashboard' && t.dashboardTitle}
              {activeTab === 'pnl' && t.pnlTitle}
              {activeTab === 'mappings' && t.mappingsTitle}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-sm text-slate-300 hover:text-white"
          >
            <Globe size={16} className="text-cyan-400" />
            <span>{language === 'pt' ? 'PT' : 'EN'}</span>
          </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-3 tracking-tight">
              {activeTab === 'upload' && t.uploadTitle}
              {activeTab === 'dashboard' && t.dashboardTitle}
              {activeTab === 'pnl' && t.pnlTitle}
              {activeTab === 'mappings' && t.mappingsTitle}
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              {activeTab === 'upload' && t.uploadDesc}
              {activeTab === 'dashboard' && t.dashboardDesc}
              {activeTab === 'pnl' && t.pnlDesc}
              {activeTab === 'mappings' && t.mappingsDesc}
            </p>
          </motion.div>

          {renderContent()}
        </div>
      </div>
    </main>

    {/* Footer */}
    <footer className="fixed bottom-4 right-6 pointer-events-none z-50 opacity-50 hover:opacity-100 transition-opacity">
      <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
        POWERED BY FINANCE SPECIALIST CASTRO M. All Rights Reserved.
      </p>
    </footer>
  </div>
);
}

export default App;
