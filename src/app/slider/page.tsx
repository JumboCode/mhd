import Slider from "@/components/Slider";

export default function SliderPage() {
    return (
        <div className="min-h-screen flex flex-col justify-start">
            <div className="flex mt-10 mb-40">
                <div className="flex flex-col ml-10 mr-160 items-center font-banner">
                    <h2 className="text-[var(--color-mhd-black)] text-5xl">
                        MHS
                    </h2>
                    <div className="flex items-center">
                        <div className="h-[2px] w-8 bg-[var(--color-mhd-black)] mr-2"></div>
                        <h3 className="text-[var(--color-mhd-red)] text-xl font-semibold">
                            1791
                        </h3>
                        <div className="h-[2px] w-8 bg-[var(--color-mhd-black)] ml-2"></div>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <h1 className="text-[var(--color-mhd-black)] text-5xl font-banner">
                        Slider
                    </h1>
                    <h2 className="text-[var(--color-mhd-red)]">Will & Ella</h2>
                </div>
            </div>
            <Slider min={1} max={84} />
        </div>
    );
}
