import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0c10] relative overflow-hidden">
      {/* Visual Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
      
      <SignIn path="/sign-in" routing="path" />
    </div>
  );
}
