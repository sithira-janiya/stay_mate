// backend/Finance/models/codeHelper.js  
const Counter = require("./Counter"); 
async function getNextCode(kind, defaultPrefix, defaultPad = 3) {
  const doc = await Counter.findOneAndUpdate(
    { _id: kind },
    {
      $setOnInsert: { prefix: defaultPrefix, pad: defaultPad },
      $inc: { seq: 1 },
    },
    { new: true, upsert: true }
  ).lean();

  const prefix = doc.prefix || defaultPrefix;
  const pad = doc.pad || defaultPad;
  const num = String(doc.seq).padStart(pad, "0");
  return `${prefix}${num}`;
}

module.exports = { getNextCode };
