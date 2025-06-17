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
    <div className="heatmap-outer-container">
      <div className="heatmap-scroll-container">
        <div className="heatmap-container">
          <CalendarHeatmap
            startDate={oneYearAgo}
            endDate={new Date()}
            values={heatmapValues}
            showWeekdayLabels={true}
            gutterSize={2}
            classForValue={(value) => {
              if (!value) {
                return 'color-empty';
              }
              return `color-github-${Math.min(value.count, 4)}`;
            }}
            tooltipDataAttrs={value => {
              if (!value || !value.date) {
                return {'data-tooltip-id': 'heatmap-tooltip', 'data-tooltip-content': 'No submissions'};
              }
              return {
                'data-tooltip-id': 'heatmap-tooltip',
                'data-tooltip-content': `${value.date}: ${value.count} submission${value.count !== 1 ? 's' : ''}`,
              };
            }}
          />
        </div>
      </div>
      <ReactTooltip id="heatmap-tooltip" />
      
      <style jsx>{`
        .heatmap-outer-container {
          width: 100%;
          position: relative;
          margin: 20px 0;
          overflow: hidden; /* Hide any overflow outside of the container */
        }

        .heatmap-scroll-container {
          width: 100%;
          overflow-x: auto;
          padding-bottom: 15px; /* Space for the scrollbar */
          -webkit-overflow-scrolling: touch; /* For smooth scrolling on iOS */
        }

        .heatmap-container {
          min-width: 750px; /* Ensure minimum width for all the squares */
          padding: 10px 0;
        }

        /* Base styles for all screens */
        :global(.react-calendar-heatmap) {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        }
        
        :global(.react-calendar-heatmap rect) {
          rx: 1.5px;
          stroke: #f4f7f9;
          stroke-width: 1px;
          height: 10px;
          width: 10px;
        }

        :global(.react-calendar-heatmap .react-calendar-heatmap-month-labels) {
          font-size: 11px;
          color: #767676;
        }
        
        :global(.react-calendar-heatmap .react-calendar-heatmap-weekday-labels) {
          font-size: 10px;
          color: #767676;
        }

        :global(.react-calendar-heatmap-month-label) {
          fill: #767676;
          font-size: 10px;
        }

        :global(.react-calendar-heatmap-weekday-label) {
          fill: #767676;
          font-size: 9px;
        }

        :global(.color-github-0) { fill: #ebedf0; }
        :global(.color-github-1) { fill: #9be9a8; }
        :global(.color-github-2) { fill: #40c463; }
        :global(.color-github-3) { fill: #30a14e; }
        :global(.color-github-4) { fill: #216e39; }
        :global(.color-empty) { fill: #ebedf0; }

        /* Mobile specific styles */
        @media screen and (max-width: 768px) {
          .heatmap-container {
            min-width: 900px; /* Larger minimum width on mobile */
            padding: 15px 0;
          }

          :global(.react-calendar-heatmap rect) {
            height: 10px;
            width: 10px;
          }
          
          /* Make weekday labels slightly larger on mobile for better readability */
          :global(.react-calendar-heatmap-weekday-label) {
            font-size: 10px;
          }
        }

        /* Larger screens */
        @media screen and (min-width: 1200px) {
          .heatmap-container {
            max-width: 1100px;
            margin: 0 auto;
          }

          :global(.react-calendar-heatmap rect) {
            height: 11px;
            width: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default SubmissionsHeatmap;