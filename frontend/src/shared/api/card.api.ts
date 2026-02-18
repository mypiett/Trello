import apiFactory from "./api-factory";

export interface CreateCardPayload {
    listId: string;
    title: string;
    description?: string;
}

export const cardApi = {
    create: (data: CreateCardPayload) => {
        return apiFactory.post("/cards", data);
    },
    update: (cardId: string, data: any) => {
        return apiFactory.put(`/cards/${cardId}`, data);
    },

    delete: (cardId: string) => {
        return apiFactory.delete(`/cards/${cardId}`);
    },

    moveCard: (data: {
        cardId: string,
        prevColumnId: string,
        prevIndex: number,
        nextColumnId: string,
        nextIndex: number
    }) => {
        return apiFactory.patch('/cards/move', data);
    },

    // Members
    addMember: (cardId: string, memberId: string) => {
        return apiFactory.post(`/cards/${cardId}/members/${memberId}`);
    },
    removeMember: (cardId: string, memberId: string) => {
        return apiFactory.delete(`/cards/${cardId}/members/${memberId}`);
    },

    // Labels
    addLabel: (cardId: string, labelId: string) => {
        return apiFactory.post(`/cards/${cardId}/labels/${labelId}`);
    },
    removeLabel: (cardId: string, labelId: string) => {
        return apiFactory.delete(`/cards/${cardId}/labels/${labelId}`);
    },

    // Comments
    addComment: (cardId: string, text: string) => {
        return apiFactory.post(`/cards/${cardId}/actions/comments`, { text });
    },
    updateComment: (cardId: string, commentId: string, text: string) => {
        return apiFactory.put(`/cards/${cardId}/actions/${commentId}/comments`, { text });
    },
    deleteComment: (cardId: string, commentId: string) => {
        return apiFactory.delete(`/cards/${cardId}/actions/${commentId}/comments`);
    },

    // Checklists
    getChecklists: (cardId: string) => {
        return apiFactory.get(`/cards/${cardId}/checklists?checkItems=true`);
    },
    createChecklist: (cardId: string, name: string, position: number) => {
        return apiFactory.post(`/cards/${cardId}/checklists`, { name, position });
    },
    deleteChecklist: (cardId: string, checklistId: string) => {
        return apiFactory.delete(`/cards/${cardId}/checklists/${checklistId}`);
    },

    // CheckItems
    createCheckItem: (cardId: string, checklistId: string, name: string, position: number) => {
        return apiFactory.post(`/cards/${cardId}/checklists/${checklistId}/checkItems`, { name, position });
    },
    updateCheckItem: (cardId: string, checklistId: string, itemId: string, data: any) => {
        return apiFactory.put(`/cards/${cardId}/checklists/${checklistId}/checkItems/${itemId}`, data);
    },
    deleteCheckItem: (cardId: string, checklistId: string, itemId: string) => {
        return apiFactory.delete(`/cards/${cardId}/checklists/${checklistId}/checkItems/${itemId}`);
    },

    // Activity
    getActions: (cardId: string) => {
        return apiFactory.get(`/cards/${cardId}/actions`);
    },

    // Attachments
    addAttachment: (cardId: string, file: File, name: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);
        return apiFactory.post(`/cards/${cardId}/attachments`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteAttachment: (cardId: string, attachmentId: string) => {
        return apiFactory.delete(`/cards/${cardId}/attachments/${attachmentId}`);
    },
    getAttachments: (cardId: string) => {
        return apiFactory.get(`/cards/${cardId}/attachments`);
    }
};