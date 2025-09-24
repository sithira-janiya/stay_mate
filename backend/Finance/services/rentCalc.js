// backend/Finance/services/rentCalc.js
const mongoose = require("mongoose");
const UtilityBill = require("../models/UtilityBill"); // strict schema for utility bills
const { ensureObjectId } = require("../utils/validators");

/**
 * Given "YYYY-MM" -> { start, end } UTC boundaries for Mongo queries
 */
function monthToRange(yyyyMM) {
  const [y, m] = yyyyMM.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end   = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { start, end };
}

/**
 * Build assignments from Room docs:
 *  - one assignment per occupant (tenant)
 *  - expects room fields: _id, property (ObjectId), occupants:[{_id:String}], price.amount
 */
function buildAssignmentsFromRooms(rooms = []) {
  const assignments = [];
  for (const r of rooms) {
    const occ = Array.isArray(r.occupants) ? r.occupants : [];
    for (const o of occ) {
      assignments.push({
        tenantId: String(o._id),                  // string
        propertyId: r.property,                   // ObjectId
        roomId: r._id,                            // ObjectId
        baseRent: Number(r?.price?.amount || 0),  // number
      });
    }
  }
  return assignments;
}

/**
 * Compute tenants per property (used to split utilities)
 */
function mapTenantsByProperty(assignments) {
  const tenantsByProperty = new Map(); // propertyId(string) -> Set(tenantId)
  for (const a of assignments) {
    const pKey = String(a.propertyId);
    if (!tenantsByProperty.has(pKey)) tenantsByProperty.set(pKey, new Set());
    tenantsByProperty.get(pKey).add(a.tenantId);
  }
  return tenantsByProperty;
}

/**
 * Get utilities per property for the given YYYY-MM (sum of all utility bill amounts for that property/month)
 * returns Map(propertyId:string -> totalUtilities:number)
 */
async function getUtilitiesByProperty({ month, propertyIds }) {
  const idList = Array.from(propertyIds).map((id) => ensureObjectId(id) || id);
  if (!idList.length) return new Map();

  const agg = await UtilityBill.aggregate([
    { $match: { month, propertyId: { $in: idList } } },
    { $group: { _id: "$propertyId", total: { $sum: "$amount" } } },
  ]);

  const utilMap = new Map();
  for (const u of agg) utilMap.set(String(u._id), Number(u.total) || 0);
  return utilMap;
}

/**
 * Build a Map of tenantId -> meal cost (rupees) for delivered orders in the month
 * You must pass the Order model (ExternalModels) and month string
 */
async function getMealCostByTenant({ OrderModel, month }) {
  const { start, end } = monthToRange(month);
  const orders = await OrderModel.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, status: "DELIVERED" } },
    { $group: { _id: "$userId", totalCents: { $sum: "$totalCents" } } },
  ]);

  const mealsMap = new Map(); // tenantId -> rupees
  for (const o of orders) {
    const rupees = Math.round(Number(o.totalCents || 0) / 100);
    mealsMap.set(String(o._id), rupees);
  }
  return mealsMap;
}

/**
 * Compute final numeric parts for each assignment:
 *  - utilityShare = (total utilities of property) / (# tenants in property)
 *  - mealCost from mealsMap
 *  - total = baseRent + utilityShare + mealCost
 * returns array with computed fields added
 */
function computeAmounts({ assignments, utilitiesByProperty, tenantsByProperty, mealsByTenant }) {
  return assignments.map((a) => {
    const pKey = String(a.propertyId);
    const tKey = a.tenantId;

    const propertyTotalUtil = utilitiesByProperty.get(pKey) || 0;
    const tenantCount       = tenantsByProperty.get(pKey)?.size || 1;
    const utilityShare      = Math.round(propertyTotalUtil / tenantCount);

    const mealCost = Math.round(mealsByTenant.get(tKey) || 0);
    const baseRent = Math.round(Number(a.baseRent || 0));
    const total    = baseRent + utilityShare + mealCost;

    return { ...a, utilityShare, mealCost, baseRent, total };
  });
}

module.exports = {
  monthToRange,
  buildAssignmentsFromRooms,
  mapTenantsByProperty,
  getUtilitiesByProperty,
  getMealCostByTenant,
  computeAmounts,
};
