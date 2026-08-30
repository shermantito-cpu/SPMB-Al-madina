const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

const chartUI = `
        {/* Grafik Pendaftar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h3 className="text-xl font-bold text-slate-800">Grafik Pendaftar Berdasarkan Jenjang</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['Harian', 'Pekanan', 'Keseluruhan'].map(period => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={\`px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors \${
                    chartPeriod === period 
                      ? 'bg-white text-emerald-700 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }\`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-72 sm:h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} name="Total Pendaftar" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metode Pembayaran */}`;

code = code.replace(
  "{/* Metode Pembayaran */}",
  chartUI
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
