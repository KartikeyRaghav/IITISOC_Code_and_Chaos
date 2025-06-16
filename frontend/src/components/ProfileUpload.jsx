import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function ProfileUpload() {
  const [file, setFile] = useState(null); //holds selected file, initially null

  const onDrop = useCallback((acceptedFiles) => {
    //triggered when file id dropped/selected
    const image = acceptedFiles[0]; //picks 1st file
    setFile(
      Object.assign(image, {
        preview: URL.createObjectURL(image), //adds a preview URL and stored it in state
      })
    );
  }, []);
  const {
    getRootProps, //props for dropzone root element
    getInputProps, //props for input element
    isDragActive, //boolean if file is dragged
  } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1, //accepts only 1 file
  });

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        {...getRootProps()}
        className={`w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor pointer ${
          isDragActive ? "bg-gray-100" : "" //changes bg when dragging (isDragActive-true)
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <img
            src={file.preview}
            alt="Profile Preview"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <p className="text-center">
            Drag & drop an image here, or click to select profile picture
          </p> //if image selected, shows preview, otherwise instructs
        )}
      </div>

      {file && (
        <button
          className="text-gray-400 px-4 py-2 rounded-xl hover:bg-[#005b83]"
          onClick={() => alert("Image uploaded!")} //clicking upload button shows logic
        >
          Upload Profile Picture
        </button>
      )}
    </div>
  );
}
