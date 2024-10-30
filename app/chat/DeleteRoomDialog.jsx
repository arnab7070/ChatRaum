'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash, Hourglass } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const DeleteRoomDialog = ({ onDelete, isDeleting }) => {
    const [openDialog, setOpenDialog] = useState(false);

    const handleDelete = () => {
        setOpenDialog(false);
        onDelete();
    };

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="lg"
                    className="mt-6 w-full"
                    disabled={isDeleting}
                >
                    {isDeleting ? <Hourglass className="w-4 h-4 mr-2" /> : <Trash className="w-4 h-4 mr-2" />}
                    {isDeleting ? 'Deleting...' : 'Delete Room'}
                </Button>
            </DialogTrigger>
            <DialogContent className="w-11/12">
                <DialogHeader>
                    <DialogTitle>Delete Room</DialogTitle>
                </DialogHeader>
                <p>Are you sure you want to delete this room? This action cannot be undone.</p>
                <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};