import React, { useEffect, useState } from 'react';
import { TIMING_CONSTANTS } from 'shared/constants/TimingConstants';
import { formatSmartTimestamp } from 'shared/utils/DateUtils';

interface RelativeTimestampProps {
  timestamp: string | number | Date;
  className?: string;
  title?: string;
}

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
