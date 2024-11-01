import { useRef, useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { Button } from "@/components/ui/button";
import { ImagePlus, Camera, LoaderCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const storage = getStorage();

export const ImageUploader = ({ onSendMessage }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleImageUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);

    try {
      // Compress the image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });

      // Create a storage reference
      const storageRef = ref(storage, `images/${Date.now()}_${compressedFile.name}`);
      
      // Upload the compressed image
      await uploadBytes(storageRef, compressedFile);

      // Get the download URL and send the image URL as a message
      const url = await getDownloadURL(storageRef);
      await onSendMessage(url);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleCameraCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleCameraCapture}
        ref={cameraInputRef}
        style={{ display: 'none' }}
        capture="environment"
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-md h-10 w-10"
            disabled={isUploading}
          >
            {isUploading ? (
              <LoaderCircle className="h-6 w-6 animate-spin" />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={openFileDialog}>
            <ImagePlus className="mr-2 h-4 w-4" />
            <span>Upload Image</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openCamera}>
            <Camera className="mr-2 h-4 w-4" />
            <span>Take Photo</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};