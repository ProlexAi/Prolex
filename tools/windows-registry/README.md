# Windows Registry Tools - Hide Default Folders

This directory contains Windows Registry (`.reg`) files to customize the appearance of "This PC" in Windows File Explorer.

## 📋 Overview

Windows displays several default folders in "This PC" (Desktop, Documents, Downloads, Music, Pictures, Videos, 3D Objects). While these folders can be useful, some users prefer a cleaner view. These registry files allow you to hide or restore these default folders.

**Important**: These tools only **hide** the folders from the "This PC" view. The actual folders and their contents remain unchanged on your system. You can still access them via the Quick Access sidebar or by navigating to `C:\Users\YourUsername\`.

## 📁 Files

| File | Description |
|------|-------------|
| `hide-default-folders.reg` | Hides all default folders from "This PC" |
| `restore-default-folders.reg` | Restores all default folders to "This PC" |
| `README.md` | This documentation file |

## 🎯 What Gets Hidden/Restored

The following folders are affected:

- 🖥️ **Desktop** - Your desktop folder
- 📄 **Documents** - Your documents folder
- 📥 **Downloads** - Your downloads folder
- 🎵 **Music** - Your music library
- 🖼️ **Pictures** - Your pictures library
- 🎬 **Videos** - Your videos library
- 🎨 **3D Objects** - 3D models folder (Windows 10)

## 🚀 Usage

### To Hide Default Folders

1. **Double-click** `hide-default-folders.reg`
2. Click **"Yes"** when User Account Control (UAC) prompts for permission
3. Click **"Yes"** to confirm adding the information to the registry
4. **Restart File Explorer** or log off and back on to see the changes

### To Restore Default Folders

1. **Double-click** `restore-default-folders.reg`
2. Click **"Yes"** when User Account Control (UAC) prompts for permission
3. Click **"Yes"** to confirm adding the information to the registry
4. **Restart File Explorer** or log off and back on to see the changes

### How to Restart File Explorer

**Method 1: Task Manager**
1. Press `Ctrl+Shift+Esc` to open Task Manager
2. Find "Windows Explorer" in the list
3. Right-click → "Restart"

**Method 2: Command Line**
1. Press `Win+R`
2. Type: `taskkill /f /im explorer.exe & start explorer.exe`
3. Press Enter

**Method 3: Log Off**
1. Simply log off and log back in to Windows

## ⚠️ Important Notes

### Safety

- ✅ **Safe to use**: These registry files only modify display settings
- ✅ **Reversible**: You can restore the folders at any time
- ✅ **Non-destructive**: Your actual files and folders remain untouched
- ⚠️ **Requires admin rights**: You need administrator privileges to apply these changes

### What Happens

**When you hide folders:**
- They disappear from "This PC" in File Explorer
- The folders still exist on your hard drive
- You can still access them via Quick Access or direct path navigation
- Applications can still use these folders normally

**When you restore folders:**
- They reappear in "This PC" in File Explorer
- Everything returns to Windows default behavior

### Compatibility

- ✅ Windows 10 (all versions)
- ✅ Windows 11 (all versions)
- ❌ Not applicable to Windows 7 or earlier

### Registry Keys Modified

These files modify registry keys under:
```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\MyComputer\NameSpace\
HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Explorer\MyComputer\NameSpace\
```

## 🔧 Advanced Usage

### Selective Hiding

If you want to hide only specific folders (e.g., only 3D Objects and Music), you can:

1. Open `hide-default-folders.reg` with a text editor (Notepad, VS Code, etc.)
2. Delete the sections for folders you want to keep visible
3. Save the file
4. Apply the modified `.reg` file

### Manual Registry Editing

If you prefer to edit the registry manually:

1. Press `Win+R` and type `regedit`
2. Navigate to:
   ```
   HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\MyComputer\NameSpace\
   ```
3. Delete the CLSID keys for folders you want to hide (see CLSID Reference below)
4. Restart File Explorer

### CLSID Reference

Each folder has a unique Class ID (CLSID):

| Folder | CLSID |
|--------|-------|
| Desktop | `{B4BFCC3A-DB2C-424C-B029-7FE99A87C641}` |
| Documents | `{d3162b92-9365-467a-956b-92703aca08af}` |
| Documents (Alt) | `{A8CDFF1C-4878-43be-B5FD-F8091C1C60D0}` |
| Downloads | `{088e3905-0323-4b02-9826-5d99428e115f}` |
| Downloads (Alt) | `{374DE290-123F-4565-9164-39C4925E467B}` |
| Music | `{3dfdf296-dbec-4fb4-81d1-6a3438bcf4de}` |
| Music (Alt) | `{1CF1260C-4DD0-4ebb-811F-33C572699FDE}` |
| Pictures | `{24ad3ad4-a569-4530-98e1-ab02f9417aa8}` |
| Pictures (Alt) | `{3ADD1653-EB32-4cb0-BBD7-DFA0ABB5ACCA}` |
| Videos | `{f86fa3ab-70d2-4fc7-9c99-fcbf05467f3a}` |
| Videos (Alt) | `{A0953C92-50DC-43bf-BE83-3742FED03C9C}` |
| 3D Objects | `{0DB7E03F-FC29-4DC6-9020-FF41B59E513A}` |

**Note**: Some folders have alternate CLSIDs (marked "Alt") for 32-bit applications on 64-bit Windows.

## 🛠️ Troubleshooting

### Changes Don't Appear

**Problem**: Applied the registry file but folders still visible/hidden

**Solutions**:
1. Restart File Explorer (see instructions above)
2. Log off and log back in
3. Restart your computer
4. Verify the registry changes were applied by opening `regedit`

### Access Denied Error

**Problem**: "Cannot edit the registry: Access denied"

**Solutions**:
1. Right-click the `.reg` file → "Run as administrator"
2. Ensure you're logged in as an administrator
3. Temporarily disable antivirus software (if it's blocking registry changes)

### Want to Undo Changes

**Problem**: Want to reverse the changes

**Solution**: Simply run the opposite `.reg` file:
- If you hid folders, run `restore-default-folders.reg`
- If you restored folders, run `hide-default-folders.reg`

### Can't Find My Files

**Problem**: "I hid the folders and now I can't find my files!"

**Solution**: Your files are still there! Access them via:
- **Quick Access** (left sidebar in File Explorer)
- **Direct path**: `C:\Users\YourUsername\Documents` (or Downloads, Pictures, etc.)
- **Run `restore-default-folders.reg`** to make folders visible again

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-23 | Initial release with hide/restore functionality |

## 📄 License

These registry files are provided as-is for personal use. Feel free to modify and distribute.

## 🤝 Contributing

If you'd like to suggest improvements or report issues, please open an issue in the repository.

## ⚡ Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│ QUICK REFERENCE - Windows Registry Tools                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ HIDE FOLDERS:                                           │
│   1. Double-click: hide-default-folders.reg             │
│   2. Click "Yes" twice                                   │
│   3. Restart File Explorer                               │
│                                                          │
│ RESTORE FOLDERS:                                        │
│   1. Double-click: restore-default-folders.reg          │
│   2. Click "Yes" twice                                   │
│   3. Restart File Explorer                               │
│                                                          │
│ RESTART EXPLORER:                                       │
│   Ctrl+Shift+Esc → Find "Windows Explorer" → Restart   │
│                                                          │
│ YOUR FILES ARE SAFE:                                    │
│   ✓ Files remain in C:\Users\YourUsername\              │
│   ✓ Quick Access still shows folders                    │
│   ✓ Applications can still access folders               │
│   ✓ Changes are fully reversible                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

**Last Updated**: 2025-11-23
**Maintained By**: Prolex AI System
**Status**: Production Ready
