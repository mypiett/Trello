import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup,
} from "@/shared/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { useNavigate } from "react-router-dom";
import { tokenStorage } from "@/shared/utils/tokenStorage";
import {
  ChevronsUpDown, LogOut, Settings, User,
  Archive, Users, Moon, Sun, Laptop
} from "lucide-react";
import { useTheme } from "@/shared/providers/ThemeProvider";

interface NavUserProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function NavUser({ user }: NavUserProps) {
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 w-full transition-colors outline-none text-sidebar-foreground">

          <Avatar className="h-8 w-8 rounded-lg border border-gray-200">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600 font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-gray-900 dark:text-gray-100">
              {user.name}
            </span>
            <span className="truncate text-xs text-gray-500">
              {user.email}
            </span>
          </div>

          <ChevronsUpDown className="ml-auto size-4 text-gray-400" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
            <User className="mr-2 h-4 w-4 text-gray-500" />
            Hồ sơ cá nhân
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4 text-gray-500" />
            Cài đặt
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => navigate("/archives")} className="cursor-pointer">
            <Archive className="mr-2 h-4 w-4 text-gray-500" />
            Kho lưu trữ
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate("/login")} className="cursor-pointer">
            <Users className="mr-2 h-4 w-4 text-gray-500" />
            Chuyển đổi tài khoản
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              {theme === 'light' && <Sun className="mr-2 h-4 w-4" />}
              {theme === 'dark' && <Moon className="mr-2 h-4 w-4" />}
              {theme === 'system' && <Laptop className="mr-2 h-4 w-4" />}
              <span>Giao diện</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                <Sun className="mr-2 h-4 w-4" />
                <span>Sáng</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                <Moon className="mr-2 h-4 w-4" />
                <span>Tối</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                <Laptop className="mr-2 h-4 w-4" />
                <span>Hệ thống</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
          onClick={() => {
            tokenStorage.clearTokens();
            navigate("/login");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
