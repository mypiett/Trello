
import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Calendar } from "@/shared/ui/calendar";
import { Plus, X } from "lucide-react";
import { format, isBefore, setHours, setMinutes, differenceInHours } from "date-fns";
import { vi } from "date-fns/locale";
import { cardApi } from "@/shared/api/card.api";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";

interface Props {
    cardId: string;
    dueDate?: string | Date;
    startDate?: string | Date;
    dueReminder?: number | null; // minutes before
    isCompleted?: boolean;
    onUpdate: () => void;
    trigger?: React.ReactNode;
    showDate?: boolean;
    canEdit?: boolean;
}

export function CardDate({ cardId, dueDate, startDate, dueReminder, isCompleted, onUpdate, trigger, showDate = true, canEdit = true }: Props) {
    const parseDate = (d: string | Date | undefined) => d ? new Date(d) : undefined;

    // State
    const [date, setDate] = useState<Date | undefined>(parseDate(dueDate));
    const [start, setStart] = useState<Date | undefined>(parseDate(startDate));
    const [time, setTime] = useState(dueDate ? format(new Date(dueDate), "HH:mm") : "12:00"); // Time for Due Date
    const [hasStart, setHasStart] = useState(!!startDate);
    const [hasDue, setHasDue] = useState(!!dueDate);
    const [reminder, setReminder] = useState<string>(dueReminder?.toString() || "-1");
    const [isOpen, setIsOpen] = useState(false);

    // Interaction State: Which field is the calendar updating?
    const [focusedInput, setFocusedInput] = useState<'start' | 'due'>('due');

    useEffect(() => {
        setDate(parseDate(dueDate));
        setStart(parseDate(startDate));
        setTime(dueDate ? format(new Date(dueDate), "HH:mm") : "12:00");
        setHasStart(!!startDate);
        setHasDue(!!dueDate);
        setReminder(dueReminder?.toString() || "-1");
        setFocusedInput(!!dueDate ? 'due' : 'start'); // Default focus
    }, [dueDate, startDate, dueReminder, isOpen]);

    // Calendar Selection Handler
    const handleCalendarSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) return;

        if (focusedInput === 'start') {
            setStart(selectedDate);
            setHasStart(true);
        } else {
            setDate(selectedDate);
            setHasDue(true);
        }
    };

    const handleSave = async () => {
        // Construct Final Dates
        let finalDue = null;
        let finalStart = null;

        if (hasDue && date) {
            const [hours, minutes] = time.split(":").map(Number);
            finalDue = setMinutes(setHours(date, hours), minutes).toISOString();
        }

        if (hasStart && start) {
            finalStart = start.toISOString();
        }

        if (!hasDue && !hasStart) {
            // User unchecked both, treat as remove
            handleRemoveDate();
            return;
        }

        // Validate: Start must be before Due (if both exist)
        if (finalStart && finalDue && isBefore(new Date(finalDue), new Date(finalStart))) {
            toast.error("Ngày hết hạn phải sau ngày bắt đầu");
            return;
        }

        const finalReminder = reminder === "-1" ? null : parseInt(reminder);

        try {
            await cardApi.update(cardId, {
                due: finalDue,
                start: finalStart,
                dueReminder: finalReminder,
                isCompleted: hasDue ? isCompleted : false
            });
            onUpdate();
            setIsOpen(false);
            toast.success("Đã cập nhật thời gian");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi cập nhật thời gian");
        }
    };

    const handleRemoveDate = async () => {
        try {
            await cardApi.update(cardId, { due: null, start: null, dueReminder: null, isCompleted: false });
            onUpdate();
            setIsOpen(false);
            setDate(undefined);
            setStart(undefined);
            setHasStart(false);
            setHasDue(false);
            toast.success("Đã xóa ngày hết hạn");
        } catch (error) {
            toast.error("Lỗi xóa ngày hết hạn");
        }
    };

    const handleToggleComplete = async (checked: boolean) => {
        if (!canEdit) return;
        try {
            await cardApi.update(cardId, { isCompleted: checked });
            onUpdate();
        } catch (error) {
            toast.error("Lỗi cập nhật trạng thái");
        }
    };

    // Badge Logic
    const getBadgeStatus = () => {
        if (!dueDate) return 'none';
        if (isCompleted) return 'completed';

        const now = new Date();
        const due = new Date(dueDate);

        if (isBefore(due, now)) return 'overdue';

        const hoursDiff = differenceInHours(due, now);
        if (hoursDiff < 24) return 'soon';

        return 'normal';
    };

    const badgeStatus = getBadgeStatus();

    const badgeStyles = {
        none: "",
        completed: "bg-green-500 text-white hover:bg-green-600 border-green-600",
        overdue: "bg-red-500 text-white hover:bg-red-600 border-red-600 animate-pulse",
        soon: "bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-yellow-500",
        normal: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300 dark:bg-gray-800 dark:text-gray-300",
    };

    const badgeLabel = {
        none: "",
        completed: "Đã xong",
        overdue: "Quá hạn",
        soon: "Sắp hết hạn",
        normal: "",
    };

    return (
        <div className={showDate ? "space-y-1.5 min-w-[120px]" : ""}>
            {showDate && <h3 className="text-xs font-semibold text-gray-500 uppercase">Ngày hết hạn</h3>}

            {showDate && (dueDate || startDate) ? (
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "flex items-center gap-2 rounded px-2.5 py-1.5 h-auto text-sm border transition-colors",
                        badgeStyles[badgeStatus] || "bg-gray-100 border-gray-300 text-gray-700"
                    )}>
                        {dueDate && (
                            <Checkbox
                                id="card-completed"
                                checked={isCompleted}
                                onCheckedChange={handleToggleComplete}
                                disabled={!canEdit}
                                className={cn(
                                    "h-4 w-4 border-2 shadow-none",
                                    badgeStatus === 'overdue' ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-red-500" :
                                        badgeStatus === 'completed' ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-green-500" :
                                            "border-gray-500"
                                )}
                            />
                        )}

                        {canEdit ? (
                            <Popover open={isOpen} onOpenChange={setIsOpen}>
                                <PopoverTrigger asChild>
                                    {trigger || (
                                        <button className="font-medium px-1 font-mono tracking-tight hover:underline flex items-center gap-2">
                                            {startDate && (
                                                <span className="opacity-80 text-xs">
                                                    {format(new Date(startDate), "d/M/yyyy")} -
                                                </span>
                                            )}
                                            {dueDate ? (
                                                <span>
                                                    {format(new Date(dueDate), "d MMM, HH:mm", { locale: vi })}
                                                </span>
                                            ) : (
                                                <span>...</span>
                                            )}
                                            {badgeLabel[badgeStatus] && (
                                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 border border-white/30 px-1 rounded-sm">
                                                    {badgeLabel[badgeStatus]}
                                                </span>
                                            )}
                                        </button>
                                    )}
                                </PopoverTrigger>
                                {renderPopoverContent()}
                            </Popover>
                        ) : (
                            // Read-only view
                            <div className="font-medium px-1 font-mono tracking-tight flex items-center gap-2 cursor-default">
                                {startDate && (
                                    <span className="opacity-80 text-xs">{format(new Date(startDate), "d/M/yyyy")} - </span>
                                )}
                                {dueDate && format(new Date(dueDate), "d MMM, HH:mm", { locale: vi })}
                                {badgeLabel[badgeStatus] && (
                                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 border border-white/30 px-1 rounded-sm">
                                        {badgeLabel[badgeStatus]}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                canEdit && (
                    <Popover open={isOpen} onOpenChange={setIsOpen}>
                        <PopoverTrigger asChild>
                            {trigger || (
                                <Button variant="secondary" size="sm" className="h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 p-0 flex items-center justify-center">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            )}
                        </PopoverTrigger>
                        {renderPopoverContent()}
                    </Popover>
                )
            )}
        </div>
    );

    function renderPopoverContent() {
        const startDateDisplay = start ? format(start, "d/M/yyyy") : "N/T/NNNN";
        const dueDateDisplay = date ? format(date, "d/M/yyyy") : "N/T/NNNN";

        return (
            <PopoverContent className="w-auto min-w-[320px] p-0 shadow-lg border-gray-200" align="start" side="bottom" sideOffset={5}>
                {/* Header */}
                <div className="relative pt-3 pb-2 text-center">
                    <span className="font-semibold text-sm text-gray-600">Ngày</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 text-gray-400 hover:text-gray-700"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Calendar */}
                <div className="p-0 flex justify-center border-b border-gray-100">
                    <Calendar
                        mode="single"
                        selected={focusedInput === 'start' ? start : date}
                        onSelect={handleCalendarSelect}
                        initialFocus
                        className="rounded-md"
                        locale={vi}
                        classNames={{
                            day_selected: "bg-blue-600 text-white hover:bg-blue-600 focus:bg-blue-600",
                            day_today: "bg-transparent text-blue-600 font-bold underline decoration-blue-500 underline-offset-4",
                        }}
                        formatters={{
                            formatWeekdayName: (date) => {
                                const day = date.getDay();
                                if (day === 0) return "CN";
                                return `T${day + 1}`;
                            }
                        }}
                    />
                </div>

                <div className="p-4 space-y-4">
                    {/* Start Date Row */}
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-600">Ngày bắt đầu</Label>
                        <div className="flex items-center gap-2 h-9">
                            <Checkbox
                                id="has-start"
                                checked={hasStart}
                                onCheckedChange={(c) => {
                                    const checked = c as boolean;
                                    setHasStart(checked);
                                    if (checked) {
                                        setFocusedInput('start');
                                        if (!start) setStart(new Date());
                                    } else {
                                        setFocusedInput('due');
                                    }
                                }}
                                className="h-4 w-4 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <div
                                className={cn(
                                    "flex-1 h-full px-3 py-1.5 text-sm rounded-[3px] border transition-all cursor-pointer flex items-center",
                                    hasStart ? "bg-white border-gray-300 text-gray-900" : "bg-gray-100 border-gray-200 text-gray-400 placeholder-shown:text-gray-300",
                                    focusedInput === 'start' && hasStart && "ring-2 ring-blue-500 border-blue-500 z-10"
                                )}
                                onClick={() => {
                                    if (hasStart) setFocusedInput('start');
                                }}
                            >
                                {startDateDisplay}
                            </div>
                        </div>
                    </div>

                    {/* Due Date Row */}
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-600">Ngày hết hạn</Label>
                        <div className="flex items-center gap-2 h-9">
                            <Checkbox
                                id="has-due"
                                checked={hasDue}
                                onCheckedChange={(c) => {
                                    const checked = c as boolean;
                                    setHasDue(checked);
                                    if (checked) {
                                        setFocusedInput('due');
                                        if (!date) setDate(new Date());
                                    }
                                }}
                                className="h-4 w-4 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <div
                                className={cn(
                                    "flex-1 h-full px-3 py-1.5 text-sm rounded-[3px] border transition-all cursor-pointer flex items-center",
                                    hasDue ? "bg-white border-gray-300 text-gray-900" : "bg-gray-100 border-gray-200 text-gray-400",
                                    focusedInput === 'due' && hasDue && "ring-2 ring-blue-500 border-blue-500 z-10"
                                )}
                                onClick={() => {
                                    if (hasDue) setFocusedInput('due');
                                }}
                            >
                                {dueDateDisplay}
                            </div>
                            {hasDue && (
                                <Input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-24 h-full text-center px-1 rounded-[3px] border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                />
                            )}
                        </div>
                    </div>

                    {/* Recurring (Fake UI) */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Label className="text-xs font-bold text-gray-600">Định kỳ</Label>
                            <span className="bg-purple-100 text-purple-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm">New</span>
                        </div>
                        <Select disabled value="never">
                            <SelectTrigger className="w-full text-sm h-9 bg-gray-50 border-gray-300 text-gray-500">
                                <SelectValue placeholder="Không bao giờ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="never">Không bao giờ</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Reminders */}
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-600">Thiết lập Nhắc nhở</Label>
                        <Select value={reminder} onValueChange={setReminder} disabled={!hasDue}>
                            <SelectTrigger className="w-full text-sm h-9 border-gray-300 focus:ring-blue-500">
                                <SelectValue placeholder="Chọn nhắc nhở" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="-1">Không nhắc</SelectItem>
                                <SelectItem value="0">Tại thời điểm hết hạn</SelectItem>
                                <SelectItem value="15">Trước 15 phút</SelectItem>
                                <SelectItem value="60">Trước 1 giờ</SelectItem>
                                <SelectItem value="1440">1 Ngày trước</SelectItem>
                                <SelectItem value="2880">2 Ngày trước</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[12px] text-gray-500 leading-tight pt-1">
                            Nhắc nhở sẽ được gửi đến tất cả các thành viên và người theo dõi thẻ này.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-1">
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-9 rounded-[3px]"
                            onClick={handleSave}
                        >
                            Lưu
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium h-9 rounded-[3px]"
                            onClick={handleRemoveDate}
                        >
                            Gỡ bỏ
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        );
    }
}
