const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

const JENJANG_OPTIONS = [
  { label: 'Semua Jenjang', value: 'Semua', filterKey: 'Semua' },
  { label: 'Salafiyah Ulya (SMA)', value: 'Ulya', filterKey: 'Ulya' },
  { label: 'Salafiyah Wustho (SMP)', value: 'Wustho', filterKey: 'Wustho' },
  { label: 'Salafiyah Ula (SD)', value: 'Ula', filterKey: 'Ula' },
  { label: 'Tadribud Du\'at/Ma\'had Aly (D3/S1)', value: 'Aly', filterKey: 'Aly' },
  { label: 'Raudhatul Athfal (RA/TK)', value: 'RA', filterKey: 'Raudhatul' }
];

// First, fix the handleExportExcel dropdown items
code = code.replace(
  /\{showDownloadMenu && \([\s\S]*?<\/div>\s*\)\}/,
  `{showDownloadMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2 text-xs font-bold text-slate-500 bg-slate-50 border-b border-slate-100">
                    Pilih Jenjang:
                  </div>
                  {[
                    { label: 'Semua Jenjang', value: 'Semua' },
                    { label: 'Salafiyah Ulya (SMA)', value: 'Ulya' },
                    { label: 'Salafiyah Wustho (SMP)', value: 'Wustho' },
                    { label: 'Salafiyah Ula (SD)', value: 'Ula' },
                    { label: 'Tadribud Du\\'at/Ma\\'had Aly (D3/S1)', value: 'Aly' },
                    { label: 'Raudhatul Athfal (RA/TK)', value: 'Raudhatul' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        handleExportExcel(opt.value);
                        setShowDownloadMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}`
);

// Second, fix the main filterJenjang select options
code = code.replace(
  /<select\s*value=\{filterJenjang\}[\s\S]*?<\/select>/,
  `<select 
            value={filterJenjang} 
            onChange={(e) => setFilterJenjang(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 font-medium shadow-sm"
          >
            <option value="Semua">Semua Jenjang</option>
            <option value="Ulya">Salafiyah Ulya (SMA)</option>
            <option value="Wustho">Salafiyah Wustho (SMP)</option>
            <option value="Ula">Salafiyah Ula (SD)</option>
            <option value="Aly">Tadribud Du'at/Ma'had Aly (D3/S1)</option>
            <option value="Raudhatul">Raudhatul Athfal (RA/TK)</option>
          </select>`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
