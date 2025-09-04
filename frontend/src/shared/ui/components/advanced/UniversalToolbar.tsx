import type {
  ButtonToolbarItem,
  CustomToolbarItem,
  MemberActivityToolbarItem,
  SearchToolbarItem,
  TitleToolbarItem,
  ToolbarItem,
  UniversalToolbarProps,
  ViewToggleToolbarItem,
} from 'features/board/types/ToolbarTypes';
import { MemberActivityIndicator } from 'features/board/ui';
import React, { useMemo, useCallback } from 'react';

import Button from '../forms/Button';
import { SearchBar } from '../navigation/SearchBar';
import { ViewToggle } from '../navigation/ViewToggle';

import styles from './UniversalToolbar.module.scss';

const ToolbarButton: React.FC<{ item: ButtonToolbarItem }> = React.memo(({ item }) => {
  const {
    icon: Icon,
    label,
    onClick,
    variant = 'secondary',
    disabled = false,
    visible = true,
    className,
  } = item;

  const isIconOnly = useMemo(
    () => variant === 'navigation' || variant === 'icon' || className === 'iconOnlyButton',
    [variant, className],
  );

  const buttonVariant = useMemo(() => (isIconOnly ? 'icon' : variant), [isIconOnly, variant]);

  if (!visible) {
    return null;
  }

  return (
    <Button
      variant={buttonVariant}
      onClick={onClick}
      disabled={disabled}
      type="button"
      title={label}
      aria-label={label}
    >
      {Icon && <Icon size={20} />}
      {!isIconOnly && <span className={styles.buttonLabel}>{label}</span>}
    </Button>
  );
});

ToolbarButton.displayName = 'ToolbarButton';

const ToolbarTitle: React.FC<{ item: TitleToolbarItem }> = ({ item }) => {
  const { content, visible = true, className, clickable = false, onClick } = item;

  if (!visible) {
    return null;
  }

  const titleClass = [styles.toolbarTitle, clickable && styles.clickableTitle, className]
    .filter(Boolean)
    .join(' ');

  if (clickable && onClick) {
    return (
      <Button
        variant="icon"
        className={`${titleClass} ${styles.titleButton}`}
        onClick={onClick}
        type="button"
        aria-label={`Edit ${content}`}
      >
        {content}
      </Button>
    );
  }

  return <h1 className={titleClass}>{content}</h1>;
};

const ToolbarSearch: React.FC<{ item: SearchToolbarItem }> = ({ item }) => {
  const { placeholder, value, onSearch, onClear, visible = true, className } = item;

  if (!visible) {
    return null;
  }

  return (
    <SearchBar
      placeholder={placeholder}
      value={value}
      onSearch={onSearch}
      onClear={onClear}
      className={className}
    />
  );
};

const ToolbarViewToggle: React.FC<{ item: ViewToggleToolbarItem }> = ({ item }) => {
  const { value, onChange, visible = true, className } = item;

  if (!visible) {
    return null;
  }

  return <ViewToggle value={value} onChange={onChange} className={className} />;
};

const ToolbarMemberActivity: React.FC<{ item: MemberActivityToolbarItem }> = ({ item }) => {
  const { memberCount, onlineCount, onClick, visible = true, className } = item;

  if (!visible) {
    return null;
  }

  return (
    <MemberActivityIndicator
      memberCount={memberCount}
      onlineCount={onlineCount}
      onClick={onClick}
      className={className}
    />
  );
};

const ToolbarCustom: React.FC<{ item: CustomToolbarItem }> = ({ item }) => {
  const { content, visible = true, className } = item;

  if (!visible) {
    return null;
  }

  return <div className={`${styles.customItem} ${className ?? ''}`}>{content}</div>;
};

const ToolbarSection: React.FC<{
  items: ToolbarItem[];
  className?: string;
}> = React.memo(({ items, className }) => {
  const renderToolbarItem = useCallback((item: ToolbarItem, index: number): React.ReactNode => {
    const key = item.key ?? `${item.type}-${index}`;

    switch (item.type) {
      case 'title':
        return <ToolbarTitle key={key} item={item} />;
      case 'button':
        return <ToolbarButton key={key} item={item} />;
      case 'search':
        return <ToolbarSearch key={key} item={item} />;
      case 'viewToggle':
        return <ToolbarViewToggle key={key} item={item} />;
      case 'memberActivity':
        return <ToolbarMemberActivity key={key} item={item} />;
      case 'custom':
        return <ToolbarCustom key={key} item={item} />;
      default:
        return null;
    }
  }, []);

  const sectionClasses = useMemo(() => `${styles.toolbarSection} ${className ?? ''}`, [className]);

  return <div className={sectionClasses}>{items.map(renderToolbarItem)}</div>;
});

ToolbarSection.displayName = 'ToolbarSection';

export const UniversalToolbar: React.FC<UniversalToolbarProps> = React.memo(
  ({ config, className }) => {
    const { leftSection = [], centerSection = [], rightSection = [] } = config;
    const toolbarRef = React.useRef<HTMLElement>(null);

    const toolbarClasses = useMemo(
      () => `${styles.universalToolbar} ${className ?? ''}`,
      [className],
    );

    return (
      <header ref={toolbarRef} className={toolbarClasses}>
        <ToolbarSection items={leftSection} className={styles.leftSection} />
        <ToolbarSection items={centerSection} className={styles.centerSection} />
        <ToolbarSection items={rightSection} className={styles.rightSection} />
      </header>
    );
  },
);

UniversalToolbar.displayName = 'UniversalToolbar';

export default UniversalToolbar;
