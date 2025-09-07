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
    PunchIN: async (locationData) => {
        try {
            const response = await apiClient.post("/location", locationData);
            return response;
        } catch (error) {
            console.error("Error saving user location:", error);
            throw error;
        }
    },

};