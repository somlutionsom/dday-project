'use client';

import { useState } from 'react';
import Image from 'next/image';

interface DdayData {
  title: string;
  image: string | null;
  targetDate: string | null;
  pageId: string;
  url: string;
}

interface DdayWidgetProps {
  initialData: DdayData | null;
  cfg: string;
}

export default function DdayWidget({ initialData }: DdayWidgetProps) {
  const [data] = useState<DdayData | null>(initialData);

  const calculateDday = (targetDate: string): string => {
    const target = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (!data || !data.targetDate) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'monospace',
        backgroundColor: '#000'
      }}>
        <p style={{ color: '#666', fontSize: '14px' }}>데이터를 불러오는 중...</p>
      </div>
    );
  }

  const dday = calculateDday(data.targetDate);
  const isToday = dday === 'D-Day';
  const isPast = dday.startsWith('D+');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: '"Courier New", "Pixelated", "monospace"',
      padding: '20px',
      boxSizing: 'border-box',
      imageRendering: 'pixelated'
    }}>
      {/* 이미지 */}
      {data.image && (
        <div style={{
          marginBottom: '30px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(255, 255, 255, 0.1)'
        }}>
          <Image 
            src={data.image} 
            alt={data.title}
            width={300}
            height={200}
            style={{
              maxWidth: '300px',
              maxHeight: '200px',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>
      )}

      {/* 제목 */}
      <h1 style={{
        fontSize: '24px',
        fontWeight: 'normal',
        margin: '0 0 20px 0',
        textAlign: 'center',
        color: '#fff',
        letterSpacing: '1px'
      }}>
        {data.title}
      </h1>

      {/* D-Day */}
      <div style={{
        fontSize: '48px',
        fontWeight: 'bold',
        margin: '20px 0',
        color: isToday ? '#ff6b6b' : isPast ? '#95a5a6' : '#4ecdc4',
        textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        letterSpacing: '2px'
      }}>
        {dday}
      </div>

      {/* 날짜 */}
      <p style={{
        fontSize: '16px',
        color: '#bbb',
        margin: '10px 0',
        letterSpacing: '0.5px'
      }}>
        {formatDate(data.targetDate)}
      </p>

      {/* 링크 */}
      <a 
        href={data.url} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          marginTop: '30px',
          padding: '8px 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          color: '#fff',
          textDecoration: 'none',
          fontSize: '12px',
          letterSpacing: '0.5px',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        Notion에서 보기 →
      </a>
    </div>
  );
}
