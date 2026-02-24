import { CameraAlt as CameraAltIcon } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import React, { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { updateProfilePicture } from '../api/user';
import { useAuth } from '../Hooks/useAuth';
import { useIsMobile } from '../Hooks/useIsMobile';
import { IUser } from '../types';
import SlideUpTransition from './SlideUpTransition';

interface ProfilePictureDialogProps {
  open: boolean;
  onClose: () => void;
  currentPicture?: string;
  userName?: string;
}

export const ProfilePictureDialog: React.FC<ProfilePictureDialogProps> = ({
  open,
  onClose,
  currentPicture,
  userName,
}) => {
  const { auth, setAuth } = useAuth();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [, setCookie] = useCookies(['user']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const updateAuthWithProfile = (data: any) => {
    if (!auth || !data) return;

    const userData = data.user || data;
    const updatedUser: IUser = {
      ...auth,
      ...userData,
      profile: userData.profile || auth.profile,
    };

    setAuth(updatedUser);
    setCookie('user', updatedUser, { path: '/' });
  };

  const mutation = useMutation({
    mutationFn: (file: File) => updateProfilePicture(file),
    onSuccess: (data: any) => {
      updateAuthWithProfile(data);
      toast.success('Profile picture updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user', auth?._id] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update profile picture',
      );
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      mutation.mutate(selectedFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={isMobile ? false : 'sm'} fullWidth fullScreen={isMobile} TransitionComponent={isMobile ? SlideUpTransition : undefined}>
      <DialogTitle>Update Profile Picture</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            py: 2,
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={preview || currentPicture}
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'primary.main',
                fontSize: '3rem',
                cursor: 'pointer',
                border: '3px solid',
                borderColor: 'divider',
              }}
              onClick={handleAvatarClick}
            >
              {!preview && !currentPicture && userName?.[0]?.toUpperCase()}
            </Avatar>
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                width: 36,
                height: 36,
              }}
              onClick={handleAvatarClick}
            >
              <CameraAltIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <Typography variant='body2' color='text.secondary' textAlign='center'>
            Click on the avatar or camera icon to select a new profile picture.
            Maximum file size: 5MB
          </Typography>
          {selectedFile && (
            <Typography variant='caption' color='text.secondary'>
              Selected: {selectedFile.name}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleUpload}
          variant='contained'
          disabled={!selectedFile || mutation.isPending}
        >
          {mutation.isPending ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
