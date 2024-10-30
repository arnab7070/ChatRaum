import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatusIndicator from "./StatusIndicator";
const UserListItem = ({ user, status, statusColor }) => (
    <div className="flex items-center gap-3">
        <div className="relative inline-block">
            <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <StatusIndicator statusColor={statusColor} />
        </div>
        <div>
            <p className="text-sm font-medium">{user.username}</p>
            <p className={`text-xs ${statusColor}`}>{status}</p>
        </div>
    </div>
);

export default UserListItem;