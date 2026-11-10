import JSZip from 'jszip';
import { PROJECT_BUNDLE_FILES } from '../data/projectFiles';

export async function generateProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root folder inside the zip
  const root = zip.folder('FOODVISION_AI_360') || zip;

  // Add all pre-configured project files
  for (const file of PROJECT_BUNDLE_FILES) {
    root.file(file.path, file.content);
  }

  // Create empty placeholder directories as requested in section 14
  root.folder('data/uploads');
  root.folder('data/models');
  root.folder('data/database');
  root.folder('datasets');
  root.folder('app/assets');

  // Add a standalone lightweight HTML/JS app bundle for the /app folder
  root.file(
    'app/index.html',
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FOODVISION AI 360° - Standalone App</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js"></script>
</head>
<body>
  <h1>FOODVISION AI 360° - Local App</h1>
  <p>Run via local web server or launch through start_windows.bat.</p>
</body>
</html>`
  );

  root.file(
    'app/style.css',
    `/* FOODVISION AI 360 Styles */
body { font-family: sans-serif; background: #0b132b; color: #fff; padding: 2rem; }`
  );

  const content = await zip.generateAsync({ type: 'blob' });
  return content;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
