import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/shared/ui/command";
import { cardApi } from "@/shared/api/card.api";
import { toast } from "sonner";
import type { Member } from "@/shared/api/board.api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

interface Props {
    cardId: string;
    members: Member[];
    boardMembers: Member[];
    onUpdate?: () => void;
    trigger?: React.ReactNode; // Custom trigger
    showList?: boolean; // Whether to show the list of avatars
    canEdit?: boolean;
}

const getInitials = (name: string) => {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
};

export const CardMembers = ({ cardId, members = [], boardMembers = [], onUpdate, trigger, showList = true, canEdit = true }: Props) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isMember = (memberId: string) => {
        return members.some((m) => m.id === memberId);
    };

    const handleToggleMember = async (memberId: string) => {
        setIsLoading(true);
        try {
            if (isMember(memberId)) {
                await cardApi.removeMember(cardId, memberId);
                toast.success("Đã xóa thành viên khỏi thẻ");
            } else {
                await cardApi.addMember(cardId, memberId);
                toast.success("Đã thêm thành viên vào thẻ");
            }
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error("Lỗi cập nhật thành viên");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={showList ? "space-y-1.5 min-w-[120px]" : ""}>
            {showList && <h3 className="text-xs font-semibold text-gray-700 uppercase">Thành viên</h3>}

            <div className={showList ? "flex flex-wrap gap-2" : "inline-block"}>
                {showList && members.map((member) => (
                    <div key={member.id} className="relative group">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                                        <AvatarImage src={member.avatarUrl || ""} />
                                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{member.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                ))}

                {canEdit && (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            {trigger || (
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                                    <Plus className="h-4 w-4 text-gray-600" />
                                </Button>
                            )}
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-64" align="start" side="bottom" sideOffset={-5}>
                            <Command>
                                <CommandInput placeholder="Tìm thành viên..." />
                                <CommandList>
                                    <CommandEmpty>Không tìm thấy thành viên.</CommandEmpty>
                                    <CommandGroup heading="Thành viên bảng">
                                        {boardMembers.map((member) => {
                                            const selected = isMember(member.id);
                                            return (
                                                <CommandItem
                                                    key={member.id}
                                                    onSelect={() => handleToggleMember(member.id)}
                                                    disabled={isLoading}
                                                    className="cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2 w-full">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={member.avatarUrl || ""} />
                                                            <AvatarFallback className="text-[10px]">{getInitials(member.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="truncate flex-1">{member.name}</span>
                                                        {selected && <Check className="h-4 w-4 text-blue-600" />}
                                                    </div>
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        </div>
    );
};
