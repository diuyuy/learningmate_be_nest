-- @param {BigInt} $1:memberId

SELECT COUNT(*) as watchedVideoCounts FROM Study
  WHERE memberId = ? AND (studyStats & 4) > 0

