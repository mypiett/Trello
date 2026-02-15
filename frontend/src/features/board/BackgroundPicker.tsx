import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { boardApi } from "@/shared/api/board.api";
import { Check, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface BackgroundPickerProps {
    boardId: string;
    currentCover: string | null;
    onUpdate: (newUrl: string) => void;
    children?: React.ReactNode;
}

// Note: For gradients/colors, we might need to handle them differently in BoardPage if they aren't URLs. 
// For now assuming we stick to Image URLs for simplicity or I need to update BoardPage to handle ClassNames/Colors.
// The user's BoardPage uses `backgroundImage: url(...)` so I should stick to URLs for now or refactor BoardPage.
// I will provide Image URLs for presets. 

const PRESET_IMAGES = [
    "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070",
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2070",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072",
    "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=1944",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070",
    "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=2070",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2070",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070",
    "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=2070",
];

export function BackgroundPicker({ boardId, currentCover, onUpdate, children }: BackgroundPickerProps) {
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleSelectPreset = async (url: string) => {
        try {
            await boardApi.update(boardId, { coverUrl: url });
            onUpdate(url);
            toast.success("Đã đổi hình nền");
            setOpen(false);
        } catch (error) {
            toast.error("Lỗi đổi hình nền");
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const response: any = await boardApi.updateCover(boardId, file);
            const newCoverUrl = response.data?.coverUrl || response.responseObject?.coverUrl || response.coverUrl;

            if (newCoverUrl) {
                onUpdate(newCoverUrl);
                toast.success("Đã tải lên hình nền mới");
                setOpen(false);
            }
        } catch (error) {
            toast.error("Lỗi tải lên hình ảnh");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Đổi hình nền bảng</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                    <div className="col-span-full mb-2">
                        <label
                            htmlFor="bg-upload"
                            className={`
                                flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition
                                ${uploading ? 'opacity-50 pointer-events-none' : ''}
                            `}
                        >
                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                                <span className="text-sm font-medium">Tải ảnh từ máy tính</span>
                            </div>
                            <input
                                id="bg-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>

                    {/* Default Option */}
                    <div
                        onClick={() => handleSelectPreset("https://images.unsplash.com/photo-1519681393784-d8e5b5a4570e?q=80&w=2070")}
                        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group hover:ring-2 ring-sky-500 transition flex items-center justify-center bg-gray-100"
                    >
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                        <span className="absolute bottom-2 text-xs font-medium text-gray-500">Mặc định</span>
                        {currentCover === "https://images.unsplash.com/photo-1519681393784-d8e5b5a4570e?q=80&w=2070" && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Check className="text-white h-8 w-8" />
                            </div>
                        )}
                    </div>

                    {PRESET_IMAGES.map((url, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelectPreset(url)}
                            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group hover:ring-2 ring-sky-500 transition"
                        >
                            <img src={url} alt="Background" className="w-full h-full object-cover" />
                            {currentCover === url && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Check className="text-white h-8 w-8" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
