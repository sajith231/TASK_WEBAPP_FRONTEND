import apiClient from "./apiClient";

export const PunchAPI = {
    getFirms: async () => {
        try {
            const response = await apiClient.get("/punch-in/firms/");
            return response;
        } catch (error) {
            console.error("Error fetching firms:", error);
            throw error;
        }
    },

    //post location
    AddShopLocation: async ({ clientId, customerName, newArea }) => {
        try {
            const response = await apiClient.post("/punch-in/", {
                clientId,
                customerName,
                newArea,
            });
            console.log("Shop location updated:", response);
            return response;
        } catch (error) {
            console.error("Error updating shop location:", error);
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