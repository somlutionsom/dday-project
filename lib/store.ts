import crypto from 'crypto';

interface ConfigData {
  token: string;
  dbId: string;
  imageProp: string;
  dateProp: string;
  colorProp: string;
  createdAt: Date;
}

export function generateCfg(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Vercel 서버리스 환경에서는 URL 기반 인코딩 사용
export function encodeConfig(data: ConfigData): string {
  const configString = JSON.stringify({
    token: data.token,
    dbId: data.dbId,
    imageProp: data.imageProp,
    dateProp: data.dateProp,
    colorProp: data.colorProp
  });
  return Buffer.from(configString).toString('base64url');
}

export function decodeConfig(encoded: string): ConfigData | null {
  try {
    const configString = Buffer.from(encoded, 'base64url').toString();
    const config = JSON.parse(configString);
    
    return {
      token: config.token,
      dbId: config.dbId,
      imageProp: config.imageProp,
      dateProp: config.dateProp,
      colorProp: config.colorProp || 'Color',
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error decoding config:', error);
    return null;
  }
}

export function saveConfig(): void {
  // URL 기반이므로 실제 저장은 불필요
  console.log(`Config prepared for URL encoding`);
}

export function getConfig(cfg: string): ConfigData | null {
  console.log(`Decoding config from: ${cfg}`);
  return decodeConfig(cfg);
}
