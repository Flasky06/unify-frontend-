import { api } from "../lib/api";

export const stockTransferService = {
  // Initiate Transfer
  initiateTransfer: async (transferData) => {
    return await api.post("/stocks/transfer/initiate", transferData);
  },

  // Acknowledge (Accept) Transfer
  acknowledgeTransfer: async (transferId) => {
    return await api.post(`/stocks/transfer/${transferId}/acknowledge`);
  },

  // Cancel Transfer
  cancelTransfer: async (transferId) => {
    return await api.post(`/stocks/transfer/${transferId}/cancel`);
  },

  // Get Incoming
  getIncomingTransfers: async (shopId) => {
    return await api.get(`/stocks/shop/${shopId}/incoming-transfers`);
  },

  // Get Outgoing
  getOutgoingTransfers: async (shopId) => {
    return await api.get(`/stocks/shop/${shopId}/outgoing-transfers`);
  },
};
