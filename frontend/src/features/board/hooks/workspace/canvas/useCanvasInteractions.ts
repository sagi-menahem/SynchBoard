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
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
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
 * @param handleMouseDown - Fallback mouse down handler for standard drawing operations
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
  handleMouseDown,
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

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (tool === TOOLS.COLOR_PICKER && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const imageData = ctx.getImageData(x, y, 1, 1);
          const data = imageData.data;

          if (data[3] === 0) {
            const backgroundColor = canvasBackgroundColor ?? '#FFFFFF';
            const normalizedColor =
              backgroundColor.length === 4
                ? `#${backgroundColor
                    .slice(1)
                    .split('')
                    .map((c) => c + c)
                    .join('')}`
                : backgroundColor;
            onColorPick?.(normalizedColor);
          } else {
            const hex = `#${((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2]).toString(16).slice(1)}`;
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
      handleMouseDown(e);
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
      handleMouseDown,
    ],
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (tool !== TOOLS.RECOLOR || canvasRef.current === null) {
        return;
      }

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const cursor = getRecolorCursor(
        { x: mouseX, y: mouseY },
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
    handleCanvasClick,
    handleCanvasMouseMove,
    handleTextSubmit,
    handleTextCancel,
    getBackgroundStyle,
  };
};
