import NavBar from "@/components/NavBar";
import Checkboxes from "@/components/Checkboxes";

export default function CheckboxPage() {
    return (
        <div className="flex flex-col items-center justify-center">
            <NavBar />
            <div className="min-h-screen">
                <Checkboxes />
            </div>
        </div>
    );
}
