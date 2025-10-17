import Slider from "@/components/Slider";

export default function SliderPage() {
    return (
        <div className="min-h-screen flex justify-center items-center">
            <Slider min={1} max={84} />
        </div>
    );
}
