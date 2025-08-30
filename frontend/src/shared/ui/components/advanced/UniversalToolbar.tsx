import React from 'react';

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

import Button from '../forms/Button';

import { SearchBar } from '../navigation/SearchBar';
import { ViewToggle } from '../navigation/ViewToggle';

import styles from './UniversalToolbar.module.scss';

const ToolbarButton: React.FC<{ item: ButtonToolbarItem }> = ({ item }) => {
  const {
    icon: Icon,
    label,
    onClick,
    variant = 'secondary',
    disabled = false,
    visible = true,
    className,
  } = item;

  if (!visible) {return null;}

  const buttonClass = [
    styles[variant],
    disabled && styles.disabled,
    className && styles[className],
  ].filter(Boolean).join(' ');

  return (
    <Button
      variant={variant as any}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      type="button"
      title={label}
    >
      {Icon && <Icon size={20} />}
      <span className={styles.buttonLabel}>{label}</span>
    </Button>
  );
};

const ToolbarTitle: React.FC<{ item: TitleToolbarItem }> = ({ item }) => {
  const { content, visible = true, className, clickable = false, onClick } = item;

  if (!visible) {return null;}

  const titleClass = [
    styles.toolbarTitle,
    clickable && styles.clickableTitle,
    className,
  ].filter(Boolean).join(' ');

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

  return (
    <h1 className={titleClass}>
      {content}
    </h1>
  );
};

const ToolbarSearch: React.FC<{ item: SearchToolbarItem }> = ({ item }) => {
  const { placeholder, value, onSearch, onClear, visible = true, className } = item;

  if (!visible) {return null;}

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

  if (!visible) {return null;}

  return (
    <ViewToggle
      value={value}
      onChange={onChange}
      className={className}
    />
  );
};

const ToolbarMemberActivity: React.FC<{ item: MemberActivityToolbarItem }> = ({ item }) => {
  const { memberCount, onlineCount, onClick, visible = true, className } = item;

  if (!visible) {return null;}

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

  if (!visible) {return null;}

  return (
    <div className={`${styles.customItem} ${className ?? ''}`}>
      {content}
    </div>
  );
};

const renderToolbarItem = (item: ToolbarItem, index: number): React.ReactNode => {
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
};

const ToolbarSection: React.FC<{ items: ToolbarItem[]; className?: string }> = ({ items, className }) => {
  return (
    <div className={`${styles.toolbarSection} ${className ?? ''}`}>
      {items.map(renderToolbarItem)}
    </div>
  );
};

export const UniversalToolbar: React.FC<UniversalToolbarProps> = ({ config, className }) => {
  const { leftSection = [], centerSection = [], rightSection = [] } = config;

  return (
    <header className={`${styles.universalToolbar} ${className ?? ''}`}>
      <ToolbarSection items={leftSection} className={styles.leftSection} />
      <ToolbarSection items={centerSection} className={styles.centerSection} />
      <ToolbarSection items={rightSection} className={styles.rightSection} />
    </header>
  );
};

export default UniversalToolbar;