import React, { startTransition, useState } from 'react';

import { CANVAS_CONFIG } from 'features/board/constants/BoardConstants';
import type { Board } from 'features/board/types/BoardTypes';
import { FileText, Monitor, Pencil, Plus, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ColorPicker, Input, RadioGroup } from 'shared/ui';
import styles from 'shared/ui/styles/CommonForm.module.scss';
import utilStyles from 'shared/ui/styles/utils.module.scss';
import { getColorName } from 'shared/utils/ColorUtils';

import { useCreateBoardForm } from '../../hooks/management';

import BoardImageUpload from './BoardImageUpload';
import MemberInviteInput from './MemberInviteInput';

interface CreateBoardFormProps {
    onBoardCreated: (newBoard: Board) => void;
    onClose: () => void;
}

const CreateBoardForm: React.FC<CreateBoardFormProps> = ({ onBoardCreated, onClose }) => {
  const { t } = useTranslation(['board', 'common']);
  
  const getTranslationKey = (sizeKey: string): string => {
    const keyMap: Record<string, string> = {
      'WIDESCREEN': 'widescreen',
      'SQUARE': 'square',
      'PORTRAIT': 'portrait',
      'DOCUMENT': 'document',
    };
    return keyMap[sizeKey] ?? sizeKey.toLowerCase();
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
      const preset = CANVAS_CONFIG.CANVAS_SIZE_PRESETS[canvasSize];
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
          {t('board:createForm.heading')}
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
          {t('board:createForm.label.boardName')}
        </label>
        <Input
          id="board-name"
          name="name"
          type="text"
          placeholder={t('board:createForm.placeholder.name')}
          required
          disabled={isPending}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="board-description">
          <FileText size={14} />
          {t('board:createForm.label.description')}
        </label>
        <textarea
          id="board-description"
          name="description"
          placeholder={t('board:createForm.placeholder.description')}
          rows={3}
          className={styles.description}
          disabled={isPending}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="board-invite-members">
          <Users size={14} />
          {t('board:createForm.label.inviteMembers')}
        </label>
        <MemberInviteInput id="board-invite-members" onMembersChange={setInviteEmails} disabled={isPending} />
      </div>

      <div className={styles.field}>
        <label htmlFor="board-canvas-background">
          <Monitor size={14} />
          {t('board:createForm.label.canvasBackground')}
        </label>
        <div className={utilStyles.settingRow}>
          <ColorPicker
            id="board-canvas-background"
            color={canvasBackgroundColor}
            onChange={setCanvasBackgroundColor}
            disabled={isPending}
          />
          <span className={utilStyles.settingValue}>
            {(() => {
              const colorName = getColorName(canvasBackgroundColor);
              return colorName ? t(`common:colors.${colorName}`) : canvasBackgroundColor;
            })()}
          </span>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="board-canvas-size">
          <Monitor size={14} />
          {t('board:createForm.label.canvasSize')}
        </label>
        <div className={styles.canvasSizeOptions}>
          <RadioGroup
            id="board-canvas-size"
            value={canvasSize}
            onValueChange={(value) => setCanvasSize(value as typeof canvasSize)}
            name="canvasSize"
            disabled={isPending}
            orientation="vertical"
            options={[
              ...CANVAS_CONFIG.PRESET_ORDER.map((size) => {
                const preset = CANVAS_CONFIG.CANVAS_SIZE_PRESETS[size];
                return {
                  value: size,
                  label: (
                    <div className={styles.presetLabel}>
                      <span className={styles.presetName}>
                        {t(`board:canvasSize.presets.${getTranslationKey(size)}.label`)}
                      </span>
                      <span className={styles.presetInfo}>
                        ({preset.ratio}) - {preset.width}×{preset.height}
                      </span>
                    </div>
                  ),
                  ariaLabel: `${t(`board:canvasSize.presets.${getTranslationKey(size)}.label`)} (${preset.ratio}) - ${preset.width}×${preset.height}`,
                };
              }),
              {
                value: 'custom',
                label: (
                  <div className={styles.presetLabel}>
                    <span className={styles.presetName}>
                      {t('board:canvasSize.custom.label')}
                    </span>
                    <span className={styles.presetInfo} />
                  </div>
                ),
                ariaLabel: t('board:canvasSize.custom.label'),
              },
            ]}
          />
          <input type="hidden" name="canvasSize" value={canvasSize} />
        </div>
        {canvasSize === 'custom' && (
          <div className={styles.customSizeInputs}>
            <Input
              id="canvas-custom-width"
              name="customWidth"
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(parseInt(e.target.value) ?? CANVAS_CONFIG.DEFAULT_WIDTH)}
              min={CANVAS_CONFIG.MIN_WIDTH}
              max={CANVAS_CONFIG.MAX_WIDTH}
              disabled={isPending}
              placeholder={t('board:createForm.placeholder.width')}
            />
            <span>×</span>
            <Input
              id="canvas-custom-height"
              name="customHeight"
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(parseInt(e.target.value) ?? CANVAS_CONFIG.DEFAULT_HEIGHT)}
              min={CANVAS_CONFIG.MIN_HEIGHT}
              max={CANVAS_CONFIG.MAX_HEIGHT}
              disabled={isPending}
              placeholder={t('board:createForm.placeholder.height')}
            />
            <span>{t('board:createForm.label.pixels')}</span>
          </div>
        )}
      </div>

      <div className={styles.buttonGroup}>
        <Button type="button" onClick={onClose} disabled={isPending} variant="secondary">
          {t('common:button.cancel')}
        </Button>
        <Button type="submit" disabled={isPending} variant="primary">
          {isPending ? t('common:button.creating') : t('board:createForm.button.createBoard')}
        </Button>
      </div>
      </form>
    </div>
  );
};

export default CreateBoardForm;
