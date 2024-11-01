import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/toggle-theme";
import VideoCallButton from "./VideoCallButton";
import { DeleteRoomDialog } from "./DeleteRoomDialog";
import { UsersList } from "./UsersList";
import { Separator } from "@/components/ui/separator";

export const ChatHeader = ({ roomCode, users, onDeleteRoom, isDeleting }) => (
  <div className="sticky top-0 z-10 bg-white dark:bg-black border-b">
    <div className="p-4 flex items-center justify-between">
      <h3 className="text-xl font-semibold">Chat Room: {roomCode}</h3>
      <div className="flex flex-row-reverse gap-x-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Users className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetDescription />
            <SheetHeader>
              <SheetTitle>Room Participants</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <UsersList users={users} />
            </div>
            <Separator className="mt-5" />
            <DeleteRoomDialog onDelete={onDeleteRoom} isDeleting={isDeleting} />
          </SheetContent>
        </Sheet>
        <VideoCallButton roomId={roomCode} />
        <ModeToggle />
      </div>
    </div>
  </div>
);