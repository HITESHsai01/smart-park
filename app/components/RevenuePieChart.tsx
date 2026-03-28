"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const revenueData = [
  { name: "Hourly Parking", value: 4200, color: "#6366f1" },
  { name: "Monthly Passes", value: 3800, color: "#3b82f6" },
  { name: "Daily Parking", value: 2100, color: "#06b6d4" },
  { name: "EV Charging", value: 1350, color: "#10b981" },
  { name: "Penalties & Fines", value: 1000, color: "#f59e0b" },
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = (props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}) => {
  const cx = props.cx ?? 0;
  const cy = props.cy ?? 0;
  const midAngle = props.midAngle ?? 0;
  const innerRadius = props.innerRadius ?? 0;
  const outerRadius = props.outerRadius ?? 0;
  const percent = props.percent ?? 0;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-semibold"
      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: {
    color: string;
  };
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-neutral-800 px-4 py-3 rounded-xl shadow-xl border border-gray-100 dark:border-neutral-700">
        <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: payload[0].payload.color }}
          />
          {payload[0].name}
        </p>
        <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-1">
          ₹{payload[0].value.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenuePieChart() {
  const total = revenueData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col items-center w-full h-full">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={revenueData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={110}
            innerRadius={50}
            dataKey="value"
            strokeWidth={2}
            stroke="rgba(255,255,255,0.6)"
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {revenueData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-xs text-gray-600 dark:text-gray-300 ml-1">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        Total Revenue:{" "}
        <span className="font-bold text-gray-700 dark:text-gray-200">
          ₹{total.toLocaleString("en-IN")}
        </span>
      </p>
    </div>
  );
}
