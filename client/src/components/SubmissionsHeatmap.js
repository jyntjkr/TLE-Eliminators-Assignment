// src/components/SubmissionsHeatmap.js
import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip'; // Using react-tooltip for hover info

const SubmissionsHeatmap = ({ submissions }) => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Process submissions to get counts per day
  const submissionCounts = submissions.reduce((acc, sub) => {
    // Convert seconds to a 'YYYY-MM-DD' string
    const date = new Date(sub.creationTimeSeconds * 1000).toISOString().slice(0, 10);
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const heatmapValues = Object.keys(submissionCounts).map(date => ({
    date: date,
    count: submissionCounts[date],
  }));

  return (
    <div className="heatmap-container">
      <CalendarHeatmap
        startDate={oneYearAgo}
        endDate={new Date()}
        values={heatmapValues}
        classForValue={(value) => {
          if (!value) {
            return 'color-empty';
          }
          return `color-github-${Math.min(value.count, 4)}`;
        }}
        tooltipDataAttrs={value => {
            return {
              'data-tooltip-id': 'heatmap-tooltip',
              'data-tooltip-content': `${value.date}: ${value.count || 0} submissions`,
            };
        }}
      />
      <ReactTooltip id="heatmap-tooltip" />
    </div>
  );
};

export default SubmissionsHeatmap;