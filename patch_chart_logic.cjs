const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

const chartLogic = `
  // Chart Data Calculation
  const getChartData = () => {
    const now = new Date();
    
    // Helper to check if a date is within a timeframe
    const isWithinPeriod = (dateStr: string, period: string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      
      if (period === 'Keseluruhan') return true;
      
      if (period === 'Harian') {
        return d.getDate() === now.getDate() && 
               d.getMonth() === now.getMonth() && 
               d.getFullYear() === now.getFullYear();
      }
      
      if (period === 'Pekanan') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return d >= oneWeekAgo && d <= now;
      }
      return true;
    };

    // Filter by period
    const periodData = data.filter(d => isWithinPeriod(d.createdAt, chartPeriod));
    
    // Group by Jenjang
    const getCount = (jKey: string) => periodData.filter(d => (d.jenjangName || d.jenjang || '').toLowerCase().includes(jKey)).length;
    
    return [
      { name: 'RA (TK)', total: getCount('ra') || getCount('raudhatul') },
      { name: 'Ula (SD)', total: getCount('ula') },
      { name: 'Wustho (SMP)', total: getCount('wustho') },
      { name: 'Ulya (SMA)', total: getCount('ulya') },
      { name: 'Ma\\'had Aly', total: getCount('aly') }
    ];
  };
  
  const chartData = getChartData();
`;

code = code.replace(
  "const getCountByJenjang = (j: string) => data.filter(d => (d.jenjangName || d.jenjang || '').toLowerCase().includes(j.toLowerCase()) && (d.statusVerifikasi || '').toLowerCase().includes('terverifikasi')).length;",
  "const getCountByJenjang = (j: string) => data.filter(d => (d.jenjangName || d.jenjang || '').toLowerCase().includes(j.toLowerCase()) && (d.statusVerifikasi || '').toLowerCase().includes('terverifikasi')).length;\n" + chartLogic
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
