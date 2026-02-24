import { Add as AddIcon, Description as DescriptionIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { fetchDocuments } from '../api/documents';
import DocumentForm from '../components/Documents/DocumentForm';
import DocumentList from '../components/Documents/DocumentList';
import { P } from '../constants/permissions';
import useDebounce from '../Hooks/useDebounce';
import { useAuth } from '../Hooks/useAuth';
import { IDocument } from '../types';

const Documents: React.FC = () => {
  const { can } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<IDocument | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: rawDocuments, isLoading } = useQuery({
    queryKey: ['documents', debouncedSearch],
    queryFn: () => fetchDocuments(debouncedSearch),
  });
  const documents = Array.isArray(rawDocuments) ? rawDocuments : [];

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    documents.forEach((doc) => {
      doc.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    if (selectedTags.length === 0) return documents;
    return documents.filter((doc) =>
      selectedTags.some((tag) => doc.tags?.includes(tag)),
    );
  }, [documents, selectedTags]);

  const handleAddClick = () => {
    setEditingDocument(null);
    setFormOpen(true);
  };

  const handleEdit = (document: IDocument) => {
    setEditingDocument(document);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingDocument(null);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <Box
      sx={{
        height: '100%',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'scroll',
        p: { xs: 1.5, md: 3 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 2, md: 3 },
          flexShrink: 0,
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 1.5, md: 0 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
          <DescriptionIcon sx={{ fontSize: { xs: 28, md: 32 }, color: 'primary.main' }} />
          <Typography
            variant='h4'
            fontWeight={600}
            sx={{ fontSize: { xs: '1.25rem', md: '2.125rem' } }}
          >
            Documents
          </Typography>
        </Box>
        {can(P.DOCUMENTS_CREATE) && (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              width: { xs: '100%', md: 'auto' },
              minHeight: { xs: 44, md: 'auto' },
              fontSize: { xs: '0.875rem', md: '1rem' },
              touchAction: 'manipulation',
            }}
          >
            Add Document
          </Button>
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: { xs: 2, md: 3 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <TextField
          fullWidth
          placeholder='Search documents by name or tags...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: allTags.length > 0 ? { xs: 2, md: 2.5 } : 0,
            '& .MuiInputBase-root': {
              borderRadius: 1.5,
              bgcolor: 'background.default',
              '&:hover': { bgcolor: 'action.hover' },
              '&.Mui-focused': { bgcolor: 'background.paper' },
            },
            '& .MuiInputBase-input': {
              fontSize: { xs: '16px', md: '1rem' },
              py: { xs: 1.5, md: 1.75 },
            },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
          }}
        />

        {allTags.length > 0 && (
          <Box>
            <Typography
              variant='body2'
              fontWeight={600}
              color='text.primary'
              sx={{ mb: 1.5, display: 'block', fontSize: '0.875rem' }}
            >
              Filter by tags:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {allTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => handleTagClick(tag)}
                  color={selectedTags.includes(tag) ? 'primary' : 'default'}
                  variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                  size='medium'
                  sx={{
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    height: 32,
                    fontWeight: 500,
                    borderRadius: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: selectedTags.includes(tag) ? 'primary.dark' : 'action.hover',
                    },
                  }}
                />
              ))}
              {selectedTags.length > 0 && (
                <Chip
                  label='Clear filters'
                  onClick={() => setSelectedTags([])}
                  size='medium'
                  sx={{
                    cursor: 'pointer',
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    fontSize: '0.8rem',
                    height: 32,
                    fontWeight: 600,
                    borderRadius: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'error.dark' },
                  }}
                />
              )}
            </Box>
          </Box>
        )}
      </Paper>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: (theme) => theme.palette.divider,
            borderRadius: '4px',
            '&:hover': { background: (theme) => theme.palette.action.hover },
          },
        }}
      >
        <Typography
          variant='body2'
          fontWeight={600}
          color='text.primary'
          sx={{ mb: 2, fontSize: '0.875rem' }}
        >
          {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
        </Typography>
        <DocumentList
          documents={filteredDocuments}
          isLoading={isLoading}
          onEdit={handleEdit}
          canEdit={can(P.DOCUMENTS_CREATE)}
        />
      </Box>

      <DocumentForm
        open={formOpen}
        onClose={handleCloseForm}
        document={editingDocument}
      />
    </Box>
  );
};

export default Documents;
