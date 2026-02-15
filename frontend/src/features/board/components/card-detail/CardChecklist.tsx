import { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Progress } from "@/shared/ui/progress";
import { cardApi } from "@/shared/api/card.api";
import { toast } from "sonner";
import { Checkbox } from "@/shared/ui/checkbox";

interface CheckItem {
    id: string;
    name: string;
    isChecked: boolean;
    position: number;
}

interface Checklist {
    id: string;
    name: string;
    position: number;
    checkItems: CheckItem[];
}

interface Props {
    cardId: string;
}

export const CardChecklist = ({ cardId }: Props) => {
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newChecklistName, setNewChecklistName] = useState("Việc cần làm");

    // Helper state for adding items to specific checklist
    const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
    const [newItemName, setNewItemName] = useState("");

    const fetchChecklists = async () => {
        try {
            const response: any = await cardApi.getChecklists(cardId);
            const data = response.responseObject || response.data || response;
            // Ensure data is array
            setChecklists(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch checklists:", error);
        }
    };

    useEffect(() => {
        fetchChecklists();
    }, [cardId]);

    const handleCreateChecklist = async () => {
        if (!newChecklistName.trim()) return;
        try {
            await cardApi.createChecklist(cardId, newChecklistName, checklists.length);
            toast.success("Đã tạo danh sách công việc");
            setIsCreating(false);
            setNewChecklistName("Việc cần làm");
            fetchChecklists();
        } catch (error) {
            toast.error("Lỗi khi tạo danh sách");
        }
    };

    const handleDeleteChecklist = async (checklistId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa danh sách này?")) return;
        try {
            await cardApi.deleteChecklist(cardId, checklistId);
            toast.success("Đã xóa danh sách");
            setChecklists(prev => prev.filter(c => c.id !== checklistId));
        } catch (error) {
            toast.error("Lỗi khi xóa danh sách");
        }
    };

    const handleAddItem = async (checklistId: string) => {
        if (!newItemName.trim()) return;
        try {
            const checklist = checklists.find(c => c.id === checklistId);
            const position = checklist?.checkItems?.length || 0;
            await cardApi.createCheckItem(cardId, checklistId, newItemName, position);
            toast.success("Đã thêm mục");
            setAddingItemTo(null);
            setNewItemName("");
            fetchChecklists();
        } catch (error) {
            toast.error("Lỗi khi thêm mục");
        }
    };

    const handleToggleItem = async (checklistId: string, itemId: string, isChecked: boolean) => {
        // Optimistic update
        setChecklists(prev => prev.map(cl => {
            if (cl.id !== checklistId) return cl;
            return {
                ...cl,
                checkItems: cl.checkItems.map(item =>
                    item.id === itemId ? { ...item, isChecked } : item
                )
            };
        }));

        try {
            await cardApi.updateCheckItem(cardId, checklistId, itemId, { isChecked });
        } catch (error) {
            toast.error("Lỗi cập nhật trạng thái");
            fetchChecklists(); // Revert
        }
    };

    const handleDeleteItem = async (checklistId: string, itemId: string) => {
        try {
            await cardApi.deleteCheckItem(cardId, checklistId, itemId);
            setChecklists(prev => prev.map(cl => {
                if (cl.id !== checklistId) return cl;
                return {
                    ...cl,
                    checkItems: cl.checkItems.filter(item => item.id !== itemId)
                };
            }));
        } catch (error) {
            toast.error("Lỗi khi xóa mục");
        }
    };

    const calculateProgress = (items: CheckItem[]) => {
        if (!items || items.length === 0) return 0;
        const checked = items.filter(i => i.isChecked).length;
        return Math.round((checked / items.length) * 100);
    };

    return (
        <div className="space-y-6">
            {checklists.map((checklist) => (
                <div key={checklist.id} className="space-y-3">
                    <div className="flex items-center justify-between group">
                        <h3 className="font-semibold flex items-center gap-2 text-gray-700 text-sm uppercase tracking-wide">
                            <CheckSquare className="w-4 h-4" /> {checklist.name}
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteChecklist(checklist.id)}
                        >
                            <Trash2 className="w-4 h-4" /> Xóa
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-8">{calculateProgress(checklist.checkItems)}%</span>
                        <Progress value={calculateProgress(checklist.checkItems)} className="h-2" />
                    </div>

                    <div className="space-y-2">
                        {checklist.checkItems?.map((item) => (
                            <div key={item.id} className="flex items-start gap-3 group/item">
                                <Checkbox
                                    checked={item.isChecked}
                                    onCheckedChange={(checked) => handleToggleItem(checklist.id, item.id, checked as boolean)}
                                    className="mt-1"
                                />
                                <span className={`text-sm flex-1 break-words ${item.isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                    {item.name}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100"
                                    onClick={() => handleDeleteItem(checklist.id, item.id)}
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {addingItemTo === checklist.id ? (
                        <div className="space-y-2 pl-7">
                            <Input
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder="Thêm một mục..."
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddItem(checklist.id);
                                    }
                                }}
                            />
                            <div className="flex items-center gap-2">
                                <Button size="sm" onClick={() => handleAddItem(checklist.id)}>Thêm</Button>
                                <Button variant="ghost" size="sm" onClick={() => setAddingItemTo(null)}>Hủy</Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="ml-0 mt-2"
                            onClick={() => {
                                setAddingItemTo(checklist.id);
                                setNewItemName("");
                            }}
                        >
                            <Plus className="w-4 h-4 mr-1" /> Thêm một mục
                        </Button>
                    )}
                </div>
            ))}

            {/* Create new checklist button/form */}
            {isCreating ? (
                <div className="space-y-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <label className="text-sm font-medium text-gray-700">Tiêu đề</label>
                    <Input
                        value={newChecklistName}
                        onChange={(e) => setNewChecklistName(e.target.value)}
                        placeholder="Việc cần làm"
                        autoFocus
                    />
                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleCreateChecklist}>Thêm</Button>
                        <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>Hủy</Button>
                    </div>
                </div>
            ) : (
                <Button
                    variant="outline"
                    className="w-full justify-start text-gray-600"
                    onClick={() => setIsCreating(true)}
                >
                    <CheckSquare className="w-4 h-4 mr-2" /> Thêm danh sách công việc
                </Button>
            )}
        </div>
    );
};
