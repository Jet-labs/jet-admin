const isDMLQuery = (query) => {
  // Trim the query to remove leading and trailing whitespace
  const trimmedQuery = query.trim().toUpperCase();

  // Define a list of DML keywords
  const dmlKeywords = ["INSERT", "UPDATE", "DELETE", "MERGE"];

  // Check if the query starts with any of the DML keywords
  return dmlKeywords.some((keyword) => trimmedQuery.startsWith(keyword));
};

const isDQLQuery = (query) => {
  // Trim the query to remove leading and trailing whitespace
  const trimmedQuery = query.trim().toUpperCase();

  // Define a list of DQL keywords
  const dqlKeywords = ["SELECT", "SHOW", "DESCRIBE", "EXPLAIN"];

  // Check if the query starts with any of the DQL keywords
  return dqlKeywords.some((keyword) => trimmedQuery.startsWith(keyword));
};

module.exports = { isDMLQuery, isDQLQuery };
