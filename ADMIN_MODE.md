# Admin Picker Mode - Feature Documentation

## Overview

The CSB Motif Explorer now includes a hidden admin mode that allows administrators to create case studies by selecting points on the interactive map.

## Activation

Admin mode is triggered by adding `?admin=1` to the URL:

- Normal mode: `http://localhost:4173/#explore`
- Admin mode: `http://localhost:4173/#explore?admin=1`

## Features

### Visual Indicators

- **Red "ADMIN MODE" badge** appears next to the page title
- **Additional help text** explains the admin functionality
- **Three-column layout** with admin panel on the right

### Admin Panel Functionality

1. **Point Selection**

   - Click any point on the map to add it to the admin selections
   - Panel shows the **last 2 selections only**
   - Each selection displays:
     - Thumbnail image of the patch
     - Ball name
     - Family/cluster label
   - **Clear button** to reset selections

2. **Case Study Creation**

   - **"Add as case study" button** appears when exactly 2 points are selected
   - Creates a case study entry with:
     - Descriptive title combining both ball names
     - Auto-generated note mentioning the families
     - Left and right thumbnail paths

3. **Export Functionality**
   - **Case Studies counter** shows how many have been created
   - **"Download case_studies.json" button** exports all created case studies
   - Downloads as a client-side blob file
   - Compatible with existing case studies format

### Normal Mode Preserved

- Hover functionality still shows Ball + Family information
- All existing features work normally
- Admin mode doesn't interfere with regular user experience

## Technical Implementation

### URL Parameter Detection

```javascript
function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setIsAdmin(urlParams.get("admin") === "1");
  }, []);

  return isAdmin;
}
```

### Case Study Format

```json
{
  "title": "Comparison between Ball1 and Ball2",
  "note": "Patches from Family A and Family B families - worth expert review?",
  "left": "/thumbs/patch_0012.jpg",
  "right": "/thumbs/patch_0084.jpg"
}
```

### Admin Panel States

- **Empty state**: Instructions to click points
- **1 selection**: Shows selected point, prompts for second
- **2 selections**: Shows both points, enables "Add as case study"
- **With case studies**: Shows export option

## Testing Checklist

✅ **Admin Mode Activation**

- [ ] Visit `/#explore?admin=1`
- [ ] Verify "ADMIN MODE" badge appears
- [ ] Confirm admin panel appears on right

✅ **Point Selection**

- [ ] Click a point, verify it appears in admin panel
- [ ] Click a second point, verify both show (max 2)
- [ ] Click a third point, verify first is removed
- [ ] Clear selections, verify panel empties

✅ **Case Study Creation**

- [ ] Select 2 points
- [ ] Click "Add as case study"
- [ ] Verify case study is added to list
- [ ] Repeat to create multiple case studies

✅ **Export Functionality**

- [ ] Create at least 2 case studies
- [ ] Click "Download case_studies.json"
- [ ] Verify file downloads
- [ ] Check JSON format matches expected structure

✅ **Normal Mode Compatibility**

- [ ] Hover over points shows Ball + Family
- [ ] Regular selection mode works when admin=1 is not present
- [ ] No visual artifacts or broken functionality

## Usage Workflow

1. Navigate to `/#explore?admin=1`
2. Click two interesting points on the map
3. Click "Add as case study" to save the comparison
4. Repeat for multiple case studies
5. Click "Download case_studies.json" to export
6. Use the exported file for further analysis or documentation

## Security Note

This is a **client-side only** feature that doesn't require server authentication. The admin mode is "hidden" but not secured - anyone who knows the URL parameter can access it. For production use, consider adding proper authentication.
