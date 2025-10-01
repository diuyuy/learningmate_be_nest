-- @param {BigInt} $1:memberId
-- @param {DateTime} $2:start
-- @param {DateTime} $3:end
-- @param {Int} $4:pageSize
-- @param {Int} $5:offset

SELECT
  r.id,
  r.articleId,
  r.memberId,
  r.createdAt,
  r.content1,
  m.nickname,
  a.title,
  COUNT(lr.id) as "likeCount",
  CASE WHEN SUM(CASE WHEN lr.memberId = ? THEN 1 ELSE 0 END) > 0
    THEN TRUE ELSE FALSE END as "likedByMe"
FROM Review r
INNER JOIN Member m ON m.id = r.memberId
INNER JOIN Article a ON a.id = r.articleId
LEFT JOIN LikeReview lr ON lr.reviewId = r.id
WHERE r.createdAt >= ?
  AND r.createdAt < ?
GROUP BY r.id, r.articleId, r.memberId, r.createdAt, r.content1, m.nickname, a.title
ORDER BY COUNT(lr.id) DESC, r.createdAt DESC
LIMIT ?
OFFSET ?