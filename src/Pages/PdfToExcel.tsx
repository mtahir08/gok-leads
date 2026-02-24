import {
  Add as AddIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Transform as TransformIcon,
  UploadFileOutlined as UploadFileOutlinedIcon,
} from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { downloadAsExcel } from '../utils/excelGenerator';
import { ParseResult, parsePdf } from '../utils/pdfParser';

const PdfToExcel = () => {
  const theme = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(false);
  const [search, setSearch] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [newColumnName, setNewColumnName] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const f = acceptedFiles[0];
    if (f.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }
    setFile(f);
    setResult(null);
    setParsed(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleParse = async () => {
    if (!file) return;
    setParsing(true);
    try {
      const parsedResult = await parsePdf(file);
      setResult(parsedResult);
      setVisibleColumns(parsedResult.columns);
      setParsed(true);
      if (parsedResult.rows.length === 0) {
        toast.warning('No data found in the PDF.');
      } else {
        toast.success(`Found ${parsedResult.rows.length} row(s) with ${parsedResult.columns.length} column(s).`);
      }
    } catch (err) {
      console.error('PDF parse error:', err);
      toast.error('Failed to parse PDF. Please try another file.');
    } finally {
      setParsing(false);
    }
  };

  const handleDownload = () => {
    if (!result || result.rows.length === 0) return;
    downloadAsExcel(result, visibleColumns);
    toast.success('Excel file downloaded!');
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setParsed(false);
    setSearch('');
    setVisibleColumns([]);
    setNewColumnName('');
  };

  const handleAddColumn = () => {
    const name = newColumnName.trim();
    if (!name) return;
    if (visibleColumns.includes(name)) {
      toast.warning('Column already exists.');
      return;
    }
    setVisibleColumns((prev) => [...prev, name]);
    setNewColumnName('');
  };

  const filteredRows = useMemo(() => {
    if (!result) return [];
    if (!search.trim()) return result.rows;
    const q = search.toLowerCase();
    return result.rows.filter((row) =>
      Object.values(row).some((val) => val.toLowerCase().includes(q)),
    );
  }, [result, search]);

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 2, md: 3 },
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 1.5, md: 0 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TransformIcon sx={{ fontSize: { xs: 22, md: 28 }, color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography variant='h5' fontWeight={700} sx={{ fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
              PDF to Excel
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
              Extract contacts from PDF and download as Excel
            </Typography>
          </Box>
        </Box>
        {result && result.rows.length > 0 && (
          <Button
            variant='contained'
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            Download Excel
          </Button>
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: { xs: 2, md: 3 } }}
      >
        {!file ? (
          <Box
            {...getRootProps()}
            sx={{
              border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive
                ? alpha(theme.palette.primary.main, 0.05)
                : theme.palette.background.paper,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              },
            }}
          >
            <input {...getInputProps()} />
            <UploadFileOutlinedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant='subtitle1' color='primary' fontWeight={500}>
              Click to upload or drag and drop
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              PDF files only
            </Typography>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UploadFileOutlinedIcon sx={{ color: 'primary.main' }} />
                <Typography variant='body1' fontWeight={600}>
                  {file.name}
                </Typography>
                <Chip label={`${(file.size / 1024).toFixed(1)} KB`} size='small' />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!parsed && (
                  <Button
                    variant='contained'
                    onClick={handleParse}
                    disabled={parsing}
                    startIcon={parsing ? <CircularProgress size={16} /> : <TransformIcon />}
                  >
                    {parsing ? 'Parsing...' : 'Extract Contacts'}
                  </Button>
                )}
                <IconButton onClick={handleClear} size='small'>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            {result && result.rows.length > 0 && (
              <>
                <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                  <Typography variant='caption' color='text.secondary' fontWeight={600} sx={{ mr: 0.5 }}>
                    Columns:
                  </Typography>
                  {visibleColumns.map((col) => (
                    <Chip
                      key={col}
                      label={col}
                      size='small'
                      onDelete={() => setVisibleColumns((prev) => prev.filter((c) => c !== col))}
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                  <TextField
                    size='small'
                    placeholder='Add column...'
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddColumn(); }}
                    sx={{ width: 150, '& .MuiInputBase-root': { height: 32, fontSize: '0.8rem' } }}
                  />
                  <IconButton size='small' onClick={handleAddColumn} color='primary' sx={{ p: 0.5 }}>
                    <AddIcon fontSize='small' />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <TextField
                    size='small'
                    placeholder='Search...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ maxWidth: 350 }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position='start'>
                            <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                        {visibleColumns.map((col) => (
                          <TableCell key={col} sx={{ fontWeight: 700 }}>{col}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{i + 1}</TableCell>
                          {visibleColumns.map((col) => (
                            <TableCell key={col}>{row[col] || '—'}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {parsed && (!result || result.rows.length === 0) && (
              <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 3 }}>
                No data found in this PDF. Try another file.
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PdfToExcel;
