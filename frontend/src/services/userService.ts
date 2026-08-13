import api from '../utils/api';
import { User } from '../types';

export const userService = {
    async getAllUsers() {
        const response = await api.get<User[]>('/users');
        return response.data;
    },

    async updateUser(id: string, data: Partial<User>) {
        const response = await api.patch<User>(`/users/${id}`, data);
        return response.data;
    },

    async deleteUser(id: string) {
        await api.delete(`/users/${id}`);
    }
};
