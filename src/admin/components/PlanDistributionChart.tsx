interface PlanData {
  plan: string;
  count: number;
  color: string;
}

interface Props {
  data: PlanData[];
}

export function PlanDistributionChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const barWidth = 60;
  const gap = 40;
  const height = 200;
  const padding = 30;
  
  return (
    <div className="chart-container">
      <div className="chart-title">📊 Répartition par plan</div>
      <svg
        className="chart-svg"
        viewBox={`0 0 ${data.length * (barWidth + gap) + padding} ${height + 60}`}
      >
        {data.map((d, i) => {
          const barHeight = (d.count / maxCount) * height;
          const x = padding + i * (barWidth + gap);
          const y = height - barHeight + 20;
          const percent = total > 0 ? ((d.count / total) * 100).toFixed(0) : '0';
          
          return (
            <g key={d.plan}>
              {/* Barre */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={d.color}
                rx="4"
                opacity="0.9"
              >
                <title>{`${d.plan}: ${d.count} (${percent}%)`}</title>
              </rect>
              
              {/* Valeur au-dessus */}
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize="14"
                fontWeight="600"
              >
                {d.count}
              </text>
              
              {/* Label */}
              <text
                x={x + barWidth / 2}
                y={height + 40}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="12"
              >
                {d.plan}
              </text>
              
              {/* Pourcentage */}
              <text
                x={x + barWidth / 2}
                y={height + 55}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="11"
              >
                {percent}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
