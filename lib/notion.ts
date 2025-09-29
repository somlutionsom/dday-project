import { Client } from '@notionhq/client';
import { getConfig } from './store';

export async function validateToken(token: string): Promise<boolean> {
  try {
    const notion = new Client({ auth: token });
    // 간단한 API 호출로 토큰 유효성 검증
    await notion.search({ page_size: 1 });
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
              databases.push({
                id: db.id,
                title: db.title.length > 0 
                  ? (db.title[0].type === 'text' ? db.title[0].text.content : db.id)
                  : db.id,
                icon: db.icon?.type === 'emoji' ? db.icon.emoji : null
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
    
    return {
      id: db.id,
      title: db.title.length > 0 
        ? (db.title[0].type === 'text' ? db.title[0].text.content : db.id)
        : db.id,
      icon: db.icon?.type === 'emoji' ? db.icon.emoji : null
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
    // 최근 수정된 아이템 1개 조회
    const response = await notion.databases.query({
      database_id: config.dbId,
      page_size: 1,
      sorts: [{ property: 'last_edited_time', direction: 'descending' }]
    });

    if (response.results.length === 0) {
      throw new Error('No items found in database');
    }

    const page = response.results[0];
    const properties = 'properties' in page ? page.properties : {};

    // 이미지 속성 가져오기
    let image = null;
    const imageProperty = properties[config.imageProp];
    if (imageProperty && imageProperty.type === 'files' && imageProperty.files.length > 0) {
      const file = imageProperty.files[0];
      if (file.type === 'file') {
        image = file.file.url;
      } else if (file.type === 'external') {
        image = file.external.url;
      }
    }

    // 날짜 속성 가져오기
    let targetDate = null;
    const dateProperty = properties[config.dateProp];
    if (dateProperty && dateProperty.type === 'date' && dateProperty.date) {
      targetDate = dateProperty.date.start;
    }

    // 제목 가져오기
    let title = 'Untitled';
    if ('properties' in page) {
      const titleProperty = Object.values(page.properties).find((prop: unknown) => {
        return typeof prop === 'object' && prop !== null && 'type' in prop && prop.type === 'title';
      });
      if (titleProperty && typeof titleProperty === 'object' && titleProperty !== null && 
          'type' in titleProperty && titleProperty.type === 'title' && 
          'title' in titleProperty && Array.isArray(titleProperty.title) && 
          titleProperty.title.length > 0 && titleProperty.title[0].plain_text) {
        title = titleProperty.title[0].plain_text;
      }
    }

    return {
      title,
      image,
      targetDate,
      pageId: page.id,
      url: page.url
    };
  } catch (error) {
    console.error('Error fetching D-Day item:', error);
    throw error;
  }
}
