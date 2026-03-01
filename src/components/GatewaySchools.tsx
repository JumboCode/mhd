import { useState } from "react";
import { Trash, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function GatewaySchools() {
    const [yearToDelete, setYearToDelete] = useState<number | null>(null);
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [emailInput, setEmailInput] = useState("");
    const [permittedUsers, setPermittedUsers] = useState<string[]>(["City 1"]);

    return (
        <div className="space-y-3">
            <div className="flex rounded-lg border border-gray-300 shadow-sm overflow-hidden w-72">
                <input
                    type="email"
                    placeholder="Email"
                    aria-label="Email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="flex-1 px-4 py-1 text-base text-gray-700 placeholder-gray-500 outline-none"
                />
                <button
                    type="button"
                    aria-label="Add Email"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors w-8 flex items-center justify-center border-l border-gray-300"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left w-3/4 px-4 py-3 text-sm font-medium text-gray-700">
                                City
                            </th>
                            <th className="text-left w-1/4 px-4 py-3 text-sm font-medium text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {permittedUsers.map((city, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm">{city}</td>
                                <td className="p-4">
                                    <button
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        aria-label={`Remove ${city}`}
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    function handleClick() {
        fetch(`/api/delete-year?year=${yearToDelete}`).then((response) => {
            if (!response.ok) {
                toast(`Failed to delete data.`);
            }
        });
    }
}
