import AuthForm from "@/components/AuthForm";
import WarpShader from "@/components/WarpShader";

export default function SignInPage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <div className="w-full h-full flex flex-row items-center">
                <AuthForm />
                <div className="w-1/2 h-full">
                    <WarpShader
                        colorFront={{ r: 0.784, g: 0.192, b: 0.22, a: 1 }}
                        colorBack={{ r: 0, g: 0, b: 0, a: 1 }}
                    />
                </div>
            </div>
        </div>
    );
}
