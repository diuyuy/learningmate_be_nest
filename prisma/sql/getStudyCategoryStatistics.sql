-- @param {BigInt} $1:memberId

SELECT c.name, COUNT(s.studyStats) as totalCounts FROM Study AS s
	INNER JOIN Keyword AS k ON k.id = s.keywordId
    INNER JOIN Category AS c ON k.categoryId = c.id
    WHERE s.memberId = ?
    GROUP BY c.name WITH ROLLUP;