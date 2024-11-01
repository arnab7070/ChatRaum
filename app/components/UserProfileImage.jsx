'use client';
import React, { useEffect, useState, useRef } from "react";
import { storage } from "@/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoaderCircle, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components

export const UserProfileImage = ({ username, userId }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const router = useRouter();

  // Fetch the image from local storage if it exists
  useEffect(() => {
    const savedImageUrl = localStorage.getItem("chatUserImage");
    if(!savedImageUrl) {
      localStorage.setItem('chatUserImage', `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`);
    }
    if (savedImageUrl) {
      setImageUrl(savedImageUrl);
    }
  }, []);

  // Trigger file input dialog
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle image upload to Firebase Storage and update local storage
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Compress the image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5, // Set to 0.5MB for smaller avatars
        maxWidthOrHeight: 512, // Adjust for small display requirements
        useWebWorker: true,
      });

      // Create a storage reference
      const storageRef = ref(storage, `users/${userId ? userId : 'temporary'}/profile.jpg`);
      
      // Upload the compressed image
      await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(storageRef);

      // Update the URL in local storage and state
      localStorage.setItem("chatUserImage", downloadURL);
      setImageUrl(downloadURL);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div onClick={handleClick} className="cursor-pointer relative">
              {isUploading ? (
                <LoaderCircle className="h-6 w-6 animate-spin mt-2" /> // Show spinner during upload
              ) : imageUrl ? (
                <Avatar>
                  <AvatarImage src={imageUrl} className="w-full h-full object-cover scale-110" />
                  <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} className="w-full h-full object-cover scale-110" />
                  <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Change Profile Image</p>
          </TooltipContent>
        </Tooltip>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
      </div>
    </TooltipProvider>
  );
};
