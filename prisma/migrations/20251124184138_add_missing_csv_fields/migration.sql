-- AlterTable
ALTER TABLE "Agency" ADD COLUMN "csa_cbsa" TEXT;
ALTER TABLE "Agency" ADD COLUMN "domain_name" TEXT;
ALTER TABLE "Agency" ADD COLUMN "grade_span" TEXT;
ALTER TABLE "Agency" ADD COLUMN "locale" TEXT;
ALTER TABLE "Agency" ADD COLUMN "mailing_address" TEXT;
ALTER TABLE "Agency" ADD COLUMN "phone" TEXT;
ALTER TABLE "Agency" ADD COLUMN "physical_address" TEXT;
ALTER TABLE "Agency" ADD COLUMN "status" TEXT;
ALTER TABLE "Agency" ADD COLUMN "student_teacher_ratio" TEXT;
ALTER TABLE "Agency" ADD COLUMN "supervisory_union" TEXT;
ALTER TABLE "Agency" ADD COLUMN "total_schools" TEXT;
ALTER TABLE "Agency" ADD COLUMN "total_students" TEXT;

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN "contact_form_url" TEXT;
ALTER TABLE "Contact" ADD COLUMN "firm_id" TEXT;
