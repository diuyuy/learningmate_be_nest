-- @param {BigInt} $1:memberId

SELECT c.name, COUNT(*) AS counts
  FROM Study AS s
	  INNER JOIN Keyword AS k ON k.id = s.keywordId
    INNER JOIN Category AS c ON k.categoryId = c.id
  WHERE s.memberId = ?
    GROUP BY c.name
    ORDER BY counts DESC
    LIMIT 1
;