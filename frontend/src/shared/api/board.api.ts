import apiFactory from "./api-factory";

export type BoardVisibility = 'private' | 'public' | 'workspace';

export interface Card {
    id: string;
    title: string;
    description?: string;
    coverUrl?: string;
    position?: number;
    isCompleted?: boolean;
    isArchived?: boolean;
    members?: Member[];
    labels?: any[];
    attachments?: any[];
    due?: string;
    listId?: string; // Add listId for archived cards context
    listTitle?: string; // Add listTitle for context
}

export interface List {
    id: string;
    title: string;
    position?: number;
    cards: Card[];
}

export interface Member {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    roleId: string;
}
export interface BoardDetail {
    id: string;
    title: string;
    description?: string;
    coverUrl: string | null;
    visibility: BoardVisibility;
    lists: List[];
    members: Member[];
    labels: { id: string; name: string; color: string }[];
    commentPolicy: 'disabled' | 'members' | 'workspace' | 'anyone';
    memberManagePolicy: 'admins_only' | 'all_members';
}

export const boardApi = {
    getDetail: (id: string) => {
        return apiFactory.get<BoardDetail>(`/boards/${id}`);
    },

    update: (id: string, data: Partial<BoardDetail>) => {
        return apiFactory.put<BoardDetail>(`/boards/${id}`, data);
    },

    inviteMember: (boardId: string, email: string, roleId: string) => {
        return apiFactory.post<void>(`/boards/${boardId}/invite`, { email, roleId });
    },

    createBoard: (data: { title: string; workspaceId: string; visibility: 'private' | 'public'; description?: string }) => {
        return apiFactory.post('/boards', data);
    },

    deletePermanently: (id: string) => {
        return apiFactory.delete(`/boards/${id}`);
    },

    removeMember: (boardId: string, userId: string) => {
        return apiFactory.delete(`/boards/${boardId}/members/${userId}`);
    },

    updateCover: (boardId: string, file: File) => {
        const formData = new FormData();
        formData.append('cover', file);
        return apiFactory.patch(`/boards/${boardId}/settings/cover`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    getActivities: (boardId: string) => {
        return apiFactory.get(`/boards/${boardId}/activities`);
    },

    getArchivedLists: (boardId: string) => {
        return apiFactory.get<List[]>(`/boards/${boardId}/lists?archived=true`);
    },

    respondToInvitation: (boardId: string, status: 'active' | 'declined') => {
        return apiFactory.post(`/boards/${boardId}/invitations/respond`, { status });
    },

    getArchivedCards: (boardId: string) => {
        return apiFactory.get<Card[]>(`/boards/${boardId}/cards?archived=true`);
    }
};