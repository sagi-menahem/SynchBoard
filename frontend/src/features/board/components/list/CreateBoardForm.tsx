import React, { startTransition, useState } from 'react';

import defaultBoardImage from 'assets/default-board-image.png';
import { CANVAS_CONFIG } from 'features/board/constants/BoardConstants';
import type { Board } from 'features/board/types/BoardTypes';
import { FileText, Pencil, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Input, PictureManager, SectionCard, Textarea } from 'shared/ui';

import { useCreateBoardForm } from '../../hooks/management';

import CanvasConfigurationSection from './CanvasConfigurationSection';
import styles from './CreateBoardForm.module.scss';
import MemberInviteInput from './MemberInviteInput';

interface CreateBoardFormProps {
    onBoardCreated: (newBoard: Board) => void;
    onClose: () => void;
}

const CreateBoardForm: React.FC<CreateBoardFormProps> = ({ onBoardCreated, onClose }) => {
  const { t } = useTranslation(['board', 'common']);
  const { state, submitAction, isPending } = useCreateBoardForm(onBoardCreated);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState<string>(CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR);
  const [canvasSize, setCanvasSize] = useState<keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS | 'custom'>('WIDESCREEN');
  const [customWidth, setCustomWidth] = useState<number>(CANVAS_CONFIG.DEFAULT_WIDTH);
  const [customHeight, setCustomHeight] = useState<number>(CANVAS_CONFIG.DEFAULT_HEIGHT);

  const handleImageUpload = (file: File) => {
    setSelectedImage(file);
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageDelete = () => {
    setSelectedImage(null);
    setPreviewImageUrl(null);
  };

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
          {t('board:createForm.heading')}
        </h3>
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className={styles.formContainer}>
          {state.error && (
            <div className={styles.error} role="alert">
              {state.error}
            </div>
          )}

          <SectionCard 
            title={t('board:createForm.label.basicInfo')}
            variant="default"
            padding="md"
          >
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
              <Textarea
                id="board-description"
                name="description"
                placeholder={t('board:createForm.placeholder.description')}
                rows={3}
                className={styles.description}
                disabled={isPending}
              />
            </div>
          </SectionCard>

          <SectionCard 
            title={t('board:createForm.label.inviteMembers')}
            variant="default"
            padding="md"
          >
            <div className={styles.field}>
              <label htmlFor="board-invite-members">
                <Users size={14} />
                {t('board:createForm.label.inviteMembersDescription')}
              </label>
              <MemberInviteInput 
                id="board-invite-members" 
                onMembersChange={setInviteEmails} 
                disabled={isPending} 
              />
            </div>
          </SectionCard>

          <CanvasConfigurationSection
            canvasBackgroundColor={canvasBackgroundColor}
            onCanvasBackgroundColorChange={setCanvasBackgroundColor}
            canvasSize={canvasSize}
            onCanvasSizeChange={setCanvasSize}
            customWidth={customWidth}
            onCustomWidthChange={setCustomWidth}
            customHeight={customHeight}
            onCustomHeightChange={setCustomHeight}
            disabled={isPending}
          />

          <SectionCard 
            title={t('board:createForm.label.boardImage')}
            variant="default"
            padding="md"
          >
            <PictureManager
              imageUrl={previewImageUrl}
              defaultImage={defaultBoardImage}
              altText={t('board:createForm.boardImageAlt')}
              onUpload={handleImageUpload}
              onDelete={selectedImage ? handleImageDelete : undefined}
              showDeleteButton={!!selectedImage}
              uploadButtonText={t('board:createForm.uploadImage')}
              deleteButtonText={t('board:createForm.removeImage')}
            />
          </SectionCard>

          <div className={styles.buttonGroup}>
            <Button type="button" onClick={onClose} disabled={isPending} variant="secondary">
              {t('common:button.cancel')}
            </Button>
            <Button type="submit" disabled={isPending} variant="primary">
              {isPending ? t('common:button.creating') : t('board:createForm.button.createBoard')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBoardForm;
