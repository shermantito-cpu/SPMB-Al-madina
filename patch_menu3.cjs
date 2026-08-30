const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /<button\s*onClick=\{handleExportExcel\}\s*className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"\s*>\s*<Download size=\{14\} \/> Download Excel \(\.xlsx\)\s*<\/button>/,
  `<div className="relative inline-block">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                <Download size={14} /> Download Excel (.xlsx)
              </button>
              
              {showDownloadMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2 text-xs font-bold text-slate-500 bg-slate-50 border-b border-slate-100">
                    Pilih Jenjang:
                  </div>
                  {['Semua', 'TKA/TPA', 'MDT', 'SMP', 'SMA'].map(j => (
                    <button
                      key={j}
                      onClick={() => {
                        handleExportExcel(j);
                        setShowDownloadMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      {j === 'Semua' ? 'Semua Jenjang' : j}
                    </button>
                  ))}
                </div>
              )}
            </div>`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
