import { useState, useRef, useEffect } from "react";
import { AlignLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { cardApi } from "@/shared/api/card.api";
import { toast } from "sonner";


interface Props {
    cardId: string;
    initialDescription?: string;
    onUpdate?: () => void;
    canEdit?: boolean;
}

export const CardDescription = ({ cardId, initialDescription, onUpdate, canEdit = true }: Props) => {
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(initialDescription || "");
    const formRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setDescription(initialDescription || "");
    }, [initialDescription]);

    // Simple click outside handler if hook doesn't exist
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (formRef.current && !formRef.current.contains(event.target as Node)) {
                if (isEditing) {
                    setIsEditing(false);
                    // Reset to last saved validation or keep unsaved? 
                    // Usually Trello saves or cancels. Let's just cancel for now/reset
                    setDescription(initialDescription || "");
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isEditing, initialDescription]);


    const handleSave = async () => {
        if (description === initialDescription) {
            setIsEditing(false);
            return;
        }

        try {
            await cardApi.update(cardId, { description });
            toast.success("Đã cập nhật mô tả");
            setIsEditing(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error("Lỗi cập nhật mô tả");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setDescription(initialDescription || "");
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2 text-gray-700 text-sm uppercase tracking-wide">
                    <AlignLeft className="w-4 h-4" /> Mô tả
                </h3>
                {!isEditing && description && canEdit && (
                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                        Chỉnh sửa
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div ref={formRef} className="space-y-2">
                    <Textarea
                        ref={textareaRef}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Thêm mô tả chi tiết hơn..."
                        className="min-h-[120px] resize-none bg-white focus:bg-white p-3"
                        autoFocus
                    />
                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleSave}>Lưu</Button>
                        <Button variant="ghost" size="sm" onClick={handleCancel}>Hủy</Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => canEdit && setIsEditing(true)}
                    className={`min-h-[60px] p-3 rounded-md transition-colors ${canEdit ? "cursor-pointer" : "cursor-default"} ${description
                        ? "bg-transparent hover:bg-gray-100"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm font-medium py-4 px-4"
                        }`}
                >
                    {description ? (
                        <div className="whitespace-pre-wrap text-sm text-gray-700">{description}</div>
                    ) : (
                        "Thêm mô tả chi tiết hơn..."
                    )}
                </div>
            )}
        </div>
    );
};
