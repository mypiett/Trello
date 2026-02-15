
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Calendar } from "@/shared/ui/calendar";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cardApi } from "@/shared/api/card.api";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { Checkbox } from "@/shared/ui/checkbox";

interface Props {
    cardId: string;
    dueDate?: string | Date;
    isCompleted?: boolean;
    onUpdate: () => void;
    trigger?: React.ReactNode;
    showDate?: boolean;
}

export function CardDate({ cardId, dueDate, isCompleted, onUpdate, trigger, showDate = true }: Props) {
    const [date, setDate] = useState<Date | undefined>(
        dueDate ? new Date(dueDate) : undefined
    );
    const [isOpen, setIsOpen] = useState(false);

    const handleSelectDate = async (newDate: Date | undefined) => {
        setDate(newDate);
        if (newDate) {
            try {
                await cardApi.update(cardId, { due: newDate.toISOString() });
                onUpdate();
                setIsOpen(false);
                toast.success("Đã cập nhật ngày hết hạn");
            } catch (error) {
                toast.error("Lỗi cập nhật ngày hết hạn");
            }
        }
    };

    const handleToggleComplete = async (checked: boolean) => {
        try {
            await cardApi.update(cardId, { isCompleted: checked });
            onUpdate();
        } catch (error) {
            toast.error("Lỗi cập nhật trạng thái");
        }
    };

    const handleRemoveDate = async () => {
        try {
            await cardApi.update(cardId, { due: null, isCompleted: false });
            onUpdate();
            setIsOpen(false);
            setDate(undefined);
            toast.success("Đã xóa ngày hết hạn");
        } catch (error) {
            toast.error("Lỗi xóa ngày hết hạn");
        }
    };

    return (
        <div className={showDate ? "space-y-1.5 min-w-[120px]" : ""}>
            {showDate && <h3 className="text-xs font-semibold text-gray-500 uppercase">Ngày hết hạn</h3>}

            {showDate && dueDate ? (
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded px-2.5 py-1.5 h-auto text-sm">
                        <Checkbox
                            id="card-completed"
                            checked={isCompleted}
                            onCheckedChange={handleToggleComplete}
                            className="h-4 w-4"
                        />
                        <Popover open={isOpen} onOpenChange={setIsOpen}>
                            <PopoverTrigger asChild>
                                {trigger || (
                                    <button className={cn(
                                        "font-medium px-1 font-mono tracking-tight hover:underline flex items-center",
                                        isCompleted ? "line-through text-green-700" : "text-gray-700"
                                    )}>
                                        {format(new Date(dueDate), "d MMM, yyyy - HH:mm", { locale: vi })}
                                        {isCompleted && <span className="ml-2 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Hoàn tất</span>}
                                    </button>
                                )}
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={-5}>
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={handleSelectDate}
                                    initialFocus
                                />
                                <div className="p-3 border-t bg-gray-50">
                                    <Button variant="destructive" size="sm" className="w-full" onClick={handleRemoveDate}>
                                        Xóa ngày
                                    </Button>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mt-3 text-center">Deadline</h4>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            ) : (
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        {trigger || (
                            <Button variant="secondary" size="sm" className="h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 p-0 flex items-center justify-center">
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={-5}>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleSelectDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}
