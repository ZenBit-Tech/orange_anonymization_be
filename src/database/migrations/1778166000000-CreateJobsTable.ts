import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobsTable1778166000000 implements MigrationInterface {
  name = 'CreateJobsTable1778166000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`jobs\` (
        \`id\`              VARCHAR(36)                                                            NOT NULL,
        \`status\`          ENUM('draft','configured','queued','processing','succeeded','failed')  NOT NULL DEFAULT 'draft',
        \`userId\`          VARCHAR(36)                                                            NOT NULL,
        \`wizardState\`     JSON                                                                   NULL,
        \`framework\`       VARCHAR(255)                                                           NULL,
        \`anonymizedText\`  TEXT                                                                   NULL,
        \`processingTime\`  FLOAT                                                                  NULL,
        \`errorMessage\`    TEXT                                                                   NULL,
        \`createdAt\`       DATETIME(6)                                                            NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\`       DATETIME(6)                                                            NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_jobs_userId\` (\`userId\`),
        CONSTRAINT \`FK_jobs_userId\`
          FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`)
          ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`jobs\``);
  }
}
