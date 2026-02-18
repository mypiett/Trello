import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { boardApi } from "@/shared/api/board.api";
import { toast } from "sonner";

interface Props {
    boardId: string;
    currentDescription?: string;
    onUpdate?: () => void;
    children?: React.ReactNode;
    canEdit?: boolean;
}

export function BoardInfoDialog({ boardId, currentDescription, onUpdate, children, canEdit = true }: Props) {
    const [description, setDescription] = useState(currentDescription || "");
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setDescription(currentDescription || "");
    }, [currentDescription, isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await boardApi.update(boardId, { description });
            toast.success("Đã cập nhật mô tả bảng");
            setIsOpen(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error("Lỗi cập nhật mô tả");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-500" />
                        Giới thiệu về bảng này
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Mô tả
                        </label>
                        <Textarea
                            placeholder={canEdit ? "Thêm mô tả chi tiết cho bảng của bạn..." : "Bảng này chưa có mô tả."}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[150px]"
                            readOnly={!canEdit}
                        />
                    </div>
                    {canEdit && (
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "Đang lưu..." : "Lưu"}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
