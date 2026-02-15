
import { useState, useRef } from "react";
import { Button } from "@/shared/ui/button";
import { Paperclip, X, Download, Loader2 } from "lucide-react";
import { cardApi } from "@/shared/api/card.api";
import { toast } from "sonner";

interface Attachment {
    id: string;
    name: string;
    url: string;
    mimeType?: string;
    createdAt: string;
}

interface Props {
    cardId: string;
    attachments: Attachment[];
    onUpdate: () => void;
}

export function CardAttachments({ cardId, attachments = [], onUpdate }: Props) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            await cardApi.addAttachment(cardId, file, file.name);
            toast.success("Đã thêm đính kèm");
            onUpdate();
        } catch (error) {
            toast.error("Lỗi khi tải lên tệp");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDelete = async (attachmentId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa đính kèm này?")) return;
        try {
            await cardApi.deleteAttachment(cardId, attachmentId);
            toast.success("Đã xóa đính kèm");
            onUpdate();
        } catch (error) {
            toast.error("Lỗi khi xóa đính kèm");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" /> Các tệp đính kèm
                </h3>
            </div>

            <div className="space-y-3">
                {attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md group">
                        <div className="h-16 w-24 bg-gray-200 rounded flex items-center justify-center overflow-hidden shrink-0">
                            {att.mimeType?.startsWith("image/") ? (
                                <img src={att.url} alt={att.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-xs font-bold text-gray-500 uppercase">
                                    {att.name.split(".").pop()}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{att.name}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(att.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-gray-700 underline flex items-center hover:text-blue-600"
                                >
                                    <Download className="h-3 w-3 mr-1" /> Tải xuống
                                </a>
                                <button
                                    className="text-xs text-gray-700 underline flex items-center hover:text-red-600"
                                    onClick={() => handleDelete(att.id)}
                                >
                                    <X className="h-3 w-3 mr-1" /> Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {attachments.length === 0 && (
                    <p className="text-sm text-gray-500 italic">Chưa có tệp đính kèm nào.</p>
                )}
            </div>

            <div>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <Button variant="secondary" size="sm" className="font-bold text-gray-700 bg-gray-200 hover:bg-gray-300" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Paperclip className="h-3.5 w-3.5 mr-2" />}
                    Thêm đính kèm
                </Button>
            </div>
        </div>
    );
}
