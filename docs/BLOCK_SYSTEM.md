# Block System Documentation

Welcome to the KZ Cloud CMS! This guide explains how our block-based page builder works across the dashboard (editor) and the server (public rendering).

## 1. What is a "Block"?

A block is a self-contained section of a page. In the database, every block is stored with two main properties:
- **`type`**: A string identifier (e.g., `"hero"`, `"features"`, `"navbar"`).
- **`content`**: A JSON object containing all the text, images, and settings for that specific block.

## 2. The Editor (Dashboard)

Located in: `apps/dashboard/src/components/cms-editor/`

The editor is split into three main parts:
1.  **Sidebar (`EditorSidebar.tsx`)**: Lists the layers (blocks) on the page. You can add, remove, or reorder blocks here.
2.  **Canvas (`EditorCanvas.tsx`)**: The visual preview. It iterates through the blocks and uses a `switch` statement to render the correct component from `blocks/`.
3.  **Inspector (`EditorInspector.tsx`)**: The right-hand panel where you edit the content of the *selected* block.

### Block Structure in Dashboard
Every block has two frontend components in `blocks/[block-name]/`:
- **`[Name]Block.tsx`**: How the block looks on the canvas.
- **`[Name]Inspector.tsx`**: The form fields used to edit that block's content.

## 3. Public Rendering (Server)

Located in: `apps/server/src/components/blocks/`

When a user visits a live website, the server fetches the blocks from the database and renders them as static HTML using JSX (Hono).

- **`blocks.tsx`**: The central hub that exports all server-side block components.
- **`blocks/[block-name]/[Name].tsx`**: The actual HTML/JSX for the public-facing block.

*Note: The server-side blocks are kept separate from the dashboard blocks to ensure the public website is lightweight and doesn't include editor-specific code.*

## 4. How to Add a New Block Type

To add a new block type (e.g., "Gallery"), follow these steps:

### Step A: Dashboard (Editor)
1.  Create `apps/dashboard/src/components/cms-editor/blocks/gallery/`.
2.  Create `GalleryBlock.tsx` (for the canvas preview).
3.  Create `GalleryInspector.tsx` (for the editing form).
4.  Add the "gallery" case to the `switch` in `EditorCanvas.tsx`.
5.  Add the "gallery" case to the `switch` in `EditorInspector.tsx`.
6.  Add the "gallery" definition to `AVAILABLE_BLOCKS` in `EditorSidebar.tsx`.

### Step B: Server (Public Site)
1.  Create `apps/server/src/components/blocks/gallery/Gallery.tsx`.
2.  Export it from `apps/server/src/components/blocks.tsx`.
3.  Update the page renderer (usually in `apps/server/src/routes/public.tsx`) to handle the new "gallery" type.

## 5. Design Principles
- **Keep it Simple**: Components should be "Plain Function Components."
- **Modular**: One file per component. Don't let files grow beyond 100-200 lines.
- **Consistent**: Use the shared helpers in `blocks/common.tsx` (Dashboard) and `blocks/utils.tsx` (Server) to keep the UI consistent.
