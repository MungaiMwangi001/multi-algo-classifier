interface ConfusionMatrixProps {
  matrix: number[][];
  labels?: string[];
}

export function ConfusionMatrix({ matrix, labels }: ConfusionMatrixProps) {
  const maxValue = Math.max(...matrix.flat());
  
  // Generate labels if not provided
  const classLabels = labels || Array.from({ length: matrix.length }, (_, i) => `Class ${i}`);

  const getCellColor = (value: number) => {
    const intensity = value / maxValue;
    return `hsl(var(--primary) / ${intensity * 0.8 + 0.1})`;
  };

  const getTextColor = (value: number) => {
    const intensity = value / maxValue;
    return intensity > 0.5 ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))';
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Confusion Matrix</h3>
        <p className="text-sm text-muted-foreground">
          Predicted vs Actual Classifications
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-sm font-medium"></th>
                <th 
                  colSpan={matrix.length} 
                  className="p-2 text-sm font-medium text-center border-b"
                >
                  Predicted
                </th>
              </tr>
              <tr>
                <th className="p-2 text-sm font-medium"></th>
                {classLabels.map((label, index) => (
                  <th key={index} className="p-2 text-sm font-medium text-center min-w-16">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {rowIndex === 0 && (
                    <th 
                      rowSpan={matrix.length}
                      className="p-2 text-sm font-medium text-center border-r writing-mode-vertical"
                      style={{ writingMode: 'vertical-rl' }}
                    >
                      Actual
                    </th>
                  )}
                  <th className="p-2 text-sm font-medium text-right border-r">
                    {classLabels[rowIndex]}
                  </th>
                  {row.map((value, colIndex) => (
                    <td
                      key={colIndex}
                      className="p-2 text-center border min-w-16 h-16 relative"
                      style={{ 
                        backgroundColor: getCellColor(value),
                        color: getTextColor(value)
                      }}
                    >
                      <div className="font-semibold">{value}</div>
                      <div className="text-xs opacity-80">
                        {((value / row.reduce((a, b) => a + b, 0)) * 100).toFixed(0)}%
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        Values represent the number of predictions for each actual-predicted class pair
      </div>
    </div>
  );
}