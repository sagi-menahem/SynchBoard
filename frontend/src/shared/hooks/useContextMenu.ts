import { useState } from 'react';

export const useContextMenu = <T>() => {
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = useState(false);

  const [data, setData] = useState<T | null>(null);

  const handleContextMenu = (event: React.MouseEvent, contextData: T) => {
    event.preventDefault();

    setAnchorPoint({ x: event.clientX, y: event.clientY });
    setData(contextData);
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setData(null);
  };

  return {
    anchorPoint,
    isOpen,
    data,
    handleContextMenu,
    closeMenu,
  };
};
