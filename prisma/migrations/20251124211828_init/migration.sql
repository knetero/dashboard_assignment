-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT,
    "state_code" TEXT,
    "type" TEXT,
    "population" TEXT,
    "website" TEXT,
    "total_schools" TEXT,
    "total_students" TEXT,
    "mailing_address" TEXT,
    "grade_span" TEXT,
    "locale" TEXT,
    "csa_cbsa" TEXT,
    "domain_name" TEXT,
    "physical_address" TEXT,
    "phone" TEXT,
    "status" TEXT,
    "student_teacher_ratio" TEXT,
    "supervisory_union" TEXT,
    "county" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "title" TEXT,
    "email_type" TEXT,
    "contact_form_url" TEXT,
    "department" TEXT,
    "firm_id" TEXT,
    "agency_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contact_agency_id_idx" ON "Contact"("agency_id");

-- CreateIndex
CREATE INDEX "ContactView_userId_viewedAt_idx" ON "ContactView"("userId", "viewedAt");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactView" ADD CONSTRAINT "ContactView_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
