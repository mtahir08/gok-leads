import {
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'react-toastify';
import { deleteDocument } from '../../api/documents';
import { IDocument } from '../../types';

interface DocumentListProps {
  documents: IDocument[];
  isLoading?: boolean;
  onEdit: (document: IDocument) => void;
  canEdit: boolean;
}

const TagChip: React.FC<{ label: string; size?: 'small' | 'medium' }> = ({ label, size = 'medium' }) => (
  <Chip
    label={label}
    size={size}
    variant='outlined'
    sx={{
      fontSize: size === 'small' ? '0.7rem' : '0.8rem',
      height: size === 'small' ? 22 : 28,
      borderRadius: 1,
      borderColor: 'primary.light',
      color: 'primary.main',
    }}
  />
);

const DocumentList: React.FC<DocumentListProps> = ({ documents, isLoading, onEdit, canEdit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete document');
    },
  });

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (documents.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: 'action.hover',
            mx: 'auto',
            mb: 2,
          }}
        >
          <LanguageIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
        </Box>
        <Typography variant='h6' fontWeight={600} gutterBottom>
          No documents found
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {canEdit ? 'Start by adding your first document' : 'No documents match your search criteria'}
        </Typography>
      </Paper>
    );
  }

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {documents.map((document) => (
          <Paper
            key={document._id}
            elevation={0}
            sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: document.tags?.length ? 1.5 : 0,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1.5,
                  bgcolor: 'primary.lighter',
                  flexShrink: 0,
                }}
              >
                <DescriptionIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              </Box>
              <Link
                href={document.url}
                target='_blank'
                rel='noopener noreferrer'
                onClick={(e) => { e.stopPropagation(); handleOpenUrl(document.url); }}
                sx={{
                  color: 'text.primary',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                }}
              >
                {document.name}
              </Link>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                <IconButton
                  size='small'
                  onClick={() => handleCopyUrl(document.url)}
                  sx={{ color: 'text.secondary', p: 0.75, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                >
                  <CopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
                {canEdit && (
                  <>
                    <IconButton
                      size='small'
                      onClick={() => onEdit(document)}
                      sx={{ color: 'text.secondary', p: 0.75, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      size='small'
                      onClick={() => handleDelete(document._id!)}
                      disabled={deleteMutation.isPending}
                      sx={{ color: 'error.main', p: 0.75, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>
            {document.tags && document.tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {document.tags.map((tag, index) => (
                  <TagChip key={index} label={tag} size='small' />
                ))}
              </Box>
            )}
          </Paper>
        ))}
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
    >
      <Table>
        <TableBody>
          {documents.map((document) => (
            <TableRow
              key={document._id}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'action.hover' },
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <TableCell sx={{ fontWeight: 500, fontSize: '0.9375rem', py: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1.5,
                      bgcolor: 'primary.lighter',
                      flexShrink: 0,
                    }}
                  >
                    <DescriptionIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  </Box>
                  <Link
                    href={document.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={(e) => { e.stopPropagation(); handleOpenUrl(document.url); }}
                    sx={{
                      color: 'text.primary',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                    }}
                  >
                    {document.name}
                  </Link>
                </Box>
              </TableCell>
              <TableCell sx={{ py: 2.5 }}>
                {document.tags && document.tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {document.tags.slice(0, 3).map((tag, index) => (
                      <TagChip key={index} label={tag} />
                    ))}
                    {document.tags.length > 3 && (
                      <TagChip label={`+${document.tags.length - 3} more`} />
                    )}
                  </Box>
                )}
              </TableCell>
              <TableCell align='right' sx={{ py: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'flex-end' }}>
                  <Tooltip title='Copy URL' arrow>
                    <IconButton
                      size='small'
                      onClick={() => handleCopyUrl(document.url)}
                      sx={{
                        color: 'text.secondary',
                        p: 1,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText', borderColor: 'primary.main' },
                      }}
                    >
                      <CopyIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  {canEdit && (
                    <>
                      <Tooltip title='Edit' arrow>
                        <IconButton
                          size='small'
                          onClick={() => onEdit(document)}
                          sx={{
                            color: 'text.secondary',
                            p: 1,
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.2s ease',
                            '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText', borderColor: 'primary.main' },
                          }}
                        >
                          <EditIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete' arrow>
                        <IconButton
                          size='small'
                          onClick={() => handleDelete(document._id!)}
                          disabled={deleteMutation.isPending}
                          sx={{
                            color: 'error.main',
                            p: 1,
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.2s ease',
                            '&:hover': { bgcolor: 'error.main', color: 'error.contrastText', borderColor: 'error.main' },
                          }}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DocumentList;
