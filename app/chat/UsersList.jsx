import UserListItem from "./UserListItem";
export const UsersList = ({ users }) => {
    const getPresenceStatus = (lastSeen) => {
        if (!lastSeen) return 'Offline';
        const lastSeenDate = lastSeen.toDate();
        const timeDiff = new Date().getTime() - lastSeenDate.getTime();
        if (timeDiff < 30000) return 'Online';
        if (timeDiff < 300000) return 'Away';
        return 'Offline';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Online': return 'text-green-500';
            case 'Away': return 'text-yellow-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="space-y-4">
            {Object.entries(users).map(([userId, user]) => (
                <UserListItem
                    key={userId}
                    user={user}
                    status={getPresenceStatus(user.lastSeen)}
                    statusColor={getStatusColor(getPresenceStatus(user.lastSeen))}
                />
            ))}
        </div>
    );
};