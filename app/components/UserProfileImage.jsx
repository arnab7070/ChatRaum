'use client';
import React, { useEffect, useState, useRef } from "react";
import { storage } from "@/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoaderCircle, Camera, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const UserProfileImage = ({ username, userId }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    const savedImageUrl = localStorage.getItem("chatUserImage");
    if(!savedImageUrl) {
      localStorage.setItem('chatUserImage', `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`);
    }
    if (savedImageUrl) {
      setImageUrl(savedImageUrl);
    }
  }, []);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      });

      const storageRef = ref(storage, `users/${userId ? userId : 'temporary'}/profile.jpg`);
      
      await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(storageRef);

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
            <div 
              onClick={handleClick}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="relative cursor-pointer group"
            >
              {isUploading ? (
                <div className="rounded-full bg-gray-100 p-2">
                  <LoaderCircle className="h-6 w-6 animate-spin text-gray-600" />
                </div>
              ) : (
                <>
                  <Avatar className="border border-gray-200 group-hover:border-primary transition-colors duration-200">
                    <AvatarImage 
                      src={imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} 
                      className="w-full h-full object-cover scale-110" 
                    />
                    <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/40 transition-opacity duration-200 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-primary text-primary-foreground">
            <p>Click to change profile picture</p>
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

export default UserProfileImage;