import { useState } from "react";
import {
    Settings,
    Lock,
    Bell,
    Moon,
    Sun,
    Laptop,
    Globe,
    Check,
    ArrowLeft
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { useTheme } from "@/shared/providers/ThemeProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { authService } from "@/shared/api/services/authService";
import { tokenStorage } from "@/shared/utils/tokenStorage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const user = tokenStorage.getUser();
    const navigate = useNavigate();

    // Mock states for form
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [browserNotifications, setBrowserNotifications] = useState(false);

    // Password change states
    const [isResetMode, setIsResetMode] = useState(false);
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleResetPassword = async () => {
        if (!user || !user.email) {
            toast.error("Không tìm thấy thông tin email. Vui lòng đăng nhập lại.");
            return;
        }

        try {
            await authService.forgotPassword(user.email);
            toast.success("Đã gửi email! Vui lòng kiểm tra và nhập mã xác nhận.");
            setIsResetMode(true);
            // Clear fields when opening form
            setResetCode("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Lỗi gửi yêu cầu. Vui lòng thử lại sau.";
            toast.error(errorMessage);
        }
    };

    const handleSubmitReset = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }

        if (!user || !user.email) {
            toast.error("Không tìm thấy thông tin email. Vui lòng thử lại.");
            return;
        }

        try {
            await authService.resetPassword(user.email, resetCode, newPassword);
            alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");

            // Optional: Logout user to force re-login with new password
            tokenStorage.clearTokens();
            setTimeout(() => window.location.reload(), 1500);

        } catch (error: any) {
            const serverMessage = error.response?.data?.message || "";
            let displayMessage = "Đổi mật khẩu thất bại. Mã xác nhận có thể không đúng hoặc đã hết hạn.";

            if (serverMessage === "New password must be different from the old password") {
                displayMessage = "Mật khẩu mới không được trùng với mật khẩu cũ.";
            } else if (serverMessage === "Invalid code" || serverMessage === "Code expired or invalid") {
                displayMessage = "Mã xác nhận không đúng hoặc đã hết hạn.";
            } else if (serverMessage === "User not found") {
                displayMessage = "Không tìm thấy thông tin người dùng.";
            }

            alert(displayMessage);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <Button
                variant="ghost"
                className="mb-6 gap-2 pl-0 hover:pl-2 transition-all"
                onClick={() => navigate('/dashboard')}
            >
                <ArrowLeft className="w-4 h-4" />
            Home
            </Button>

            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Settings className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
                    <p className="text-muted-foreground">Quản lý tùy chọn ứng dụng và tài khoản của bạn.</p>
                </div>
            </div>

            <Tabs defaultValue="general" className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-64 shrink-0">
                    <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1">
                        <TabsTrigger
                            value="general"
                            className="w-full justify-start gap-2 px-3 py-2 h-10 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400"
                        >
                            <Globe className="w-4 h-4" /> Chung
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="w-full justify-start gap-2 px-3 py-2 h-10 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400"
                        >
                            <Lock className="w-4 h-4" /> Bảo mật
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="w-full justify-start gap-2 px-3 py-2 h-10 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400"
                        >
                            <Bell className="w-4 h-4" /> Thông báo
                        </TabsTrigger>
                    </TabsList>
                </aside>

                <div className="flex-1">
                    {/* GENERAL SETTINGS */}
                    <TabsContent value="general" className="space-y-6 mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>Giao diện</CardTitle>
                                <CardDescription>Tùy chỉnh giao diện sáng tối của ứng dụng.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div
                                        className={`cursor-pointer rounded-md border-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${theme === 'light' ? 'border-blue-600 bg-blue-50/50' : 'border-transparent'}`}
                                        onClick={() => setTheme('light')}
                                    >
                                        <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                            <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                                <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                            </div>
                                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center justify-center gap-2">
                                            <Sun className="h-4 w-4" />
                                            <span className="text-sm font-medium">Sáng</span>
                                        </div>
                                    </div>
                                    <div
                                        className={`cursor-pointer rounded-md border-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${theme === 'dark' ? 'border-blue-600 bg-blue-50/50' : 'border-transparent'}`}
                                        onClick={() => setTheme('dark')}
                                    >
                                        <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                                            <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                            </div>
                                            <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                <div className="h-4 w-4 rounded-full bg-slate-400" />
                                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center justify-center gap-2">
                                            <Moon className="h-4 w-4" />
                                            <span className="text-sm font-medium">Tối</span>
                                        </div>
                                    </div>
                                    <div
                                        className={`cursor-pointer rounded-md border-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${theme === 'system' ? 'border-blue-600 bg-blue-50/50' : 'border-transparent'}`}
                                        onClick={() => setTheme('system')}
                                    >
                                        <div className="space-y-2 rounded-sm bg-slate-300 p-2">
                                            <div className="space-y-2 rounded-md bg-slate-600 p-2 shadow-sm">
                                                <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                            </div>
                                            <div className="flex items-center space-x-2 rounded-md bg-slate-600 p-2 shadow-sm">
                                                <div className="h-4 w-4 rounded-full bg-slate-400" />
                                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center justify-center gap-2">
                                            <Laptop className="h-4 w-4" />
                                            <span className="text-sm font-medium">Hệ thống</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Ngôn ngữ</CardTitle>
                                <CardDescription>Chọn ngôn ngữ hiển thị của ứng dụng.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 border rounded-lg p-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">🇻🇳</div>
                                    <div className="flex-1">
                                        <p className="font-medium">Tiếng Việt</p>
                                        <p className="text-sm text-gray-500">Ngôn ngữ mặc định</p>
                                    </div>
                                    <Check className="h-5 w-5 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SECURITY SETTINGS */}
                    <TabsContent value="security" className="space-y-6 mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>Đổi mật khẩu</CardTitle>
                                <CardDescription>Bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Email hiện tại: <span className="font-semibold text-gray-900 dark:text-white">{user?.email}</span>
                                    </div>
                                    {!isResetMode ? (
                                        <Button onClick={handleResetPassword}>
                                            Gửi yêu cầu đặt lại mật khẩu
                                        </Button>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-2">
                                                <Label>Mã xác nhận (kiểm tra email)</Label>
                                                <Input
                                                    value={resetCode}
                                                    onChange={(e) => setResetCode(e.target.value)}
                                                    placeholder="Nhập mã từ email..."
                                                    autoComplete="off"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Mật khẩu mới</Label>
                                                <Input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Nhập mật khẩu mới..."
                                                    autoComplete="new-password"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Xác nhận mật khẩu mới</Label>
                                                <Input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Nhập lại mật khẩu mới..."
                                                    autoComplete="new-password"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={handleSubmitReset} disabled={!resetCode || !newPassword || !confirmPassword}>
                                                    Đổi mật khẩu
                                                </Button>
                                                <Button variant="ghost" onClick={() => setIsResetMode(false)}>
                                                    Hủy
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* NOTIFICATION SETTINGS */}
                    <TabsContent value="notifications" className="space-y-6 mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông báo</CardTitle>
                                <CardDescription>Quản lý cách bạn nhận thông báo từ TaskFlow.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Thông báo qua Email</Label>
                                        <p className="text-sm text-muted-foreground">Nhận email về hoạt động quan trọng trong dự án.</p>
                                    </div>
                                    <Switch
                                        checked={emailNotifications}
                                        onCheckedChange={setEmailNotifications}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Thông báo trình duyệt</Label>
                                        <p className="text-sm text-muted-foreground">Hiển thị popup thông báo trên góc màn hình.</p>
                                    </div>
                                    <Switch
                                        checked={browserNotifications}
                                        onCheckedChange={setBrowserNotifications}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
