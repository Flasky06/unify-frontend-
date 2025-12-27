import api from "../lib/api";

export const stockTransferService = {
  // Initiate Transfer
  initiateTransfer: async (transferData) => {
    const response = await api.post("/stocks/transfer/initiate", transferData);
    return response.data;
  },

  // Acknowledge (Accept) Transfer
  acknowledgeTransfer: async (transferId) => {
    const response = await api.post(
      `/stocks/transfer/${transferId}/acknowledge`
    );
    return response.data;
  },

  // Cancel Transfer
  cancelTransfer: async (transferId) => {
    const response = await api.post(`/stocks/transfer/${transferId}/cancel`);
    return response.data;
  },

  // Get Incoming
  getIncomingTransfers: async (shopId) => {
    const response = await api.get(`/stocks/shop/${shopId}/incoming-transfers`);
    return response.data;
  },

  // Get Outgoing
  getOutgoingTransfers: async (shopId) => {
    const response = await api.get(`/stocks/shop/${shopId}/outgoing-transfers`);
    return response.data;
  },
};
