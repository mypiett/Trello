import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { boardApi } from "@/shared/api/board.api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/model";

export const InviteResponsePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const boardId = searchParams.get("boardId");
    const { isAuthenticated, isLoading } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    // Determine action based on URL path
    const isDecline = location.pathname.includes("/decline");
    const action = isDecline ? "Decline" : "Accept";

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Redirect to login if not authenticated, preserving the invite link as returnUrl
            const returnUrl = encodeURIComponent(`${location.pathname}${location.search}`);
            navigate(`/login?returnUrl=${returnUrl}`);
        }
    }, [isAuthenticated, isLoading, navigate, location]);

    const handleResponse = async () => {
        if (!boardId) {
            toast.error("Invalid invitation link");
            return;
        }

        setIsProcessing(true);
        try {
            const status = isDecline ? "declined" : "active";
            await boardApi.respondToInvitation(boardId, status);

            if (isDecline) {
                toast.success("Invitation declined");
                navigate("/dashboard");
            } else {
                toast.success("Invitation accepted! Welcome to the board.");
                navigate(`/boards/${boardId}`);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to process invitation");
            setIsProcessing(false);
        }
    };

    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#1d2125] text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!boardId) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#1d2125] text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Invalid Link</h1>
                    <p className="mt-2 text-gray-400">Missing board information.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#1d2125] text-white">
            <div className="w-full max-w-md rounded-lg bg-[#22272b] p-8 shadow-xl border border-gray-700">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Board Invitation</h1>
                    <p className="mb-8 text-gray-300">
                        You have been invited to join a board. <br />
                        Do you want to <strong>{action}</strong> this invitation?
                    </p>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleResponse}
                            disabled={isProcessing}
                            className={`flex w-full items-center justify-center rounded px-4 py-3 font-semibold transition-colors ${isDecline
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                                } disabled:opacity-50`}
                        >
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {action} Invitation
                        </button>

                        {!isDecline && (
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="w-full text-sm text-gray-400 hover:text-white underline"
                            >
                                Not now, go to Dashboard
                            </button>
                        )}
                        {isDecline && (
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="w-full text-sm text-gray-400 hover:text-white underline"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
