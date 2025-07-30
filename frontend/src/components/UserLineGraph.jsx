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
        <div className="bg-gradient-to-r from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-8 border border-purple-500/20 backdrop-blur-sm text-white">
            <div className="mb-8 flex justify-center gap-6">
                {["daily", "weekly", "monthly"].map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`
                            px-6 py-3 rounded-2xl font-semibold transition-colors duration-300
                            ${
                                period === p
                                    ? "bg-gradient-to-r from-blue-400 via-purple-500 to-purple-700 shadow-lg"
                                    : "bg-gray-800 hover:bg-purple-700 hover:text-white text-gray-300"
                            }
                        `}
                    >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                ))}
            </div>

            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={stats[period]}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#6b7280" opacity={0.3} />
                    <XAxis
                        dataKey={xKey}
                        tick={{ fill: "#d1d5db" }}
                        tickLine={false}
                        axisLine={{ stroke: "#4b5563" }}
                        padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fill: "#d1d5db" }}
                        tickLine={false}
                        axisLine={{ stroke: "#4b5563" }}
                        width={50}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(31, 41, 55, 0.9)",
                            borderRadius: "10px",
                            borderColor: "#6366f1",
                            color: "white",
                            fontWeight: "600",
                        }}
                        labelStyle={{ color: "#a78bfa" }}
                    />
                    <Legend
                        wrapperStyle={{ color: "#a5b4fc", fontWeight: "600" }}
                        verticalAlign="top"
                        align="right"
                    />
                    <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#c084fc"
                        strokeWidth={4}
                        dot={{ r: 6, stroke: "#a78bfa", strokeWidth: 2, fill: "#c4b5fd" }}
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default UserLineGraph;