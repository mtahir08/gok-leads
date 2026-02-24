import {
  CameraAlt as CameraAltIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Description as DescriptionIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Transform as TransformIcon,
} from '@mui/icons-material';
import {
  alpha,
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../Hooks/useAuth';
import { useAuthActions } from '../Hooks/useAuthActions';
import { ProfilePictureDialog } from './ProfilePictureDialog';

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 64;

const NAV_ITEMS = [
  { label: 'Documents', path: '/documents', icon: <DescriptionIcon /> },
  { label: 'PDF to Excel', path: '/pdf-to-excel', icon: <TransformIcon /> },
];

const getInitials = (name?: string) =>
  name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [avatarAnchor, setAvatarAnchor] = useState<null | HTMLElement>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const location = useLocation();
  const { auth } = useAuth();
  const { logout } = useAuthActions();

  const mini = collapsed && !isMobile;

  const SidebarContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider' }}>
      {/* Brand */}
      <Box sx={{ px: mini ? 1.5 : 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid', borderColor: 'divider', minHeight: 64 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` }}>
          <Typography variant='body1' fontWeight={800} color='white' sx={{ lineHeight: 1 }}>G</Typography>
        </Box>
        {!mini && (
          <Box>
            <Typography variant='subtitle1' fontWeight={700} color='text.primary' lineHeight={1.2}>GOK Leads</Typography>
            <Typography variant='caption' color='text.secondary' lineHeight={1}>Internal Tools</Typography>
          </Box>
        )}
        {mini && (
          <IconButton size='small' onClick={() => setCollapsed(false)} sx={{ ml: 'auto', color: 'text.secondary' }}>
            <MenuIcon fontSize='small' />
          </IconButton>
        )}
      </Box>

      {/* Nav */}
      <Box sx={{ flex: 1, py: 1.5, px: 1 }}>
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <ListItem key={item.path} disablePadding>
                <Tooltip title={mini ? item.label : ''} placement='right' arrow>
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    onClick={() => isMobile && setMobileOpen(false)}
                    sx={{
                      borderRadius: 1.5, px: mini ? 1.5 : 2, py: 1.25, minHeight: 44,
                      justifyContent: mini ? 'center' : 'flex-start',
                      bgcolor: isActive ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                      color: isActive ? 'primary.main' : 'text.secondary',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.16) : 'action.hover',
                        color: isActive ? 'primary.main' : 'text.primary',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: mini ? 0 : 36, '& svg': { fontSize: 20 } }}>
                      {item.icon}
                    </ListItemIcon>
                    {!mini && (
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 }} />
                    )}
                    {isActive && (
                      <Box sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: '60%', borderRadius: '0 2px 2px 0', bgcolor: 'primary.main' }} />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User */}
      <Box sx={{ px: 1, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: mini ? 0.5 : 1.5, py: 1, borderRadius: 2, bgcolor: 'action.hover', justifyContent: mini ? 'center' : 'flex-start' }}>
          <Tooltip title='Update profile picture' arrow>
            <Avatar
              src={auth?.profile}
              onClick={() => setProfileDialogOpen(true)}
              sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            >
              {getInitials(auth?.name)}
            </Avatar>
          </Tooltip>
          {!mini && (
            <>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant='body2' fontWeight={600} noWrap>{auth?.name || 'User'}</Typography>
                <Typography variant='caption' color='text.secondary' noWrap>{auth?.role}</Typography>
              </Box>
              <Tooltip title='Sign out' arrow>
                <IconButton size='small' onClick={logout} sx={{ color: 'text.secondary', flexShrink: 0 }}>
                  <LogoutIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Box sx={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH, flexShrink: 0, transition: 'width 0.2s ease', overflow: 'visible', position: 'relative' }}>
          <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <SidebarContent />
          </Box>
          <IconButton
            onClick={() => setCollapsed((v) => !v)}
            size='small'
            sx={{ position: 'absolute', top: '50%', right: -14, transform: 'translateY(-50%)', zIndex: 1300, width: 28, height: 28, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 2, '&:hover': { bgcolor: 'action.hover' } }}
          >
            {collapsed ? <ChevronRightIcon sx={{ fontSize: 16 }} /> : <ChevronLeftIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} variant='temporary' ModalProps={{ keepMounted: true }} PaperProps={{ sx: { width: SIDEBAR_WIDTH } }}>
          <SidebarContent />
        </Drawer>
      )}

      {/* Avatar menu */}
      <Menu
        anchorEl={avatarAnchor}
        open={Boolean(avatarAnchor)}
        onClose={() => setAvatarAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 200 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant='body2' fontWeight={600} noWrap>{auth?.name || 'User'}</Typography>
          <Typography variant='caption' color='text.secondary' noWrap>{auth?.role}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { setAvatarAnchor(null); setProfileDialogOpen(true); }} sx={{ gap: 1.5 }}>
          <CameraAltIcon fontSize='small' />
          Update Picture
        </MenuItem>
        <MenuItem onClick={() => { setAvatarAnchor(null); logout(); }} sx={{ gap: 1.5, color: 'error.main' }}>
          <LogoutIcon fontSize='small' />
          Sign out
        </MenuItem>
      </Menu>

      {/* Main */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AppBar position='static' color='transparent' elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Toolbar sx={{ gap: 1, ...(isMobile ? {} : { justifyContent: 'flex-end', minHeight: '52px !important' }) }}>
            {isMobile && (
              <>
                <IconButton edge='start' onClick={() => setMobileOpen((v) => !v)} size='small'><MenuIcon /></IconButton>
                <Typography variant='subtitle1' fontWeight={700} sx={{ flex: 1 }}>GOK Leads</Typography>
              </>
            )}
            <Tooltip title={auth?.name || 'User'} arrow>
              <Avatar
                src={auth?.profile}
                onClick={(e) => setAvatarAnchor(e.currentTarget)}
                sx={{ width: isMobile ? 32 : 34, height: isMobile ? 32 : 34, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'box-shadow 0.15s ease', '&:hover': { boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.25)}` } }}
              >
                {getInitials(auth?.name)}
              </Avatar>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>

      <ProfilePictureDialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        currentPicture={auth?.profile}
        userName={auth?.name}
      />
    </Box>
  );
};

export default Layout;
