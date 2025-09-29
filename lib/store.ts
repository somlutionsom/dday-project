import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

interface ConfigData {
  token: string;
  dbId: string;
  imageProp: string;
  dateProp: string;
  createdAt: Date;
}

const STORAGE_DIR = path.join(process.cwd(), 'data');

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

export function generateCfg(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function saveConfig(cfg: string, data: ConfigData): void {
  console.log(`Saving config for cfg: ${cfg}`, data);
  
  try {
    ensureStorageDir();
    const filePath = path.join(STORAGE_DIR, `${cfg}.json`);
    
    const saveData = {
      ...data,
      createdAt: data.createdAt.toISOString()
    };
    
    fs.writeFileSync(filePath, JSON.stringify(saveData, null, 2));
    console.log(`Config saved to file: ${filePath}`);
  } catch (error) {
    console.error('Error saving config:', error);
    throw new Error('Failed to save config');
  }
}

export function getConfig(cfg: string): ConfigData | null {
  console.log(`Getting config for cfg: ${cfg}`);
  
  try {
    const filePath = path.join(STORAGE_DIR, `${cfg}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`Config file not found: ${filePath}`);
      return null;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    const config: ConfigData = {
      ...data,
      createdAt: new Date(data.createdAt)
    };
    
    console.log(`Config loaded from file: ${filePath}`);
    return config;
  } catch (error) {
    console.error('Error loading config:', error);
    return null;
  }
}

export function deleteConfig(cfg: string): boolean {
  try {
    const filePath = path.join(STORAGE_DIR, `${cfg}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Config file deleted: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting config:', error);
    return false;
  }
}
