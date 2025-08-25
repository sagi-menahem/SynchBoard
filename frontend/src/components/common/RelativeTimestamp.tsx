import React, { useEffect, useState } from 'react';

import { formatSmartTimestamp } from 'utils/DateUtils';

interface RelativeTimestampProps {
  timestamp: string | number | Date;
  className?: string;
  title?: string;
}

const RelativeTimestamp: React.FC<RelativeTimestampProps> = ({ timestamp, className, title }) => {
  const [displayTime, setDisplayTime] = useState(() => formatSmartTimestamp(timestamp));

  useEffect(() => {
    // Update immediately when timestamp prop changes
    setDisplayTime(formatSmartTimestamp(timestamp));
    
    // Set up interval to update every 55 seconds
    const interval = setInterval(() => {
      setDisplayTime(formatSmartTimestamp(timestamp));
    }, 55000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <span className={className} title={title}>
      {displayTime}
    </span>
  );
};

export default RelativeTimestamp;