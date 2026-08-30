const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

// 1. Update Props
code = code.replace(
  /export default function AdminDashboard\(\{ onLogout \}: \{ onLogout: \(\) => void \}\) \{/,
  `export default function AdminDashboard({ onLogout, onGoHome }: { onLogout: () => void, onGoHome: () => void }) {`
);

// 2. Add Home Icon import
code = code.replace(
  /import \{ Download, ArrowLeft, Users, CreditCard, Banknote, Filter, RefreshCw, CheckCircle, FileText, Check, Clock, PenTool \} from 'lucide-react';/,
  `import { Home, Download, ArrowLeft, Users, CreditCard, Banknote, Filter, RefreshCw, CheckCircle, FileText, Check, Clock, PenTool } from 'lucide-react';`
);

// 3. Add the "Lihat Website Utama" button
// The existing buttons section is:
/*
          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{loading ? 'Memuat...' : 'Segarkan Data'}</span>
          </button>
        </div>
      </header>
*/

code = code.replace(
  /<button\s*onClick=\{fetchData\}\s*disabled=\{loading\}\s*className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"\s*>\s*<RefreshCw size=\{16\} className=\{loading \? 'animate-spin' : ''\} \/>\s*<span className="hidden sm:inline">\{loading \? 'Memuat\.\.\.' : 'Segarkan Data'\}<\/span>\s*<\/button>\s*<\/div>/,
  `<div className="flex gap-2">
            <button 
              onClick={onGoHome}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Website Utama</span>
            </button>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{loading ? 'Memuat...' : 'Segarkan'}</span>
            </button>
          </div>
        </div>`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
