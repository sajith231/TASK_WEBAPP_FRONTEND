import apiClient from '../../../services/apiClient';

export const PunchAPI = {
    getFirms: async () => {
        try {
            const response = await apiClient.get("/shop-location/firms/");
            return response;
        } catch (error) {
            console.error("Error fetching firms:", error);
            throw error;
        }
    },

    //post location
    AddShopLocation: async ({ firm_name, latitude, longitude }) => {
        try {
            const response = await apiClient.post("/shop-location/", {
                firm_name,
                latitude,
                longitude
            });
            return response;
        } catch (error) {
            console.error("Error updating shop location:", error);
            throw error;
        }
    },

    LocationTable: async () => {
        try {
            const res = await apiClient.get('/shop-location/table/')
            return res
        } catch (error) {
            console.error("Error fetching Location Update Table:", error);
            throw error;
        }
    },

    updateStatus: async (statusData) => {
        try {
            const response = await apiClient.post("/shop-location/status/", statusData);
            return response;
        } catch (error) {
            console.error("Error Updating location status:", error);
            throw error;
        }
    },

    //PUNCHIN Get Cloudinary upload signature
    getUploadSignature: async () => {
        try {
            const response = await apiClient.get("/punch-in/cloudinary-signature/");
            return response.data;
        } catch (error) {
            console.error("Error getting upload signature:", error);
            throw error;
        }
    },

    // Upload image directly to Cloudinary
    uploadImageToCloudinary: async (imageFile, progressCallback = null) => {
        try {
            // ✅ Client-side validation first
            const maxFileSize = 5 * 1024 * 1024; // 5MB
            if (imageFile.size > maxFileSize) {
                throw new Error(`File size too large. Maximum size is ${maxFileSize / 1024 / 1024}MB`);
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(imageFile.type)) {
                throw new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.');
            }

            // Get upload signature from your backend
            const signatureData = await PunchAPI.getUploadSignature();
            console.log("signatureData", signatureData);
            
            // Check if API key is available
            const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
            if (!apiKey) {
                throw new Error('Cloudinary API key not found. Please set VITE_CLOUDINARY_API_KEY in your .env file');
            }
            
            console.log('API Key available:', !!apiKey);
            console.log('Using cloud name:', signatureData.cloudName);

            // Prepare form data for Cloudinary - EXACT order matters for signature
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('api_key', apiKey);
            formData.append('timestamp', signatureData.timestamp);
            formData.append('signature', signatureData.signature);
            
            // Add ONLY parameters that were included in signature generation
            // Based on Cloudinary error: 'allowed_formats=jpg,png,jpeg&folder=punch_images/SYSMAC/ARUN&tags=client_SYSMAC,user_ARUN&timestamp=1758194850'
            if (signatureData.folder) {
                formData.append('folder', signatureData.folder);
            }
            if (signatureData.allowed_formats) {
                formData.append('allowed_formats', signatureData.allowed_formats);
            }
            if (signatureData.tags) {
                formData.append('tags', signatureData.tags);
            }
            
            // ❌ DON'T include max_file_size - it wasn't in the signature!
            // The backend signature was generated without max_file_size

            // Debug: Log what we're sending
            console.log('FormData entries:');
            for (let [key, value] of formData.entries()) {
                if (key !== 'file') {
                    console.log(`${key}: ${value}`);
                }
            }

            // Upload directly to Cloudinary
            const uploadResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                    // Note: Don't set Content-Type header when using FormData
                }
            );

            console.log('Upload response status:', uploadResponse.status);

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('Cloudinary error response:', errorText);
                throw new Error(`Cloudinary upload failed (${uploadResponse.status}): ${errorText}`);
            }

            const result = await uploadResponse.json();
            
            return {
                success: true,
                url: result.secure_url,
                public_id: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
                created_at: result.created_at
            };

        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            throw error;
        }
    },

    // Enhanced punch-in with Cloudinary upload
    punchIn: async ({ firm_name, image, location, onProgress = null }) => {
            console.log('punchin service')
        try {
            let photoUrl = null;

            // Upload image to Cloudinary if provided
            if (image) {
                console.log('Uploading image to Cloudinary...', { size: image.size, type: image.type });
                
                const uploadResult = await PunchAPI.uploadImageToCloudinary(image, onProgress);
                photoUrl = uploadResult.url;
                console.log(photoUrl)
                
                console.log('Image uploaded successfully:', { url: photoUrl });
            }

            // Send punch-in data to your backend (matching Django model)
            const punchData = {
                firm_name,                          // Match Django view expectation
                latitude: location?.latitude,       // Optional location data
                longitude: location?.longitude,     // Optional location data  
                photo_url: photoUrl                 // Cloudinary URL for PunchIn.photo_url field
            };

            const response = await apiClient.post("/punch-in/", punchData);
            
            return {
                success: true,
                data: response.data,
                photo_url: photoUrl
            };

        } catch (error) {
            console.error("Error in punchIn:", error);
            throw error;
        }
    },

    // // Punch-out functionality
    // punchOut: async (punchinId) => {
    //     try {
    //         const response = await apiClient.post("/punchout/", {
    //             punchin_id: punchinId
    //         });
            
    //         return {
    //             success: true,
    //             data: response.data
    //         };
    //     } catch (error) {
    //         console.error("Error in punchOut:", error);
    //         throw error;
    //     }
    // },

    // // Get punch-in/out records
    // getPunchRecords: async () => {
    //     try {
    //         const response = await apiClient.get("/punch-records/");
    //         return response;
    //     } catch (error) {
    //         console.error("Error fetching punch records:", error);
    //         throw error;
    //     }
    // },

    // // Get active punch-ins (not punched out yet)
    // getActivePunchIns: async () => {
    //     try {
    //         const response = await apiClient.get("/punch-records/");
            
    //         // Filter for active punch-ins (no punchout_time)
    //         const activePunchIns = response.data.filter(record => !record.punchout_time);
            
    //         return {
    //             ...response,
    //             data: activePunchIns
    //         };
    //     } catch (error) {
    //         console.error("Error fetching active punch-ins:", error);
    //         throw error;
    //     }
    // },

    // // Utility function to validate image before upload
    // validateImage: (file) => {
    //     const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    //     const maxSize = 5 * 1024 * 1024; // 5MB

    //     if (!validTypes.includes(file.type)) {
    //         throw new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.');
    //     }

    //     if (file.size > maxSize) {
    //         throw new Error('File size too large. Maximum size is 5MB.');
    //     }

    //     return true;
    // },

    // // Compress image before upload (optional)
    // compressImage: (file, maxWidth = 1920, quality = 0.8) => {
    //     return new Promise((resolve) => {
    //         const canvas = document.createElement('canvas');
    //         const ctx = canvas.getContext('2d');
    //         const img = new Image();

    //         img.onload = () => {
    //             // Calculate new dimensions
    //             const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
    //             canvas.width = img.width * ratio;
    //             canvas.height = img.height * ratio;

    //             // Draw and compress
    //             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
    //             canvas.toBlob(resolve, 'image/jpeg', quality);
    //         };

    //         img.src = URL.createObjectURL(file);
    //     });
    // }


};