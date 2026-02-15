import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { boardApi } from "@/shared/api/board.api";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";

interface Props {
    boardId: string;
    currentCommentPolicy?: 'disabled' | 'members' | 'workspace' | 'anyone';
    currentMemberPolicy?: 'admins_only' | 'all_members';
    onUpdate?: () => void;
    children?: React.ReactNode;
}

export function BoardSettingsDialog({ boardId, currentCommentPolicy, currentMemberPolicy, onUpdate, children }: Props) {
    const [commentPolicy, setCommentPolicy] = useState(currentCommentPolicy || 'members');
    const [memberPolicy, setMemberPolicy] = useState(currentMemberPolicy || 'admins_only');
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCommentPolicy(currentCommentPolicy || 'members');
            setMemberPolicy(currentMemberPolicy || 'admins_only');
        }
    }, [currentCommentPolicy, currentMemberPolicy, isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await boardApi.update(boardId, {
                commentPolicy: commentPolicy as any,
                memberManagePolicy: memberPolicy as any
            });
            toast.success("Đã cập nhật cài đặt bảng");
            setIsOpen(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error("Lỗi cập nhật cài đặt");
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
                        <Settings className="w-5 h-5 text-gray-500" />
                        Cài đặt bảng
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Quyền bình luận</Label>
                        <p className="text-sm text-gray-500">Ai có thể bình luận trên thẻ?</p>
                        <Select
                            value={commentPolicy}
                            onValueChange={(val) => setCommentPolicy(val as any)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn quyền bình luận" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="disabled">Đã tắt (Không ai)</SelectItem>
                                <SelectItem value="members">Thành viên & Quản trị viên</SelectItem>
                                <SelectItem value="workspace">Thành viên Workspace</SelectItem>
                                <SelectItem value="anyone">Công khai (Bất kỳ ai)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Thêm và xóa thành viên</Label>
                        <p className="text-sm text-gray-500">Ai có thể thêm hoặc loại bỏ thành viên khỏi bảng?</p>
                        <Select
                            value={memberPolicy}
                            onValueChange={(val) => setMemberPolicy(val as any)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn quyền quản lý thành viên" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admins_only">Chỉ Quản trị viên (QTV)</SelectItem>
                                <SelectItem value="all_members">Tất cả thành viên</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
