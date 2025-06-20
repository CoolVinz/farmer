-- CreateTable
CREATE TABLE "plots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "area" DECIMAL,
    "soil_type" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plot_id" UUID NOT NULL,
    "section_number" INTEGER NOT NULL,
    "section_code" VARCHAR NOT NULL,
    "name" VARCHAR,
    "description" TEXT,
    "area" DECIMAL,
    "soil_type" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "location_id" TEXT NOT NULL,
    "variety" TEXT,
    "planted_date" DATE,
    "status" TEXT DEFAULT 'alive',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "tree_number" INTEGER DEFAULT 1,
    "tree_height" DECIMAL,
    "trunk_diameter" DECIMAL,
    "flower_date" DATE,
    "fruit_count" INTEGER DEFAULT 0,
    "death_date" DATE,
    "plot_id" UUID,
    "tree_code" VARCHAR(10),
    "section_id" UUID,
    "blooming_status" VARCHAR DEFAULT 'not_blooming',

    CONSTRAINT "trees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tree_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tree_id" UUID,
    "log_date" DATE NOT NULL,
    "notes" TEXT,
    "fertilizer" TEXT,
    "pesticide" TEXT,
    "created_by" TEXT,
    "image_path" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "activity_type" TEXT,
    "health_status" TEXT,
    "fertilizer_type" TEXT,
    "batch_id" UUID,

    CONSTRAINT "tree_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plot_id" TEXT NOT NULL,
    "log_date" DATE NOT NULL,
    "activity_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tree_costs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cost_date" DATE NOT NULL,
    "activity_type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "notes" TEXT,

    CONSTRAINT "tree_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "varieties" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "varieties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fertilizers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fertilizers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesticides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pesticides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_diseases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plant_diseases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "activities_cost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities_cost" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plots_code_key" ON "plots"("code");

-- CreateIndex
CREATE UNIQUE INDEX "sections_section_code_key" ON "sections"("section_code");

-- CreateIndex
CREATE UNIQUE INDEX "sections_plot_id_section_number_key" ON "sections"("plot_id", "section_number");

-- CreateIndex
CREATE UNIQUE INDEX "trees_tree_code_key" ON "trees"("tree_code");

-- CreateIndex
CREATE UNIQUE INDEX "varieties_name_key" ON "varieties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "fertilizers_name_key" ON "fertilizers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pesticides_name_key" ON "pesticides"("name");

-- CreateIndex
CREATE UNIQUE INDEX "plant_diseases_name_key" ON "plant_diseases"("name");

-- CreateIndex
CREATE UNIQUE INDEX "activities_cost_name_key" ON "activities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "activities_name_key" ON "activities_cost"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trees" ADD CONSTRAINT "trees_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tree_logs" ADD CONSTRAINT "tree_logs_tree_id_fkey" FOREIGN KEY ("tree_id") REFERENCES "trees"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "batch_logs" ADD CONSTRAINT "batch_logs_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
