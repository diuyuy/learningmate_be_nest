-- CreateTable
CREATE TABLE `Article` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `content` TEXT NOT NULL,
    `publishedAt` TIMESTAMP(6) NOT NULL,
    `scrapCount` BIGINT NOT NULL DEFAULT 0,
    `summary` TEXT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `views` BIGINT NOT NULL DEFAULT 0,
    `keywordId` BIGINT NOT NULL,

    INDEX `FKor8y5kscjrt38n1ddqh89o4s3`(`keywordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `name` VARCHAR(2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Keyword` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `description` VARCHAR(1320) NOT NULL,
    `name` VARCHAR(80) NOT NULL,
    `categoryId` BIGINT NOT NULL,

    INDEX `FK9hqhtlqxtjb70umrxcvvb1qvc`(`categoryId`),
    INDEX `idx_keyword_name`(`name`),
    FULLTEXT INDEX `ft_keyword_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LikeReview` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `memberId` BIGINT NOT NULL,
    `reviewId` BIGINT NOT NULL,

    INDEX `idx_like_review_member`(`memberId`),
    INDEX `idx_like_review_review`(`reviewId`),
    UNIQUE INDEX `uk_like_review_review_member`(`reviewId`, `memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Member` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `email` VARCHAR(255) NOT NULL,
    `imageUrl` VARCHAR(255) NULL,
    `nickname` VARCHAR(50) NULL,
    `passwordHash` VARCHAR(60) NULL,
    `status` BIT(1) NOT NULL DEFAULT b'1',
    `deletedAt` DATETIME(6) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',

    UNIQUE INDEX `UK9qv6yhjqm8iafto8qk452gx8h`(`email`),
    UNIQUE INDEX `UKp0hytgwmegm8egg7lrjqpesp`(`nickname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MemberQuiz` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `memberAnswer` VARCHAR(1) NOT NULL,
    `memberId` BIGINT NOT NULL,
    `quizId` BIGINT NOT NULL,

    INDEX `idx_mq_member`(`memberId`),
    UNIQUE INDEX `uk_member_quiz_quiz_member`(`quizId`, `memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quiz` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `answer` VARCHAR(1) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `explanation` VARCHAR(512) NOT NULL,
    `question1` VARCHAR(255) NOT NULL,
    `question2` VARCHAR(255) NOT NULL,
    `question3` VARCHAR(255) NOT NULL,
    `question4` VARCHAR(255) NOT NULL,
    `articleId` BIGINT NOT NULL,

    INDEX `FK1sb1n4xojkoo2qmwt3i2rkfvq`(`articleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `content1` VARCHAR(2000) NOT NULL,
    `content2` VARCHAR(2000) NOT NULL,
    `content3` VARCHAR(2000) NOT NULL,
    `articleId` BIGINT NOT NULL,
    `memberId` BIGINT NOT NULL,

    INDEX `FKdgh7i1rmiffemo1wxkea75tv3`(`memberId`),
    INDEX `FKgxst9s1m81taftxr9u79wqnxs`(`articleId`),
    UNIQUE INDEX `Review_memberId_articleId_key`(`memberId`, `articleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Statistic` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `studyCount` BIGINT NOT NULL DEFAULT 0,
    `categoryId` BIGINT NOT NULL,
    `memberId` BIGINT NOT NULL,

    INDEX `FK6687cpk12iic4o81ilqkxu04v`(`categoryId`),
    INDEX `FKdh51t3dh0ag5egixvegjwnj7d`(`memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Study` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `studyStats` TINYINT NOT NULL DEFAULT 0,
    `keywordId` BIGINT NOT NULL,
    `memberId` BIGINT NOT NULL,

    INDEX `FKe649b4utnj7k15p724xrnhuet`(`memberId`),
    INDEX `FKh9kqg6kindl5l651edqsuttf3`(`keywordId`),
    UNIQUE INDEX `uk_keyword_member`(`keywordId`, `memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TodaysKeyword` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `date` DATE NOT NULL,
    `keywordId` BIGINT NOT NULL,

    UNIQUE INDEX `UKlgeus1t64dtgvkdlpx6h22tdh`(`date`),
    INDEX `FKbag38p1orbpj7fpn33bf77raa`(`keywordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Video` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `link` VARCHAR(2048) NOT NULL,
    `keywordId` BIGINT NOT NULL,

    INDEX `FKm9n9p7beulerlb1jj05se00n2`(`keywordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_scrap` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `member_id` BIGINT NOT NULL,
    `article_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_article_scraps`(`article_id`),
    INDEX `idx_member_scraps`(`member_id`),
    UNIQUE INDEX `article_scrap_member_id_article_id_key`(`member_id`, `article_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `FKor8y5kscjrt38n1ddqh89o4s3` FOREIGN KEY (`keywordId`) REFERENCES `Keyword`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Keyword` ADD CONSTRAINT `FK9hqhtlqxtjb70umrxcvvb1qvc` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `LikeReview` ADD CONSTRAINT `FK9rovxawis6ajfnvvpg901ghly` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `LikeReview` ADD CONSTRAINT `FKcjiolh2ge79lmd5a69dvncyap` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `MemberQuiz` ADD CONSTRAINT `FKb0gtuduybdgjjlxg2dxm1hs0i` FOREIGN KEY (`quizId`) REFERENCES `Quiz`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `MemberQuiz` ADD CONSTRAINT `FKp2jthlaoh87gf17kcuxnvuce3` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Quiz` ADD CONSTRAINT `FK1sb1n4xojkoo2qmwt3i2rkfvq` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `FKdgh7i1rmiffemo1wxkea75tv3` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `FKgxst9s1m81taftxr9u79wqnxs` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Statistic` ADD CONSTRAINT `FK6687cpk12iic4o81ilqkxu04v` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Statistic` ADD CONSTRAINT `FKdh51t3dh0ag5egixvegjwnj7d` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Study` ADD CONSTRAINT `FKe649b4utnj7k15p724xrnhuet` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Study` ADD CONSTRAINT `FKh9kqg6kindl5l651edqsuttf3` FOREIGN KEY (`keywordId`) REFERENCES `Keyword`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `TodaysKeyword` ADD CONSTRAINT `FKbag38p1orbpj7fpn33bf77raa` FOREIGN KEY (`keywordId`) REFERENCES `Keyword`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `FKm9n9p7beulerlb1jj05se00n2` FOREIGN KEY (`keywordId`) REFERENCES `Keyword`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `article_scrap` ADD CONSTRAINT `article_scrap_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_scrap` ADD CONSTRAINT `article_scrap_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

