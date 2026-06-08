import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\`                 VARCHAR(36)                             NOT NULL,
        \`email\`              VARCHAR(255)                            NOT NULL,
        \`firstName\`          VARCHAR(255)                            NULL,
        \`lastName\`           VARCHAR(255)                            NULL,
        \`role\`               ENUM('admin','analyst','viewer')        NOT NULL DEFAULT 'analyst',
        \`magicLinkToken\`     VARCHAR(255)                            NULL,
        \`magicLinkExpiresAt\` DATETIME                                NULL,
        \`isActive\`           TINYINT(1) UNSIGNED ZEROFILL            NOT NULL DEFAULT '0',
        \`createdAt\`          DATETIME(6)                             NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\`          DATETIME(6)                             NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_users_email\` (\`email\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`documents\` (
        \`id\`                VARCHAR(36)                                        NOT NULL,
        \`userId\`            VARCHAR(36)                                        NOT NULL,
        \`originalText\`      TEXT                                               NOT NULL,
        \`anonymizedText\`    TEXT                                               NULL,
        \`status\`            ENUM('pending','processing','completed','failed')  NOT NULL DEFAULT 'pending',
        \`entityCount\`       INT                                                NOT NULL DEFAULT '0',
        \`processingTimeMs\`  INT                                                NULL,
        \`framework\`         ENUM('hipaa','gdpr','custom')                      NOT NULL DEFAULT 'hipaa',
        \`analysisResult\`    JSON                                               NULL,
        \`createdAt\`         DATETIME(6)                                        NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_documents_userId\` (\`userId\`),
        CONSTRAINT \`FK_documents_userId\`
          FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`)
          ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`synthetic_records\` (
        \`id\`          VARCHAR(36)  NOT NULL,
        \`userId\`      VARCHAR(36)  NOT NULL,
        \`entityType\`  VARCHAR(255) NOT NULL,
        \`value\`       TEXT         NOT NULL,
        \`locale\`      VARCHAR(255) NOT NULL DEFAULT 'en_US',
        \`createdAt\`   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_synthetic_records_userId\` (\`userId\`)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`word_counts\` (
        \`userId\`    VARCHAR(36)  NOT NULL,
        \`word\`      VARCHAR(20)  NOT NULL,
        \`count\`     INT          NOT NULL DEFAULT 0,
        PRIMARY KEY (\`userId\`, \`word\`),
        INDEX \`IDX_word_counts_userId\` (\`userId\`)
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`word_counts\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`synthetic_records\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`documents\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
  }
}
