'use client';

import { useState } from 'react';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [databases, setDatabases] = useState<Array<{ id: string; title: string; icon?: string }>>([]);
  const [dbUrl, setDbUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTokenSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/databases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const dbs = await res.json();
        setDatabases(dbs);
        
        if (dbs.length === 1) {
          await handleDbSelect(dbs[0].id);
        } else {
          setStep(2);
        }
      } else {
        setError('토큰이 유효하지 않습니다.');
      }
    } catch {
      setError('연결 실패. 다시 시도해주세요.');
    }
    setLoading(false);
  };

  const handleDbSelect = async (dbId: string) => {
    setLoading(true);
    setError('');
    try {
      console.log('DB Selected:', dbId);
      
      await handleFinalSubmit(dbId, 'Image', 'Target Date');
    } catch {
      setError('설정 실패');
    }
    setLoading(false);
  };

  const handleDbUrlPaste = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/database-from-url', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: dbUrl })
      });
      
      if (res.ok) {
        const db = await res.json();
        await handleDbSelect(db.id);
      } else {
        const errorData = await res.json();
        setError(errorData.error || '데이터베이스 접근 실패');
      }
    } catch {
      setError('데이터베이스 접근 실패. URL과 토큰 권한을 확인해주세요.');
    }
    
    setLoading(false);
  };

  const handleFinalSubmit = async (dbId?: string, imageCol?: string, dateCol?: string) => {
    const finalDbId = dbId || '';
    const finalImageProp = imageCol || 'Image';
    const finalDateProp = dateCol || 'Target Date';
    
    console.log('Final submit with:', { finalDbId, finalImageProp, finalDateProp });
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          dbId: finalDbId,
          imageProp: finalImageProp,
          dateProp: finalDateProp
        })
      });
      const data = await res.json();
      if (data.ok) {
        setEmbedUrl(data.embedUrl);
        setStep(4);
      } else {
        setError(data.error || '설정 저장 실패');
      }
    } catch {
      setError('설정 저장 실패');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>D-Day 위젯 설정</h1>
      
      {step === 1 && (
        <div>
          <h2>1단계: Notion API 토큰 입력</h2>
          <p>Notion에서 생성한 API 토큰을 입력하세요.</p>
          <input 
            type="password" 
            placeholder="ntn_으로 시작하는 토큰"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button 
            onClick={handleTokenSubmit}
            disabled={!token || loading}
            style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            {loading ? '확인 중...' : '다음'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>2단계: 데이터베이스 선택</h2>
          {databases.length > 0 ? (
            <div>
              <p>사용할 데이터베이스를 선택하세요:</p>
              {databases.map((db) => (
                <div 
                  key={db.id} 
                  onClick={() => handleDbSelect(db.id)}
                  style={{ 
                    border: '1px solid #ddd', 
                    padding: '10px', 
                    margin: '5px 0', 
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  {db.icon && <span style={{ marginRight: '8px' }}>{db.icon}</span>}
                  {db.title}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p>데이터베이스가 없거나 접근 권한이 없습니다. URL을 직접 입력해주세요:</p>
              <input 
                type="text" 
                placeholder="https://notion.so/..."
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              <button 
                onClick={handleDbUrlPaste}
                disabled={!dbUrl || loading}
                style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                {loading ? '확인 중...' : '연결'}
              </button>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div>
          <h2>설정 완료!</h2>
          <p>위젯이 생성되었습니다. 아래 URL을 사용하세요:</p>
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '4px', 
            wordBreak: 'break-all',
            marginBottom: '15px'
          }}>
            <a href={embedUrl} target="_blank" rel="noopener noreferrer">
              {embedUrl}
            </a>
          </div>
          <button 
            onClick={() => window.open(embedUrl, '_blank')}
            style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            위젯 보기
          </button>
        </div>
      )}

      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffe6e6', 
          padding: '10px', 
          borderRadius: '4px', 
          marginTop: '10px' 
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
