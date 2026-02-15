import apiFactory from "./api-factory";

export const listApi = {
    create: (boardId: string, title: string) => {
        return apiFactory.post(`/boards/${boardId}/lists`, { title });
    },

    update: (listId: string, data: { title?: string; isArchived?: boolean }) => {
        return apiFactory.patch(`/lists/${listId}`, data);
    },

    archiveAllCards: (listId: string) => {
        return apiFactory.patch(`/lists/${listId}/archive-all-cards`);
    },

    reorder: (listId: string, prevListId: string | null, nextListId: string | null) => {
        return apiFactory.patch(`/lists/${listId}/reorder`, { prevListId, nextListId });
    },

    delete: (listId: string) => {
        return apiFactory.delete(`/lists/${listId}`);
    }
};