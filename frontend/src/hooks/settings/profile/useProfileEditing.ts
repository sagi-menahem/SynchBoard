import { useEffect, useState } from 'react';

import type { UpdateUserProfileRequest, UserProfile } from 'types/UserTypes';

export const useProfileEditing = (user: UserProfile | null) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserProfileRequest>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
      });
    }
  }, [user]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startEditing = () => setIsEditing(true);

  const cancelEditing = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
      });
    }
    setIsEditing(false);
  };

  const stopEditing = () => setIsEditing(false);

  return {
    isEditing,
    formData,
    onInputChange,
    startEditing,
    cancelEditing,
    stopEditing,
  };
};
