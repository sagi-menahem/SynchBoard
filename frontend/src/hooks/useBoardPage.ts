// File: frontend/src/hooks/useBoardPage.ts
import { useState } from 'react';
import { DEFAULT_DRAWING_CONFIG, TOOLS, type TOOL_LIST } from '../constants/board.constants';
import type { Member } from '../types/board.types';

type Tool = typeof TOOL_LIST[number];

export const useBoardPage = () => {

    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const openInviteModal = () => setInviteModalOpen(true);
    const closeInviteModal = () => setInviteModalOpen(false);

    const [tool, setTool] = useState<Tool>(TOOLS.BRUSH);
    const [strokeColor, setStrokeColor] = useState<string>(DEFAULT_DRAWING_CONFIG.STROKE_COLOR);
    const [strokeWidth, setStrokeWidth] = useState<number>(DEFAULT_DRAWING_CONFIG.STROKE_WIDTH);

    const handleInviteSuccess = (newMember: Member) => {
        console.log('Successfully invited:', newMember);
        closeInviteModal();
    };

    return {
        isInviteModalOpen,
        openInviteModal,
        closeInviteModal,
        handleInviteSuccess,
        tool,
        setTool,
        strokeColor,
        setStrokeColor,
        strokeWidth,
        setStrokeWidth,
    };
};