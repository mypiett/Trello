import { LoginForm } from "@/features/auth/ui";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/dashboard", { replace: true });
  };

  const bgImage = "https://demoda.vn/wp-content/uploads/2023/06/hinh-nen-dektop-4k-dep.jpg";

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{
        backgroundImage: `url('${bgImage}')`,
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="w-full max-w-md z-10 relative">

        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};