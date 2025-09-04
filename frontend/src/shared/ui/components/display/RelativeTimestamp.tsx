import React, { useEffect, useState } from 'react';
import { TIMING_CONSTANTS } from 'shared/constants/TimingConstants';
import { formatSmartTimestamp } from 'shared/utils/DateUtils';

interface RelativeTimestampProps {
  /** Date/time value to display as relative time (e.g., "2 minutes ago") */
  timestamp: string | number | Date;
  /** Additional CSS classes for styling customization */
  className?: string;
  /** Tooltip text shown on hover, typically the full timestamp */
  title?: string;
}

/**
 * Self-updating timestamp component that displays relative time formatting.
 * Automatically refreshes to maintain accuracy of relative time descriptions
 * and provides consistent temporal context throughout the application.
 *
 * @param timestamp - Date/time value to display as relative time (e.g., "2 minutes ago")
 * @param className - Additional CSS classes for styling customization
 * @param title - Tooltip text shown on hover, typically the full timestamp
 */
const RelativeTimestamp: React.FC<RelativeTimestampProps> = ({ timestamp, className, title }) => {
  const [displayTime, setDisplayTime] = useState(() => formatSmartTimestamp(timestamp));

  useEffect(() => {
    setDisplayTime(formatSmartTimestamp(timestamp));

    const interval = setInterval(() => {
      setDisplayTime(formatSmartTimestamp(timestamp));
    }, TIMING_CONSTANTS.TIMESTAMP_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <span className={className} title={title}>
      {displayTime}
    </span>
  );
};

export default RelativeTimestamp;
