import type { CanvasConfig } from 'features/board/types/BoardTypes';
import { useCallback } from 'react';

/**
 * Props interface for useCanvasDownload hook.
 * Defines the configuration needed for canvas download operations.
 */
export interface UseCanvasDownloadProps {
  /** Name of the board to use in the downloaded file name */
  boardName: string;
  /** Canvas configuration including background color settings */
  canvasConfig?: CanvasConfig;
}

/**
 * Custom hook that manages canvas download functionality for board exports.
 * This hook provides the ability to download the current canvas as a PNG image with
 * proper background color handling and timestamp-based file naming.
 *
 * @param {string} boardName - Name of the board to use in the downloaded file name
 * @param {CanvasConfig} [canvasConfig] - Canvas configuration including background color and dimension settings
 * @returns Object containing the handleDownload function for triggering canvas exports
 */
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
