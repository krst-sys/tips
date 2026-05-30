export function calculateOpportunityMetrics(records = []) {
  const safeRecords = Array.isArray(records) ? records : [];
  const green = safeRecords.filter((item) => item.result === "green").length;
  const red = safeRecords.filter((item) => item.result === "red").length;
  const pending = safeRecords.filter((item) => item.result === "pending").length;
  const voided = safeRecords.filter((item) => item.result === "void").length;
  const refunded = safeRecords.filter((item) => item.result === "refunded").length;
  const finalized = green + red;
  const hitRate = finalized ? green / finalized : null;

  return {
    registered: safeRecords.length,
    finalized,
    green,
    red,
    pending,
    voided,
    refunded,
    nonActionable: voided + refunded,
    hitRate,
  };
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function getRecordTime(record) {
  const value = record.eventDate || record.registeredAt || record.createdAt;
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) ? time : null;
}

export function filterOpportunityHistoryByPeriod(records = [], period = "recent") {
  const ordered = [...records].sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0));
  if (period === "recent") return ordered.slice(0, 15);

  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = startOfLocalDay(new Date());
  const now = Date.now();
  const yesterdayStart = todayStart - dayMs;

  return ordered.filter((record) => {
    const recordTime = getRecordTime(record);
    if (recordTime === null) return false;
    if (period === "yesterday") return recordTime >= yesterdayStart && recordTime < todayStart;
    if (period === "7d") return recordTime >= now - 7 * dayMs;
    return true;
  });
}
