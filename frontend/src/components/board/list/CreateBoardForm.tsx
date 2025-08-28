import React, { startTransition, useState } from 'react';

import { FileText, Monitor, Pencil, Plus, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getColorName } from 'utils/ColorUtils';

import { Button, ColorPicker, Input } from 'components/common';
import styles from 'components/common/CommonForm.module.css';
import utilStyles from 'components/common/utils.module.css';
import { CANVAS_CONFIG } from 'constants/BoardConstants';
import { useCreateBoardForm } from 'hooks/board/management';
import type { Board } from 'types/BoardTypes';

import BoardImageUpload from './BoardImageUpload';
import MemberInviteInput from './MemberInviteInput';

interface CreateBoardFormProps {
    onBoardCreated: (newBoard: Board) => void;
    onClose: () => void;
}

const CreateBoardForm: React.FC<CreateBoardFormProps> = ({ onBoardCreated, onClose }) => {
  const { t } = useTranslation();
  
  const getTranslationKey = (sizeKey: string): string => {
    const keyMap: Record<string, string> = {
      'WIDESCREEN': 'widescreen',
      'SQUARE': 'square',
      'PORTRAIT': 'portrait',
      'DOCUMENT': 'document',
    };
    return keyMap[sizeKey] || sizeKey.toLowerCase();
  };
  const { state, submitAction, isPending } = useCreateBoardForm(onBoardCreated);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState<string>(CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR);
  const [canvasSize, setCanvasSize] = useState<keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS | 'custom'>('WIDESCREEN');
  const [customWidth, setCustomWidth] = useState<number>(CANVAS_CONFIG.DEFAULT_WIDTH);
  const [customHeight, setCustomHeight] = useState<number>(CANVAS_CONFIG.DEFAULT_HEIGHT);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    
    if (selectedImage) {
      formData.append('picture', selectedImage);
    }
    
    inviteEmails.forEach((email) => {
      formData.append('inviteEmails', email);
    });

    formData.append('canvasBackgroundColor', canvasBackgroundColor);
    
    let width, height;
    if (canvasSize === 'custom') {
      width = customWidth;
      height = customHeight;
    } else {
      const preset = CANVAS_CONFIG.CANVAS_SIZE_PRESETS[canvasSize as keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS];
      width = preset.width;
      height = preset.height;
    }
    
    formData.append('canvasWidth', width.toString());
    formData.append('canvasHeight', height.toString());
    
    startTransition(() => {
      submitAction(formData);
    });
  };

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>
          <Plus size={20} />
          {t('createBoardForm.heading')}
        </h3>
      </div>

      <form onSubmit={handleFormSubmit} className={styles.form}>

      {state.error && (
        <div className={styles.error} role="alert">
          {state.error}
        </div>
      )}

      <div className={styles.imageField}>
        <BoardImageUpload onImageSelect={setSelectedImage} disabled={isPending} />
      </div>

      <div className={styles.field}>
        <label htmlFor="board-name">
          <Pencil size={14} />
          {t('createBoardForm.label.boardName')}
        </label>
        <Input
          id="board-name"
          name="name"
          type="text"
          placeholder={t('createBoardForm.placeholder.name')}
          required
          disabled={isPending}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="board-description">
          <FileText size={14} />
          {t('createBoardForm.label.description')}
        </label>
        <textarea
          id="board-description"
          name="description"
          placeholder={t('createBoardForm.placeholder.description')}
          rows={3}
          className={styles.description}
          disabled={isPending}
        />
      </div>

      <div className={styles.field}>
        <label>
          <Users size={14} />
          {t('createBoardForm.label.inviteMembers')}
        </label>
        <MemberInviteInput onMembersChange={setInviteEmails} disabled={isPending} />
      </div>

      <div className={styles.field}>
        <div className={utilStyles.settingRow}>
          <span className={utilStyles.settingLabel}>{t('createBoardForm.label.canvasBackground')}:</span>
          <ColorPicker
            color={canvasBackgroundColor}
            onChange={setCanvasBackgroundColor}
            disabled={isPending}
          />
          <span className={utilStyles.settingValue}>
            {(() => {
              const colorName = getColorName(canvasBackgroundColor);
              return colorName ? t(`colors.${colorName}`) : canvasBackgroundColor;
            })()}
          </span>
        </div>
      </div>

      <div className={styles.field}>
        <label>
          <Monitor size={14} />
          {t('createBoardForm.label.canvasSize')}
        </label>
        <div className={styles.canvasSizeOptions}>
          {/* Canvas Size Presets */}
          <div className={styles.sizeGroup}>
            {CANVAS_CONFIG.PRESET_ORDER.map((size) => {
              const preset = CANVAS_CONFIG.CANVAS_SIZE_PRESETS[size];
              return (
                <label key={size} className={styles.radioOption}>
                  <input
                    type="radio"
                    value={size}
                    checked={canvasSize === size}
                    onChange={(e) => setCanvasSize(e.target.value as typeof canvasSize)}
                    disabled={isPending}
                    aria-label={`${t(`canvasSize.presets.${getTranslationKey(size)}.label`)} (${preset.ratio}) - ${preset.width}×${preset.height}`}
                  />
                  <div className={styles.presetLabel}>
                    <span className={styles.presetName}>
                      {t(`canvasSize.presets.${getTranslationKey(size)}.label`)}
                    </span>
                    <span className={styles.presetInfo}>
                      ({preset.ratio}) - {preset.width}×{preset.height}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
          
          <div className={styles.sizeGroup}>
            <label className={styles.radioOption}>
              <input
                type="radio"
                value="custom"
                checked={canvasSize === 'custom'}
                onChange={(e) => setCanvasSize(e.target.value as typeof canvasSize)}
                disabled={isPending}
                aria-label={`${t('canvasSize.custom.label')}`}
              />
              <div className={styles.presetLabel}>
                <span className={styles.presetName}>
                  {t('canvasSize.custom.label')}
                </span>
                <span className={styles.presetInfo}>
                </span>
              </div>
            </label>
          </div>
        </div>
        {canvasSize === 'custom' && (
          <div className={styles.customSizeInputs}>
            <Input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(parseInt(e.target.value) || CANVAS_CONFIG.DEFAULT_WIDTH)}
              min={CANVAS_CONFIG.MIN_WIDTH}
              max={CANVAS_CONFIG.MAX_WIDTH}
              disabled={isPending}
              placeholder={t('createBoardForm.placeholder.width')}
            />
            <span>×</span>
            <Input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(parseInt(e.target.value) || CANVAS_CONFIG.DEFAULT_HEIGHT)}
              min={CANVAS_CONFIG.MIN_HEIGHT}
              max={CANVAS_CONFIG.MAX_HEIGHT}
              disabled={isPending}
              placeholder={t('createBoardForm.placeholder.height')}
            />
            <span>{t('createBoardForm.label.pixels')}</span>
          </div>
        )}
      </div>

      <div className={styles.buttonGroup}>
        <Button type="button" onClick={onClose} disabled={isPending} variant="secondary">
          {t('common.button.cancel')}
        </Button>
        <Button type="submit" disabled={isPending} variant="primary">
          {isPending ? t('common.button.creating') : t('createBoardForm.button.createBoard')}
        </Button>
      </div>
      </form>
    </div>
  );
};

export default CreateBoardForm;
