import { fetchDdayItem } from '@/lib/notion';
import DdayWidget from '@/app/components/DdayWidget';

export default async function WidgetPage({ params }: { params: Promise<{ cfg: string }> }) {
  let initialData = null;
  let error = null;
  
  const { cfg } = await params;
  
  try {
    initialData = await fetchDdayItem(cfg);
  } catch (e) {
    error = '데이터를 불러올 수 없습니다.';
  }
  
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'system-ui'
      }}>
        <p style={{ color: '#999' }}>{error}</p>
      </div>
    );
  }
  
  return <DdayWidget initialData={initialData} cfg={cfg} />;
}
