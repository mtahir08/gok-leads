import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import React from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { createDocument, updateDocument } from '../../api/documents';
import { useIsMobile } from '../../Hooks/useIsMobile';
import { IDocument } from '../../types';
import SlideUpTransition from '../SlideUpTransition';

interface DocumentFormProps {
  open: boolean;
  onClose: () => void;
  document?: IDocument | null;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Document name is required'),
  url: Yup.string().url('Must be a valid URL').required('URL is required'),
  tags: Yup.array().of(Yup.string()),
});

const DocumentForm: React.FC<DocumentFormProps> = ({ open, onClose, document }) => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const isEditMode = !!document?._id;

  const createMutation = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document created successfully');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create document');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IDocument> }) =>
      updateDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document updated successfully');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update document');
    },
  });

  const initialValues: Partial<IDocument> = {
    name: document?.name || '',
    url: document?.url || '',
    tags: document?.tags || [],
  };

  const handleSubmit = (values: Partial<IDocument>) => {
    if (isEditMode && document?._id) {
      updateMutation.mutate({ id: document._id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isMobile ? false : 'sm'}
      fullWidth
      fullScreen={isMobile}
      TransitionComponent={isMobile ? SlideUpTransition : undefined}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2 } }}
    >
      <DialogTitle sx={{ pb: 2, fontWeight: 600 }}>
        {isEditMode ? 'Edit Document' : 'Add New Document'}
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
          <Form>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label='Document Name'
                  name='name'
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  required
                />

                <TextField
                  fullWidth
                  label='URL'
                  name='url'
                  value={values.url}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.url && Boolean(errors.url)}
                  helperText={touched.url && errors.url}
                  placeholder='https://drive.google.com/...'
                  required
                  InputProps={{
                    endAdornment: values.url && (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          onClick={() => window.open(values.url, '_blank')}
                          edge='end'
                          sx={{ color: 'primary.main' }}
                        >
                          <OpenInNewIcon fontSize='small' />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={values.tags || []}
                  onChange={(_, newValue) => setFieldValue('tags', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Tags'
                      placeholder='Type and press Enter to add tags'
                      helperText='Add tags to help categorize and search documents'
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key || index}
                          {...tagProps}
                          label={option}
                          color='primary'
                          size='small'
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      );
                    })
                  }
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
              <Button onClick={onClose} sx={{ textTransform: 'none', borderRadius: 1.5 }}>
                Cancel
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={createMutation.isPending || updateMutation.isPending}
                sx={{ textTransform: 'none', borderRadius: 1.5 }}
              >
                {isEditMode ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default DocumentForm;
