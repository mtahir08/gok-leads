import {
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
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 64;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactElement;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Documents', path: '/documents', icon: <DescriptionIcon /> },
  { label: 'PDF to Excel', path: '/pdf-to-excel', icon: <TransformIcon /> },
];

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { auth } = useAuth();
  const { logout } = useAuthActions();

  const sidebarWidth = collapsed && !isMobile ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  const handleMobileToggle = () => setMobileOpen((v) => !v);
  const handleCollapseToggle = () => setCollapsed((v) => !v);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const SidebarContent = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          px: collapsed && !isMobile ? 1.5 : 2.5,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: 64,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          <Typography variant='body1' fontWeight={800} color='white' sx={{ lineHeight: 1 }}>
            G
          </Typography>
        </Box>
        {(!collapsed || isMobile) && (
          <Box>
            <Typography variant='subtitle1' fontWeight={700} color='text.primary' lineHeight={1.2}>
              GOK Leads
            </Typography>
            <Typography variant='caption' color='text.secondary' lineHeight={1}>
              Internal Tools
            </Typography>
          </Box>
        )}
        {!isMobile && collapsed && (
          <IconButton
            size='small'
            onClick={handleCollapseToggle}
            sx={{ ml: 'auto', color: 'text.secondary' }}
          >
            <MenuIcon fontSize='small' />
          </IconButton>
        )}
      </Box>

      {/* Nav Items */}
      <Box sx={{ flex: 1, py: 1.5, px: 1 }}>
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <ListItem key={item.path} disablePadding>
                <Tooltip
                  title={collapsed && !isMobile ? item.label : ''}
                  placement='right'
                  arrow
                >
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    onClick={() => isMobile && setMobileOpen(false)}
                    sx={{
                      borderRadius: 1.5,
                      px: collapsed && !isMobile ? 1.5 : 2,
                      py: 1.25,
                      minHeight: 44,
                      justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                      bgcolor: isActive
                        ? alpha(theme.palette.primary.main, 0.12)
                        : 'transparent',
                      color: isActive ? 'primary.main' : 'text.secondary',
                      '&:hover': {
                        bgcolor: isActive
                          ? alpha(theme.palette.primary.main, 0.16)
                          : 'action.hover',
                        color: isActive ? 'primary.main' : 'text.primary',
                      },
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'inherit',
                        minWidth: collapsed && !isMobile ? 0 : 36,
                        '& svg': { fontSize: 20 },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {(!collapsed || isMobile) && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 600 : 400,
                        }}
                      />
                    )}
                    {isActive && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 3,
                          height: '60%',
                          borderRadius: '0 2px 2px 0',
                          bgcolor: 'primary.main',
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User + Logout */}
      <Box
        sx={{
          px: 1,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: collapsed && !isMobile ? 0.5 : 1.5,
            py: 1,
            borderRadius: 2,
            bgcolor: 'action.hover',
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              fontSize: '0.75rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {getInitials(auth?.name)}
          </Avatar>
          {(!collapsed || isMobile) && (
            <>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant='body2' fontWeight={600} noWrap>
                  {auth?.name || 'User'}
                </Typography>
                <Typography variant='caption' color='text.secondary' noWrap>
                  {auth?.role}
                </Typography>
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
        <Box
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            transition: 'width 0.2s ease',
            overflow: 'visible',
            position: 'relative',
          }}
        >
          <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <SidebarContent />
          </Box>
          <IconButton
            onClick={handleCollapseToggle}
            size='small'
            sx={{
              position: 'absolute',
              top: '50%',
              right: -14,
              transform: 'translateY(-50%)',
              zIndex: 1300,
              width: 28,
              height: 28,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 2,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {collapsed ? (
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            ) : (
              <ChevronLeftIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Box>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          variant='temporary'
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { width: SIDEBAR_WIDTH } }}
        >
          <SidebarContent />
        </Drawer>
      )}

      {/* Main content area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile top bar */}
        {isMobile && (
          <AppBar
            position='static'
            color='transparent'
            elevation={0}
            sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
          >
            <Toolbar sx={{ gap: 1 }}>
              <IconButton edge='start' onClick={handleMobileToggle} size='small'>
                <MenuIcon />
              </IconButton>
              <Typography variant='subtitle1' fontWeight={700} sx={{ flex: 1 }}>
                GOK Leads
              </Typography>
              <Tooltip title='Sign out' arrow>
                <IconButton size='small' onClick={logout} sx={{ color: 'text.secondary' }}>
                  <LogoutIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>
        )}

        {/* Page content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
