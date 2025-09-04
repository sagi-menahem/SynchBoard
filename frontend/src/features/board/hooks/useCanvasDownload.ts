import type { CanvasConfig } from 'features/board/types/BoardTypes';
import { useCallback } from 'react';


export interface UseCanvasDownloadProps {
  boardName: string;
  canvasConfig?: CanvasConfig;
}

export function useCanvasDownload({ boardName, canvasConfig }: UseCanvasDownloadProps) {
  const handleDownload = useCallback(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) {
      return;
    }

    const backgroundColor = canvasConfig?.backgroundColor ?? '#FFFFFF';
    tempCtx.fillStyle = backgroundColor;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    tempCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `${boardName}-${timestamp}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  }, [boardName, canvasConfig]);

  return { handleDownload };
}
