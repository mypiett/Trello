import { useState } from "react";
import { Archive, RotateCcw } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { boardApi } from "@/shared/api/board.api";
import { listApi } from "@/shared/api/list.api";
import { cardApi } from "@/shared/api/card.api";
import { toast } from "sonner";

interface Props {
    boardId: string;
    onUpdate?: () => void;
    children?: React.ReactNode;
    canEdit?: boolean;
}

export function BoardArchivedItemsDialog({ boardId, onUpdate, children, canEdit = true }: Props) {
    const [archivedLists, setArchivedLists] = useState<any[]>([]);
    const [archivedCards, setArchivedCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [listsRes, cardsRes] = await Promise.all([
                boardApi.getArchivedLists(boardId) as any,
                boardApi.getArchivedCards(boardId) as any
            ]);

            // Robust parsing
            let listsData = [];
            if (listsRes && Array.isArray(listsRes)) {
                listsData = listsRes;
            } else if (listsRes && listsRes.data && Array.isArray(listsRes.data)) {
                listsData = listsRes.data;
            } else if (listsRes && listsRes.responseObject && Array.isArray(listsRes.responseObject)) {
                listsData = listsRes.responseObject;
            } else if (listsRes && listsRes.result && Array.isArray(listsRes.result)) {
                listsData = listsRes.result;
            }

            let cardsData = [];
            if (cardsRes && Array.isArray(cardsRes)) {
                cardsData = cardsRes;
            } else if (cardsRes && cardsRes.data && Array.isArray(cardsRes.data)) {
                cardsData = cardsRes.data;
            } else if (cardsRes && cardsRes.responseObject && Array.isArray(cardsRes.responseObject)) {
                cardsData = cardsRes.responseObject;
            }

            setArchivedLists(listsData);
            setArchivedCards(cardsData);
        } catch (error) {
            console.error("Failed to fetch archived items", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreList = async (listId: string) => {
        try {
            await listApi.update(listId, { isArchived: false } as any);
            toast.success("Đã khôi phục danh sách");
            fetchData();
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error("Lỗi khôi phục danh sách");
        }
    };

    const handleRestoreCard = async (cardId: string) => {
        try {
            await cardApi.update(cardId, { isArchived: false });
            toast.success("Đã khôi phục thẻ");
            fetchData();
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error("Lỗi khôi phục thẻ");
        }
    };

    return (
        <Dialog onOpenChange={(open) => { if (open) fetchData(); }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[500px] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Archive className="w-5 h-5 text-orange-500" />
                        Mục đã lưu trữ
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Xem và khôi phục các danh sách và thẻ đã lưu trữ.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="cards" className="w-full flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="cards">Thẻ ({archivedCards.length})</TabsTrigger>
                        <TabsTrigger value="lists">Danh sách ({archivedLists.length})</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-hidden mt-4 bg-gray-50 rounded-md border p-2">
                        <TabsContent value="cards" className="h-full mt-0">
                            <div className="h-full pr-4 overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                    {loading ? (
                                        <p className="text-center text-sm text-gray-500 mt-4">Đang tải...</p>
                                    ) : archivedCards.length === 0 ? (
                                        <p className="text-center text-sm text-gray-500 mt-10">Không có thẻ nào được lưu trữ.</p>
                                    ) : (
                                        archivedCards.map((card) => (
                                            <div key={card.id} className="flex items-center justify-between p-3 bg-white rounded border shadow-sm hover:shadow-md transition">
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900">{card.title}</p>
                                                    <p className="text-xs text-gray-500">
                                                        trong danh sách: <span className="font-semibold">{card.listTitle || "Unknown List"}</span>
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {canEdit && (
                                                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleRestoreCard(card.id)}>
                                                            <RotateCcw className="w-3 h-3 mr-1" /> Khôi phục
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="lists" className="h-full mt-0">
                            <div className="h-full pr-4 overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                    {loading ? (
                                        <p className="text-center text-sm text-gray-500 mt-4">Đang tải...</p>
                                    ) : archivedLists.length === 0 ? (
                                        <p className="text-center text-sm text-gray-500 mt-10">Không có danh sách nào được lưu trữ.</p>
                                    ) : (
                                        archivedLists.map((list) => (
                                            <div key={list.id} className="flex items-center justify-between p-3 bg-white rounded border shadow-sm hover:shadow-md transition">
                                                <p className="font-medium text-sm text-gray-900">{list.title}</p>
                                                <div className="flex gap-2">
                                                    {canEdit && (
                                                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleRestoreList(list.id)}>
                                                            <RotateCcw className="w-3 h-3 mr-1" /> Gửi lại vào bảng
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
