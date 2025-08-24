import React, { startTransition, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Button, ColorPicker, Input } from 'components/common';
import styles from 'components/common/CommonForm.module.css';
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
      'MEDIUM_LANDSCAPE': 'mediumLandscape',
      'LARGE_LANDSCAPE': 'largeLandscape', 
      'EXTRA_LARGE_LANDSCAPE': 'extraLargeLandscape',
      'MEDIUM_PORTRAIT': 'mediumPortrait',
      'LARGE_PORTRAIT': 'largePortrait',
      'EXTRA_LARGE_PORTRAIT': 'extraLargePortrait',
    };
    return keyMap[sizeKey] || sizeKey.toLowerCase();
  };
  const { state, submitAction, isPending } = useCreateBoardForm(onBoardCreated);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState<string>(CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR);
  const [canvasSize, setCanvasSize] = useState<keyof typeof CANVAS_CONFIG.SIZE_PRESETS | 'custom'>('MEDIUM_LANDSCAPE');
  const [customWidth, setCustomWidth] = useState<number>(CANVAS_CONFIG.DEFAULT_WIDTH);
  const [customHeight, setCustomHeight] = useState<number>(CANVAS_CONFIG.DEFAULT_HEIGHT);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    
    // Add image if selected
    if (selectedImage) {
      formData.append('picture', selectedImage);
    }
    
    // Add invite emails
    inviteEmails.forEach((email) => {
      formData.append('inviteEmails', email);
    });

    // Add canvas settings
    formData.append('canvasBackgroundColor', canvasBackgroundColor);
    
    let width, height;
    if (canvasSize === 'custom') {
      width = customWidth;
      height = customHeight;
    } else {
      const preset = CANVAS_CONFIG.SIZE_PRESETS[canvasSize as keyof typeof CANVAS_CONFIG.SIZE_PRESETS];
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
    <form onSubmit={handleFormSubmit} className={styles.form}>
      <h3>{t('createBoardForm.heading')}</h3>

      {state.error && (
        <div className={styles.error} role="alert">
          {state.error}
        </div>
      )}

      <div className={styles.imageField}>
        <BoardImageUpload onImageSelect={setSelectedImage} disabled={isPending} />
      </div>

      <div className={styles.field}>
        <label htmlFor="board-name">{t('createBoardForm.label.boardName')}</label>
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
        <label htmlFor="board-description">{t('createBoardForm.label.description')}</label>
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
        <label>{t('createBoardForm.label.inviteMembers')}</label>
        <MemberInviteInput onMembersChange={setInviteEmails} disabled={isPending} />
      </div>

      <div className={styles.field}>
        <ColorPicker
          color={canvasBackgroundColor}
          onChange={setCanvasBackgroundColor}
          disabled={isPending}
          label={t('createBoardForm.label.canvasBackground')}
        />
      </div>

      <div className={styles.field}>
        <label>{t('createBoardForm.label.canvasSize')}</label>
        <div className={styles.canvasSizeOptions}>
          {/* Landscape Options */}
          <div className={styles.sizeGroup}>
            <h4 className={styles.groupLabel}>{t('createBoardForm.canvasSize.landscape')}</h4>
            {(['MEDIUM_LANDSCAPE', 'LARGE_LANDSCAPE', 'EXTRA_LARGE_LANDSCAPE'] as const).map((size) => {
              const preset = CANVAS_CONFIG.SIZE_PRESETS[size];
              return (
                <label key={size} className={styles.radioOption}>
                  <input
                    type="radio"
                    value={size}
                    checked={canvasSize === size}
                    onChange={(e) => setCanvasSize(e.target.value as typeof canvasSize)}
                    disabled={isPending}
                  />
                  {t(`createBoardForm.canvasSize.${getTranslationKey(size)}`)} ({preset.width}×{preset.height})
                </label>
              );
            })}
          </div>
          
          {/* Portrait Options */}
          <div className={styles.sizeGroup}>
            <h4 className={styles.groupLabel}>{t('createBoardForm.canvasSize.portrait')}</h4>
            {(['MEDIUM_PORTRAIT', 'LARGE_PORTRAIT', 'EXTRA_LARGE_PORTRAIT'] as const).map((size) => {
              const preset = CANVAS_CONFIG.SIZE_PRESETS[size];
              return (
                <label key={size} className={styles.radioOption}>
                  <input
                    type="radio"
                    value={size}
                    checked={canvasSize === size}
                    onChange={(e) => setCanvasSize(e.target.value as typeof canvasSize)}
                    disabled={isPending}
                  />
                  {t(`createBoardForm.canvasSize.${getTranslationKey(size)}`)} ({preset.width}×{preset.height})
                </label>
              );
            })}
          </div>
          
          {/* Custom Option */}
          <div className={styles.sizeGroup}>
            <h4 className={styles.groupLabel}>{t('createBoardForm.canvasSize.customGroup')}</h4>
            <label className={styles.radioOption}>
              <input
                type="radio"
                value="custom"
                checked={canvasSize === 'custom'}
                onChange={(e) => setCanvasSize(e.target.value as typeof canvasSize)}
                disabled={isPending}
              />
              {t('createBoardForm.canvasSize.custom')}
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
  );
};

export default CreateBoardForm;
