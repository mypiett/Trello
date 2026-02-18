
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Check, Plus } from "lucide-react";
import { cardApi } from "@/shared/api/card.api";
import { toast } from "sonner";

interface Label {
    id: string;
    name: string;
    color: string;
}

interface Props {
    cardId: string;
    labels: Label[];
    boardLabels: Label[];
    onUpdate: () => void;
    trigger?: React.ReactNode;
    showList?: boolean;
    canEdit?: boolean;
}

export function CardLabels({ cardId, labels, boardLabels, onUpdate, trigger, showList = true, canEdit = true }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    // ... (logic)

    const isLabelActive = (labelId: string) => {
        return labels.some((l) => l.id === labelId);
    };

    const handleToggleLabel = async (label: Label) => {
        const isActive = isLabelActive(label.id);
        try {
            if (isActive) {
                await cardApi.removeLabel(cardId, label.id);
            } else {
                await cardApi.addLabel(cardId, label.id);
            }
            onUpdate();
        } catch (error) {
            toast.error("Lỗi cập nhật nhãn");
        }
    };

    return (
        <div className={showList ? "space-y-1.5 min-w-[120px]" : ""}>
            {showList && <h3 className="text-xs font-semibold text-gray-500 uppercase">Nhãn</h3>}
            <div className={showList ? "flex flex-wrap gap-2" : "inline-block"}>
                {showList && labels.map((label) => (
                    <div
                        key={label.id}
                        className="h-8 px-3 rounded text-sm font-medium text-white flex items-center min-w-[40px] shadow-sm"
                        style={{ backgroundColor: label.color }}
                    >
                        {label.name}
                    </div>
                ))}

                {canEdit && (
                    <Popover open={isOpen} onOpenChange={setIsOpen}>
                        <PopoverTrigger asChild>
                            {trigger || (
                                <Button variant="secondary" size="sm" className="h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 p-0 flex items-center justify-center">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            )}
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3" align="start" side="bottom" sideOffset={-5}>
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm text-center border-b pb-2 mb-2">Nhãn</h4>
                                <div className="space-y-1">
                                    {boardLabels.map((label) => {
                                        const isActive = isLabelActive(label.id);
                                        return (
                                            <div
                                                key={label.id}
                                                className="flex items-center gap-2 cursor-pointer group"
                                                onClick={() => handleToggleLabel(label)}
                                            >
                                                <div
                                                    className="flex-1 h-8 rounded px-3 flex items-center text-sm font-medium text-white hover:opacity-90 transition-opacity"
                                                    style={{ backgroundColor: label.color }}
                                                >
                                                    {label.name}
                                                </div>
                                                {isActive && (
                                                    <Check className="h-4 w-4 text-blue-600" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        </div>
    );
}
