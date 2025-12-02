import { TOOLS } from 'features/board/constants/BoardConstants';
import type {
  ActionPayload,
  SendBoardActionRequest,
  TextBoxPayload,
} from 'features/board/types/BoardObjectTypes';
import { getRecolorCursor } from 'features/board/utils/cursorUtils';
import { processRecolorClick } from 'features/board/utils/recolorLogic';
import { useUserBoardPreferences } from 'features/settings/UserBoardPreferencesProvider';
import { useCallback, useState } from 'react';
import { CHAT_BACKGROUND_OPTIONS } from 'shared/constants';
import type { Tool } from 'shared/types/CommonTypes';

interface UseCanvasInteractionsProps {
  tool: Tool;
  strokeColor: string;
  fontSize: number;
  instanceId: string;
  objects: ActionPayload[];
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
  onColorPick?: (color: string) => void;
  canvasBackgroundColor?: string;
  handlePointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  zoomScale?: number;
}

/**
 * Custom hook that manages specialized canvas interactions including color picking, recoloring, and text input.
 * This hook provides advanced interaction capabilities beyond basic drawing, handling tool-specific behaviors
 * such as color picker sampling, object recoloring with hover feedback, text input overlay management, and
 * background styling preferences integration. It processes complex interactions that require pixel-level canvas
 * access, coordinate transformations, and specialized tool logic. The hook coordinates between user interactions
 * and drawing actions while maintaining proper state management for text input overlays and dynamic cursor
 * feedback for recoloring operations.
 *
 * @param tool - Currently active drawing tool that determines interaction behavior
 * @param strokeColor - Active color setting for drawing and recoloring operations
 * @param fontSize - Font size setting for text input operations
 * @param instanceId - Unique identifier for action tracking and collaboration
 * @param objects - Array of existing canvas objects for recoloring target detection
 * @param canvasRef - Reference to the HTML canvas element for pixel access and coordinate calculations
 * @param onDraw - Callback function for submitting drawing actions to the collaboration system
 * @param onColorPick - Optional callback for color picker tool results
 * @param canvasBackgroundColor - Optional canvas background color for transparent pixel handling
 * @param handlePointerDown - Fallback pointer down handler for standard drawing operations
 * @param zoomScale - Optional zoom scale factor for coordinate adjustment (default 1.0)
 * @returns Object containing text input state, cursor styles, and specialized interaction handlers
 */
export const useCanvasInteractions = ({
  tool,
  strokeColor,
  fontSize,
  instanceId,
  objects,
  canvasRef,
  onDraw,
  onColorPick,
  canvasBackgroundColor,
  handlePointerDown,
  zoomScale = 1.0,
}: UseCanvasInteractionsProps) => {
  const { preferences } = useUserBoardPreferences();
  const [textInput, setTextInput] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [recolorCursor, setRecolorCursor] = useState<string>('crosshair');

  const handleTextInputRequest = useCallback(
    (x: number, y: number, width: number, height: number) => {
      setTextInput({ x, y, width, height });
    },
    [],
  );

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      // Middle mouse button (button === 1) is reserved for panning - skip all tool logic
      if (e.button === 1) {
        handlePointerDown(e);
        return;
      }

      if (tool === TOOLS.COLOR_PICKER && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const rect = canvas.getBoundingClientRect();
          // Adjust coordinates for zoom scale - divide by scale to get actual canvas pixel position
          const x = (e.clientX - rect.left) / zoomScale;
          const y = (e.clientY - rect.top) / zoomScale;
          const imageData = ctx.getImageData(x, y, 1, 1);
          const data = imageData.data;

          // Check for transparent pixel (alpha channel = 0)
          if (data[3] === 0) {
            const backgroundColor = canvasBackgroundColor ?? '#FFFFFF';
            // Expand 3-digit hex shorthand to 6-digit format (#ABC -> #AABBCC)
            // Character duplication algorithm: each hex digit is repeated to create full RGB values
            const normalizedColor =
              backgroundColor.length === 4
                ? `#${backgroundColor
                    .slice(1)
                    .split('')
                    .map((c) => c + c) // Duplicate each character (#A -> AA, #B -> BB, #C -> CC)
                    .join('')}`
                : backgroundColor;
            onColorPick?.(normalizedColor);
          } else {
            // Convert RGB pixel data to hexadecimal color string
            const hex = `#${((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2]).toString(16).slice(1)}`;
            // Bit manipulation: (1 << 24) ensures 6-digit hex by setting bit 24, then slice(1) removes leading '1'
            onColorPick?.(hex);
          }
        }
        e.preventDefault();
        return;
      } else if (tool === TOOLS.RECOLOR && canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const recolorAction = processRecolorClick(
          { x: clickX, y: clickY },
          objects,
          canvas.width,
          canvas.height,
          strokeColor,
          instanceId,
        );

        if (recolorAction.shouldPerformAction && recolorAction.action) {
          onDraw(recolorAction.action);
        }

        e.preventDefault();
        return;
      }
      handlePointerDown(e);
    },
    [
      tool,
      canvasRef,
      onColorPick,
      canvasBackgroundColor,
      objects,
      strokeColor,
      instanceId,
      onDraw,
      handlePointerDown,
    ],
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (tool !== TOOLS.RECOLOR || canvasRef.current === null) {
        return;
      }

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      const cursor = getRecolorCursor(
        { x: pointerX, y: pointerY },
        objects,
        canvas.width,
        canvas.height,
      );

      setRecolorCursor(cursor);
    },
    [tool, objects, canvasRef],
  );

  const handleTextSubmit = useCallback(
    (text: string) => {
      if (textInput !== null && canvasRef.current !== null) {
        const canvas = canvasRef.current;
        onDraw({
          type: 'OBJECT_ADD',
          payload: {
            tool: TOOLS.TEXT,
            x: textInput.x / canvas.width,
            y: textInput.y / canvas.height,
            width: textInput.width / canvas.width,
            height: textInput.height / canvas.height,
            text,
            fontSize,
            color: strokeColor,
          } as Omit<TextBoxPayload, 'instanceId'>,
          sender: instanceId,
        });
      }
      setTextInput(null);
    },
    [textInput, canvasRef, onDraw, fontSize, strokeColor, instanceId],
  );

  const handleTextCancel = useCallback(() => {
    setTextInput(null);
  }, []);

  const getBackgroundStyle = useCallback(() => {
    const savedColor = preferences.boardBackgroundSetting;
    if (!savedColor) {
      return {};
    }

    const backgroundOption = CHAT_BACKGROUND_OPTIONS.find((option) => option.color === savedColor);
    if (backgroundOption?.cssVar) {
      return { backgroundColor: `var(${backgroundOption.cssVar})` };
    }

    return { backgroundColor: savedColor };
  }, [preferences.boardBackgroundSetting]);

  return {
    textInput,
    recolorCursor,

    handleTextInputRequest,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleTextSubmit,
    handleTextCancel,
    getBackgroundStyle,
  };
};
