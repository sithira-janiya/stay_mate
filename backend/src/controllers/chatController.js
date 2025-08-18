import ChatMessage from "../models/ChatMessage.js";

// Recent chat for a tenant thread
export const getTenantThread = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const msgs = await ChatMessage.find({
      $or: [{ toTenantId: tenantId }, { role: "tenant", from: tenantId }]
    }).sort({ createdAt: 1 }).limit(200);
    res.json(msgs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
