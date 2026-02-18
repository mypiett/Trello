import { useState, useEffect } from "react";
import { Activity, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { boardApi } from "@/shared/api/board.api";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/shared/ui/button";

interface Props {
    boardId: string;
    children?: React.ReactNode;
}

export function BoardActivitySidebar({ boardId, children }: Props) {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [tab, setTab] = useState('all');
    const PAGE_SIZE = 5;

    const fetchActivities = async (pageToFetch: number, isReset: boolean = false) => {
        setLoading(true);
        try {
            const res: any = await boardApi.getActivities(boardId, pageToFetch, PAGE_SIZE);
            // Backend returns: { items: [...], total: ..., page: ..., pageSize: ... }
            // API Factory likely returns the data directly or we extract it
            const data = res.responseObject || res.data || res.element || res || {};

            // Allow for different response structures just in case
            const items = Array.isArray(data.items) ? data.items :
                (Array.isArray(data) ? data : []);

            const total = data.total || 0;

            if (isReset) {
                setActivities(items);
            } else {
                setActivities(prev => [...prev, ...items]);
            }

            // Robust hasMore check using total
            // If we have minimal total, or if we've fetched enough pages
            if (typeof total === 'number' && total > 0) {
                // Check if the number of items fetched so far (including this page) covers the total
                // Note: activities.length is stale here, so we estimate.
                // Better: If we received fewer items than requested, we are done.
                // OR: current page * PAGE_SIZE < total
                setHasMore(pageToFetch * PAGE_SIZE < total);
            } else {
                // Fallback if total is missing
                setHasMore(items.length === PAGE_SIZE);
            }

        } catch (error) {
            console.error("Failed to fetch activities", error);
            if (isReset) setActivities([]);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (boardId) {
            setPage(1);
            setHasMore(true);
            fetchActivities(1, true);
        }
    }, [boardId]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchActivities(nextPage, false);
    };

    const getInitials = (name: string) => {
        if (!name) return "??";
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    };

    // Helper to get display name
    const getDisplayName = (actor: any) => {
        if (!actor) return 'Unknown';
        return actor.name || actor.email || 'Unknown';
    };

    const getActionDescription = (action: any) => {
        const type = action.actionType;
        const meta = action.metadata || {};

        switch (type) {
            case 'BOARD_CREATED': return 'đã tạo bảng này';
            case 'BOARD_SETTINGS_UPDATED': return 'đã cập nhật cài đặt bảng';
            case 'BOARD_ARCHIVED': return 'đã lưu trữ bảng';
            case 'BOARD_REOPENED': return 'đã mở lại bảng';
            case 'LIST_CREATED': return `đã tạo danh sách "${meta.listTitle || 'mới'}"`;
            case 'LIST_RENAMED': return `đã đổi tên danh sách thành "${meta.listTitle}"`;
            case 'LIST_ARCHIVED': return `đã lưu trữ danh sách "${meta.listTitle}"`;
            case 'LIST_MOVED': return `đã di chuyển danh sách "${meta.listTitle}" sang vị trí mới`;
            case 'CARD_CREATED': return `đã tạo thẻ "${meta.cardTitle || 'mới'}"`;
            case 'CARD_UPDATED': return `đã cập nhật thẻ "${meta.cardTitle || ''}"`;
            case 'CARD_MOVED':
                if (meta.fromListTitle && meta.toListTitle && meta.fromListId !== meta.toListId) {
                    return `đã di chuyển thẻ "${meta.cardTitle}" từ danh sách "${meta.fromListTitle}" sang "${meta.toListTitle}"`;
                }
                return `đã di chuyển thẻ "${meta.cardTitle || 'thẻ'}" sang vị trí mới`;
            case 'CARD_ARCHIVED': return `đã lưu trữ thẻ "${meta.cardTitle}"`;
            case 'MEMBER_ADDED': return 'đã thêm thành viên vào bảng';
            case 'MEMBER_REMOVED': return 'đã xóa thành viên khỏi bảng';
            case 'COMMENT_ADDED': return `đã bình luận vào thẻ "${meta.cardTitle || 'thẻ'}"`;
            default: return 'đã thực hiện một hành động';
        }
    };

    const filteredActivities = tab === 'comments'
        ? activities.filter(a => a.actionType === 'COMMENT_ADDED')
        : activities;

    const translateField = (field: string) => {
        const map: Record<string, string> = {
            'coverUrl': 'ảnh bìa',
            'visibility': 'quyền riêng tư',
            'commentPolicy': 'quyền bình luận',
            'memberManagePolicy': 'quyền quản lý thành viên',
            'workspaceMembersCanEditAndJoin': 'quyền thành viên workspace'
        };
        return map[field] || field;
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Hoạt động
                    </SheetTitle>
                </SheetHeader>

                <Tabs value={tab} onValueChange={setTab} className="w-full mt-4 flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="all">Tất cả</TabsTrigger>
                        <TabsTrigger value="comments">Bình luận</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto mt-4 pr-2 custom-scrollbar">
                        <TabsContent value="all" className="mt-0 space-y-4">
                            {filteredActivities.length === 0 && !loading ? (
                                <p className="text-center text-gray-500 text-sm py-4">Chưa có hoạt động nào.</p>
                            ) : (
                                filteredActivities.map((action) => (
                                    <div key={action.id} className="flex gap-3 items-start text-sm group">
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarImage src={action.actor?.avatarUrl} />
                                            <AvatarFallback>{getInitials(getDisplayName(action.actor))}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p>
                                                <span className="font-semibold text-gray-900">{getDisplayName(action.actor)}</span>
                                                {" "}
                                                <span className="text-gray-600">
                                                    {getActionDescription(action)}
                                                </span>
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatDistanceToNow(new Date(action.createdAt), { addSuffix: true, locale: vi })}
                                            </p>

                                            {/* Show comment text if it's a comment */}
                                            {action.actionType === 'COMMENT_ADDED' && action.metadata?.text && (
                                                <div
                                                    className="mt-1 p-2 bg-gray-100 rounded text-gray-700 italic border border-gray-200 prose prose-sm max-w-none [&>p]:m-0"
                                                    dangerouslySetInnerHTML={{ __html: action.metadata.text }}
                                                />
                                            )}

                                            {/* Show changed fields for updates */}
                                            {action.actionType === 'BOARD_SETTINGS_UPDATED' && action.metadata?.changedFields && (
                                                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border">
                                                    {Object.keys(action.metadata.changedFields).map(key => (
                                                        <div key={key} className="flex items-center gap-1">
                                                            <span>• Đã thay đổi <b>{translateField(key)}</b></span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}

                            {loading && (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                </div>
                            )}

                            {!loading && hasMore && filteredActivities.length > 0 && (
                                <div className="py-2 text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={loadMore}
                                        className="text-gray-500 hover:text-gray-900"
                                    >
                                        Tải thêm hoạt động cũ hơn...
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="comments" className="mt-0 space-y-4">
                            {/* Reuse similar structure for comments tab if needed, logic handled by filteredActivities */}
                            {filteredActivities.length === 0 && !loading ? (
                                <p className="text-center text-gray-500 text-sm py-4">Chưa có bình luận nào.</p>
                            ) : (
                                filteredActivities.map((action) => (
                                    <div key={action.id} className="flex gap-3 items-start text-sm">
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarImage src={action.actor?.avatarUrl} />
                                            <AvatarFallback>{getInitials(getDisplayName(action.actor))}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {getDisplayName(action.actor)}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-1">
                                                trong thẻ "{action.metadata?.cardTitle}"
                                            </p>
                                            <div
                                                className="mt-1 p-3 bg-white border border-gray-200 rounded shadow-sm text-gray-800 prose prose-sm max-w-none [&>p]:m-0"
                                                dangerouslySetInnerHTML={{ __html: action.metadata?.text || '' }}
                                            />
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatDistanceToNow(new Date(action.createdAt), { addSuffix: true, locale: vi })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            {loading && (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                </div>
                            )}
                            {!loading && hasMore && filteredActivities.length > 0 && (
                                <div className="py-2 text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={loadMore}
                                        className="text-gray-500 hover:text-gray-900"
                                    >
                                        Tải thêm bình luận cũ hơn...
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
