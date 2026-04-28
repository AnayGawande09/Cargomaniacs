import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export default function TelemetryChart({ data, dataKey, color, threshold, unit }) {
  return (
    <div className="w-full h-48 bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-lg mb-4">
      <h3 className="text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wide">
        Vehicle {dataKey} ({unit})
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF" 
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={false}
          />
          <YAxis 
            stroke="#9CA3AF" 
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }}
            labelStyle={{ color: '#9CA3AF' }}
          />
          {threshold && (
            <ReferenceLine y={threshold} label="" stroke="red" strokeDasharray="3 3" />
          )}
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
