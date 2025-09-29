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
    
    if (diffDays === 0) return 'D-DAY';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  if (!data || !data.targetDate) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'transparent'
      }}>
        <p style={{ color: '#999', fontSize: '14px' }}>데이터를 불러오는 중...</p>
      </div>
    );
  }

  const dday = calculateDday(data.targetDate);
  const isToday = dday === 'D-DAY';
  const isPast = dday.startsWith('D+');

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'transparent',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* 브라우저 창 스타일 위젯 */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
        minWidth: '320px',
        width: '400px',
        aspectRatio: '4/3',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* 헤더바 */}
        <div style={{
          backgroundColor: '#B3D9F2',
          height: '32px',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '12px',
          gap: '8px'
        }}>
          {/* 버튼들 */}
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            opacity: 0.8
          }}></div>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#7FC4ED',
            opacity: 0.9
          }}></div>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#5BB4E8',
            cursor: 'pointer',
            transition: 'all 0.15s ease-out'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          ></div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div style={{
          position: 'relative',
          height: 'calc(100% - 32px)',
          margin: '24px',
          backgroundColor: data.image ? 'transparent' : '#C4C4C4',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* 이미지 또는 플레이스홀더 */}
          {data.image ? (
            <Image 
              src={data.image} 
              alt={data.title}
              fill
              style={{
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#C4C4C4',
              opacity: 0.5
            }}></div>
          )}

          {/* D-Day 배지 */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            backgroundColor: isToday ? '#51CF66' : isPast ? '#FF6B6B' : '#5BB4E8',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '18px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(91, 180, 232, 0.25)',
            cursor: 'pointer',
            transition: 'all 0.15s ease-out'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(91, 180, 232, 0.35)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(91, 180, 232, 0.25)';
          }}
          onClick={() => {
            if (data.url) {
              window.open(data.url, '_blank');
            }
          }}
          >
            {dday}
          </div>
        </div>
      </div>
    </div>
  );
}