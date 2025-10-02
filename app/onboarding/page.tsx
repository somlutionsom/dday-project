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
        
        // DB가 있으면 무조건 선택 화면으로 이동
        setStep(2);
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
      
      await handleFinalSubmit(dbId, 'Image', 'Target Date', 'Color');
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

  const handleFinalSubmit = async (dbId?: string, imageCol?: string, dateCol?: string, colorCol?: string) => {
    const finalDbId = dbId || '';
    const finalImageProp = imageCol || 'Image';
    const finalDateProp = dateCol || 'Target Date';
    const finalColorProp = colorCol || 'Color';
    
    console.log('Final submit with:', { finalDbId, finalImageProp, finalDateProp, finalColorProp });
    
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
          dateProp: finalDateProp,
          colorProp: finalColorProp
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
          
          <details style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <summary style={{ 
              cursor: 'pointer', 
              fontWeight: 'bold', 
              fontSize: '15px',
              color: '#495057',
              marginBottom: '10px'
            }}>
              📖 API 토큰 생성 및 연결 방법
            </summary>
            <div style={{ 
              marginTop: '15px', 
              fontSize: '14px', 
              lineHeight: '1.6',
              color: '#495057'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '15px', marginBottom: '8px' }}>
                1️⃣ API 토큰 생성하기
              </h3>
              <ol style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                <li style={{ marginBottom: '5px' }}>
                  <a 
                    href="https://www.notion.so/my-integrations" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#0070f3', textDecoration: 'underline' }}
                  >
                    https://www.notion.so/my-integrations
                  </a> 접속
                </li>
                <li style={{ marginBottom: '5px' }}><strong>"New integration"</strong> 버튼 클릭</li>
                <li style={{ marginBottom: '5px' }}>원하는 이름 입력 (예: "D-Day Widget")</li>
                <li style={{ marginBottom: '5px' }}>사용할 워크스페이스 선택</li>
                <li style={{ marginBottom: '5px' }}><strong>"Submit"</strong> 버튼 클릭</li>
                <li style={{ marginBottom: '5px' }}><strong>"Internal Integration Token"</strong> 복사 (ntn_으로 시작)</li>
              </ol>

              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '15px', marginBottom: '8px' }}>
                2️⃣ DB 페이지에 API 연결하기
              </h3>
              <ol style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                <li style={{ marginBottom: '5px' }}>위젯으로 사용할 <strong>Notion DB 페이지</strong> 열기</li>
                <li style={{ marginBottom: '5px' }}>페이지 우측 상단 <strong>"⋯"</strong> (더보기) 버튼 클릭</li>
                <li style={{ marginBottom: '5px' }}><strong>"Add connections"</strong> 선택</li>
                <li style={{ marginBottom: '5px' }}>방금 생성한 Integration 이름 찾아서 <strong>"Connect"</strong> 클릭</li>
              </ol>

              <div style={{ 
                backgroundColor: '#fff3cd', 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #ffc107',
                marginTop: '10px'
              }}>
                <strong>💡 중요:</strong> DB에 API를 연결하지 않으면 위젯이 작동하지 않습니다!
              </div>
            </div>
          </details>

          <input 
            type="password" 
            placeholder="ntn_으로 시작하는 토큰"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginBottom: '10px',
              border: '2px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button 
            onClick={handleTokenSubmit}
            disabled={!token || loading}
            style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: token ? 'pointer' : 'not-allowed' }}
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
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  marginBottom: '10px',
                  border: '2px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
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
