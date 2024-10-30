const StatusIndicator = ({ statusColor }) => (
    <span
        className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white"
        style={{
            backgroundColor: statusColor.includes('green') ? 'rgb(34, 197, 94)' :
                statusColor.includes('yellow') ? 'rgb(234, 203, 40)' :
                    'rgb(156, 163, 175)'
        }}
    />
);

export default StatusIndicator;