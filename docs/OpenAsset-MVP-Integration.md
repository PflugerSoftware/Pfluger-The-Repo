# OpenAsset MVP Integration - Repository Research Platform

**Goal:** Dead simple. One album per project. Store image IDs in blocks. Fetch on load.

---

## Organization

### Albums = Research Projects

One album per research project:

```
Albums:
  ├── X25-RB01 Sanctuary Spaces
  ├── X25-RB02 Modulizer Part 2
  ├── X25-RB03 A4LE Design Awards
  ├── X25-RB05 Mass Timber
  ├── X25-RB06 Timberlyne Study
  ├── X25-RB08 Modulizer Part 1
  └── X25-RB13 Modulizer Part 3
```

That's it. No tags, no filtering, no complexity.

---

## Setup (One-Time)

```typescript
// Create albums for all research projects
async function setupResearchAlbums() {
  const projects = [
    'X25-RB01 Sanctuary Spaces',
    'X25-RB02 Modulizer Part 2',
    'X25-RB03 A4LE Design Awards',
    'X25-RB05 Mass Timber',
    'X25-RB06 Timberlyne Study',
    'X25-RB08 Modulizer Part 1',
    'X25-RB13 Modulizer Part 3',
  ];

  for (const projectName of projects) {
    const album = await createAlbum(projectName, '');
    console.log(`✓ Created ${projectName} (Album ID: ${album.id})`);
  }
}

await setupResearchAlbums();
```

Done.

---

## Workflow

### 1. Upload Images to Album (During Research)

```typescript
// Upload image to OpenAsset
const uploaded = await uploadFile(imageFile, GENERIC_PROJECT_ID, {
  caption: 'Daylight analysis results',
  photographer: 'Pfluger R&B Team',
});

// Get album for this project
const albums = await openAssetGet('/Albums');
const album = albums.find(a => a.name.startsWith('X25-RB01'));

// Add to album
await addFilesToAlbum(album.id, [uploaded.id]);

console.log(`✓ Uploaded image ${uploaded.id} to X25-RB01`);
```

### 2. Build Dashboard Blocks (Admin UI)

When research project is complete, admin selects specific images:

**Admin UI Flow:**
1. Navigate to project editor: `/admin/projects/X25-RB01/edit`
2. Click "Add Image Gallery Block"
3. Browse OpenAsset album "X25-RB01 Sanctuary Spaces"
4. Select specific images (check boxes): ✓ 67890, ✓ 67891, ✓ 67892
5. Enter gallery title: "Environmental Analysis Results"
6. Click "Create Block"

**Stored in Supabase:**
```json
{
  "id": "gallery-analysis",
  "project_id": "X25-RB01",
  "block_type": "image-gallery",
  "block_order": 5,
  "data": {
    "title": "Environmental Analysis Results",
    "openasset_file_ids": [67890, 67891, 67892]
  }
}
```

### 3. Display on Frontend (Automatic)

Component fetches images by ID on page load:

```tsx
// src/components/blocks/ImageGalleryBlock.tsx

export function ImageGalleryBlock({ data }: ImageGalleryBlockProps) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImages() {
      if (data.openasset_file_ids) {
        // Fetch all files from OpenAsset
        const files = await Promise.all(
          data.openasset_file_ids.map(id => getFile(id))
        );

        // Map to display format
        const mappedImages = files.map(f => ({
          src: getFileDownloadUrl(f, 'large'),
          thumbnail: getFileDownloadUrl(f, 'thumbnail'),
          caption: f.caption || '',
          photographer: f.photographer || '',
          alt: f.description || f.caption || f.filename,
        }));

        setImages(mappedImages);
      }

      setLoading(false);
    }

    loadImages();
  }, [data.openasset_file_ids]);

  if (loading) return <div>Loading images...</div>;

  return (
    <div className="image-gallery">
      <h3>{data.title}</h3>
      <div className="grid grid-cols-3 gap-4">
        {images.map((img, i) => (
          <div key={i}>
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-64 object-cover rounded"
            />
            {img.caption && <p className="text-sm mt-2">{img.caption}</p>}
            {img.photographer && (
              <p className="text-xs text-gray-500">Photo: {img.photographer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Admin UI Components

### Image Browser

```tsx
// src/components/Admin/OpenAssetImageBrowser.tsx

