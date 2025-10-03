-- @param {BigInt} $1:memberId
-- @param {BigInt} $2:keywordId
-- @param {Int} $3:flag
-- @param {Int} $4:updateFlag
INSERT INTO Study(memberId, keywordId,studyStats)
  VALUES(?, ?, ?)
  ON DUPLICATE KEY UPDATE
  studyStats = studyStats | ?