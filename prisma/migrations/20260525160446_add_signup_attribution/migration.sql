-- CreateTable
CREATE TABLE "SignupAttribution" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "referrer" TEXT,
    "landingPath" TEXT,
    "gclid" TEXT,
    "fbclid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignupAttribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SignupAttribution_userId_key" ON "SignupAttribution"("userId");

-- CreateIndex
CREATE INDEX "SignupAttribution_utmSource_idx" ON "SignupAttribution"("utmSource");

-- CreateIndex
CREATE INDEX "SignupAttribution_utmCampaign_idx" ON "SignupAttribution"("utmCampaign");

-- AddForeignKey
ALTER TABLE "SignupAttribution" ADD CONSTRAINT "SignupAttribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
