# OpenAsset Integration Guide

**Source:** Extracted from Pfluger-Vision project (January 2026)
**Target:** Repository Research Platform
**Purpose:** Pull project images and metadata automatically from Pfluger's Digital Asset Management system

---

## Table of Contents

1. [Overview](#overview)
2. [What is OpenAsset](#what-is-openasset)
3. [API Authentication](#api-authentication)
4. [API Structure](#api-structure)
5. [Field Mappings](#field-mappings)
6. [API Client Code](#api-client-code)
7. [Write Operations](#write-operations-upload-update-delete)
8. [Advanced Features](#advanced-features)
9. [Research Platform Use Cases](#research-platform-use-cases)
10. [Utility Scripts](#utility-scripts)
11. [Environment Setup](#environment-setup)
12. [Integration Patterns](#integration-patterns)
13. [Usage Examples](#usage-examples)
14. [Next Steps for Repository](#next-steps-for-repository)

---

## Overview

OpenAsset is Pfluger's Digital Asset Management (DAM) system that stores:
- Project images and renderings
- Project metadata (client, office, dates, costs)
- Keywords and tags
- Photographer information
- Copyright data

**Current Status:**
- ✅ **Vision (BD Tool):** Active integration, syncs project metadata and image counts
- ⏳ **Repository (Research Platform):** Planned integration to replace Unsplash placeholders

**API Access:**
- Base URL: Stored in environment variable
- Authentication: OATU token format
- Users: `AW@pfluger`, `LS@pfluger`
- Cost: Included in Pfluger's OpenAsset license

---

## What is OpenAsset

OpenAsset is an enterprise DAM platform used by architecture firms to:
- Store and organize project photography
- Tag assets with keywords for searchability
- Manage copyright and photographer credits
- Link images to specific projects
- Generate reports on asset usage

**For Repository Integration:**
- **READ:** Automatic image retrieval for research projects
- **READ:** Sync project metadata (dates, descriptions, costs)
- **READ:** Track image availability per project
- **WRITE:** Upload research images directly to OpenAsset
- **WRITE:** Tag images with research project IDs and categories
- **WRITE:** Update captions and photographer credits
- **WRITE:** Create albums to organize research images
- **WRITE:** Manage keywords and metadata
- **DELETE:** Remove draft or outdated images

---

## API Authentication

OpenAsset uses **OATU (OpenAsset Token Authentication)** format:

```javascript
const authHeader = `OATU ${OPENASSET_TOKEN_ID}:${OPENASSET_TOKEN_STRING}`;

const response = await fetch(`${OPENASSET_BASE_URL}/Projects`, {
  headers: {
    'Authorization': authHeader,
    'Content-Type': 'application/json',
  },
});
```

**Environment Variables Required:**
```bash
VITE_OPENASSET_BASE_URL=https://pfluger.openasset.com/REST/1
VITE_OPENASSET_TOKEN_ID=your_token_id
VITE_OPENASSET_TOKEN_STRING=your_token_string
```

**Security Notes:**
- Token never expires (stored credentials)
- Use environment variables only (never commit)
- Rate limiting: ~100ms delay between requests recommended

---

## API Structure

### Available Endpoints

| Endpoint | Purpose | Methods | Query Params |
|----------|---------|---------|--------------|
| `/Projects` | All projects | GET, POST | `?limit=50&offset=0&textMatching=search` |
| `/Projects/{id}` | Single project | GET, PUT, DELETE | None |
| `/Projects/{id}/Fields` | Project custom fields | GET, PUT | None |
| `/Files` | All files/images | GET, POST (upload) | `?limit=50&project_id=123&keyword=tag` |
| `/Files/{id}` | Single file | GET, PUT, DELETE | None |
| `/Keywords` | All tags | GET, POST | `?limit=100` |
| `/Keywords/{id}` | Single keyword | GET, PUT, DELETE | None |
| `/Albums` | Photo albums | GET, POST | `?limit=100` |
| `/Albums/{id}` | Single album | GET, PUT, DELETE | None |
| `/Albums/{id}/Files` | Album contents | GET, POST, DELETE | None |
| `/Categories` | Asset categories | GET, POST | `?limit=100` |
| `/Fields` | Custom field definitions | GET, POST | `?limit=100` |
| `/Users` | OpenAsset users | GET | `?limit=100` |
| `/Photographers` | Photographer list | GET, POST | `?limit=100` |
| `/CopyrightHolders` | Copyright holders | GET, POST | `?limit=100` |

**Supported Operations:**
- **GET** - Retrieve data (read-only)
- **POST** - Create new records (projects, files, keywords, albums)
- **PUT** - Update existing records (metadata, fields, tags)
- **DELETE** - Remove records (files, projects, albums)

### Common Response Structures

**Project Object:**
```json
{
  "id": 12345,
  "code": "15-007",
  "name": "Example Elementary School",
  "description": "Project description here",
  "created": "2015-03-15T10:00:00Z",
  "updated": "2024-12-01T14:30:00Z",
  "keywords": ["education", "elementary"],
  "public_image_count": 42,
  "fields": {}
}
```

**File Object:**
```json
{
  "id": 67890,
  "original_filename": "exterior_01.jpg",
  "filename": "015-007-exterior.jpg",
  "caption": "Main entrance view",
  "description": "Full description of image",
  "photographer": "John Smith",
  "category_id": 5,
  "project_id": 12345,
  "created": "2015-08-20T09:00:00Z",
  "updated": "2015-08-20T09:00:00Z",
  "keywords": ["exterior", "entrance"],
  "sizes": [
    {
      "id": 1,
      "name": "original",
      "width": 4000,
      "height": 3000,
      "url": "https://pfluger.openasset.com/img/original/..."
    },
    {
      "id": 2,
      "name": "large",
      "width": 1920,
      "height": 1440,
      "url": "https://pfluger.openasset.com/img/large/..."
    },
    {
      "id": 3,
      "name": "thumbnail",
      "width": 300,
      "height": 225,
      "url": "https://pfluger.openasset.com/img/thumb/..."
    }
  ]
}
```

**Keyword Object:**
```json
{
  "id": 456,
  "name": "elementary-school"
}
```

---

## Field Mappings

OpenAsset custom fields discovered in Vision project (Field IDs may vary by organization):

| Field ID | Field Name | Data Type | Example Value |
|----------|------------|-----------|---------------|
| 2 | Start Date | Date | `20180319000000` |
| 3 | Completion Date | Date | `20200815000000` |
| 5 | Description | Text | Project description text |
| 16 | Area (sqft) | Number | `125000` |
| 243 | Client | Text | `Example ISD` |
| 244 | Office | Text | `Austin` |
| 245 | Address | Text | `123 School St` |
| 246 | Cost | Currency | `$3,910,456.00` |
| 253 | City | Text | `Austin` |
| 254 | State | Text | `TX` |
| 255 | Student Capacity | Number | `800` |

**Fetching Field Values:**
```javascript
const fieldsResponse = await fetch(`${OPENASSET_BASE_URL}/Projects/${projectId}/Fields`, {
  headers: { 'Authorization': authHeader }
});

const fields = await fieldsResponse.json();
const fieldMap = {};

fields.forEach(f => {
  fieldMap[f.id] = f.values && f.values.length > 0 ? f.values[0] : null;
});

// Access values
const client = fieldMap[243];
const office = fieldMap[244];
const cost = fieldMap[246];
```

**Date Format Conversion:**
```javascript
// OpenAsset date: "20180319000000"
// Convert to: "2018-03-19"
function formatDate(dateStr) {
  if (!dateStr || dateStr === '0') return null;
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}-${month}-${day}`;
}
```

**Cost Cleanup:**
```javascript
// OpenAsset cost: "$3,910,456.00"
// Convert to: 3910456.00
function cleanCost(costStr) {
  if (!costStr) return null;
  const cleaned = costStr.replace(/[$,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}
```

**Project Number Conversion:**
```javascript
// OpenAsset code: "15-007"
// Convert to internal format: "015-0070"
function convertOACodeToInternal(oaCode) {
  const match = oaCode.match(/^(\d+)-(\d+)$/);
  if (!match) return null;

  const [, year, num] = match;
  return `0${year.padStart(2, '0')}-${num.padStart(3, '0')}0`;
}
```

---

## API Client Code

**Full TypeScript API Client** (from Vision project):

```typescript
/**
 * OpenAsset API Client
 * Connects to OpenAsset digital asset management system
 * Documentation: https://developers.openasset.com
 */

const OPENASSET_BASE_URL = import.meta.env.VITE_OPENASSET_BASE_URL;
const OPENASSET_TOKEN_ID = import.meta.env.VITE_OPENASSET_TOKEN_ID;
const OPENASSET_TOKEN_STRING = import.meta.env.VITE_OPENASSET_TOKEN_STRING;

/**
 * OpenAsset File (Image/Asset)
 */
export interface OpenAssetFile {
  id: number;
  original_filename: string;
  filename: string;
  caption: string | null;
  description: string | null;
  photographer: string | null;
  category_id: number | null;
  project_id: number | null;
  created: string;
  updated: string;
  keywords: string[];
  sizes: {
    id: number;
    name: string;
    width: number;
    height: number;
    url: string;
  }[];
}

/**
 * OpenAsset Project
 */
export interface OpenAssetProject {
  id: number;
  code: string;
  name: string;
  description: string | null;
  created: string;
  updated: string;
  keywords: string[];
  fields: Record<string, unknown>;
}

/**
 * OpenAsset Keyword/Tag
 */
export interface OpenAssetKeyword {
  id: number;
  name: string;
}

/**
 * Search/Filter parameters
 */
export interface OpenAssetSearchParams {
  limit?: number;
  offset?: number;
  keyword?: string;
  project_id?: number;
  text_search?: string;
}

/**
 * Makes an authenticated request to OpenAsset API
 */
async function openAssetFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!OPENASSET_BASE_URL || !OPENASSET_TOKEN_ID || !OPENASSET_TOKEN_STRING) {
    throw new Error('OpenAsset API credentials not configured');
  }

  // OpenAsset uses OATU (OpenAsset Token Authentication) format
  const authHeader = `OATU ${OPENASSET_TOKEN_ID}:${OPENASSET_TOKEN_STRING}`;

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${OPENASSET_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAsset API error: ${response.status} - ${errorText}`);
  }

  return response;
}

/**
 * GET request helper
 */
async function openAssetGet<T>(endpoint: string): Promise<T> {
  const response = await openAssetFetch(endpoint);
  return response.json();
}

/**
 * POST request helper
 */
async function openAssetPost<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await openAssetFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * PUT request helper
 */
async function openAssetPut<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await openAssetFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Fetch files/images from OpenAsset
 */
export async function getFiles(params: OpenAssetSearchParams = {}): Promise<OpenAssetFile[]> {
  const queryParams = new URLSearchParams();

  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.project_id) queryParams.append('project_id', params.project_id.toString());
  if (params.text_search) queryParams.append('textMatching', params.text_search);

  const endpoint = `/Files${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return openAssetGet<OpenAssetFile[]>(endpoint);
}

/**
 * Fetch a single file by ID
 */
export async function getFile(fileId: number): Promise<OpenAssetFile> {
  return openAssetGet<OpenAssetFile>(`/Files/${fileId}`);
}

/**
 * Fetch projects from OpenAsset
 */
export async function getProjects(params: OpenAssetSearchParams = {}): Promise<OpenAssetProject[]> {
  const queryParams = new URLSearchParams();

  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  if (params.text_search) queryParams.append('textMatching', params.text_search);

  const endpoint = `/Projects${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return openAssetGet<OpenAssetProject[]>(endpoint);
}

/**
 * Fetch a single project by ID
 */
export async function getProject(projectId: number): Promise<OpenAssetProject> {
  return openAssetGet<OpenAssetProject>(`/Projects/${projectId}`);
}

/**
 * Fetch files for a specific project
 */
export async function getProjectFiles(projectId: number, limit = 50): Promise<OpenAssetFile[]> {
  return getFiles({ project_id: projectId, limit });
}

/**
 * Fetch all keywords/tags
 */
export async function getKeywords(): Promise<OpenAssetKeyword[]> {
  return openAssetGet<OpenAssetKeyword[]>('/Keywords');
}

/**
 * Create a new keyword/tag
 */
export async function createKeyword(name: string): Promise<OpenAssetKeyword> {
  return openAssetPost<OpenAssetKeyword>('/Keywords', { name });
}

/**
 * Add keywords to a file
 */
export async function addKeywordsToFile(
  fileId: number,
  keywordIds: number[]
): Promise<void> {
  await openAssetPut(`/Files/${fileId}`, {
    keywords: keywordIds
  });
}

/**
 * Search for files by keyword name
 */
export async function searchFilesByKeyword(
  keywordName: string,
  limit = 50
): Promise<OpenAssetFile[]> {
  return getFiles({ keyword: keywordName, limit });
}

/**
 * Get file download URL
 */
export function getFileDownloadUrl(file: OpenAssetFile, sizeName = 'original'): string | null {
  const size = file.sizes.find(s => s.name === sizeName);
  return size?.url || file.sizes[0]?.url || null;
}
```

---

## Write Operations (Upload, Update, Delete)

The OpenAsset API supports full CRUD operations. Here's what you can do:

### Upload New Images

```typescript
/**
 * Upload a file to OpenAsset
 * Note: File upload requires multipart/form-data
 */
async function uploadFile(
  file: File,
  projectId: number,
  metadata: {
    caption?: string;
    description?: string;
    photographer?: string;
    keywords?: number[];
  }
): Promise<OpenAssetFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('project_id', projectId.toString());

  if (metadata.caption) formData.append('caption', metadata.caption);
  if (metadata.description) formData.append('description', metadata.description);
  if (metadata.photographer) formData.append('photographer', metadata.photographer);
  if (metadata.keywords) {
    metadata.keywords.forEach(keywordId => {
      formData.append('keywords[]', keywordId.toString());
    });
  }

  const authHeader = `OATU ${OPENASSET_TOKEN_ID}:${OPENASSET_TOKEN_STRING}`;

  const response = await fetch(`${OPENASSET_BASE_URL}/Files`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      // Don't set Content-Type - browser will set it with boundary for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Usage Example
const file = document.querySelector('input[type="file"]').files[0];
const uploadedFile = await uploadFile(file, 12345, {
  caption: 'Exterior view from southeast',
  photographer: 'John Smith',
  keywords: [42, 87, 123], // Keyword IDs for "exterior", "school", "daytime"
});

console.log('Uploaded:', uploadedFile.id);
```

### Update File Metadata

```typescript
/**
 * Update an existing file's metadata
 */
async function updateFileMetadata(
  fileId: number,
  updates: {
    caption?: string;
    description?: string;
    photographer?: string;
    filename?: string;
  }
): Promise<OpenAssetFile> {
  return openAssetPut(`/Files/${fileId}`, updates);
}

// Usage Examples
await updateFileMetadata(67890, {
  caption: 'Updated caption text',
  photographer: 'Jane Doe',
});

// Rename file
await updateFileMetadata(67890, {
  filename: 'X25-RB01-sanctuary-exterior-01.jpg',
});
```

### Add/Remove Tags (Keywords)

```typescript
/**
 * Add keywords to a file
 */
async function addKeywordsToFile(
  fileId: number,
  keywordIds: number[]
): Promise<void> {
  // Get existing keywords first
  const file = await getFile(fileId);
  const existingKeywordIds = file.keywords.map(k =>
    typeof k === 'number' ? k : k.id
  );

  // Merge with new keywords (deduplicate)
  const allKeywordIds = [...new Set([...existingKeywordIds, ...keywordIds])];

  await openAssetPut(`/Files/${fileId}`, {
    keywords: allKeywordIds
  });
}

/**
 * Remove keywords from a file
 */
async function removeKeywordsFromFile(
  fileId: number,
  keywordIdsToRemove: number[]
): Promise<void> {
  const file = await getFile(fileId);
  const existingKeywordIds = file.keywords.map(k =>
    typeof k === 'number' ? k : k.id
  );

  // Filter out keywords to remove
  const remainingKeywordIds = existingKeywordIds.filter(
    id => !keywordIdsToRemove.includes(id)
  );

  await openAssetPut(`/Files/${fileId}`, {
    keywords: remainingKeywordIds
  });
}

/**
 * Replace all keywords on a file
 */
async function setFileKeywords(
  fileId: number,
  keywordIds: number[]
): Promise<void> {
  await openAssetPut(`/Files/${fileId}`, {
    keywords: keywordIds
  });
}

// Usage Examples
await addKeywordsToFile(67890, [101, 102]); // Add "research", "X25-RB01"
await removeKeywordsFromFile(67890, [50]); // Remove "draft" tag
await setFileKeywords(67890, [42, 87, 101]); // Replace all with specific set
```

### Create and Manage Keywords

```typescript
/**
 * Create a new keyword/tag
 */
async function createKeyword(name: string): Promise<OpenAssetKeyword> {
  return openAssetPost<OpenAssetKeyword>('/Keywords', { name });
}

/**
 * Find or create a keyword by name
 */
async function findOrCreateKeyword(name: string): Promise<number> {
  // Search for existing keyword
  const keywords = await getKeywords();
  const existing = keywords.find(k =>
    k.name.toLowerCase() === name.toLowerCase()
  );

  if (existing) {
    return existing.id;
  }

  // Create new keyword
  const newKeyword = await createKeyword(name);
  return newKeyword.id;
}

// Usage Examples
const researchKeywordId = await findOrCreateKeyword('research');
const projectKeywordId = await findOrCreateKeyword('X25-RB01');
const categoryKeywordId = await findOrCreateKeyword('sanctuary-spaces');

// Tag an image with research project
await addKeywordsToFile(67890, [
  researchKeywordId,
  projectKeywordId,
  categoryKeywordId
]);
```

### Delete Files

```typescript
/**
 * Delete a file from OpenAsset
 * WARNING: This is permanent and cannot be undone
 */
async function deleteFile(fileId: number): Promise<void> {
  const authHeader = `OATU ${OPENASSET_TOKEN_ID}:${OPENASSET_TOKEN_STRING}`;

  const response = await fetch(`${OPENASSET_BASE_URL}/Files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Delete failed: ${response.status} - ${errorText}`);
  }
}

// Usage Example
await deleteFile(67890);
```

### Batch Operations

```typescript
/**
 * Batch tag multiple files with same keywords
 */
async function batchTagFiles(
  fileIds: number[],
  keywordIds: number[]
): Promise<void> {
  console.log(`Tagging ${fileIds.length} files...`);

  for (const fileId of fileIds) {
    try {
      await addKeywordsToFile(fileId, keywordIds);
      console.log(`✓ Tagged file ${fileId}`);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`✗ Failed to tag file ${fileId}:`, error);
    }
  }

  console.log('Batch tagging complete');
}

/**
 * Batch update photographer credit
 */
async function batchUpdatePhotographer(
  fileIds: number[],
  photographer: string
): Promise<void> {
  console.log(`Updating ${fileIds.length} files...`);

  for (const fileId of fileIds) {
    try {
      await updateFileMetadata(fileId, { photographer });
      console.log(`✓ Updated file ${fileId}`);

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`✗ Failed to update file ${fileId}:`, error);
    }
  }

  console.log('Batch update complete');
}

// Usage Examples

// Tag all images in a project with research ID
const files = await getProjectFiles(12345);
const fileIds = files.map(f => f.id);
const researchTag = await findOrCreateKeyword('X25-RB01');
await batchTagFiles(fileIds, [researchTag]);

// Update photographer for multiple images
await batchUpdatePhotographer([101, 102, 103], 'John Smith Photography');
```

### Create/Update Projects

```typescript
/**
 * Create a new project in OpenAsset
 */
async function createProject(
  code: string,
  name: string,
  description?: string
): Promise<OpenAssetProject> {
  return openAssetPost<OpenAssetProject>('/Projects', {
    code,
    name,
    description: description || '',
  });
}

/**
 * Update an existing project
 */
async function updateProject(
  projectId: number,
  updates: {
    name?: string;
    description?: string;
    code?: string;
  }
): Promise<OpenAssetProject> {
  return openAssetPut<OpenAssetProject>(`/Projects/${projectId}`, updates);
}

// Usage Examples
const newProject = await createProject(
  '25-025',
  'X25-RB01 Sanctuary Spaces Research',
  'Research project exploring sanctuary spaces in educational environments'
);

await updateProject(newProject.id, {
  description: 'Updated description with more details',
});
```

### Update Project Custom Fields

```typescript
/**
 * Update custom field values on a project
 */
async function updateProjectFields(
  projectId: number,
  fieldValues: Record<number, string>
): Promise<void> {
  // fieldValues is a map of field ID to value
  // Example: { 243: "Example ISD", 244: "Austin", 246: "$3,500,000" }

  const updates = Object.entries(fieldValues).map(([fieldId, value]) => ({
    field_id: parseInt(fieldId),
    values: [value],
  }));

  await openAssetPut(`/Projects/${projectId}/Fields`, updates);
}

// Usage Example
await updateProjectFields(12345, {
  243: 'Example ISD',           // Client
  244: 'Austin',                // Office
  246: '$3,500,000',            // Cost
  253: 'Austin',                // City
  254: 'TX',                    // State
  255: '800',                   // Student Capacity
});
```

### Manage Albums

```typescript
/**
 * Create a new album
 */
async function createAlbum(
  name: string,
  description?: string
): Promise<{ id: number; name: string }> {
  return openAssetPost('/Albums', {
    name,
    description: description || '',
  });
}

/**
 * Add files to an album
 */
async function addFilesToAlbum(
  albumId: number,
  fileIds: number[]
): Promise<void> {
  await openAssetPost(`/Albums/${albumId}/Files`, {
    file_ids: fileIds,
  });
}

/**
 * Remove files from an album
 */
async function removeFilesFromAlbum(
  albumId: number,
  fileIds: number[]
): Promise<void> {
  // Delete request with body
  const authHeader = `OATU ${OPENASSET_TOKEN_ID}:${OPENASSET_TOKEN_STRING}`;

  await fetch(`${OPENASSET_BASE_URL}/Albums/${albumId}/Files`, {
    method: 'DELETE',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_ids: fileIds }),
  });
}

// Usage Example - Organize research project images
const album = await createAlbum(
  'X25-RB01 Sanctuary Spaces',
  'Images for sanctuary spaces research project'
);

const files = await getProjectFiles(12345);
const fileIds = files.map(f => f.id);
await addFilesToAlbum(album.id, fileIds);
```

### Generate Thumbnails

```typescript
/**
 * Request thumbnail generation for a file
 * OpenAsset automatically generates standard sizes, but you can request custom
 */
async function generateCustomThumbnail(
  fileId: number,
  width: number,
  height: number
): Promise<string> {
  // OpenAsset API typically auto-generates thumbnails
  // Access via the sizes array on file object
  const file = await getFile(fileId);

  // Find closest size
  const closestSize = file.sizes.reduce((prev, curr) => {
    const prevDiff = Math.abs(prev.width - width) + Math.abs(prev.height - height);
    const currDiff = Math.abs(curr.width - width) + Math.abs(curr.height - height);
    return currDiff < prevDiff ? curr : prev;
  });

  return closestSize.url;
}

// Usage Example
const thumbnailUrl = await generateCustomThumbnail(67890, 300, 225);
```

---

## Advanced Features

### MERGE Operations

Consolidate duplicate resources into a single record:

```typescript
/**
 * MERGE verb - consolidate duplicate resources
 * Supported: Albums, Keywords, CopyrightHolders, CopyrightPolicies,
 *            Photographers, Topics, ProjectKeywords, KeywordCategories
 */
async function mergeKeywords(
  targetKeywordId: number,
  sourceKeywordIds: number[]
): Promise<void> {
  const authHeader = `OATU ${OPENASSET_TOKEN_ID}:${OPENASSET_TOKEN_STRING}`;

  // MERGE accepts array of IDs or array of objects with ID
  await fetch(`${OPENASSET_BASE_URL}/Keywords/${targetKeywordId}`, {
    method: 'MERGE',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sourceKeywordIds), // [40, 42] or [{"id": 40}, {"id": 42}]
  });
}

/**
 * Merge duplicate photographer records
 */
async function mergePhotographers(
  targetPhotographerId: number,
  sourcePhotographerIds: number[]
): Promise<void> {
  const authHeader = `OATU ${OPENASSET_TOKEN_ID}:${OPENASSET_TOKEN_STRING}`;

  await fetch(`${OPENASSET_BASE_URL}/Photographers/${targetPhotographerId}`, {
    method: 'MERGE',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sourcePhotographerIds),
  });
}

// Usage Examples
await mergeKeywords(100, [101, 102, 103]); // Merge keywords 101,102,103 into 100
await mergePhotographers(5, [12, 18]); // Merge duplicate photographer records
```

### Batch Operation Limits

**Official Recommendations:**

```typescript
// GET requests - Maximum 500 objects
const files = await getFiles({ limit: 500 });

// POST/PUT/DELETE - Recommended 100, ceiling 200 objects
const BATCH_SIZE = 100; // Recommended
const MAX_BATCH_SIZE = 200; // Ceiling

async function batchUpdateSafe(fileIds: number[], updates: any) {
  for (let i = 0; i < fileIds.length; i += BATCH_SIZE) {
    const batch = fileIds.slice(i, i + BATCH_SIZE);

    // Update batch
    await Promise.all(
      batch.map(id => updateFileMetadata(id, updates))
    );

    console.log(`Processed ${Math.min(i + BATCH_SIZE, fileIds.length)}/${fileIds.length}`);

    // Rate limiting between batches
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Image uploads - Maximum 3GB per batch
const MAX_UPLOAD_SIZE_GB = 3;

async function batchUploadImages(files: File[]) {
  let currentBatch: File[] = [];
  let currentBatchSize = 0;

  for (const file of files) {
    const fileSizeGB = file.size / (1024 ** 3);

    if (currentBatchSize + fileSizeGB > MAX_UPLOAD_SIZE_GB) {
      // Upload current batch
      await uploadBatch(currentBatch);
      currentBatch = [file];
      currentBatchSize = fileSizeGB;
    } else {
      currentBatch.push(file);
      currentBatchSize += fileSizeGB;
    }
  }

  // Upload remaining files
  if (currentBatch.length > 0) {
    await uploadBatch(currentBatch);
  }
}
```

### Advanced Filtering

Use `filterBy` parameter for complex queries with AND/OR logic:

```typescript
/**
 * Advanced filtering with filterBy parameter
 * Default: Array = OR, Object keys = AND
 */

// Example 1: OR operation (array) - find files matching any condition
const filterByOR = [
  { "name": "*exterior*" },
  { "code": "*exterior*" }
];

const files = await fetch(
  `${OPENASSET_BASE_URL}/Files?filterBy=${encodeURIComponent(JSON.stringify(filterByOR))}`
);

// Example 2: AND operation (object) - find files matching all conditions
const filterByAND = {
  "photographer": "John Smith",
  "category_id": 5,
  "project_id": 12345
};

// Example 3: Complex nested AND/OR with special operators
const filterByComplex = {
  "-or": [
    { "name": "*school*" },
    { "caption": "*school*" }
  ],
  "photographer": "John Smith",
  "category_id": { "-range": [1, 10] }
};

/**
 * filterBy helper with TypeScript
 */
async function advancedFileSearch(filters: {
  orConditions?: Record<string, any>[];
  andConditions?: Record<string, any>;
  textSearch?: string;
  dateRange?: { start: string; end: string };
}): Promise<OpenAssetFile[]> {
  let filterBy: any;

  if (filters.orConditions && filters.andConditions) {
    // Complex: Mix OR and AND
    filterBy = {
      "-or": filters.orConditions,
      ...filters.andConditions
    };
  } else if (filters.orConditions) {
    // Simple OR
    filterBy = filters.orConditions;
  } else if (filters.andConditions) {
    // Simple AND
    filterBy = filters.andConditions;
  }

  const params = new URLSearchParams();
  if (filterBy) {
    params.append('filterBy', JSON.stringify(filterBy));
  }
  if (filters.textSearch) {
    params.append('textMatching', filters.textSearch);
  }

  const endpoint = `/Files?${params.toString()}`;
  return openAssetGet<OpenAssetFile[]>(endpoint);
}

// Usage Examples
const results = await advancedFileSearch({
  orConditions: [
    { "name": "*exterior*" },
    { "caption": "*exterior*" }
  ],
  andConditions: {
    "photographer": "John Smith",
    "project_id": 12345
  }
});

// Numeric operators
const expensiveProjects = await advancedFileSearch({
  andConditions: {
    "cost": { "-range": [1000000, 5000000] } // Range: $1M - $5M
  }
});

// Date range
const recentImages = await advancedFileSearch({
  andConditions: {
    "created": { "-range": ["2025-01-01", "2025-12-31"] }
  }
});
```

**Filter Operators:**
- **Range:** `{ "-range": [min, max] }`
- **Greater than:** `{ "-gt": value }`
- **Less than:** `{ "-lt": value }`
- **Not equal:** `{ "-not": value }`
- **Wildcard:** `"*text*"` (contains), `"text*"` (starts with), `"*text"` (ends with)

### Nesting & Remote Fields

Reduce API calls by fetching related data in a single request:

```typescript
/**
 * Nesting - get related objects in one call
 */
async function getProjectWithFiles(projectId: number): Promise<any> {
  // Nest files within project request
  const project = await openAssetGet(`/Projects/${projectId}?files=all`);

  // project now includes full files array without separate API call
  console.log(`Project: ${project.name}`);
  console.log(`Files: ${project.files.length}`);

  return project;
}

/**
 * Remote Fields - retrieve related data simultaneously
 */
async function getFilesWithRelatedData(): Promise<OpenAssetFile[]> {
  // Fetch files with photographer, copyright holder, and project code
  const files = await openAssetGet<OpenAssetFile[]>(
    '/Files?limit=50&remoteFields=photographer,copyright_holder,project_code'
  );

  // Files now include expanded photographer and copyright holder objects
  files.forEach(file => {
    console.log(`File: ${file.filename}`);
    console.log(`Photographer: ${file.photographer?.name || 'N/A'}`);
    console.log(`Copyright: ${file.copyright_holder?.name || 'N/A'}`);
    console.log(`Project Code: ${file.project_code || 'N/A'}`);
  });

  return files;
}

// Usage Example - get album with all associations
async function getAlbumExpanded(albumId: number) {
  return openAssetGet(
    `/Albums/${albumId}?groups=all&projects=all&topics=all&users=all`
  );
}
```

**Available Nesting Parameters:**
- Projects: `?files=all&employees=all`
- Albums: `?groups=all&projects=all&topics=all&users=all`
- Files: `?project=all&keywords=all`

**Available Remote Fields:**
- Files: `photographer`, `copyright_holder`, `project_code`, `project_name`
- Albums: `user_name`, `group_name`

### AWS S3 Direct Upload

For large file uploads, use S3 presigned URLs:

```typescript
/**
 * Step 1: Create file record and get presigned URL
 */
async function initiateLargeUpload(
  projectId: number,
  filename: string,
  fileSize: number
): Promise<{ fileId: number; uploadUrl: string }> {
  const response = await openAssetPost('/Files', {
    project_id: projectId,
    original_filename: filename,
    filesize: fileSize,
    // Request presigned URL
    aws_presigned_urls: true
  });

  return {
    fileId: response.id,
    uploadUrl: response.aws_presigned_url
  };
}

/**
 * Step 2: Upload directly to S3
 */
async function uploadToS3(presignedUrl: string, file: File): Promise<void> {
  await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });
}

/**
 * Step 3: Mark upload complete in OpenAsset
 */
async function completeS3Upload(fileId: number): Promise<void> {
  await openAssetPut(`/Files/${fileId}`, {
    s3_upload_complete: true
  });
}

// Full workflow
async function uploadLargeFile(file: File, projectId: number) {
  console.log(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)...`);

  // Step 1: Get presigned URL
  const { fileId, uploadUrl } = await initiateLargeUpload(
    projectId,
    file.name,
    file.size
  );

  // Step 2: Upload to S3
  await uploadToS3(uploadUrl, file);

  // Step 3: Mark complete
  await completeS3Upload(fileId);

  console.log('✓ Upload complete');
  return fileId;
}
```

### Image Rotation

Rotate images programmatically:

```typescript
/**
 * Rotate an image by 90, 180, or 270 degrees
 */
async function rotateImage(
  fileId: number,
  degrees: 0 | 90 | 180 | 270
): Promise<OpenAssetFile> {
  return openAssetPut(`/Files/${fileId}`, {
    rotate_degrees: degrees
  });
}

// Usage Examples
await rotateImage(67890, 90);   // Rotate 90° clockwise
await rotateImage(67890, 180);  // Rotate 180°
await rotateImage(67890, 270);  // Rotate 270° clockwise (90° counter-clockwise)

// Check rotation history
const file = await getFile(67890);
console.log(`Total rotation: ${file.rotation_since_upload}°`);
```

### Response Headers

OpenAsset returns useful metadata in HTTP headers:

```typescript
/**
 * Extract OpenAsset response headers
 */
async function getFilesWithMetadata() {
  const authHeader = `OATU ${OPENASSET_TOKEN_ID}:${OPENASSET_TOKEN_STRING}`;

  const response = await fetch(`${OPENASSET_BASE_URL}/Files?limit=50`, {
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  // Extract useful headers
  const metadata = {
    sessionKey: response.headers.get('X-SessionKey'),
    fullResultsCount: parseInt(response.headers.get('X-Full-Results-Count') || '0'),
    displayResultsCount: parseInt(response.headers.get('X-Display-Results-Count') || '0'),
    offset: parseInt(response.headers.get('X-Offset') || '0'),
    timing: response.headers.get('X-Timing'),
    username: response.headers.get('X-Username'),
    userId: response.headers.get('X-User-Id'),
    openAssetVersion: response.headers.get('X-OpenAsset-Version'),
  };

  console.log('Metadata:', metadata);
  console.log(`Showing ${metadata.displayResultsCount} of ${metadata.fullResultsCount} results`);

  return { data, metadata };
}
```

**Available Headers:**
- `X-SessionKey` - Session persistence across calls
- `X-Full-Results-Count` - Total matching results
- `X-Display-Results-Count` - Results returned in this response
- `X-Offset` - Current pagination offset
- `X-Timing` - Request processing time
- `X-Username` - Authenticated user
- `X-User-Id` - User ID
- `X-OpenAsset-Version` - API version
- `X-Ignored-Fields` - Fields ignored in request

### Saved Searches

Create and manage reusable search queries:

```typescript
/**
 * Create a saved search
 */
async function createSavedSearch(
  name: string,
  searchParams: {
    keywords?: string[];
    projectId?: number;
    photographer?: string;
    dateRange?: { start: string; end: string };
  }
): Promise<{ id: number; name: string }> {
  const searchQuery: any = {};

  if (searchParams.keywords) {
    searchQuery.keywords = searchParams.keywords.join(',');
  }
  if (searchParams.projectId) {
    searchQuery.project_id = searchParams.projectId;
  }
  if (searchParams.photographer) {
    searchQuery.photographer = searchParams.photographer;
  }
  if (searchParams.dateRange) {
    searchQuery.created = {
      "-range": [searchParams.dateRange.start, searchParams.dateRange.end]
    };
  }

  return openAssetPost('/Searches', {
    name,
    query: searchQuery
  });
}

/**
 * Execute a saved search
 */
async function executeSavedSearch(searchId: number): Promise<OpenAssetFile[]> {
  return openAssetGet<OpenAssetFile[]>(`/Searches/${searchId}/execute`);
}

// Usage Examples
const search = await createSavedSearch('Research Project Images 2025', {
  keywords: ['research', 'X25-RB01'],
  dateRange: { start: '2025-01-01', end: '2025-12-31' }
});

const results = await executeSavedSearch(search.id);
console.log(`Found ${results.length} images matching saved search`);
```

### Additional Endpoints

**Employees:**
```typescript
// Manage employee records (team members)
async function getEmployees(): Promise<any[]> {
  return openAssetGet('/Employees');
}

async function createEmployee(data: {
  name: string;
  email?: string;
  title?: string;
}): Promise<any> {
  return openAssetPost('/Employees', data);
}
```

**Topics:**
```typescript
// Manage topics (categorical organization)
async function getTopics(): Promise<any[]> {
  return openAssetGet('/Topics');
}

async function createTopic(name: string): Promise<any> {
  return openAssetPost('/Topics', { name });
}

// Merge duplicate topics
async function mergeTopics(targetId: number, sourceIds: number[]): Promise<void> {
  const authHeader = `OATU ${OPENASSET_TOKEN_ID}:${OPENASSET_TOKEN_STRING}`;

  await fetch(`${OPENASSET_BASE_URL}/Topics/${targetId}`, {
    method: 'MERGE',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sourceIds),
  });
}
```

**Data Integrations:**
```typescript
// Manage external system connections (Vision, Cosential, etc.)
async function getDataIntegrations(): Promise<any[]> {
  return openAssetGet('/DataIntegrations');
}
```

**Sizes & Aspect Ratios:**
```typescript
// Get configured image sizes and aspect ratios
async function getImageSizes(): Promise<any[]> {
  return openAssetGet('/Sizes');
}

async function getAspectRatios(): Promise<any[]> {
  return openAssetGet('/AspectRatios');
}
```

---

## Research Platform Use Cases

### Use Case 1: Upload Research Project Images

```typescript
async function uploadResearchImages(
  projectId: string, // X25-RB01
  openAssetProjectId: number,
  files: File[]
) {
  // Get or create research tags
  const researchTag = await findOrCreateKeyword('research');
  const projectTag = await findOrCreateKeyword(projectId);
  const categoryTag = await findOrCreateKeyword('sanctuary-spaces');

  const uploadedFiles = [];

  for (const file of files) {
    try {
      const uploaded = await uploadFile(file, openAssetProjectId, {
        caption: `${projectId} - ${file.name}`,
        photographer: 'Pfluger R&B Team',
        keywords: [researchTag, projectTag, categoryTag],
      });

      uploadedFiles.push(uploaded);
      console.log(`✓ Uploaded ${file.name}`);

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`✗ Failed to upload ${file.name}:`, error);
    }
  }

  return uploadedFiles;
}
```

### Use Case 2: Tag Existing Images with Research Projects

```typescript
async function tagProjectWithResearch(
  openAssetProjectId: number,
  researchProjectId: string // X25-RB01
) {
  // Get all images for the project
  const files = await getProjectFiles(openAssetProjectId);

  // Get or create tags
  const researchTag = await findOrCreateKeyword('research');
  const projectTag = await findOrCreateKeyword(researchProjectId);

  // Tag all images
  await batchTagFiles(
    files.map(f => f.id),
    [researchTag, projectTag]
  );

  console.log(`✓ Tagged ${files.length} images with ${researchProjectId}`);
}
```

### Use Case 3: Create Research Image Album

```typescript
async function createResearchAlbum(
  researchProjectId: string,
  title: string,
  description: string
) {
  // Create album
  const album = await createAlbum(
    `${researchProjectId} - ${title}`,
    description
  );

  // Find all images tagged with this research project
  const projectTag = await findOrCreateKeyword(researchProjectId);
  const allFiles = await searchFilesByKeyword(researchProjectId);

  // Add to album
  await addFilesToAlbum(
    album.id,
    allFiles.map(f => f.id)
  );

  console.log(`✓ Created album with ${allFiles.length} images`);
  return album;
}
```

### Use Case 4: Clean Up Draft Images

```typescript
async function removeResearchDrafts(researchProjectId: string) {
  // Find images tagged as drafts
  const draftTag = await findOrCreateKeyword('draft');
  const draftImages = await searchFilesByKeyword('draft');

  // Filter to only this research project
  const projectTag = await findOrCreateKeyword(researchProjectId);
  const projectImages = await searchFilesByKeyword(researchProjectId);

  const projectImageIds = new Set(projectImages.map(f => f.id));
  const draftsToRemove = draftImages.filter(f => projectImageIds.has(f.id));

  console.log(`Found ${draftsToRemove.length} draft images to clean up`);

  // Option 1: Just remove the draft tag
  for (const file of draftsToRemove) {
    await removeKeywordsFromFile(file.id, [draftTag]);
  }

  // Option 2: Delete the files entirely (uncomment if needed)
  // for (const file of draftsToRemove) {
  //   await deleteFile(file.id);
  // }

  console.log('✓ Cleanup complete');
}
```

---

## Utility Scripts

### 1. Test Connection Script

**File:** `test-openasset.js`
**Purpose:** Verify API credentials and connectivity

```javascript
/**
 * Test OpenAsset API Connection
 * Run with: node test-openasset.js
 */

import dotenv from 'dotenv';
dotenv.config();

const OPENASSET_BASE_URL = process.env.VITE_OPENASSET_BASE_URL;
const OPENASSET_TOKEN_ID = process.env.VITE_OPENASSET_TOKEN_ID;
const OPENASSET_TOKEN_STRING = process.env.VITE_OPENASSET_TOKEN_STRING;

async function testOpenAssetConnection() {
  console.log('Testing OpenAsset API Connection...\n');
  console.log('Base URL:', OPENASSET_BASE_URL);
  console.log('Token ID:', OPENASSET_TOKEN_ID);
  console.log('Token String:', OPENASSET_TOKEN_STRING ? `${OPENASSET_TOKEN_STRING.substring(0, 10)}...` : 'NOT SET');
  console.log('');

  if (!OPENASSET_BASE_URL || !OPENASSET_TOKEN_ID || !OPENASSET_TOKEN_STRING) {
    console.error('ERROR: OpenAsset credentials not found in .env file');
    process.exit(1);
  }

  const authHeader = `OATU ${OPENASSET_TOKEN_ID}:${OPENASSET_TOKEN_STRING}`;

  try {
    // Test 1: Fetch first 5 projects
    console.log('Test 1: Fetching first 5 projects...');
    const projectsResponse = await fetch(`${OPENASSET_BASE_URL}/Projects?limit=5`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!projectsResponse.ok) {
      const errorText = await projectsResponse.text();
      throw new Error(`Projects API failed: ${projectsResponse.status} - ${errorText}`);
    }

    const projects = await projectsResponse.json();
    console.log(`✓ Successfully fetched ${projects.length} projects`);

    if (projects.length > 0) {
      console.log('\nSample project:');
      console.log('  ID:', projects[0].id);
      console.log('  Code:', projects[0].code);
      console.log('  Name:', projects[0].name);
      console.log('');

      // Test 2: Fetch files for first project
      const firstProjectId = projects[0].id;
      console.log(`Test 2: Fetching files for project ${firstProjectId}...`);

      const filesResponse = await fetch(`${OPENASSET_BASE_URL}/Files?project_id=${firstProjectId}&limit=5`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!filesResponse.ok) {
        const errorText = await filesResponse.text();
        throw new Error(`Files API failed: ${filesResponse.status} - ${errorText}`);
      }

      const files = await filesResponse.json();
      console.log(`✓ Successfully fetched ${files.length} files for this project`);

      if (files.length > 0) {
        console.log('\nSample file:');
        console.log('  ID:', files[0].id);
        console.log('  Filename:', files[0].original_filename);
        console.log('  Caption:', files[0].caption || 'None');
        console.log('  Keywords:', files[0].keywords?.join(', ') || 'None');
        if (files[0].sizes && files[0].sizes.length > 0) {
          console.log('  Available sizes:', files[0].sizes.map(s => s.name).join(', '));
        }
      }
    }

    // Test 3: Fetch keywords
    console.log('\nTest 3: Fetching keywords/tags...');
    const keywordsResponse = await fetch(`${OPENASSET_BASE_URL}/Keywords?limit=10`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!keywordsResponse.ok) {
      const errorText = await keywordsResponse.text();
      throw new Error(`Keywords API failed: ${keywordsResponse.status} - ${errorText}`);
    }

    const keywords = await keywordsResponse.json();
    console.log(`✓ Successfully fetched ${keywords.length} keywords`);

    if (keywords.length > 0) {
      console.log('Sample keywords:', keywords.slice(0, 5).map(k => k.name).join(', '));
    }

    console.log('\n✓ All tests passed! OpenAsset API is working correctly.');

  } catch (error) {
    console.error('\n✗ Error testing OpenAsset API:', error.message);
    process.exit(1);
  }
}

testOpenAssetConnection();
```

**Usage:**
```bash
node test-openasset.js
```

---

### 2. Explore API Structure

**File:** `explore-openasset-structure.js`
**Purpose:** Discover available endpoints and data types

```javascript
/**
 * Explore OpenAsset Structure
 * Check what organizational features exist: Fields, Categories, Albums, etc.
 */

import dotenv from 'dotenv';
dotenv.config();

const OPENASSET_BASE_URL = process.env.VITE_OPENASSET_BASE_URL;
const OPENASSET_TOKEN_ID = process.env.VITE_OPENASSET_TOKEN_ID;
const OPENASSET_TOKEN_STRING = process.env.VITE_OPENASSET_TOKEN_STRING;

async function testEndpoint(name, endpoint) {
  const authHeader = `OATU ${OPENASSET_TOKEN_ID}:${OPENASSET_TOKEN_STRING}`;

  try {
    const response = await fetch(`${OPENASSET_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const count = Array.isArray(data) ? data.length : 'N/A';
      console.log(`✓ ${name.padEnd(20)} - ${count} items`);
      if (Array.isArray(data) && data.length > 0) {
        console.log(`  Sample:`, JSON.stringify(data[0], null, 2).substring(0, 200) + '...\n');
      }
      return { success: true, data };
    } else {
      console.log(`✗ ${name.padEnd(20)} - ${response.status} ${response.statusText}`);
      return { success: false };
    }
  } catch (error) {
    console.log(`✗ ${name.padEnd(20)} - Error: ${error.message}`);
    return { success: false };
  }
}

async function exploreStructure() {
  console.log('Exploring OpenAsset Organizational Structure:\n');
  console.log('='.repeat(80) + '\n');

  await testEndpoint('Projects', '/Projects?limit=1');
  await testEndpoint('Files', '/Files?limit=1');
  await testEndpoint('Keywords', '/Keywords?limit=5');
  await testEndpoint('Categories', '/Categories?limit=5');
  await testEndpoint('Albums', '/Albums?limit=5');
  await testEndpoint('Fields', '/Fields?limit=5');
  await testEndpoint('Groups', '/Groups?limit=5');
  await testEndpoint('Users', '/Users?limit=5');
  await testEndpoint('Photographers', '/Photographers?limit=5');
  await testEndpoint('Copyright Holders', '/CopyrightHolders?limit=5');

  console.log('\n' + '='.repeat(80));
  console.log('Research Complete');
}

exploreStructure().catch(console.error);
```

---

### 3. Check Data Coverage

**File:** `check-project-data-coverage.js`
**Purpose:** Analyze how many projects have specific fields populated

```javascript
/**
 * Check Data Coverage in OpenAsset Projects
 * See how many projects have costs, addresses, client names, etc.
 */

import dotenv from 'dotenv';
dotenv.config();

const OPENASSET_BASE_URL = process.env.VITE_OPENASSET_BASE_URL;
const OPENASSET_TOKEN_ID = process.env.VITE_OPENASSET_TOKEN_ID;
const OPENASSET_TOKEN_STRING = process.env.VITE_OPENASSET_TOKEN_STRING;

async function checkDataCoverage() {
  const authHeader = `OATU ${OPENASSET_TOKEN_ID}:${OPENASSET_TOKEN_STRING}`;

  // Fetch first 50 projects
  const projectsResponse = await fetch(`${OPENASSET_BASE_URL}/Projects?limit=50`, {
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });

  const projects = await projectsResponse.json();
  console.log(`Analyzing ${projects.length} projects...\n`);

  let stats = {
    withClient: 0,
    withOffice: 0,
    withCost: 0,
    withAddress: 0,
    withCity: 0,
    withState: 0,
    withStudentCapacity: 0
  };

  const samples = [];

  for (const project of projects) {
    const fieldsResponse = await fetch(`${OPENASSET_BASE_URL}/Projects/${project.id}/Fields`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const fields = await fieldsResponse.json();

    const fieldMap = {};
    fields.forEach(f => {
      fieldMap[f.id] = f.values && f.values.length > 0 ? f.values[0] : null;
    });

    // Field IDs: 243=Client, 244=Office, 246=Cost, 245=Address, 253=City, 254=State, 255=Student Capacity
    const hasClient = fieldMap[243] && fieldMap[243].trim() !== '';
    const hasOffice = fieldMap[244] && fieldMap[244].trim() !== '';
    const hasCost = fieldMap[246] && fieldMap[246].trim() !== '';
    const hasAddress = fieldMap[245] && fieldMap[245].trim() !== '';
    const hasCity = fieldMap[253] && fieldMap[253].trim() !== '';
    const hasState = fieldMap[254] && fieldMap[254].trim() !== '';
    const hasStudentCapacity = fieldMap[255] && fieldMap[255].trim() !== '';

    if (hasClient) stats.withClient++;
    if (hasOffice) stats.withOffice++;
    if (hasCost) stats.withCost++;
    if (hasAddress) stats.withAddress++;
    if (hasCity) stats.withCity++;
    if (hasState) stats.withState++;
    if (hasStudentCapacity) stats.withStudentCapacity++;

    if (samples.length < 5 && (hasClient || hasOffice || hasCost || hasAddress)) {
      samples.push({
        code: project.code,
        name: project.name,
        client: fieldMap[243] || 'N/A',
        office: fieldMap[244] || 'N/A',
        cost: fieldMap[246] || 'N/A',
        address: fieldMap[245] || 'N/A',
        city: fieldMap[253] || 'N/A',
        state: fieldMap[254] || 'N/A',
      });
    }
  }

  console.log('Data Coverage Statistics:');
  console.log('='.repeat(80));
  console.log(`Client Name:      ${stats.withClient}/${projects.length} (${Math.round(stats.withClient/projects.length*100)}%)`);
  console.log(`Office:           ${stats.withOffice}/${projects.length} (${Math.round(stats.withOffice/projects.length*100)}%)`);
  console.log(`Cost:             ${stats.withCost}/${projects.length} (${Math.round(stats.withCost/projects.length*100)}%)`);
  console.log(`Address:          ${stats.withAddress}/${projects.length} (${Math.round(stats.withAddress/projects.length*100)}%)`);
  console.log(`City:             ${stats.withCity}/${projects.length} (${Math.round(stats.withCity/projects.length*100)}%)`);
  console.log(`State:            ${stats.withState}/${projects.length} (${Math.round(stats.withState/projects.length*100)}%)`);
  console.log(`Student Capacity: ${stats.withStudentCapacity}/${projects.length} (${Math.round(stats.withStudentCapacity/projects.length*100)}%)`);

  console.log('\n\nSample Projects with Data:');
  console.log('='.repeat(80));
  samples.forEach(s => {
    console.log(`\n${s.code} - ${s.name}`);
    console.log(`  Client: ${s.client}`);
    console.log(`  Office: ${s.office}`);
    console.log(`  Cost: ${s.cost}`);
    console.log(`  Location: ${s.city}, ${s.state}`);
  });
}

checkDataCoverage().catch(console.error);
```

---

### 4. Explore Custom Fields

**File:** `explore-fields.js`
**Purpose:** List all custom fields and their configurations

```javascript
/**
 * Explore OpenAsset Fields
 * See what custom fields exist and if we can create new ones
 */

import dotenv from 'dotenv';
dotenv.config();

const OPENASSET_BASE_URL = process.env.VITE_OPENASSET_BASE_URL;
const OPENASSET_TOKEN_ID = process.env.VITE_OPENASSET_TOKEN_ID;
const OPENASSET_TOKEN_STRING = process.env.VITE_OPENASSET_TOKEN_STRING;

async function exploreFields() {
  const authHeader = `OATU ${OPENASSET_TOKEN_ID}:${OPENASSET_TOKEN_STRING}`;

  const response = await fetch(`${OPENASSET_BASE_URL}/Fields?limit=100`, {
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });

  const fields = await response.json();

  console.log(`Found ${fields.length} custom fields in OpenAsset:\n`);

  fields.forEach(field => {
    console.log(`Field: ${field.name || field.code}`);
    console.log(`  Code: ${field.code}`);
    console.log(`  Type: ${field.field_type}`);
    console.log(`  Applied to: ${field.applies_to || 'N/A'}`);
    console.log(`  Description: ${field.description || 'None'}`);
    console.log(`  Protected: ${field.protected ? 'Yes (cannot modify)' : 'No (can modify)'}`);
    console.log('');
  });

  const clientFields = fields.filter(f =>
    f.name?.toLowerCase().includes('client') ||
    f.name?.toLowerCase().includes('district') ||
    f.code?.toLowerCase().includes('client') ||
    f.code?.toLowerCase().includes('district')
  );

  if (clientFields.length > 0) {
    console.log('\n🎯 Found client/district related fields:');
    clientFields.forEach(f => console.log(`  - ${f.name || f.code}`));
  } else {
    console.log('\n💡 No client/district fields exist yet. Could create custom fields for:');
    console.log('  - Client Name');
    console.log('  - District Name');
    console.log('  - Research Project ID (X25-RB01)');
    console.log('  - Research Category');
  }
}

exploreFields().catch(console.error);
```

---

## Environment Setup

### 1. Install Dependencies

```bash
npm install dotenv
```

### 2. Create `.env` File

Add to `.env.local` in the Repository project:

```bash
# OpenAsset API Configuration
VITE_OPENASSET_BASE_URL=https://pfluger.openasset.com/REST/1
VITE_OPENASSET_TOKEN_ID=your_token_id_here
VITE_OPENASSET_TOKEN_STRING=your_token_string_here
```

**Get Credentials:**
1. Login to OpenAsset admin panel
2. Navigate to Settings → API Tokens
3. Generate new token or use existing
4. Copy Token ID and Token String
5. Store in environment variables

### 3. Test Connection

```bash
# Run test script
node test-openasset.js

# Expected output:
# ✓ Successfully fetched 5 projects
# ✓ Successfully fetched N files for this project
# ✓ Successfully fetched 10 keywords
# ✓ All tests passed!
```

---

## Integration Patterns

### Pattern 1: Fetch Project Images for Research Project

```typescript
import { getProjects, getProjectFiles, getFileDownloadUrl } from './services/openAssetApi';

async function loadResearchProjectImages(researchProjectId: string) {
  // Research project ID format: "X25-RB01"
  // Map to OpenAsset project (may need custom field or keyword)

  // Option A: Search by keyword
  const oaProjects = await getProjects({
    text_search: researchProjectId,
    limit: 10
  });

  if (oaProjects.length === 0) {
    console.log('No OpenAsset project found for', researchProjectId);
    return [];
  }

  const oaProject = oaProjects[0];

  // Fetch all images for this project
  const files = await getProjectFiles(oaProject.id, 50);

  // Get URLs for different sizes
  const images = files.map(file => ({
    id: file.id,
    filename: file.filename,
    caption: file.caption,
    photographer: file.photographer,
    keywords: file.keywords,
    original: getFileDownloadUrl(file, 'original'),
    large: getFileDownloadUrl(file, 'large'),
    thumbnail: getFileDownloadUrl(file, 'thumbnail'),
  }));

  return images;
}
```

### Pattern 2: Sync Project Metadata to Supabase

```typescript
async function syncOpenAssetToSupabase(projectId: string) {
  // Fetch from OpenAsset
  const oaProjects = await getProjects({ text_search: projectId });
  if (oaProjects.length === 0) return null;

  const oaProject = oaProjects[0];

  // Fetch field values
  const fieldsResponse = await fetch(
    `${OPENASSET_BASE_URL}/Projects/${oaProject.id}/Fields`,
    { headers: { 'Authorization': authHeader } }
  );

  const fields = await fieldsResponse.json();
  const fieldMap = {};
  fields.forEach(f => {
    fieldMap[f.id] = f.values && f.values.length > 0 ? f.values[0] : null;
  });

  // Update Supabase
  const { data, error } = await supabase
    .from('projects')
    .update({
      openasset_project_id: oaProject.id,
      openasset_code: oaProject.code,
      office: fieldMap[244],
      address: fieldMap[245],
      city: fieldMap[253],
      state: fieldMap[254],
      cost_estimate: cleanCost(fieldMap[246]),
      project_area_sqft: fieldMap[16],
      start_date: formatDate(fieldMap[2]),
      completion_date: formatDate(fieldMap[3]),
      description: fieldMap[5],
      image_count: oaProject.public_image_count,
    })
    .eq('id', projectId);

  return data;
}
```

### Pattern 3: Gallery Component with OpenAsset Images

```typescript
import { useState, useEffect } from 'react';
import { getProjectFiles, getFileDownloadUrl } from '../services/openAssetApi';

interface ImageGalleryProps {
  openAssetProjectId: number;
}

export function ImageGallery({ openAssetProjectId }: ImageGalleryProps) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImages() {
      try {
        const files = await getProjectFiles(openAssetProjectId, 50);

        const imageData = files.map(file => ({
          id: file.id,
          src: getFileDownloadUrl(file, 'large'),
          thumbnail: getFileDownloadUrl(file, 'thumbnail'),
          caption: file.caption,
          photographer: file.photographer,
        }));

        setImages(imageData);
      } catch (error) {
        console.error('Failed to load images:', error);
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, [openAssetProjectId]);

  if (loading) return <div>Loading images...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map(img => (
        <div key={img.id} className="relative">
          <img
            src={img.thumbnail}
            alt={img.caption || 'Project image'}
            className="w-full h-48 object-cover rounded-lg"
          />
          {img.caption && (
            <p className="text-sm mt-2 text-gray-600">{img.caption}</p>
          )}
          {img.photographer && (
            <p className="text-xs text-gray-400">Photo: {img.photographer}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Pattern 4: Batch Sync All Projects (Nightly Job)

```typescript
async function batchSyncAllProjects() {
  console.log('Starting OpenAsset batch sync...');

  let offset = 0;
  const limit = 100;
  let totalSynced = 0;

  while (true) {
    // Fetch batch of projects
    const oaProjects = await getProjects({ limit, offset });

    if (oaProjects.length === 0) break;

    // Sync each project
    for (const oaProject of oaProjects) {
      try {
        await syncOpenAssetToSupabase(oaProject.code);
        totalSynced++;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to sync ${oaProject.code}:`, error);
      }
    }

    offset += limit;
    console.log(`Synced ${totalSynced} projects so far...`);
  }

  console.log(`✓ Batch sync complete. Synced ${totalSynced} projects.`);
}
```

---

## Usage Examples

### Example 1: Get All Images for a Project

```typescript
import { getProjectFiles } from './services/openAssetApi';

// By OpenAsset project ID
const files = await getProjectFiles(12345, 50);

console.log(`Found ${files.length} images`);

files.forEach(file => {
  console.log(`- ${file.filename}`);
  console.log(`  Caption: ${file.caption || 'None'}`);
  console.log(`  Sizes: ${file.sizes.map(s => s.name).join(', ')}`);
  console.log('');
});
```

### Example 2: Search Projects by Text

```typescript
import { getProjects } from './services/openAssetApi';

// Search for a specific project
const results = await getProjects({
  text_search: 'Elementary School',
  limit: 10
});

results.forEach(project => {
  console.log(`${project.code} - ${project.name}`);
  console.log(`  Images: ${project.public_image_count}`);
  console.log(`  Keywords: ${project.keywords.join(', ')}`);
  console.log('');
});
```

### Example 3: Get Specific Image Sizes

```typescript
import { getFile, getFileDownloadUrl } from './services/openAssetApi';

const file = await getFile(67890);

const urls = {
  original: getFileDownloadUrl(file, 'original'),
  large: getFileDownloadUrl(file, 'large'),
  thumbnail: getFileDownloadUrl(file, 'thumbnail'),
};

console.log('Image URLs:');
console.log('Original:', urls.original);
console.log('Large:', urls.large);
console.log('Thumbnail:', urls.thumbnail);
```

### Example 4: Filter Images by Keyword

```typescript
import { searchFilesByKeyword } from './services/openAssetApi';

// Find all images tagged with "exterior"
const exteriorImages = await searchFilesByKeyword('exterior', 50);

console.log(`Found ${exteriorImages.length} exterior images`);

exteriorImages.forEach(img => {
  console.log(`- ${img.filename}`);
  console.log(`  Project ID: ${img.project_id}`);
  console.log(`  Photographer: ${img.photographer || 'Unknown'}`);
});
```

---

## Next Steps for Repository

### Phase 1: Setup & Testing (Week 1)

1. **Add OpenAsset API Client to Repository:**
   - Copy `openAssetApi.ts` to `src/services/`
   - Add environment variables to `.env.local`
   - Test connection with existing credentials

2. **Create Mapping System:**
   - Add `openasset_project_id` field to Supabase `projects` table
   - Create mapping table: `research_project_id` → `openasset_project_id`
   - Manual mapping initially (8 research projects)

3. **Test Image Retrieval:**
   - Pick one research project (X25-RB01)
   - Fetch images from OpenAsset
   - Display in project dashboard
   - Verify image quality and sizes

### Phase 2: Integration (Week 2)

1. **Update Project Dashboard:**
   - Replace Supabase Storage image galleries with OpenAsset
   - Add OpenAsset image selector for ImageGallery blocks
   - Keep Supabase Storage as fallback for custom images

2. **Add Admin UI:**
   - Project settings page to link OpenAsset projects
   - Search OpenAsset projects by name/code
   - Preview images before linking
   - Save mapping to database

3. **Metadata Sync:**
   - Sync project descriptions from OpenAsset
   - Pull photographer credits
   - Import keywords as tags

### Phase 3: Automation (Week 3)

1. **Scheduled Sync:**
   - Nightly job to sync new images
   - Update image counts
   - Pull metadata changes
   - Log sync results

2. **Image Optimization:**
   - Cache OpenAsset URLs in Supabase
   - Generate thumbnails if needed
   - Lazy loading for galleries

3. **Fallback Strategy:**
   - If OpenAsset unavailable, use cached URLs
   - Supabase Storage as permanent fallback
   - Error handling and user notifications

### Phase 4: Features (Week 4)

1. **Advanced Gallery:**
   - Filter by photographer
   - Filter by image type (exterior, interior, detail)
   - Lightbox with metadata display
   - Download options

2. **Research-Specific Tags:**
   - Tag images with research findings
   - "Featured in X25-RB01 Section 3"
   - Create custom keywords in OpenAsset

3. **Analytics:**
   - Track image views
   - Popular images per project
   - Missing image reports

---

## Questions to Answer Before Implementation

1. **Project Mapping:**
   - How do research project IDs (X25-RB01) map to OpenAsset projects?
   - Are there custom fields or keywords we can use?
   - Do we need manual mapping for all 8 projects?

2. **Image Selection:**
   - Should all OpenAsset images appear, or only tagged ones?
   - Do we need approval workflow for which images show publicly?
   - Who manages which images are "research-relevant"?

3. **Data Ownership:**
   - Is Supabase Storage still used for researcher-uploaded images?
   - Do we mix OpenAsset + Supabase images in one gallery?
   - Which is the "source of truth" for project images?

4. **Performance:**
   - Cache OpenAsset URLs in database?
   - Proxy images through Cloudflare?
   - Direct links to OpenAsset CDN?

5. **Permissions:**
   - Are all OpenAsset images public-facing?
   - Do some projects have image restrictions?
   - Copyright considerations for external sharing?

---

## Additional Resources

- **OpenAsset Developer Docs:** https://developers.openasset.com
- **Vision Project Reference:** `/Users/alexanderwickes/GitHub/Pfluger-Vision`
- **Current API Access:** `AW@pfluger`, `LS@pfluger`
- **Support Contact:** OpenAsset support team

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-01-29 | Initial guide created from Vision project | Alex Wickes |
| 2026-01-29 | Added Write Operations (upload, update, delete, tag management) | Alex Wickes |
| 2026-01-29 | Added Advanced Features from official documentation | Alex Wickes |

---

## Documentation Sources

This guide was compiled from:

1. **Vision Project Implementation** - Working OpenAsset integration from Pfluger-Vision BD tool
2. **Official OpenAsset API Documentation** - [developers.openasset.com](https://developers.openasset.com/)
3. **OpenAsset API Reference** - Verified all endpoints, operations, and limits
4. **OpenAsset Integration Guide** - [success.openasset.com](https://success.openasset.com/en/articles/3122502-developing-custom-integrations-using-the-openasset-rest-api)

**Verified Features:**
- ✅ CRUD operations (GET, POST, PUT, DELETE)
- ✅ MERGE operations for deduplication
- ✅ Batch limits (500 GET, 100-200 POST/PUT/DELETE, 3GB uploads)
- ✅ Advanced filtering with filterBy parameter
- ✅ Nesting and remote fields
- ✅ AWS S3 direct upload
- ✅ Image rotation
- ✅ Response headers
- ✅ Saved searches
- ✅ All major endpoints (Projects, Files, Keywords, Albums, etc.)

**Additional Resources:**
- [OpenAsset API Tracker](https://apitracker.io/a/openasset)
- [OpenAsset REST API Blog Post](https://openasset.com/blog/customise-your-openasset-with-our-rest-api/)

---

**End of OpenAsset Integration Guide**
