import { useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const UserLineGraph = ({data}) => {
    const [period, setPeriod] = useState("daily")

    const stats= {
        daily: data?.daily || [],
        weekly: data?.weekly || [],
        monthly: data?.monthly || []
    };

    const xKey = period === "daily" ? "date" : period === "weekly" ? "week" : "month";

    return (
        <div className="bg-gray-800 rounded p-6">
            <div className="mb-4 flex gap-2">
                {["daily", "weekly", "monthly"].map((p) => (
                    <button
                        key={p}
                        className={`px-4 py-2 rounded ${period === p ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
                        onClick={() => setPeriod(p)}
                    >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                ))}
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats[period]}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey={xKey}/>
                    <YAxis allowDecimals={false}/>
                    <Tooltip/>
                    <Legend/>
                    <Line type="monotone" dataKey="users" stroke="#3b82f6" activeDot={{ r : 8}}/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default UserLineGraph;