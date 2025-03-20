import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as VpnKeyIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// Mock data for users
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  roles: string[];
  createdAt: string;
  lastLoginAt?: string;
}

const MOCK_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    enabled: true,
    roles: ['ADMIN', 'USER'],
    createdAt: '2023-01-15T09:30:00',
    lastLoginAt: '2023-06-20T14:22:00'
  },
  {
    id: 2,
    username: 'johndoe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    enabled: true,
    roles: ['USER'],
    createdAt: '2023-02-22T11:45:00',
    lastLoginAt: '2023-06-19T10:15:00'
  },
  {
    id: 3,
    username: 'janesmith',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    enabled: true,
    roles: ['USER'],
    createdAt: '2023-03-10T08:20:00',
    lastLoginAt: '2023-06-21T09:05:00'
  },
  {
    id: 4,
    username: 'michaelb',
    email: 'michael.brown@example.com',
    firstName: 'Michael',
    lastName: 'Brown',
    enabled: false,
    roles: ['USER'],
    createdAt: '2023-04-05T15:30:00',
    lastLoginAt: '2023-05-28T16:40:00'
  },
  {
    id: 5,
    username: 'emilyw',
    email: 'emily.wilson@example.com',
    firstName: 'Emily',
    lastName: 'Wilson',
    enabled: true,
    roles: ['USER'],
    createdAt: '2023-05-18T13:10:00'
  }
];

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading users from an API
    const fetchUsers = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setUsers(MOCK_USERS);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      // In a real app, this would call an API to delete the user
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setSuccessMessage(`User ${selectedUser.username} has been deleted`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
    handleCloseDeleteDialog();
  };

  const handleToggleRole = (userId: number, role: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const hasRole = user.roles.includes(role);
        const newRoles = hasRole 
          ? user.roles.filter(r => r !== role)
          : [...user.roles, role];
        
        // Ensure every user has at least the USER role
        if (newRoles.length === 0 || (role === 'USER' && newRoles.length === 1 && newRoles[0] === 'ADMIN')) {
          newRoles.push('USER');
        }
        
        return { ...user, roles: newRoles };
      }
      return user;
    }));

    setSuccessMessage(`Role updated for user`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleToggleStatus = (userId: number) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return { ...user, enabled: !user.enabled };
      }
      return user;
    }));

    setSuccessMessage(`User status updated`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="div">
        Administrator Dashboard
      </Typography>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Management
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.enabled ? "Active" : "Disabled"} 
                      color={user.enabled ? "success" : "default"}
                      onClick={() => handleToggleStatus(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        icon={<PersonIcon />}
                        label="USER" 
                        variant={user.roles.includes('USER') ? "filled" : "outlined"}
                        color={user.roles.includes('USER') ? "primary" : "default"}
                        onClick={() => handleToggleRole(user.id, 'USER')}
                        size="small"
                      />
                      <Chip 
                        icon={<AdminIcon />}
                        label="ADMIN" 
                        variant={user.roles.includes('ADMIN') ? "filled" : "outlined"}
                        color={user.roles.includes('ADMIN') ? "secondary" : "default"}
                        onClick={() => handleToggleRole(user.id, 'ADMIN')}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {user.lastLoginAt 
                      ? new Date(user.lastLoginAt).toLocaleDateString() 
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="warning">
                        <VpnKeyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user {selectedUser?.username}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 