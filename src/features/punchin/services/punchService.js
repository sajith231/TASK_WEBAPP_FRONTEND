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
    getUploadSignature: async ({ customerName }) => {
        try {
            const response = await apiClient.get(`/punch-in/cloudinary-signature/?customerName=${encodeURIComponent(customerName)}`)
                ;
            return response.data;
        } catch (error) {
            console.error("Error getting upload signature:", error);
            throw error;
        }
    },

    // Upload image directly to Cloudinary - Production Ready
    uploadImageToCloudinary: async (imageFile, customerName, progressCallback = null) => {
        try {
            // Client-side validation
            const maxFileSize = 5 * 1024 * 1024; // 5MB
            if (imageFile.size > maxFileSize) {
                throw new Error('File size too large. Maximum size is 5MB');
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(imageFile.type)) {
                throw new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.');
            }

            progressCallback?.(10);

            // Get upload signature from backend
            const signatureData = await PunchAPI.getUploadSignature({ customerName });

            // Check API key
            const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
            if (!apiKey) {
                throw new Error('Cloudinary configuration missing');
            }

            progressCallback?.(30);

            // Prepare form data for Cloudinary
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('api_key', apiKey);
            formData.append('timestamp', signatureData.timestamp);
            formData.append('signature', signatureData.signature);

            // Add signed parameters
            if (signatureData.folder) formData.append('folder', signatureData.folder);
            if (signatureData.allowed_formats) formData.append('allowed_formats', signatureData.allowed_formats);
            if (signatureData.tags) formData.append('tags', signatureData.tags);
            if (signatureData.public_id) formData.append('public_id', signatureData.public_id);

            progressCallback?.(50);

            // Upload to Cloudinary with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const uploadResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal
                }
            );

            clearTimeout(timeoutId);
            progressCallback?.(80);

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                throw new Error(`Upload failed: ${uploadResponse.status}`);
            }

            const result = await uploadResponse.json();
            progressCallback?.(100);

            return {
                success: true,
                url: result.secure_url,
                public_id: result.public_id,
                format: result.format,
                bytes: result.bytes
            };

        } catch (error) {
            progressCallback?.(0);
            if (error.name === 'AbortError') {
                throw new Error('Upload timeout - please try again');
            }
            throw error;
        }
    },

    // Enhanced punch-in with Cloudinary upload
    punchIn: async ({ customerCode, customerName, image, location, onProgress = null }) => {
        try {
            let photoUrl = null;

            // Upload image to Cloudinary if provided
            if (image) {
                const uploadResult = await PunchAPI.uploadImageToCloudinary(image, customerName, onProgress);
                photoUrl = uploadResult.url;
            }

            // Send punch-in data to backend
            const punchData = {
                customerCode,
                latitude: location?.latitude,
                longitude: location?.longitude,
                photo_url: photoUrl
            };

            const response = await apiClient.post("/punch-in/", punchData);

            return {
                success: true,
                data: response.data,
                photo_url: photoUrl
            };

        } catch (error) {
            throw error;
        }
    },

    // // Punch-out functionality   
    punchOut: async (punchinId) => {
        try {
            const response = await apiClient.get('')

        } catch (error) {

        }
    },
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

    // Get active punch-ins (not punched out yet)
    getActivePunchIns: async () => {
        try {
            const response = await apiClient.get('punch-status/');
            return response.data;
        } catch (error) {
            console.error("Error Get active punch-ins:", error);
            throw error;
        }
    }
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