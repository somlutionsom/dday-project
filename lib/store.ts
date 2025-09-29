import crypto from 'crypto';

interface ConfigData {
  token: string;
  dbId: string;
  imageProp: string;
  dateProp: string;
  createdAt: Date;
}

// Vercel에서는 파일 시스템 대신 메모리 저장소 사용
const configStore = new Map<string, ConfigData>();

export function generateCfg(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function saveConfig(cfg: string, data: ConfigData): void {
  console.log(`Saving config for cfg: ${cfg}`, data);
  
  try {
    configStore.set(cfg, data);
    console.log(`Config saved to memory store. Store size: ${configStore.size}`);
  } catch (error) {
    console.error('Error saving config:', error);
    throw new Error('Failed to save config');
  }
}

export function getConfig(cfg: string): ConfigData | null {
  console.log(`Getting config for cfg: ${cfg}`);
  
  try {
    const config = configStore.get(cfg);
    
    if (!config) {
      console.log(`Config not found in memory store`);
      return null;
    }
    
    console.log(`Config loaded from memory store`);
    return config;
  } catch (error) {
    console.error('Error loading config:', error);
    return null;
  }
}

export function deleteConfig(cfg: string): boolean {
  try {
    const deleted = configStore.delete(cfg);
    console.log(`Config deleted from memory store: ${deleted}`);
    return deleted;
  } catch (error) {
    console.error('Error deleting config:', error);
    return false;
  }
}
