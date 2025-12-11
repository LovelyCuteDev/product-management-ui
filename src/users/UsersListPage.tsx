import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext';
import { http } from '../lib/http';
import { useToast } from '../components/ui/toast';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import type { User } from './types';

interface UsersResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
}

async function fetchUsers(params: { q: string }): Promise<UsersResponse> {
  const res = await http.get<UsersResponse>('/users', {
    params: {
      page: 1,
      limit: 20,
      q: params.q || undefined,
    },
  });
  return res.data;
}

export function UsersListPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    email: '',
    name: '',
    role: 'user',
    password: '',
  });

  const { data, isLoading, error } = useQuery<UsersResponse, Error>({
    queryKey: ['users', { search }],
    queryFn: () => fetchUsers({ q: search }),
  });

  const resetForm = () => {
    setEditingUser(null);
    setForm({
      email: '',
      name: '',
      role: 'user',
      password: '',
    });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      await http.post('/users', {
        email: form.email,
        name: form.name,
        role: form.role,
        password: form.password,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      resetForm();
      addToast({
        title: 'User created',
        description: 'The user has been created successfully.',
        variant: 'success',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingUser) return;
      await http.put(`/users/${editingUser.id}`, {
        email: form.email,
        name: form.name,
        role: form.role,
        password: form.password || undefined,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      resetForm();
      addToast({
        title: 'User updated',
        description: 'The user has been updated successfully.',
        variant: 'success',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await http.delete(`/users/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      addToast({
        title: 'User deleted',
        description: 'The user has been deleted.',
        variant: 'success',
      });
    },
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-4xl text-sm text-destructive">
        You are not authorized to manage users.
      </div>
    );
  }

  const users: User[] = data?.items ?? [];

  const handleEditClick = (u: User) => {
    setEditingUser(u);
    setForm({
      email: u.email,
      name: u.name,
      role: u.role,
      password: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-xs text-muted-foreground">
            Manage application users and roles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-56"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Users list</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading users...</p>
            ) : error ? (
              <p className="text-sm text-destructive">Failed to load users.</p>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b text-xs text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">{u.name}</td>
                        <td className="py-2 pr-4">{u.email}</td>
                        <td className="py-2 pr-4 capitalize">{u.role}</td>
                        <td className="py-2 pr-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleEditClick(u)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-destructive"
                              disabled={deleteMutation.isPending}
                              onClick={() => deleteMutation.mutate(u.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingUser ? 'Edit user' : 'Add user'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Name
                </label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Role
                </label>
                <select
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                  value={form.role}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, role: e.target.value }))
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  {editingUser ? 'New password (optional)' : 'Password'}
                </label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  required={!editingUser}
                  placeholder={editingUser ? 'Leave blank to keep current' : ''}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingUser
                    ? updateMutation.isPending
                      ? 'Saving...'
                      : 'Save changes'
                    : createMutation.isPending
                      ? 'Creating...'
                      : 'Create user'}
                </Button>
                {editingUser && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



