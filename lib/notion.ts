import { Client } from '@notionhq/client';
import { getConfig } from './store';

export async function validateToken(token: string): Promise<boolean> {
  try {
    // 단순히 토큰 형식만 검증 (실제 API 호출 없이)
    if (!token || !token.startsWith('ntn_') || token.length < 50) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function listDatabases(token: string) {
  const notion = new Client({ auth: token });
  
  try {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
      page_size: 100
    });

    const databases = [];
    const processedDbIds = new Set();

    for (const page of response.results) {
      if (page.object === 'page') {
        try {
          const pageDetails = await notion.pages.retrieve({ page_id: page.id });
          
          if ('parent' in pageDetails && pageDetails.parent.type === 'database_id') {
            const dbId = pageDetails.parent.database_id;
            
            if (processedDbIds.has(dbId)) continue;
            processedDbIds.add(dbId);
            
            try {
              const db = await notion.databases.retrieve({ database_id: dbId });
              const dbTitle = 'title' in db && Array.isArray(db.title) && db.title.length > 0
                ? (db.title[0].type === 'text' ? db.title[0].text.content : db.id)
                : db.id;
              
              databases.push({
                id: db.id,
                title: dbTitle,
                icon: 'icon' in db && db.icon?.type === 'emoji' ? db.icon.emoji : null
              });
            } catch {
              continue;
            }
          }
        } catch {
          continue;
        }
      }
    }

    console.log(`Found ${databases.length} databases`);
    
    if (databases.length === 0) {
      console.log('No databases found. User should input database URL directly.');
    }
    
    return databases;
  } catch (error) {
    console.error('Error listing databases:', error);
    return [];
  }
}

export async function getDatabaseFromUrl(token: string, url: string) {
  const notion = new Client({ auth: token });
  
  try {
    let dbId = null;
    const patterns = [
      /notion\.so\/[^\/]+\/([a-f0-9]{32})/,
      /notion\.so\/([a-f0-9]{32})/,
      /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/,
      /([a-f0-9]{32})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        dbId = match[1];
        break;
      }
    }
    
    if (!dbId) {
      throw new Error('Invalid Notion database URL');
    }
    
    const db = await notion.databases.retrieve({ database_id: dbId });
    
    const dbTitle = 'title' in db && Array.isArray(db.title) && db.title.length > 0
      ? (db.title[0].type === 'text' ? db.title[0].text.content : db.id)
      : db.id;
    
    return {
      id: db.id,
      title: dbTitle,
      icon: 'icon' in db && db.icon?.type === 'emoji' ? db.icon.emoji : null
    };
  } catch (error) {
    console.error('Error getting database from URL:', error);
    throw new Error('Failed to access database. Please check the URL and API token permissions.');
  }
}

export async function fetchDdayItem(cfg: string) {
  console.log(`Fetching D-Day item for cfg: ${cfg}`);
  
  const config = getConfig(cfg);
  if (!config) {
    console.log(`Configuration not found for cfg: ${cfg}`);
    throw new Error('Configuration not found');
  }

  console.log(`Config found: {
    dbId: '${config.dbId}',
    imageProp: '${config.imageProp}',
    dateProp: '${config.dateProp}'
  }`);

  const notion = new Client({ auth: config.token });

  try {
    // Notion API의 올바른 데이터베이스 쿼리 방식
    const response = await (notion as unknown as {
      databases: {
        query: (params: {
          database_id: string;
          page_size: number;
          sorts: Array<{ property: string; direction: string }>;
        }) => Promise<{ results: Array<unknown> }>;
      };
    }).databases.query({
      database_id: config.dbId,
      page_size: 1,
      sorts: [{ property: 'last_edited_time', direction: 'descending' }]
    });

    if (response.results.length === 0) {
      throw new Error('No items found in database');
    }

    const page = response.results[0] as Record<string, unknown>;
    const properties = 'properties' in page && typeof page.properties === 'object' && page.properties !== null 
      ? page.properties as Record<string, unknown>
      : {};

    // 이미지 속성 가져오기 - 안전한 타입 체크
    let image = null;
    const imageProperty = properties[config.imageProp] as unknown;
    if (typeof imageProperty === 'object' && imageProperty !== null) {
      const prop = imageProperty as Record<string, unknown>;
      if (prop.type === 'files' && Array.isArray(prop.files) && prop.files.length > 0) {
        const file = prop.files[0] as Record<string, unknown>;
        if (file?.type === 'file' && typeof file.file === 'object' && file.file !== null) {
          const fileObj = file.file as Record<string, unknown>;
          if (typeof fileObj.url === 'string') {
            image = fileObj.url;
          }
        } else if (file?.type === 'external' && typeof file.external === 'object' && file.external !== null) {
          const externalObj = file.external as Record<string, unknown>;
          if (typeof externalObj.url === 'string') {
            image = externalObj.url;
          }
        }
      }
    }

    // 날짜 속성 가져오기 - 안전한 타입 체크
    let targetDate = null;
    const dateProperty = properties[config.dateProp] as unknown;
    if (typeof dateProperty === 'object' && dateProperty !== null) {
      const prop = dateProperty as Record<string, unknown>;
      if (prop.type === 'date' && typeof prop.date === 'object' && prop.date !== null) {
        const dateObj = prop.date as Record<string, unknown>;
        if (typeof dateObj.start === 'string') {
          targetDate = dateObj.start;
        }
      }
    }

    // 제목 가져오기 - 간단하게 처리
    let title = 'Untitled';
    if ('properties' in page && typeof page.properties === 'object' && page.properties !== null) {
      const props = page.properties as Record<string, unknown>;
      for (const prop of Object.values(props)) {
        if (typeof prop === 'object' && prop !== null && 
            'type' in prop && prop.type === 'title' &&
            'title' in prop && Array.isArray(prop.title) && 
            prop.title.length > 0) {
          const titleItem = prop.title[0] as { plain_text?: string };
          if (titleItem.plain_text) {
            title = titleItem.plain_text;
            break;
          }
        }
      }
    }

    return {
      title,
      image,
      targetDate,
      pageId: String(page.id || ''),
      url: String(page.url || '')
    };
  } catch (error) {
    console.error('Error fetching D-Day item:', error);
    throw error;
  }
}
