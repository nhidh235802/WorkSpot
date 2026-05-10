// frontend/services/user.service.ts


const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type UserProfile = any;

export const userService = {
  // ... existing methods

  // Upload avatar
  async uploadAvatar(file: File): Promise<UserProfile> {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE}/profile/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('アバターをアップロードできません');
    }

    return response.json();
  },
};