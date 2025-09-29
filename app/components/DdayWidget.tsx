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
  const [isRotating, setIsRotating] = useState(false);

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
        background: 'transparent',
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{
          width: '200px',
          background: '#FFFFFF',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          padding: '10px',
          textAlign: 'center' as const
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '107.5px',
            color: '#9E9E9E',
            fontSize: '7px'
          }}>
            이미지 로딩 중...
          </div>
        </div>
      </div>
    );
  }

  const dday = calculateDday(data.targetDate);
  const isToday = dday === 'D-DAY';
  const isPast = dday.startsWith('D+');

  const handleRefresh = () => {
    setIsRotating(true);
    setTimeout(() => {
      window.location.reload();
    }, 300);
    setTimeout(() => {
      setIsRotating(false);
    }, 600);
  };

  return (
    <div style={{
      background: 'transparent',
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif",
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '200px',
        background: '#FFFFFF',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        position: 'relative',
        overflow: 'visible'
      }}>
        {/* 헤더바 */}
        <div style={{
          background: '#CFEBFF',
          height: '36.5px',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '5.5px 11.5px',
          gap: '5px'
        }}>
          <div style={{
            width: '8.5px',
            height: '8.5px',
            borderRadius: '50%',
            background: '#FFFFFF',
            opacity: 0.9,
            transition: 'all 0.15s ease-out'
          }}></div>
          <div style={{
            width: '8.5px',
            height: '8.5px',
            borderRadius: '50%',
            background: '#7FC4ED',
            transition: 'all 0.15s ease-out'
          }}></div>
          <div 
            style={{
              width: '8.5px',
              height: '8.5px',
              borderRadius: '50%',
              background: '#5BB4E8',
              cursor: 'pointer',
              position: 'relative',
              transition: isRotating ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'all 0.15s ease-out',
              transform: isRotating ? 'rotate(360deg)' : 'rotate(0deg)',
              transformOrigin: 'center'
            }}
            onMouseOver={(e) => {
              if (!isRotating) {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.filter = 'brightness(1.1)';
              }
            }}
            onMouseOut={(e) => {
              if (!isRotating) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }
            }}
            onMouseDown={(e) => {
              if (!isRotating) {
                e.currentTarget.style.transform = 'scale(0.95)';
              }
            }}
            onMouseUp={(e) => {
              if (!isRotating) {
                e.currentTarget.style.transform = 'scale(1.15)';
              }
            }}
            onClick={handleRefresh}
          ></div>
        </div>
        
        {/* 컨텐츠 영역 */}
        <div style={{
          padding: '10px',
          position: 'relative'
        }}>
          {/* 이미지 컨테이너 */}
          <div style={{
            width: '100%',
            height: '107.5px',
            background: '#C4C4C4',
            borderRadius: '6px',
            overflow: 'hidden',
            position: 'relative'
          }}>
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
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#9E9E9E',
                fontSize: '14px'
              }}>
                이미지 로딩 중...
              </div>
            )}
          </div>
          
          {/* D-Day 래퍼 (3D 그림자 효과) */}
          <div 
            style={{
              position: 'absolute',
              bottom: '16.5px',
              right: '-30.5px',
              zIndex: 10
            }}
            onMouseOver={(e) => {
              const badge = e.currentTarget.querySelector('[data-badge="true"]') as HTMLElement;
              if (badge) {
                badge.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              const badge = e.currentTarget.querySelector('[data-badge="true"]') as HTMLElement;
              if (badge) {
                badge.style.transform = 'translateY(0)';
              }
            }}
          >
            {/* 그림자 */}
            <div style={{
              position: 'absolute',
              top: '2px',
              left: '1.5px',
              background: isToday ? '#C8F0C6' : isPast ? '#FFD6DA' : '#CADDEE',
              borderRadius: '8px',
              width: '100%',
              height: '100%',
              zIndex: 1
            }}></div>
            
            {/* 메인 배지 */}
            <div 
              data-badge="true"
              style={{
                position: 'relative',
                background: isToday ? '#A8E6A3' : isPast ? '#FFB3BA' : '#9CD5FE',
                border: '0.5px solid #FFFFFF',
                borderRadius: '9.68px',
                padding: '7.26px 14.52px',
                minWidth: '59.29px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                transition: 'transform 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (data.url) {
                  window.open(data.url, '_blank');
                }
              }}
            >
              <span style={{
                color: '#FFFFFF',
                fontSize: '19.36px',
                fontWeight: '900',
                letterSpacing: '-0.3025px',
                lineHeight: 1,
                whiteSpace: 'nowrap'
              }}>
                {dday}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}