import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Clock } from 'lucide-react';
import { apiService } from '../services/api';

export default function NewsActivityChart() {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiService
      .getActivityTimeline(range)
      .then((res) => {
        if (isMounted && res.success && res.activity) {
          setData(res.activity);
        }
      })
      .catch((err) => console.warn('Activity chart load error:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [range]);

  return (
    <div className="bg-white rounded-lg border border-border p-5 shadow-card">
      {/* Header and Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-navy/10 text-navy">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-primary tracking-tight">
              Publication Activity & Source Velocity
            </h3>
            <p className="text-xs text-secondary">
              Real-time multi-publisher report frequency & coverage density
            </p>
          </div>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1 bg-[#F7F7F5] p-1 rounded-md border border-border self-start sm:self-auto">
          {[
            { label: '24 Hours', value: '24h' },
            { label: '7 Days', value: '7d' },
            { label: '30 Days', value: '30d' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setRange(item.value)}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                range === item.value
                  ? 'bg-white text-navy shadow-xs border border-border'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Display */}
      <div className="h-56 w-full pt-2">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-secondary">
            Loading news activity metrics...
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-secondary">
            No activity records in this time window.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="articlesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#263F65" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#263F65" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="sourcesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6687B2" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6687B2" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#737983' }} axisLine={{ stroke: '#E5E7EB' }} />
              <YAxis tick={{ fontSize: 11, fill: '#737983' }} axisLine={{ stroke: '#E5E7EB' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-border p-2.5 rounded shadow-elevated text-xs">
                        <p className="font-semibold text-primary mb-1">{label}</p>
                        <p className="text-navy flex items-center gap-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full bg-navy inline-block" />
                          Articles Published: {payload[0].value}
                        </p>
                        {payload[1] && (
                          <p className="text-mutedBlue flex items-center gap-1.5 font-medium">
                            <span className="w-2 h-2 rounded-full bg-mutedBlue inline-block" />
                            Distinct Publishers: {payload[1].value}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="articlesCount"
                stroke="#263F65"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#articlesGrad)"
                name="Articles Published"
              />
              <Area
                type="monotone"
                dataKey="sourcesCount"
                stroke="#6687B2"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#sourcesGrad)"
                name="Publishers"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