interface ImageBrowserProps {
  albumId: number;
  onSelect: (fileIds: number[]) => void;
}

export function OpenAssetImageBrowser({ albumId, onSelect }: ImageBrowserProps) {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function loadImages() {
      const files = await getAlbumFiles(albumId);
      setImages(files);
    }
    loadImages();
  }, [albumId]);

  function toggleSelect(fileId: number) {
    const newSelected = new Set(selected);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelected(newSelected);
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        {images.map(img => (
          <div
            key={img.id}
            onClick={() => toggleSelect(img.id)}
            className={`cursor-pointer border-2 p-2 rounded ${
              selected.has(img.id) ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            <img
              src={getFileDownloadUrl(img, 'thumbnail')}
              alt={img.caption}
              className="w-full h-32 object-cover"
            />
            {selected.has(img.id) && (
              <div className="text-blue-500 text-center">✓</div>
            )}
            <div className="text-xs truncate">{img.filename}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSelect(Array.from(selected))}
        disabled={selected.size === 0}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Add {selected.size} Image{selected.size !== 1 ? 's' : ''}
      </button>
    </div>
  );
}
```

### Gallery Block Editor

```tsx
// src/components/Admin/GalleryBlockEditor.tsx

export function GalleryBlockEditor({ projectId, onSave }: EditorProps) {
  const [title, setTitle] = useState('');
  const [fileIds, setFileIds] = useState<number[]>([]);
  const [showBrowser, setShowBrowser] = useState(false);

  // Get album ID for this project
  const { data: project } = await supabase
    .from('projects')
    .select('openasset_album_id')
    .eq('id', projectId)
    .single();

  function handleSave() {
    const blockData = {
      title,
      openasset_file_ids: fileIds,
    };
    onSave(blockData);
  }

  return (
    <div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Gallery Title"
        className="border p-2 w-full mb-4"
      />

      <div className="mb-4">
        <p>{fileIds.length} images selected</p>
        <button
          onClick={() => setShowBrowser(true)}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Select Images from OpenAsset
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={!title || fileIds.length === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Create Gallery Block
      </button>

      {showBrowser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded max-w-4xl">
            <OpenAssetImageBrowser
              albumId={project.openasset_album_id}
              onSelect={(ids) => {
                setFileIds([...fileIds, ...ids]);
                setShowBrowser(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Implementation Checklist

### Phase 1: OpenAsset Setup
- [ ] Create albums for all 7 research projects
- [ ] Upload images to albums

### Phase 2: API Integration
- [ ] Add `openAssetApi.ts` to Repository
- [ ] Add environment variables
- [ ] Test connection

### Phase 3: Admin UI
- [ ] Build `OpenAssetImageBrowser` component
- [ ] Build `GalleryBlockEditor` component
- [ ] Add to admin project editor

### Phase 4: Frontend Display
- [ ] Update `ImageGalleryBlock` to fetch by file IDs
- [ ] Add loading states
- [ ] Test on project dashboards

---

## Key Points

✅ **Albums organize images** - One per research project
✅ **Blocks store file IDs** - `[67890, 67891, 67892]`
✅ **Component fetches on load** - Gets files from OpenAsset by ID
✅ **No tags needed** - Keep it simple
✅ **No filtering logic** - Admin selects exact images
✅ **Images can be in multiple albums** - NOT copied, just referenced
✅ **Rename-safe** - Uses file ID, not filename

---

**That's the whole MVP. Simple.**
